from django.urls import path
from . import views

urlpatterns = [
    path('create-intent/', views.create_payment_intent, name='payment-create-intent'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]
