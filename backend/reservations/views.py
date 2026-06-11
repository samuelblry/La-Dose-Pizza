from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reservation, RestaurantTable
from .serializers import ReservationSerializer


def _is_admin(request):
    return request.user.is_authenticated and request.user.is_admin


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

    # trouver une table disponible avec capacité suffisante
    tables_occupees = Reservation.objects.filter(
        reservation_date=date,
        reservation_time=heure,
        status__in=['en_attente', 'confirmee'],
    ).values_list('table_id', flat=True)

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
