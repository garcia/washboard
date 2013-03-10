from django.shortcuts import render, redirect

from wb.forms import LoginForm

def main(request):
    if request.user.is_authenticated():
        return redirect('/dash')
    return render(request, 'welcome.html', {
        'form': LoginForm(),
    })
