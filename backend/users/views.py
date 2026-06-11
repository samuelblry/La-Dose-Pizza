from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UserAccount
from .serializers import RegisterSerializer, UserProfileSerializer, AdminClientSerializer
from orders.models import CustomerOrder


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Compte créé'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'is_admin': user.is_admin,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Déconnecté'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


# --- vues admin ---

def _check_admin(request):
    return request.user.is_authenticated and request.user.is_admin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not _check_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    from django.utils import timezone
    from reservations.models import Reservation
    today = timezone.now().date()
    orders_today = CustomerOrder.objects.filter(order_date__date=today).count()
    pending_reservations = Reservation.objects.filter(status='en_attente').count()
    total_clients = UserAccount.objects.filter(is_admin=False).count()
    return Response({
        'orders_today': orders_today,
        'pending_reservations': pending_reservations,
        'total_clients': total_clients,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_clients(request):
    if not _check_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    clients = UserAccount.objects.filter(is_admin=False)
    serializer = AdminClientSerializer(clients, many=True)
    return Response(serializer.data)
