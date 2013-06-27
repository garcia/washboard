import json
import random
import sys
import urlparse
import warnings

from django import forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.utils.datastructures import SortedDict

from wb.models import *

class RuleForm(forms.ModelForm):
    class Meta:
        model = Rule
        widgets = {'keyword': forms.TextInput()}

# Used on Rules page
class HiddenPostForm(forms.ModelForm):
    class Meta:
        model = HiddenPost
        widgets = {'post': forms.TextInput()}

# Used by "Hide this post" link in post context menus
class HidePostForm(forms.ModelForm):
    class Meta:
        model = HiddenPost
        exclude = ('user',)

class ImportSaviorForm(forms.Form):
    json = forms.CharField(widget=forms.Textarea)

@transaction.commit_on_success
def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    if request.method == 'POST':
        return post(request)
    else:
        return get(request)
    
def get(request):
    blacklist = [RuleForm(prefix='{prefix}', instance=Rule())]
    whitelist = [RuleForm(prefix='{prefix}', instance=Rule(blacklist=False))]
    hiddenposts = [HiddenPostForm(prefix='hp-{prefix}', instance=HiddenPost())]
    for i, r in enumerate(Rule.objects.filter(user__exact=request.user)
            .order_by('index')):
        form = RuleForm(instance=r, prefix=str(i))
        if r.blacklist:
            blacklist.append(form)
        else:
            whitelist.append(form)
    for i, p in enumerate(HiddenPost.objects.filter(user__exact=request.user)):
        hiddenposts.extend([HiddenPostForm(instance=p, prefix='hp-'+str(i))])

    data = {
        'title': 'Rules',
        'rulesets': ('blacklist', 'whitelist'),
        'rules': SortedDict([
            ('blacklist', blacklist),
            ('whitelist', whitelist),
        ]),
        'hiddenposts': hiddenposts,
        'importsavior': ImportSaviorForm(),
    }
    return render(request, 'rules.html', data)

def post(request):
    Rule.objects.filter(user__exact=request.user).delete()
    HiddenPost.objects.filter(user__exact=request.user).delete()

    # Rule prefixes
    prefixes = filter(
        lambda k: k.endswith('-keyword') and
                  not k.startswith('hp-') and
                  '{prefix}' not in k,
        request.POST
    )
    prefixes = [k.split('-')[0] for k in prefixes]
    try:
        prefixes.sort(key=int)
    except NameError:
        pass
    '''except ValueError:
        messages.error(request, """
            There was an invalid input name in your request.

            You can try again, but please contact us if the problem persists.
        """)'''
    i = 0

    # Add rules
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

    # XXX duplicated code follows; maybe merge HiddenPost into Blacklist?

    # Hidden post prefixes
    hp_prefixes= filter(
        lambda k: k.startswith('hp-') and
                  k.endswith('-post') and
                  '{prefix}' not in k,
        request.POST
    )
    hp_prefixes = [k.split('-')[1] for k in hp_prefixes]

    # Add hidden posts
    for prefix in hp_prefixes:
        # Empty?
        if not request.POST.get('hp-%s-%s' % (prefix, 'post'), ''):
            continue
        form = {}
        for field in HiddenPost._meta.fields:
            # Ignored fields
            if field.name in ('id', 'user'):
                continue
            postname = 'hp-%s-%s' % (prefix, field.name)
            form[field.name] = request.POST.get(postname, False)
        hp = HiddenPost(user=request.user, **form)
        hp.save()

    messages.success(request, 'Your rules have been saved.')

    return redirect('/rules')

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

def importsavior(request):
    max_len = filter(lambda f: f.name == 'keyword',
                     Rule._meta.fields)[0].max_length
    form = ImportSaviorForm(request.POST)
    if not form.is_valid():
        messages.error(request, 'Invalid form data.')
        return redirect('/rules')
    try:
        savior_data = json.loads(form.cleaned_data['json'])
    except ValueError:
        messages.error(request, 'Invalid save data. Are you sure you '
            'copy-pasted it directly from Tumblr Savior\'s Save/Load box?')
        return redirect('/rules')

    i = 0
    existing_rules = Rule.objects.filter(user__exact=request.user)
    if len(existing_rules):
        i = max(r.index for r in existing_rules) + 1
    imported = 0
    truncated = False

    for savior_list in ('listBlack', 'listWhite'):
        if savior_list not in savior_data:
            continue
        for keyword in savior_data[savior_list]:
            # Truncate keyword if necessary
            if len(keyword) > max_len:
                keyword = keyword[:max_len]
                truncated = True
            # Check for keyword's existence first
            try:
                Rule.objects.get(user=request.user, keyword=keyword)
            # If it doesn't exist, add it
            except Rule.DoesNotExist:
                try:
                    Rule(user=request.user, keyword=keyword, index=i,
                         blacklist=('Black' in savior_list)).save()
                    i += 1
                    imported += 1
                except IntegrityError:
                    pass

    messages.success(request, 'Imported %s rules successfully.' % imported)
    if truncated:
        messages.warning(request, 'Some of your keywords may have been cut '
                                  'off because they were too long.')
    return redirect('/rules')
