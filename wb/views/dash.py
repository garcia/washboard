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

def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    
    profile = request.user.get_profile()
    data = {
        'title': 'Dashboard',
        'dash': True,
        'BASE_URL': settings.BASE_URL,
        'api_key': profile.api_key,
        'api_secret': profile.api_secret,
        'token_key': profile.token_key,
        'token_secret': profile.token_secret,
        'rules': json.dumps(list(
                Rule.objects.filter(user__exact=request.user).values()
            )),
    }
    return render(request, 'dash.html', data)
