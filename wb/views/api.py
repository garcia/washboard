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
            'offset', 'since_id', 'reblog_info', 'notes_info', 'before_id',
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
            'post_id', 'reblog_key', 'reply_text', 'tumblelog'
        ],
    },
    'reblog': {
        'url': 'blog/{blog}.tumblr.com/post/reblog',
        'method': 'POST',
        'api_key': True,
        'parameters': [
            'id', 'type', 'reblog_key', 'comment', 'tags', 'state',
            'send_to_facebook', 'tweet',
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
    'inbox': {
        'url': 'blog/{blog}.tumblr.com/posts/submission',
        'method': 'GET',
        'api_key': True,
        'parameters': [
            'filter', 'limit', 'offset', 'reblog_info',
        ],
    },
    'follow': {
        'url': 'user/follow',
        'method': 'POST',
        'api_key': False,
        'parameters': [
            'url',
        ],
    },
    'unfollow': {
        'url': 'user/unfollow',
        'method': 'POST',
        'api_key': False,
        'parameters': [
            'url',
        ],
    },
}

def api_error(status, msg, http_status=None):
    if not http_status: http_status = status
    return HttpResponse(json.dumps({'meta': {
        'status': str(status),
        'msg': msg,
    }}), content_type='application/json', status=http_status)


def main(request, data_=None):
    if not request.user.is_authenticated():
        return api_error(401, 'Not authorized')

    if request.method != 'POST':
        return api_error(401, 'Invalid request method')

    try:
        req = Tumblr(
            settings.OAUTH_CONSUMER_KEY,
            settings.OAUTH_SECRET_KEY,
            request.session['oauth_token'],
            request.session['oauth_token_secret'],
        )
    except KeyError:
        return api_error(500, 'Missing authentication tokens')
    
    # Get endpoint information
    if request.POST.get('endpoint') in endpoints:
        endpoint = endpoints[request.POST.get('endpoint')]
    else:
        return api_error(500, 'Invalid endpoint')

    # Raise an error; useful for debugging
    if request.POST.get('endpoint') == request.POST.get('throw_error'):
        if request.POST.get('error_type') == 'json':
            return api_error(400, 'Invalid request')
        elif request.POST.get('error_type') == 'tumblr':
            return api_error(400, 'Invalid request', 200)
        elif request.POST.get('error_type') == '502':
            return HttpResponse(json.dumps({
                "meta": {
                    "status": 200,
                    "msg": "Service Unavailable"
                },
                "response": "There was an error processing your request. Our engineers have been alerted and will work quickly to correct any issues."
            }), content_type='application/json', status=200)
        elif request.POST.get('error_type') == 'js':
            return api_error(999, 'JavaScript error', 200)
        else:
            raise ValueError('throw_error')
        
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

    qs = '&'.join('='.join(urllib.quote(p.encode('utf8')) for p in pair) for pair in data.items())
    
    try:
        if endpoint['method'] == 'GET':
            response = req.request_json('%s?%s' % (url, qs), endpoint['method'])
        else:
            response = req.request_json(url, endpoint['method'], qs)
    except ValueError:
        return api_error(500, 'Tumblr returned a malformed reponse.', 200)
    
    return HttpResponse(json.dumps(response), content_type='application/json')
