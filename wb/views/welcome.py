from django.conf import settings
from django.shortcuts import render, redirect

def main(request):
    if request.user.is_authenticated():
        return redirect('/dash')
    return render(request, 'welcome.html', {
        'environment': settings.ENVIRONMENT,
    })
