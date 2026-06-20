from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from .models import UserAccount, Address, LoginLog
from .serializers import RegisterSerializer, UserProfileSerializer, AdminClientSerializer
from .validators import validate_phone, validate_zip_code, validate_name, validate_street
from orders.models import CustomerOrder


# Limite les tentatives de connexion par IP
class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


# Valide le format des champs fournis ; renvoie un message d'erreur ou None
def _valider_champs(data):
    regles = {
        'first_name': validate_name,
        'last_name': validate_name,
        'phone': validate_phone,
        'street': validate_street,
        'zip_code': validate_zip_code,
        'city': validate_name,
        'email': validate_email,
    }
    for champ, validateur in regles.items():
        valeur = data.get(champ)
        if valeur in (None, ''):
            continue
        try:
            validateur(valeur)
        except DjangoValidationError as e:
            return ' '.join(e.messages)
    return None


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
@throttle_classes([LoginRateThrottle])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
    ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR', '')
    if ip and ',' in ip:
        ip = ip.split(',')[0].strip()
    LoginLog.objects.create(user=user, ip_address=ip or None)
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'is_admin': user.is_admin,
        'is_superadmin': user.is_superadmin,
        'is_staff': user.is_staff,
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


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if request.method == 'GET':
        return Response(UserProfileSerializer(user).data)

    if request.method == 'PATCH':
        nouvel_email = request.data.get('email')
        if nouvel_email and nouvel_email != user.email and \
                UserAccount.objects.filter(email=nouvel_email).exclude(pk=user.pk).exists():
            return Response({'error': 'Cet email est déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation des champs modifiés (formats cohérents)
        erreur_format = _valider_champs(request.data)
        if erreur_format:
            return Response({'error': erreur_format}, status=status.HTTP_400_BAD_REQUEST)

        champs_user = ('first_name', 'last_name', 'email', 'phone')
        for champ in champs_user:
            if champ in request.data:
                setattr(user, champ, request.data[champ])
        user.save()

        # mise à jour ou création de l'adresse
        champs_adresse = {k: request.data[k] for k in ('street', 'zip_code', 'city') if k in request.data}
        if champs_adresse:
            adresse = user.addresses.first()
            if adresse:
                for k, v in champs_adresse.items():
                    setattr(adresse, k, v)
                adresse.save()
            else:
                Address.objects.create(user=user, **champs_adresse)

        return Response(UserProfileSerializer(user).data)

    if request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def me_password(request):
    current = request.data.get('current_password', '')
    new = request.data.get('new_password', '')

    if not current or not new:
        return Response(
            {'error': 'current_password et new_password requis'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    try:
        validate_password(new, user)
    except DjangoValidationError as e:
        return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(current):
        return Response(
            {'error': 'Mot de passe actuel incorrect'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new)
    user.save()
    return Response({'message': 'Mot de passe mis à jour'})


# --- vues admin ---

def _check_admin(request):
    return request.user.is_authenticated and (request.user.is_admin or request.user.is_staff)


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
    total_clients = UserAccount.objects.filter(is_staff=False, is_admin=False).count()
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
    clients = UserAccount.objects.filter(is_admin=False, is_staff=False)
    serializer = AdminClientSerializer(clients, many=True)
    return Response(serializer.data)
