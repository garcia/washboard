from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = patterns('',
    url(r'^$', 'wb.views.welcome.main'),
    url(r'^logout$', 'wb.views.logout.main'),
    url(r'^register$', 'wb.views.register.main'),
    url(r'^callback$', 'wb.views.register.callback'),
    url(r'^setpassword$', 'wb.views.register.setpassword'),
    url(r'^changename$', 'wb.views.register.changename'),
    url(r'^getstarted$', 'wb.views.register.getstarted'),
    url(r'^api$', 'wb.views.api.main'),
    url(r'^dash$', 'wb.views.dash.main'),
    url(r'^blog/([A-Za-z0-9-]+)$', 'wb.views.dash.blog'),
    url(r'^blog/([A-Za-z0-9-]+)/inbox$', 'wb.views.dash.inbox'),
    url(r'^tagged/(.+)$', 'wb.views.dash.tagged'),
    url(r'^rules$', 'wb.views.rules.main'),
    url(r'^hide$', 'wb.views.rules.hide'),
    url(r'^importrules$', 'wb.views.rules.importrules'),
    url(r'^settings$', 'wb.views.settings.main'),
    url(r'^faq$', 'wb.views.faq.main'),
    url(r'^jserror$', 'wb.views.jserror.main'),
    url(r'^seen$', 'wb.alerts.seen'),
    url(r'^bookmark$', 'wb.views.bookmark.main'),
    url(r'^favicon\.ico$', RedirectView.as_view(url='/static/images/favicon.ico')),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
