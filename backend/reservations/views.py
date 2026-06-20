from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reservation, RestaurantTable
from .serializers import ReservationSerializer, RestaurantTableSerializer


def _is_admin(request):
    return request.user.is_authenticated and (request.user.is_admin or request.user.is_staff)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reservations(request):
    if request.method == 'GET':
        qs = request.user.reservations.all().order_by('-reservation_date')
        return Response(ReservationSerializer(qs, many=True).data)

    # POST : nouvelle réservation
    nb_personnes = request.data.get('guest_count')
    date = request.data.get('reservation_date')
    heure = request.data.get('reservation_time')

    if not all([nb_personnes, date, heure]):
        return Response({'error': 'Champs manquants'}, status=400)

    # On valide le nombre de convives avant toute requête (évite un crash ORM)
    try:
        nb_personnes = int(nb_personnes)
    except (ValueError, TypeError):
        return Response({'error': 'Nombre de convives invalide'}, status=400)
    if nb_personnes < 1 or nb_personnes > 20:
        return Response({'error': 'Le nombre de convives doit être entre 1 et 20'}, status=400)

    table_id = request.data.get('table_id')

    # trouver une table disponible avec capacité suffisante
    tables_occupees = Reservation.objects.filter(
        reservation_date=date,
        reservation_time=heure,
        status__in=['en_attente', 'confirmee'],
    ).values_list('table_id', flat=True)

    if table_id:
        table = RestaurantTable.objects.filter(id=table_id).first()
        if not table:
            return Response({'error': 'Table introuvable'}, status=400)
        if table.id in tables_occupees:
            return Response({'error': 'Cette table est déjà réservée pour ce créneau'}, status=400)
        if table.capacity < int(nb_personnes):
            return Response({'error': 'La capacité de cette table est insuffisante'}, status=400)
    else:
        table = RestaurantTable.objects.filter(
            capacity__gte=nb_personnes,
        ).exclude(id__in=tables_occupees).first()

    if not table:
        return Response({'error': 'Aucune table disponible pour ce créneau'}, status=400)

    reservation = Reservation.objects.create(
        user=request.user,
        reservation_date=date,
        reservation_time=heure,
        guest_count=nb_personnes,
        table=table,
    )

    return Response({
        'id_reservation': reservation.id,
        'status': reservation.status,
        'table_number': table.table_number,
    }, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def reservation_detail(request, pk):
    try:
        reservation = request.user.reservations.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE' or (request.method == 'PATCH' and request.data.get('status') == 'annulee'):
        if reservation.status == 'annulee':
            return Response({'error': 'Déjà annulée'}, status=400)
        reservation.status = 'annulee'
        reservation.save()
        return Response(ReservationSerializer(reservation).data)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)


# --- disponibilité des tables ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tables_availability(request):
    date = request.query_params.get('date')
    heure = request.query_params.get('time')

    if not date or not heure:
        return Response({'error': 'Paramètres date et time requis'}, status=400)

    tables_occupees = Reservation.objects.filter(
        reservation_date=date,
        reservation_time=heure,
        status__in=['en_attente', 'confirmee'],
    ).values_list('table_id', flat=True)

    tables = RestaurantTable.objects.all().order_by('table_number')
    serializer = RestaurantTableSerializer(tables, many=True)
    data = serializer.data

    for table_data in data:
        table_data['is_reserved'] = table_data['id'] in tables_occupees

    return Response(data)


# --- vues admin ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reservations(request):
    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    qs = Reservation.objects.all().order_by('-reservation_date')
    return Response(ReservationSerializer(qs, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_reservation_detail(request, pk):
    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        reservation = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    nouveau_status = request.data.get('status')
    statuts_valides = [s[0] for s in Reservation.STATUS_CHOICES]
    if nouveau_status not in statuts_valides:
        return Response({'error': 'Statut invalide'}, status=400)

    reservation.status = nouveau_status
    reservation.save()
    return Response(ReservationSerializer(reservation).data)
