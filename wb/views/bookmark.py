from django.http import HttpResponse

from wb.models import *

def main(request):
    if not request.user.is_authenticated():
        return redirect('/')
    if request.method == 'POST':
        return post(request)
    return HttpResponse('invalid request')

def post(request):
    tag = request.POST.get('tag')
    action = request.POST.get('action')

    if tag:
        if action == 'bookmark':
            Bookmark.objects.get_or_create(user=request.user, tag=tag)
        elif action == 'unbookmark':
            Bookmark.objects.filter(user=request.user, tag=tag).delete()
        else:
            return HttpResponse('invalid action')
        return HttpResponse('OK')
    return HttpResponse('invalid tag')
