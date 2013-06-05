from django import forms
from django.contrib import messages, auth
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from wb.forms import LoginForm
from wb.tumblr import Tumblr

def main(request):
    auth.logout(request)
    messages.success(request, 'You have logged out.')
    return redirect('/')
