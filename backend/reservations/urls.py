from django.urls import path
from . import views

urlpatterns = [
    path('', views.reservations),
    path('<int:pk>/', views.reservation_detail),
    path('tables/', views.tables_availability),
]
