import urlparse

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect, render
import oauth2

def main(request):
    return render(request, 'register.main.tpl', {'BASE_URL': settings.BASE_URL})

def app(request):
    if request.method != 'POST':
        # TODO: error message
        return render('/register/')
    if ('api_key' not in request.POST or
        'api_secret' not in request.POST):
        # TODO: error message
        return render('/register/')
    client = oauth2.Client(oauth2.Consumer(
        request.POST['api_key'],
        request.POST['api_secret'],
    ))
    resp, content = client.request('http://www.tumblr.com/oauth/request_token', 'POST')
    request_token = dict(urlparse.parse_qsl(content))
    return redirect('http://www.tumblr.com/oauth/authorize?oauth_token=' + request_token['oauth_token'])

def callback(request):
    if request.method != 'GET':
        # TODO: error message
        return render('/register/app')
    request.GET['oauth_verifier']
    request.GET['oauth_token']
