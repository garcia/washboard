from django.core.mail import mail_admins
from django.http import HttpResponse

def main(request):
    report = '\n\n'.join('%s = %s' % (k, v) for (k, v) in request.POST.items())
    mail_admins("Reported JavaScript error", report)
    return HttpResponse('ok')
