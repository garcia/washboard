from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^register/', include('register.urls')),
    #url(r'^dashboard$', 'dash.views.main'),
    # Examples:
    # url(r'^$', 'washboard.views.home', name='home'),
    # url(r'^washboard/', include('washboard.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
