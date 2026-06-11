import uuid
from decimal import Decimal
from io import BytesIO
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from .models import CustomerOrder, OrderLine
from .serializers import OrderSerializer
from menu.models import Pizza, Drink, Dessert


def _is_admin(request):
    return request.user.is_authenticated and request.user.is_admin


def _generer_numero_facture():
    return f"FAC-{uuid.uuid4().hex[:8].upper()}"


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def orders(request):
    if request.method == 'GET':
        qs = request.user.orders.all().order_by('-order_date')
        return Response(OrderSerializer(qs, many=True).data)

    # POST : création d'une commande
    items = request.data.get('items', [])
    if not items:
        return Response({'error': 'Panier vide'}, status=status.HTTP_400_BAD_REQUEST)

    total = Decimal('0.00')
    lignes = []

    for item in items:
        qte = item.get('quantity', 1)
        pizza_id = item.get('pizza_id')
        drink_id = item.get('drink_id')
        dessert_id = item.get('dessert_id')
        prix_unitaire = None

        if pizza_id:
            try:
                p = Pizza.objects.get(pk=pizza_id, is_available=True)
                prix_unitaire = p.base_price
                lignes.append({'pizza': p, 'drink': None, 'dessert': None, 'quantity': qte, 'unit_price': prix_unitaire})
            except Pizza.DoesNotExist:
                return Response({'error': f'Pizza {pizza_id} introuvable'}, status=400)
        elif drink_id:
            try:
                d = Drink.objects.get(pk=drink_id, is_available=True)
                prix_unitaire = d.price
                lignes.append({'pizza': None, 'drink': d, 'dessert': None, 'quantity': qte, 'unit_price': prix_unitaire})
            except Drink.DoesNotExist:
                return Response({'error': f'Boisson {drink_id} introuvable'}, status=400)
        elif dessert_id:
            try:
                ds = Dessert.objects.get(pk=dessert_id, is_available=True)
                prix_unitaire = ds.price
                lignes.append({'pizza': None, 'drink': None, 'dessert': ds, 'quantity': qte, 'unit_price': prix_unitaire})
            except Dessert.DoesNotExist:
                return Response({'error': f'Dessert {dessert_id} introuvable'}, status=400)

        if prix_unitaire is not None:
            total += prix_unitaire * qte

    commande = CustomerOrder.objects.create(
        user=request.user,
        invoice_number=_generer_numero_facture(),
        total_amount=total,
        order_type=request.data.get('order_type', 'livraison'),
        street=request.data.get('street', ''),
        zip_code=request.data.get('zip_code', ''),
        city=request.data.get('city', ''),
    )

    for l in lignes:
        OrderLine.objects.create(order=commande, **l)

    return Response({
        'id_order': commande.id,
        'invoice_number': commande.invoice_number,
        'total_amount': str(commande.total_amount),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_invoice(request, pk):
    try:
        commande = CustomerOrder.objects.get(pk=pk, user=request.user)
    except CustomerOrder.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    largeur, hauteur = A4

    p.setFont('Helvetica-Bold', 18)
    p.drawString(50, hauteur - 60, 'La Dose Pizza')
    p.setFont('Helvetica', 12)
    p.drawString(50, hauteur - 85, 'Facture')
    p.drawString(50, hauteur - 110, f'N° {commande.invoice_number}')
    p.drawString(50, hauteur - 130, f'Date : {commande.order_date.strftime("%d/%m/%Y %H:%M")}')
    p.drawString(50, hauteur - 150, f'Client : {commande.user.email}')

    y = hauteur - 190
    p.setFont('Helvetica-Bold', 11)
    p.drawString(50, y, 'Article')
    p.drawString(350, y, 'Qté')
    p.drawString(420, y, 'Prix unit.')
    p.drawString(490, y, 'Total')
    y -= 20

    p.setFont('Helvetica', 11)
    for ligne in commande.lines.all():
        article = ''
        if ligne.pizza:
            article = ligne.pizza.name
        elif ligne.drink:
            article = ligne.drink.name
        elif ligne.dessert:
            article = ligne.dessert.name
        sous_total = ligne.unit_price * ligne.quantity
        p.drawString(50, y, article[:40])
        p.drawString(350, y, str(ligne.quantity))
        p.drawString(420, y, f'{ligne.unit_price:.2f} €')
        p.drawString(490, y, f'{sous_total:.2f} €')
        y -= 20

    y -= 10
    p.setFont('Helvetica-Bold', 12)
    p.drawString(420, y, f'Total : {commande.total_amount:.2f} €')

    p.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=f'facture_{commande.invoice_number}.pdf')


# --- vues admin ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    qs = CustomerOrder.objects.all().order_by('-order_date')
    return Response(OrderSerializer(qs, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_order_detail(request, pk):
    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        commande = CustomerOrder.objects.get(pk=pk)
    except CustomerOrder.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    nouveau_status = request.data.get('status')
    statuts_valides = [s[0] for s in CustomerOrder.STATUS_CHOICES]
    if nouveau_status not in statuts_valides:
        return Response({'error': 'Statut invalide'}, status=400)

    ancien_status = commande.status
    commande.status = nouveau_status
    commande.save()

    # points de fidélité : 1 pt par euro à la livraison
    if nouveau_status == 'livree' and ancien_status != 'livree':
        user = commande.user
        user.loyalty_points += int(commande.total_amount)
        user.save()

    return Response(OrderSerializer(commande).data)
