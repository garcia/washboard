import json
import random
import sys
import urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django import forms
from django.http import HttpResponse
from django.shortcuts import redirect, render

from wb.models import *

class RuleForm(forms.ModelForm):
    class Meta:
        model = Rule
        widgets = {'keyword': forms.TextInput()}

def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    
    rules = [RuleForm(prefix='{prefix}')];
    rules.extend(RuleForm(instance=r, prefix=r.keyword)
        for r in Rule.objects.filter(user__exact=request.user))
    data = {
        'rules': rules,
    }
    return render(request, 'rules.tpl', data)
