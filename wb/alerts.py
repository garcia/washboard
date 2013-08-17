from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect

from wb.models import Alert, SeenAlert

class AlertMiddleware(object):
    def process_request(self, request):
        if not request.user.is_authenticated():
            return
        alerts = set()
        for alert in Alert.objects.all():
            if not SeenAlert.objects.filter(
                    alert__exact=alert, user__exact=request.user).exists():
                # The user hasn't seen this alert yet; add it
                alerts.add(alert)
        request._alerts = alerts

def context_processor(request):
    if hasattr(request, '_alerts'):
        return {'alerts': list(request._alerts)}
    else:
        return {'alerts': []}

def seen(request):
    if not request.user.is_authenticated():
        return redirect('/')
    alert_id = request.POST.get('id')
    if not alert_id:
        return HttpResponse('NG')
    alert = get_object_or_404(Alert, pk=alert_id)
    seen_alert, created = SeenAlert.objects.get_or_create(alert=alert, user=request.user)
    if created:
        seen_alert.save()
    return HttpResponse('OK')
