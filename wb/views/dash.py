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
    return render(request, 'dash.main.tpl', {})
