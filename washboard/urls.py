from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^register/', 'wb.views.register.main'),
    url(r'^register/app', 'wb.views.register.app'),
    url(r'^register/callback', 'wb.views.register.callback'),
    url(r'^register/finish', 'wb.views.register.finish'),
    
    url(r'^dash/', 'wb.views.dash.main'),
)
