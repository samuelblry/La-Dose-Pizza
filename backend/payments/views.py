import stripe
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from orders.models import CustomerOrder

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Crée un PaymentIntent Stripe pour une commande existante."""
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'error': 'order_id requis'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        commande = CustomerOrder.objects.get(pk=order_id, user=request.user)
    except CustomerOrder.DoesNotExist:
        return Response({'error': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)

    # Montant en centimes (Stripe attend des entiers)
    montant_centimes = int(commande.total_amount * 100)

    intent = stripe.PaymentIntent.create(
        amount=montant_centimes,
        currency='eur',
        metadata={
            'order_id': commande.id,
            'invoice_number': commande.invoice_number,
        },
    )

    return Response({'client_secret': intent.client_secret})


@csrf_exempt
def stripe_webhook(request):
    """Reçoit les événements Stripe et met à jour la commande en conséquence."""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)
    else:
        # Mode dév sans webhook secret configuré
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            return HttpResponse(status=400)

    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        order_id = intent.get('metadata', {}).get('order_id')
        if order_id:
            try:
                commande = CustomerOrder.objects.get(pk=order_id)
                # Le paiement confirme la commande ; les points sont crédités à la livraison
                if commande.status == 'en_attente':
                    commande.status = 'en_preparation'
                    commande.save()
            except CustomerOrder.DoesNotExist:
                pass

    return HttpResponse(status=200)
