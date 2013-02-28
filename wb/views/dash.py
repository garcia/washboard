import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render

from wb.models import *

def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    
    profile = request.user.get_profile()
    data = {
        'dash': True,
        'api_key': profile.api_key,
        'api_secret': profile.api_secret,
        'token_key': profile.token_key,
        'token_secret': profile.token_secret,
    }
    return render(request, 'dash.tpl', data)
