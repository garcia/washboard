from django import forms
from django.contrib import messages, auth
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

def main(request):
    if not request.user.is_authenticated():
        return redirect('/')

    oldname = request.session['oldname']
    del request.session['oldname']
    return render(request, 'namechange.html', {
        'oldname': oldname,
        'newname': request.user.username,
    })
