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
import oauth2

from wb.models import *

OAUTH_BASE_URL = 'http://www.tumblr.com/oauth/'
REQUEST_TOKEN_URL = OAUTH_BASE_URL + 'request_token'
AUTHORIZE_URL = OAUTH_BASE_URL + 'authorize?oauth_token=%s'
ACCESS_TOKEN_URL = OAUTH_BASE_URL + 'access_token'

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
    request.session['nonce'] = str(random.randrange(sys.maxsize))
    return render(request, 'register.tpl', {
        'BASE_URL': settings.BASE_URL,
        'form': RegistrationForm(),
    })


def app(request):
    if request.user.is_authenticated():
        return redirect('/')
    if request.method != 'POST':
        messages.error(request, 'Invalid request.') # TODO: more details
        return redirect('/register')
    if not RegistrationForm(request.POST).is_valid():
        messages.error(request, 'Please fill in all of the fields.')
        return redirect('/register')
    
    # Get request token for the user
    client = oauth2.Client(oauth2.Consumer(
        request.POST['api_key'],
        request.POST['api_secret'],
    ))
    resp, content = client.request(REQUEST_TOKEN_URL, 'POST')
    request_token = dict(urlparse.parse_qsl(content))
    
    if not ('oauth_token' in request_token and
            'oauth_token_secret' in request_token):
        messages.error(request, """
            Sorry, we were unable to retrieve request tokens for the app.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register')
    
    # Save input for after the authorization has been completed
    request.session['api_key'] = request.POST['api_key']
    request.session['api_secret'] = request.POST['api_secret']
    request.session['token_key'] = request_token['oauth_token']
    request.session['token_secret'] = request_token['oauth_token_secret']
    request.session['password'] = request.POST['password']
    
    return redirect(AUTHORIZE_URL % request_token['oauth_token'])


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
    consumer = oauth2.Consumer(
        request.session['api_key'],
        request.session['api_secret'],
    )
    req_token = oauth2.Token(
        request.session['token_key'],
        request.session['token_secret'],
    )
    req_token.set_verifier(request.GET['oauth_verifier'])
    req_client = oauth2.Client(consumer, req_token)
    resp, content = req_client.request(ACCESS_TOKEN_URL, 'POST')
    access_token = dict(urlparse.parse_qsl(content))
    if not ('oauth_token' in access_token and
            'oauth_token_secret' in access_token):
        messages.error(request, """
            Sorry, we were unable to retrieve access tokens for your account.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register')
    token = oauth2.Token(
        access_token['oauth_token'],
        access_token['oauth_token_secret'],
    )

    # Get the user's name
    client = oauth2.Client(consumer, token)
    # TODO: externalize this URL (but where...?)
    resp, content = client.request('http://api.tumblr.com/v2/user/info', 'GET')
    try:
        userinfo = json.loads(content)
    except ValueError:
        messages.warning(request, """
            Tumblr returned a malformed message when we asked for your name.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register')
    if not str(userinfo['meta']['status']).startswith('2'):
        messages.warning(request, """
            Tumblr refused to give us your name for some reason.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register')
    name = userinfo['response']['user']['name']

    # Check for duplicate user
    try:
        User.objects.get(username__exact=name)
        messages.error("""
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
