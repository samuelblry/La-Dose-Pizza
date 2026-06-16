from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.me),
    path('me/password/', views.me_password),
]
