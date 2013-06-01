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

class RegistrationForm(forms.Form):
    api_key = forms.CharField(
        max_length=64,
        widget=forms.TextInput(attrs={'placeholder': 'OAuth Consumer Key'}),
        error_messages={
            'required': 'Please enter your OAuth Consumer Key.',
        },
    )
    api_secret = forms.CharField(
        max_length=64,
        widget=forms.TextInput(attrs={'placeholder': 'Secret Key'}),
        error_messages={
            'required': 'Please enter your Secret Key.',
        },
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        error_messages={
            'required': 'Please choose a password.',
        },
    )


def main(request):
    if request.user.is_authenticated():
        return redirect('/')
    
    if request.method != 'POST':
        request.session['nonce'] = str(random.randrange(sys.maxsize))
        return render(request, 'register.html', {
            'title': 'Sign Up',
            'BASE_URL': settings.BASE_URL,
            'form': RegistrationForm(),
        })
    
    if not RegistrationForm(request.POST).is_valid():
        messages.error(request, 'Please fill in all of the fields.')
        return redirect('/register')
    
    # Get request token for the user
    req_token = Tumblr(
        request.POST['api_key'],
        request.POST['api_secret'],
    )
    token = req_token.request_qsl(Tumblr.REQUEST_TOKEN, 'POST')
    
    if not ('oauth_token' in token and
            'oauth_token_secret' in token):
        messages.error(request, tryagain(
            "Sorry, we were unable to retrieve request tokens for the app."
        ))
        return redirect('/register')
    
    # Save input for after the authorization has been completed
    request.session['api_key'] = request.POST['api_key']
    request.session['api_secret'] = request.POST['api_secret']
    request.session['token_key'] = token['oauth_token']
    request.session['token_secret'] = token['oauth_token_secret']
    request.session['password'] = request.POST['password']
    
    return redirect(Tumblr.AUTHORIZE % token['oauth_token'])


def app(request):
    if request.user.is_authenticated():
        return redirect('/')
    if request.method != 'POST':
        messages.error(request, 'Invalid request.') # TODO: more details
        return redirect('/register')


def callback(request):
    if request.user.is_authenticated():
        return redirect('/')
    if request.method != 'GET':
        messages.error(request, 'Invalid request.')
        return redirect('/register')
    if 'oauth_verifier' not in request.GET:
        messages.error(request, """
            You need to grant your application access to your blog.
        """)
        return redirect('/register')
    for sessionvar in ('api_key', 'api_secret', 'token_key',
                       'token_secret', 'password', 'nonce'):
        if sessionvar not in request.session:
            messages.error(request, 'Invalid request.')
            return redirect('/register')

    # Get the access token for the user
    req_access = Tumblr(
        request.session['api_key'],
        request.session['api_secret'],
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
        return redirect('/register')

    # Get the user's name
    req_username = Tumblr(
        request.session['api_key'],
        request.session['api_secret'],
        access_token['oauth_token'],
        access_token['oauth_token_secret'],
    )
    try:
        userinfo = req_username.request_json(Tumblr.USER_INFO, 'GET')
    except ValueError:
        messages.warning(request, tryagain(
            "Tumblr returned a malformed message when we asked for your name."
        ))
        return redirect('/register')
    if not str(userinfo['meta']['status']).startswith('2'):
        messages.warning(request, tryagain(
            "Tumblr refused to give us your name for some reason."
        ))
        return redirect('/register')
    name = userinfo['response']['user']['name']

    # Check for duplicate user
    try:
        User.objects.get(username__exact=name)
        messages.error(request, """
            It looks like you've already signed up for Washboard!

            Contact us if you're absolutely sure you didn't.
        """)
        return redirect('/register')
    except User.DoesNotExist:
        pass

    # Save the user's information
    # TODO: What happens when a user changes their username on Tumblr?
    user = User(username=name)
    password = request.session['password']
    user.set_password(password)
    user.save()
    profile = user.get_profile()
    profile.api_key = request.session['api_key']
    profile.api_secret = request.session['api_secret']
    profile.token_key = access_token['oauth_token']
    profile.token_secret = access_token['oauth_token_secret']
    profile.save()
    
    # Cleanup
    for key in request.session.keys():
        del request.session[key]
    
    # Authenticate the user
    authenticated_user = authenticate(username=name, password=password)
    login(request, authenticated_user)
    return redirect('/')
