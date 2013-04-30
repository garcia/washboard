from django import forms
from django.contrib import messages, auth
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from wb.forms import LoginForm
from wb.tumblr import Tumblr

def login(request):
    if request.method == 'GET':
        return redirect('/')
    form = LoginForm(request.POST)
    if not form.is_valid():
        messages.error(request, 'Invalid request.')
        return redirect('/')
    
    data = form.cleaned_data
    user = auth.authenticate(username=data['username'], password=data['password'])
    if not user:
        messages.error(request, 'Incorrect username or password.')
        return redirect('/')
    elif not user.is_active:
        messages.error(request, 'Sorry, your account is disabled.')
        return redirect('/')
    auth.login(request, user)

    # Check for name change, but don't care if something breaks
    try:
        profile = user.get_profile()
        req_name = Tumblr(
            profile.api_key,
            profile.api_secret,
            profile.token_key,
            profile.token_secret
        )
        userinfo = req_name.request_json(Tumblr.USER_INFO, 'GET')
        if user.username != userinfo['response']['user']['name']:
            request.session['oldname'] = user.username
            user.username = userinfo['response']['user']['name']
            user.save()
            return redirect('/namechange')
    except Exception:
        messages.warning(request, """
            Just FYI, we did a routine check to see if you changed your Tumblr
            username and something went wrong. This isn't necessarily bad, but
            if you keep seeing this message, please contact us.""")

    return redirect('/')

def logout(request):
    auth.logout(request)
    messages.success(request, 'You have logged out.')
    return redirect('/')
