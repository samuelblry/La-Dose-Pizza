from django.urls import path
from . import superadmin_views as v

urlpatterns = [
    path('stats/', v.superadmin_stats),
    path('employees/', v.superadmin_employees),
    path('employees/<int:pk>/', v.superadmin_employee_detail),
    path('employees/<int:pk>/reset-password/', v.superadmin_employee_reset_password),
    path('users/', v.superadmin_users),
    path('logs/', v.superadmin_logs),
]
