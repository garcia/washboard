import collections
import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from django.http import HttpResponse
from django.http.request import QueryDict
from django.shortcuts import redirect, render
from django.template import RequestContext

from wb.models import *
import wb.views.api

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
            'pagination_key': 'before_id',
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
    
    # Load data now if not using sessions or preloading
    if not data['wb']['profile']['sessions'] and 'preloaded' not in request.GET:
        POST = {}
        POST['endpoint'] = data['wb']['endpoint']
        POST['reblog_info'] = POST['notes_info'] = 'true'
        pk = data['wb']['pagination_key']
        if pk in request.GET:
            POST[pk] = request.GET[pk]
        POST.update(data['wb']['parameters'])
        request.POST = QueryDict('&'.join('='.join(pair) for pair in POST.items()))
        request.method = 'POST'
        data['wb']['initial_data'] = json.loads(wb.views.api.main(request).content)

    data['wb'] = json.dumps(data['wb'])

    # Prohibit </ literals (most importantly in the case of </script>)
    data['wb'] = data['wb'].replace('</', '<\/');

    return render(request, 'dash.html', data)

def blog(request, name):
    return main(request, data_={
        'title': "%s" % name,
        'wb': {
            'endpoint': 'blog',
            'parameters': {'blog': name},
            'pagination_key': 'offset',
        },
    })

def inbox(request, name):
    return main(request, data_={
        'title': "%s's inbox" % name,
        'wb': {
            'endpoint': 'inbox',
            'parameters': {'blog': name},
            'pagination_key': 'offset',
        },
    })

def tagged(request, tag):
    return main(request, data_={
        'title': 'Posts tagged %s' % tag,
        'wb': {
            'endpoint': 'tagged',
            'well_ordered': False,
            'parameters': {'tag': tag},
            'pagination_key': 'before',
        },
    })
