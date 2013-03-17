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
from django.utils.datastructures import SortedDict

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
    blacklist = [RuleForm(prefix='{prefix}', instance=Rule())];
    whitelist = [RuleForm(prefix='{prefix}', instance=Rule(blacklist=False))]
    for i, r in enumerate(Rule.objects.filter(user__exact=request.user)
            .order_by('index')):
        form = RuleForm(instance=r, prefix=str(i))
        if r.blacklist:
            blacklist.append(form)
        else:
            whitelist.append(form)
    data = {
        'title': 'Rules',
        'rulesets': ('blacklist', 'whitelist'),
        'rules': SortedDict([
            ('blacklist', blacklist),
            ('whitelist', whitelist),
        ]),
    }
    return render(request, 'rules.html', data)

def post(request):
    Rule.objects.filter(user__exact=request.user).delete()
    prefixes = filter(
        lambda k: k.endswith('-keyword') and not k.startswith('{prefix}'),
        request.POST
    )
    prefixes = [k.split('-')[0] for k in prefixes]
    try:
        prefixes.sort(key=int)
    except ValueError:
        messages.error(request, """
            There was an invalid input name in your request.

            You can try again, but please contact us if the problem persists.
        """)
    i = 0
    for prefix in prefixes:
        # Empty?
        if not request.POST.get('%s-%s' % (prefix, 'keyword'), ''):
            continue
        form = {}
        for field in Rule._meta.fields:
            # Ignored fields
            if field.name in ('id', 'user', 'index'):
                continue
            postname = '%s-%s' % (prefix, field.name)
            form[field.name] = request.POST.get(postname, False)
        r = Rule(user=request.user, index=i, **form)
        r.save()
        i += 1
    return redirect('/rules')

class HidePostForm(forms.ModelForm):
    class Meta:
        model = HiddenPost
        exclude = ('user',)

def hide(request):
    form = HidePostForm(request.POST)
    if not form.is_valid():
        return HttpResponse(json.dumps({
            'meta': {'status': 403, 'msg': 'Form validation failed.'},
            'response': {},
        }))
    hidden_post = HiddenPost(user=request.user, post=form.cleaned_data['post'])
    hidden_post.save()
    return HttpResponse(json.dumps({
        'meta': {'status': 200, 'msg': 'OK'},
        'response': {},
    }), content_type='application/json')
