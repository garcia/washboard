import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render
import oauth2

from models import *

def main(request):
    request.session['nonce'] = str(random.randrange(sys.maxsize))
    return render(request, 'register.main.tpl', {'BASE_URL': settings.BASE_URL})

def app(request):
    if request.method != 'POST':
        # TODO: error message
        return redirect('/register/')
    if ('api_key' not in request.POST or
        'api_secret' not in request.POST):
        # TODO: error message
        return redirect('/register/')
    client = oauth2.Client(oauth2.Consumer(
        request.POST['api_key'],
        request.POST['api_secret'],
    ))
    resp, content = client.request('http://www.tumblr.com/oauth/request_token', 'POST')
    request_token = dict(urlparse.parse_qsl(content))
    
    tk = TemporaryKeypair(
        api_key=request.POST['api_key'],
        api_secret=request.POST['api_secret'],
        token_key=request_token['oauth_token'],
        token_secret=request_token['oauth_token_secret'],
        nonce=request.session['nonce'],
    )
    tk.save()
    
    return redirect('http://www.tumblr.com/oauth/authorize?oauth_token=' + request_token['oauth_token'])

def callback(request):
    if request.method != 'GET':
        # TODO: error message
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
    token = oauth2.Token(
        access_token['oauth_token'],
        access_token['oauth_token_secret'],
    )
    # Get the user's name
    client = oauth2.Client(consumer, token)
    resp, content = client.request('http://api.tumblr.com/v2/user/info', 'GET')
    userinfo = json.loads(content)
    name = userinfo['response']['user']['name']
    # Assemble everything for the last step
    data = {
        'api_key': tk.api_key,
        'api_secret': tk.api_secret,
        'token_key': access_token['oauth_token'],
        'token_secret': access_token['oauth_token_secret'],
        'name': name,
    }
    # Cleanup
    tk.delete()
    return render(request, 'register.callback.tpl', data)

def finish(request):
    if request.method != 'POST':
        # TODO: error message
        return redirect('/register/')
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
