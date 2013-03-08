import json
import random
import sys
import urlparse

from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import redirect, render

from wb.models import *

class RuleForm(forms.ModelForm):
    class Meta:
        model = Rule
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
    rules = [RuleForm(prefix='{prefix}')];
    rules.extend(RuleForm(instance=r, prefix=r.keyword)
        for r in Rule.objects.filter(user__exact=request.user))
    data = {
        'title': 'Rules',
        'rules': rules,
    }
    return render(request, 'rules.tpl', data)

def post(request):
    Rule.objects.filter(user__exact=request.user).delete()
    prefixes = filter(lambda k: k.endswith('-keyword'), request.POST)
    prefixes = [k.split('-')[0] for k in prefixes]
    for prefix in prefixes:
        # Defaults
        if prefix == '{prefix}':
            continue
        # Empty?
        if not request.POST.get('%s-%s' % (prefix, 'keyword'), ''):
            continue
        form = {}
        for field in Rule._meta.fields:
            # Ignored fields
            if field.name in ('id', 'user'):
                continue
            postname = '%s-%s' % (prefix, field.name)
            form[field.name] = request.POST.get(postname, False)
        r = Rule(user=request.user, **form)
        r.save()
    return redirect('/rules')
