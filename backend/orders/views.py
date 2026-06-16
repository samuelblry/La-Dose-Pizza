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

    use_points = request.data.get('use_points', 0)
    try:
        use_points = int(use_points)
    except ValueError:
        use_points = 0

    if use_points < 0:
        return Response({'error': 'Points invalides'}, status=status.HTTP_400_BAD_REQUEST)
    if use_points > request.user.loyalty_points:
        return Response({'error': 'Points de fidélité insuffisants'}, status=status.HTTP_400_BAD_REQUEST)

    total = Decimal('0.00')
    lignes = []

    for item in items:
        qte = item.get('quantity', 1)
        pizza_id = item.get('pizza_id') or item.get('id_pizza')
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

    discount = Decimal(use_points) * Decimal('0.10')
    if discount > total:
        max_points = int(total / Decimal('0.10'))
        use_points = max_points
        discount = Decimal(use_points) * Decimal('0.10')

    montant_brut = total
    total -= discount

    commande = CustomerOrder.objects.create(
        user=request.user,
        invoice_number=_generer_numero_facture(),
        total_amount=total,
        gross_amount=montant_brut,
        points_used=use_points,
        order_type=request.data.get('order_type', 'livraison'),
        street=request.data.get('street', ''),
        zip_code=request.data.get('zip_code', ''),
        city=request.data.get('city', ''),
    )

    if use_points > 0:
        request.user.loyalty_points -= use_points
        request.user.save()

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
    c = canvas.Canvas(buffer, pagesize=A4)
    largeur, hauteur = A4

    # --- Palette couleurs ---
    DARK      = (0.102, 0.008, 0.000)   # #1A0200
    ROUGE     = (0.706, 0.188, 0.141)   # #B43024
    AMBRE     = (0.902, 0.647, 0.341)   # #E6A557
    CREME     = (0.957, 0.882, 0.800)   # #F4E1CC
    GRIS_CLAIR = (0.95, 0.95, 0.95)
    BLANC     = (1, 1, 1)

    def set_fill(rgb):
        c.setFillColorRGB(*rgb)

    def set_stroke(rgb):
        c.setStrokeColorRGB(*rgb)

    # =========================================================
    # EN-TÊTE — bandeau rouge foncé
    # =========================================================
    set_fill(ROUGE)
    c.rect(0, hauteur - 110, largeur, 110, fill=1, stroke=0)

    # Nom de l'enseigne
    set_fill(BLANC)
    c.setFont('Helvetica-Bold', 28)
    c.drawString(40, hauteur - 52, 'LA DOSE PIZZA')

    # Tagline
    c.setFont('Helvetica', 9)
    set_fill((1, 1, 1))
    c.drawString(40, hauteur - 68, 'FINGER-LICKING GOOD')

    # Coordonnées enseigne (droite)
    c.setFont('Helvetica', 8)
    set_fill(CREME)
    ligne_ens = [
        '12 Rue de la Farine, 75001 Paris',
        'Tél : +33 1 23 45 67 89',
        'contact@ladosepizza.fr',
        'SIRET : 000 000 000 00000',
    ]
    y_ens = hauteur - 38
    for txt in ligne_ens:
        c.drawRightString(largeur - 40, y_ens, txt)
        y_ens -= 14

    # =========================================================
    # BLOC TITRE FACTURE + NUMÉRO
    # =========================================================
    y = hauteur - 145
    set_fill(DARK)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(40, y, 'FACTURE')

    set_fill(ROUGE)
    c.setFont('Helvetica-Bold', 12)
    c.drawRightString(largeur - 40, y, commande.invoice_number)

    # Ligne séparatrice ambrée
    set_stroke(AMBRE)
    c.setLineWidth(1.5)
    c.line(40, y - 8, largeur - 40, y - 8)

    # =========================================================
    # INFO CLIENT + DATE (deux colonnes)
    # =========================================================
    y -= 32
    user = commande.user
    nom_client = f'{user.first_name} {user.last_name}'.strip() or user.email

    # Colonne gauche : client
    set_fill(ROUGE)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(40, y, 'FACTURÉ À')
    y -= 14
    set_fill(DARK)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(40, y, nom_client)
    y -= 13
    c.setFont('Helvetica', 9)
    infos_client = [user.email]
    if user.phone:
        infos_client.append(user.phone)
    if commande.order_type == 'livraison' and commande.street:
        infos_client.append(commande.street)
        infos_client.append(f'{commande.zip_code} {commande.city}'.strip())
    for info in infos_client:
        c.drawString(40, y, info)
        y -= 12

    # Colonne droite : dates et infos commande
    col2_x = largeur / 2 + 20
    y_col2 = hauteur - 177
    set_fill(ROUGE)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(col2_x, y_col2, 'DÉTAILS DE LA COMMANDE')
    y_col2 -= 14
    set_fill(DARK)
    c.setFont('Helvetica', 9)
    details = [
        ('Date :', commande.order_date.strftime('%d/%m/%Y à %H:%M')),
        ('Type :', 'Livraison' if commande.order_type == 'livraison' else 'Sur place'),
        ('Statut :', dict(CustomerOrder.STATUS_CHOICES).get(commande.status, commande.status)),
    ]
    for label, val in details:
        c.setFont('Helvetica-Bold', 9)
        c.drawString(col2_x, y_col2, label)
        c.setFont('Helvetica', 9)
        c.drawString(col2_x + 55, y_col2, val)
        y_col2 -= 13

    # =========================================================
    # TABLEAU DES ARTICLES
    # =========================================================
    # Démarrer sous le bloc le plus bas
    y_tableau = min(y, y_col2) - 20

    # En-tête tableau
    col_art = 40
    col_qte = 340
    col_pu  = 400
    col_tot = 480
    col_fin = largeur - 40

    set_fill(DARK)
    c.rect(col_art, y_tableau - 4, col_fin - col_art, 20, fill=1, stroke=0)
    set_fill(BLANC)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(col_art + 6, y_tableau + 4, 'ARTICLE')
    c.drawString(col_qte,     y_tableau + 4, 'QTÉ')
    c.drawString(col_pu,      y_tableau + 4, 'PRIX UNIT. HT')
    c.drawString(col_tot,     y_tableau + 4, 'TOTAL HT')
    y_tableau -= 18

    # Lignes articles
    TAUX_TVA = Decimal('0.10')  # TVA 10% restauration
    lignes = commande.lines.all()
    total_ht = Decimal('0.00')

    for idx, ligne in enumerate(lignes):
        if ligne.pizza:
            article = ligne.pizza.name
        elif ligne.drink:
            article = ligne.drink.name
        elif ligne.dessert:
            article = ligne.dessert.name
        else:
            article = 'Article'

        pu_ttc  = ligne.unit_price
        pu_ht   = (pu_ttc / (1 + TAUX_TVA)).quantize(Decimal('0.01'))
        sous_ht = (pu_ht * ligne.quantity).quantize(Decimal('0.01'))
        total_ht += sous_ht

        # Fond alterné
        if idx % 2 == 0:
            set_fill(GRIS_CLAIR)
            c.rect(col_art, y_tableau - 4, col_fin - col_art, 18, fill=1, stroke=0)

        set_fill(DARK)
        c.setFont('Helvetica', 9)
        c.drawString(col_art + 6, y_tableau + 4, article[:48])
        c.drawString(col_qte,     y_tableau + 4, str(ligne.quantity))
        c.drawString(col_pu,      y_tableau + 4, f'{pu_ht:.2f} €')
        c.drawString(col_tot,     y_tableau + 4, f'{sous_ht:.2f} €')
        y_tableau -= 18

    # =========================================================
    # TOTAUX
    # =========================================================
    y_tableau -= 8
    set_stroke((0.8, 0.8, 0.8))
    c.setLineWidth(0.5)
    c.line(col_qte, y_tableau + 8, col_fin, y_tableau + 8)

    tva_montant = (total_ht * TAUX_TVA).quantize(Decimal('0.01'))
    total_ttc_avant_remise = (total_ht + tva_montant).quantize(Decimal('0.01'))

    def ligne_total(label, valeur, bold=False, couleur=DARK):
        nonlocal y_tableau
        set_fill(couleur)
        police = 'Helvetica-Bold' if bold else 'Helvetica'
        c.setFont(police, 9)
        c.drawRightString(col_tot - 10, y_tableau, label)
        c.setFont('Helvetica-Bold' if bold else 'Helvetica', 9)
        c.drawString(col_tot, y_tableau, f'{valeur:.2f} €')
        y_tableau -= 15

    ligne_total('Sous-total HT', total_ht)
    ligne_total(f'TVA (10% restauration)', tva_montant)
    ligne_total('Total TTC', total_ttc_avant_remise)

    if commande.points_used > 0:
        remise = (Decimal(commande.points_used) * Decimal('0.10')).quantize(Decimal('0.01'))
        y_tableau -= 4
        set_fill(AMBRE)
        c.setFont('Helvetica', 8)
        c.drawRightString(col_tot - 10, y_tableau, f'Réduction fidélité ({commande.points_used} pts)')
        c.drawString(col_tot, y_tableau, f'-{remise:.2f} €')
        y_tableau -= 15

    # Total final encadré
    y_tableau -= 4
    set_fill(ROUGE)
    c.rect(col_qte - 10, y_tableau - 6, col_fin - col_qte + 10, 22, fill=1, stroke=0)
    set_fill(BLANC)
    c.setFont('Helvetica-Bold', 11)
    c.drawRightString(col_tot - 10, y_tableau + 4, 'TOTAL À PAYER')
    c.drawString(col_tot, y_tableau + 4, f'{commande.total_amount:.2f} €')

    # =========================================================
    # POINTS DE FIDÉLITÉ GAGNÉS
    # =========================================================
    if commande.status == 'livree':
        base = commande.gross_amount if commande.gross_amount else commande.total_amount
        pts_gagnes = int(base)
        y_pts = y_tableau - 40
        set_fill(AMBRE)
        c.roundRect(40, y_pts - 10, 240, 32, 6, fill=1, stroke=0)
        set_fill(DARK)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(52, y_pts + 10, f'✓  {pts_gagnes} points de fidélité crédités sur cette commande')
        c.setFont('Helvetica', 8)
        c.drawString(52, y_pts - 1, 'Retrouvez vos points dans votre espace client.')

    # =========================================================
    # PIED DE PAGE
    # =========================================================
    set_fill(ROUGE)
    c.rect(0, 0, largeur, 40, fill=1, stroke=0)
    set_fill(BLANC)
    c.setFont('Helvetica', 7.5)
    c.drawCentredString(
        largeur / 2, 24,
        'La Dose Pizza — 12 Rue de la Farine, 75001 Paris — contact@ladosepizza.fr — SIRET : 000 000 000 00000'
    )
    c.setFont('Helvetica', 7)
    set_fill(CREME)
    c.drawCentredString(largeur / 2, 12, 'TVA non applicable selon l\'article 293 B du CGI — Conservez ce document.')

    c.showPage()
    c.save()
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

    # points de fidélité : 1 pt par euro sur le montant brut, à la livraison
    if nouveau_status == 'livree' and ancien_status != 'livree':
        user = commande.user
        base = commande.gross_amount if commande.gross_amount else commande.total_amount
        user.loyalty_points += int(base)
        user.save()

    return Response(OrderSerializer(commande).data)
