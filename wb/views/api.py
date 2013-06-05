import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import RequestContext

from wb.models import *
from wb.tumblr import Tumblr

def api_error(status, msg):
    return HttpResponse(json.dumps({'meta': {
        'status': str(status),
        'msg': msg,
    }}), content_type='application/json')

def main(request, data_=None):
    if not request.user.is_authenticated():
        return api_error(401, 'Not authorized')

    #if request.method != 'POST':
    #    return api_error(500, 'Invalid request method')

    # Temporary hack
    if request.method != 'POST':
        request.POST = request.GET
        
    req = Tumblr(
        settings.OAUTH_CONSUMER_KEY,
        settings.SECRET_KEY,
        request.session['oauth_token'],
        request.session['oauth_token_secret'],
    )

    if 'data' not in request.POST:
        return api_error(500, 'No data')
    if 'endpoint' not in request.POST:
        return api_error(500, 'No endpoint')

    try:
        data = json.loads(request.POST['data'])
    except ValueError:
        return api_error(500, 'Invalid data')

    url = 'http://api.tumblr.com/v2/'
    try:
        url += {
            'dashboard': 'user/dashboard',
            'blog': 'blog/%s.tumblr.com/posts',
            'like': 'user/like',
            'unlike': 'user/unlike',
        }[request.POST['endpoint']]
    except KeyError:
        return api_error(500, 'Invalid endpoint')

    if request.POST['endpoint'] == 'blog':
        data['api_key'] = settings.OAUTH_CONSUMER_KEY
        try:
            url %= request.POST['blog']
        except KeyError:
            return api_error(500, 'No blog')
        
    response = req.request_json(
        url + '?' + '&'.join('='.join(str(p) for p in pair) for pair in data.items()),
        'GET'
    )
    
    return HttpResponse(json.dumps(response), content_type='application/json')
