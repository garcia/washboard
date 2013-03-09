from django import forms
from django.contrib import messages, auth
from django.contrib.auth.models import User

class LoginForm(forms.Form):
    username = forms.CharField(
        max_length=30,
        error_messages={
            'required': 'Please enter your name.',
        },  
        widget=forms.TextInput(attrs={'placeholder': 'Username'}),
    )   
    password = forms.CharField(
        label='Password',
        error_messages={
            'required': 'Please enter your password.',
        },  
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
    )

