import json
import random
import sys
import urllib
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import RequestContext

from wb.models import *
from wb.tumblr import Tumblr

endpoints = {
    'dashboard': {
        'url': 'user/dashboard',
        'method': 'GET',
        'api_key': False,
        'parameters': [
            'offset', 'since_id', 'reblog_info', 'notes_info',
        ],
    },
    'blog': {
        'url': 'blog/{blog}.tumblr.com/posts',
        'method': 'GET',
        'api_key': True,
        'parameters': [
            'id', 'tag', 'offset', 'reblog_info', 'notes_info',
        ],
    },
    'like': {
        'url': 'user/like',
        'method': 'GET',
        'api_key': False,
        'parameters': [
            'id', 'reblog_key',
        ],
    },
    'unlike': {
        'url': 'user/unlike',
        'method': 'GET',
        'api_key': False,
        'parameters': [
            'id', 'reblog_key',
        ],
    },
    # Not supported for mainline Tumblr apps yet
    #'notifications': {
    #    'url': 'user/notifications',
    #    'method': 'POST',
    #    'api_key': True,
    #},
    'reply': {
        'url': 'user/post/reply',
        'method': 'POST',
        'api_key': True,
        'parameters': [
            'post_id', 'reblog_key', 'reply_text',
        ],
    },
    'reblog': {
        'url': 'blog/{blog}.tumblr.com/post/reblog',
        'method': 'POST',
        'api_key': True,
        'parameters': [
            'id', 'type', 'reblog_key', 'comment', 'tags',
        ],
    },
    'tagged': {
        'url': 'tagged',
        'method': 'GET',
        'api_key': True,
        'parameters': [
            'tag', 'before',
        ],
    },
}

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
        settings.OAUTH_SECRET_KEY,
        request.session['oauth_token'],
        request.session['oauth_token_secret'],
    )
    
    # Get endpoint information
    if 'endpoint' not in request.POST:
        return api_error(500, 'No endpoint')
    if request.POST['endpoint'] in endpoints:
        endpoint = endpoints[request.POST['endpoint']]
    else:
        return api_error(500, 'Invalid endpoint')

    # Get required parameters from POST form
    data = {}
    for parameter in endpoint['parameters']:
        value = request.POST.get(parameter)
        if value:
            data[parameter] = value

    # Build endpoint URL
    url = 'http://api.tumblr.com/v2/'
    try:
        url += endpoint['url'].format(
            **{k: v for k, v in request.POST.items()}
        )
    except KeyError as error:
        return api_error(500, 'Missing ' + error.message)

    # Add API key if required
    if endpoint['api_key']:
        data['api_key'] = settings.OAUTH_CONSUMER_KEY
        #data['api_key'] = "w9rn1oBFMV1Fv1xD0hFAkkZ9FJQA1LTfynnmNiQxGDoXRALRmC"

    qs = '&'.join('='.join(urllib.quote(str(p)) for p in pair) for pair in data.items())
    
    if endpoint['method'] == 'GET':
        response = req.request_json('%s?%s' % (url, qs), endpoint['method'])
    else:
        response = req.request_json(url, endpoint['method'], qs)

    response['washboard'] = {
        'endpoint': endpoint,
        'url': url,
        'data': data,
    }
    
    return HttpResponse(json.dumps(response), content_type='application/json')
