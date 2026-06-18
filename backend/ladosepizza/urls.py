from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/reservations/', include('reservations.urls')),
    path('api/users/', include('users.profile_urls')),
    path('api/admin/', include('users.admin_urls')),
    path('api/payments/', include('payments.urls')),
    path('api/superadmin/', include('users.superadmin_urls')),
    # Sert les images uploadées même hors DEBUG (pas de proxy média dédié)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
