from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'wb.views.login.main'),
    url(r'^login$', 'wb.views.login.login'),
    url(r'^logout$', 'wb.views.login.logout'),

    url(r'^register$', 'wb.views.register.main'),
    url(r'^callback$', 'wb.views.register.callback'),
    
    url(r'^dash', 'wb.views.dash.main'),

    url(r'^rules', 'wb.views.rules.main'),
    
    (r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/images/favicon.ico'}),
)
