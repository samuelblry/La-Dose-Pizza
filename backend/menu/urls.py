from django.urls import path
from . import views

urlpatterns = [
    path('pizzas/', views.pizzas),
    path('pizzas/<int:pk>/', views.pizza_detail),
    path('drinks/', views.drinks),
    path('desserts/', views.desserts),
]
