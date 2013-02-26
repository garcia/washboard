import json
import random
import sys
import urlparse

from django import forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render
import oauth2

from wb.models import *

class APIForm(forms.Form):
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


def main(request):
    
    request.session['nonce'] = str(random.randrange(sys.maxsize))
    return render(request, 'register.main.tpl', {
        'BASE_URL': settings.BASE_URL,
        'form': APIForm(),
    })


def app(request):
    if not (request.method == 'POST' and APIForm(request.POST).is_valid()):
        messages.error(request, 'Invalid request.') # TODO: more details
        return redirect('/register/')
    
    client = oauth2.Client(oauth2.Consumer(
        request.POST['api_key'],
        request.POST['api_secret'],
    ))
    resp, content = client.request('http://www.tumblr.com/oauth/request_token', 'POST')
    request_token = dict(urlparse.parse_qsl(content))
    
    if not ('oauth_token' in request_token and
            'oauth_token_secret' in request_token):
        messages.error(request, """
            Sorry, we were unable to retrieve request tokens for the app.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register/')
    
    tk = TemporaryKeypair(
        api_key=request.POST['api_key'],
        api_secret=request.POST['api_secret'],
        token_key=request_token['oauth_token'],
        token_secret=request_token['oauth_token_secret'],
        nonce=request.session['nonce'],
    )
    tk.save()
    
    return redirect('http://www.tumblr.com/oauth/authorize?oauth_token=' + request_token['oauth_token'])


class CallbackForm(forms.Form):
    name = forms.CharField(max_length=64)
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        error_messages={
            'required': 'Please choose a password.',
        },
    )


def callback(request):
    if not (request.method == 'GET' and
            'nonce' in request.session and
            'oauth_verifier' in request.GET):
        messages.error(request, 'Invalid request.') # TODO: more details
        return redirect('/register/')

    # Get consumer and request keypair from database
    tk = TemporaryKeypair.objects.filter(nonce__exact=request.session['nonce'])[0]
    consumer = oauth2.Consumer(tk.api_key, tk.api_secret)
    # Get the access token for the user
    req_token = oauth2.Token(tk.token_key, tk.token_secret)
    req_token.set_verifier(request.GET['oauth_verifier'])
    req_client = oauth2.Client(consumer, req_token)
    resp, content = req_client.request(
        'http://www.tumblr.com/oauth/access_token',
        'POST'
    )
    access_token = dict(urlparse.parse_qsl(content))

    if not ('oauth_token' in access_token and
            'oauth_token_secret' in access_token):
        messages.error(request, """
            Sorry, we were unable to retrieve access tokens for your account.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register/')

    token = oauth2.Token(
        access_token['oauth_token'],
        access_token['oauth_token_secret'],
    )

    # Get the user's name
    client = oauth2.Client(consumer, token)
    resp, content = client.request('http://api.tumblr.com/v2/user/info', 'GET')
    try:
        userinfo = json.loads(content)
    except ValueError:
        messages.warning(request, """
            Tumblr returned a malformed message when we asked for your name.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register/')
    if not str(userinfo['meta']['status']).startswith('2'):
        messages.warning(request, """
            Tumblr refused to give us your name for some reason.

            You can try again, but please contact us if the problem persists.
        """)
        return redirect('/register/')

    name = userinfo['response']['user']['name']

    # Assemble everything for the last step
    data = {
        'api_key': tk.api_key,
        'api_secret': tk.api_secret,
        'token_key': access_token['oauth_token'],
        'token_secret': access_token['oauth_token_secret'],
        'name': name,
        'form': CallbackForm(),
    }
    # Cleanup
    tk.delete()
    return render(request, 'register.callback.tpl', data)


def finish(request):
    if not (request.method == 'POST' and CallbackForm(request.POST).is_valid()):
        messages.error('Invalid request.') # TODO: more details
        return redirect('/register/')

    # Check for duplicate user
    try:
        User.objects.get(username__exact=request.POST['name'])
        messages.error('User already exists.')
        return redirect('/register/') # TODO: return to Step 2, not Step 1!
    except User.DoesNotExist:
        pass

    # TODO: re-request username from Tumblr (or just only do it here...?)
    # Also, consider that a user might change their username on Tumblr. What then?
    user = User(username=request.POST['name'])
    user.set_password(request.POST['password'])
    user.save()
    profile = user.get_profile()
    profile.api_key = request.POST['api_key']
    profile.api_secret = request.POST['api_secret']
    profile.token_key = request.POST['token_key']
    profile.token_secret = request.POST['token_secret']
    profile.save()
    return redirect('/')
