from django.conf.urls import patterns, include, url
from django.views.generic.base import RedirectView

urlpatterns = patterns('',
    url(r'^$', 'wb.views.welcome.main'),
    url(r'^login$', 'wb.views.login.login'),
    url(r'^logout$', 'wb.views.login.logout'),
    url(r'^register$', 'wb.views.register.main'),
    url(r'^callback$', 'wb.views.register.callback'),
    url(r'^dash$', 'wb.views.dash.main'),
    url(r'^blog/([A-Za-z0-9-]+)$', 'wb.views.dash.blog'),
    url(r'^rules$', 'wb.views.rules.main'),
    url(r'^hide$', 'wb.views.rules.hide'),
    url(r'^settings$', 'wb.views.settings.main'),
    url(r'^namechange$', 'wb.views.namechange.main'),
    url(r'^faq$', 'wb.views.faq.main'),
    url(r'^favicon\.ico$', RedirectView.as_view(url='/static/images/favicon.ico')),
)
