from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    (r'^$', 'register.views.main'),
    (r'^app$', 'register.views.app'),
    (r'^callback$', 'register.views.callback'),
    (r'^finish$', 'register.views.finish'),
)
