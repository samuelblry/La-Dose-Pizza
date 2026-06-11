from django.urls import path
from . import views

urlpatterns = [
    path('', views.orders),
    path('<int:pk>/invoice/', views.order_invoice),
]
