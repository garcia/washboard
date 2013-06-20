import collections
import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import RequestContext

from wb.models import *

def update(d, u):
    """Recursively merge two mappings."""
    for k, v in u.iteritems():
        if isinstance(v, collections.Mapping):
            r = update(d.get(k, {}), v)
            d[k] = r
        else:
            d[k] = u[k]
    return d

def main(request, data_=None):
    if not request.user.is_authenticated():
        return redirect('/')
    
    data = {
        'title': 'Dashboard',
        'dash': True,
        'wb': {
            'username': request.user.username,
            'profile': model_to_dict(request.user.get_profile(), exclude=('id', 'user')),
            'blogs': request.session.get('blogs', []),
            'parameters': {},
            'base_url': settings.BASE_URL,
            'endpoint': 'dashboard',
            'well_ordered': True,
            'rules': [
                {field: rule[field] for field in rule
                    if field not in ('user_id', 'id', 'index')}
                for rule in Rule.objects.filter(user__exact=request.user).values()
            ],
            'hidden_posts': [
                {field: hp[field] for field in hp
                    if field not in ('user_id', 'id', 'index')}
                for hp in HiddenPost.objects.filter(user__exact=request.user).values()
            ],
        },
    }
    if data_: update(data, data_)

    data['wb'] = json.dumps(data['wb'])

    return render(request, 'dash.html', data)

def blog(request, name):
    return main(request, data_={
        'title': "%s's blog" % name,
        'wb': {
            'endpoint': 'blog',
            'parameters': {'blog': name},
        },
    })

def tagged(request, tag):
    return main(request, data_={
        'title': 'Posts tagged %s' % tag,
        'wb': {
            'endpoint': 'tagged',
            'well_ordered': False,
            'parameters': {'tag': tag},
        },
    })
