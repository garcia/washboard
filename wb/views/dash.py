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

def main(request, data_=None):
    if not request.user.is_authenticated():
        return redirect('/')
    
    profile = request.user.get_profile()
    data = {
        'title': 'Dashboard',
        'dash': True,
        'base_url': settings.BASE_URL,
        'api_url': 'http://api.tumblr.com/v2/user/dashboard',
        'append_key': 0,
        'api_key': profile.api_key,
        'api_secret': profile.api_secret,
        'token_key': profile.token_key,
        'token_secret': profile.token_secret,
        'rules': json.dumps(list(
                Rule.objects.filter(user__exact=request.user).values()
            )),
        'hidden_posts': json.dumps(list(
                HiddenPost.objects.filter(user__exact=request.user).values()
            )),
    }
    if data_: data.update(data_)

    return render(request, 'dash.html', data)

def blog(request, username):
    return main(request, data_={
        'title': "%s's blog" % username,
        'api_url': 'http://api.tumblr.com/v2/blog/%s.tumblr.com/posts' % username,
        'append_key': 1,
    })
