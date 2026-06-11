from django.urls import path
from . import views
from orders.views import admin_orders, admin_order_detail
from reservations.views import admin_reservations, admin_reservation_detail

urlpatterns = [
    path('stats/', views.admin_stats),
    path('clients/', views.admin_clients),
    path('orders/', admin_orders),
    path('orders/<int:pk>/', admin_order_detail),
    path('reservations/', admin_reservations),
    path('reservations/<int:pk>/', admin_reservation_detail),
]
