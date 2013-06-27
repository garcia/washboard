import json
import random
import sys
import urlparse

from django import forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render

from wb.models import *
from wb.tumblr import Tumblr

def tryagain(message):
    return message + """
        You can try again, but please contact us if the problem persists."""


class ChangeNameForm(forms.Form):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'placeholder': 'Old username'}),
        error_messages={
            'reqired': 'Please enter your old username.',
        }
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        error_messages={
            'required': 'Please enter your password.',
        },
    )


class PasswordForm(forms.Form):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        error_messages={
            'required': 'Please choose a password.',
        },
    )


def main(request):
    if request.user.is_authenticated():
        return redirect('/')
    
    # Get request token
    req_token = Tumblr(
        settings.OAUTH_CONSUMER_KEY,
        settings.OAUTH_SECRET_KEY,
    )
    token = req_token.request_qsl(Tumblr.REQUEST_TOKEN, 'POST')
    
    if not ('oauth_token' in token and
            'oauth_token_secret' in token):
        messages.error(request, tryagain(
            "Sorry, we were unable to retrieve request tokens."
        ))
        return redirect('/')
    
    # Save input for after the authorization has been completed
    request.session['token_key'] = token['oauth_token']
    request.session['token_secret'] = token['oauth_token_secret']
    
    return redirect(Tumblr.AUTHORIZE % token['oauth_token'])


def callback(request):
    if request.user.is_authenticated():
        return redirect('/')
    if request.method != 'GET':
        messages.error(request, 'Invalid request.')
        return redirect('/')
    if 'oauth_verifier' not in request.GET:
        messages.error(request, """
            You need to grant the application access to your blog.
        """)
        return redirect('/')

    # Get the access token for the user
    req_access = Tumblr(
        settings.OAUTH_CONSUMER_KEY,
        settings.OAUTH_SECRET_KEY,
        request.session['token_key'],
        request.session['token_secret'],
        request.GET['oauth_verifier'],
    )
    access_token = req_access.request_qsl(Tumblr.ACCESS_TOKEN, 'POST')
    if not ('oauth_token' in access_token and
            'oauth_token_secret' in access_token):
        messages.error(request, tryagain(
            "Sorry, we were unable to retrieve access tokens for your account."
        ))
        return redirect('/')

    # Get the user's name
    req_username = Tumblr(
        settings.OAUTH_CONSUMER_KEY,
        settings.OAUTH_SECRET_KEY,
        access_token['oauth_token'],
        access_token['oauth_token_secret'],
    )
    try:
        userinfo = req_username.request_json(Tumblr.USER_INFO, 'GET')
    except ValueError:
        messages.warning(request, tryagain(
            "Tumblr returned a malformed message when we asked for your name."
        ))
        return redirect('/')
    if not str(userinfo['meta']['status']).startswith('2'):
        messages.warning(request, tryagain(
            "Tumblr refused to give us your name for some reason."
        ))
        return redirect('/')
    name = userinfo['response']['user']['name']
    
    # Cleanup
    for key in request.session.keys():
        del request.session[key]

    request.session['blogs'] = [blog['name']
        for blog in userinfo['response']['user']['blogs']]

    # Check for duplicate user
    try:
        user = User.objects.get(username__exact=name)
        # Log in existing user
    except User.DoesNotExist:
        # Save the user's information
        user = User(username=name)
        user.save()
        profile = user.get_profile()
        profile.save()
    
    # Save user tokens
    request.session['oauth_token'] = access_token['oauth_token']
    request.session['oauth_token_secret'] = access_token['oauth_token_secret']
    
    # Hack - authenticate the user despite having no password
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)

    if user.has_usable_password():
        return redirect('/')
    else:
        return redirect('/setpassword')

def setpassword(request):
    if not request.user.is_authenticated():
        return redirect('/')

    if request.method == 'GET':
        return render(request, 'setpassword.html', {
            'setpassword': PasswordForm(),
            'changename': ChangeNameForm(),
        })
    
    elif request.method != 'POST':
        messages.error(request, 'Invalid request.')
        return redirect('/')
    
    form = PasswordForm(request.POST)
    if form.is_valid():
        request.user.set_password(form.cleaned_data['password'])
        request.user.save()
        return redirect('/getstarted')
    else:
        messages.error(request, 'Invalid form data. (Did you choose a password?)')
        return redirect('/setpassword')

def changename(request):
    if not request.user.is_authenticated():
        return redirect('/')

    if request.method != 'POST':
        messages.error(request, 'Invalid request.')
        return redirect('/')
    
    form = ChangeNameForm(request.POST)
    if form.is_valid():
        user = authenticate(
            username=form.cleaned_data['username'],
            password=form.cleaned_data['password']
        )
        if user is None:
            messages.error(request, 'Invalid username or password.')
            return redirect('/setpassword')
        else:
            user.username = request.user.username
            request.user.delete()
            user.save()
            login(request, user)

        return redirect('/')

def getstarted(request):
    if not request.user.is_authenticated():
        return redirect('/')

    profile = request.user.get_profile()
    if profile.started:
        return redirect('/dash')
    else:
        profile.started = True
        profile.save()
        return render(request, 'getstarted.html')
