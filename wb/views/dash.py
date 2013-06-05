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
    
    data = {
        'title': 'Dashboard',
        'dash': True,
        'base_url': settings.BASE_URL,
        'endpoint': 'dashboard',
        'rules': json.dumps(list(
                Rule.objects.filter(user__exact=request.user).values()
            )),
        'hidden_posts': json.dumps(list(
                HiddenPost.objects.filter(user__exact=request.user).values()
            )),
    }
    if data_: data.update(data_)

    return render(request, 'dash.html', data)

def blog(request, blog):
    return main(request, data_={
        'title': "%s's blog" % blog,
        'endpoint': 'blog',
        'blog': blog,
    })
