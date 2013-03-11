import json
import random
import sys
import urlparse

from django import forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import redirect, render

from wb.models import *

# TODO: allow user to change API key/secret

class SettingsForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        exclude = ('user',)
        widgets = {'keyword': forms.TextInput()}

@transaction.commit_on_success
def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    if request.method == 'POST':
        return post(request)
    else:
        return get(request)
    
def get(request):
    data = {
        'title': 'Settings',
        'settings': SettingsForm(),
    }
    return render(request, 'settings.html', data)

def post(request):
    UserProfile.objects.get(user__exact=request.user)
    if not RegistrationForm(request.POST).is_valid():
        messages.error(request, 'Please fill in all of the fields.')
        return redirect('/settings')
    return redirect('/settings')
