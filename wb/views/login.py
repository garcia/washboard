from django import forms
from django.contrib import messages, auth
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from wb.forms import LoginForm

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
    return redirect('/')

def logout(request):
    auth.logout(request)
    messages.success(request, 'You have logged out.')
    return redirect('/')
