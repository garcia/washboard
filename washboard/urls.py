from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'wb.views.login.main'),
    url(r'^login$', 'wb.views.login.login'),

    url(r'^register/$', 'wb.views.register.main'),
    url(r'^register/app$', 'wb.views.register.app'),
    url(r'^register/callback$', 'wb.views.register.callback'),
    
    url(r'^dash', 'wb.views.dash.main'),
)
