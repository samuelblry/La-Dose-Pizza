import random
import string

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum

from .models import UserAccount, LoginLog
from .serializers import AdminClientSerializer, EmployeeSerializer, LoginLogSerializer


def _check_superadmin(request):
    return request.user.is_authenticated and request.user.is_superadmin


def _generate_temp_password():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=10))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def superadmin_stats(request):
    if not _check_superadmin(request):
        return Response(status=403)
    from orders.models import CustomerOrder
    from reservations.models import Reservation

    total_revenue = CustomerOrder.objects.filter(status='livree').aggregate(
        s=Sum('total_amount')
    )['s'] or 0
    return Response({
        'total_revenue': float(total_revenue),
        'total_orders': CustomerOrder.objects.count(),
        'total_reservations': Reservation.objects.count(),
        'total_clients': UserAccount.objects.filter(is_staff=False, is_admin=False).count(),
        'total_employees': UserAccount.objects.filter(is_staff=True, is_superadmin=False).count(),
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def superadmin_employees(request):
    if not _check_superadmin(request):
        return Response(status=403)

    if request.method == 'GET':
        employees = UserAccount.objects.filter(is_staff=True, is_superadmin=False).order_by('id')
        return Response(EmployeeSerializer(employees, many=True).data)

    email = request.data.get('email', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    is_admin = bool(request.data.get('is_admin', False))
    if not email:
        return Response({'error': 'Email requis'}, status=400)
    if UserAccount.objects.filter(email=email).exists():
        return Response({'error': 'Email déjà utilisé'}, status=400)

    temp_pwd = _generate_temp_password()
    emp = UserAccount.objects.create_user(
        email=email,
        password=temp_pwd,
        first_name=first_name,
        last_name=last_name,
        is_admin=is_admin,
        is_staff=True,
    )
    return Response({
        'id': emp.id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'temp_password': temp_pwd,
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def superadmin_employee_detail(request, pk):
    if not _check_superadmin(request):
        return Response(status=403)
    try:
        emp = UserAccount.objects.get(pk=pk, is_staff=True, is_superadmin=False)
    except UserAccount.DoesNotExist:
        return Response({'error': 'Introuvable'}, status=404)
    emp.delete()
    return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def superadmin_employee_reset_password(request, pk):
    if not _check_superadmin(request):
        return Response(status=403)
    try:
        emp = UserAccount.objects.get(pk=pk, is_staff=True, is_superadmin=False)
    except UserAccount.DoesNotExist:
        return Response({'error': 'Introuvable'}, status=404)
    temp_pwd = _generate_temp_password()
    emp.set_password(temp_pwd)
    emp.save()
    return Response({'temp_password': temp_pwd, 'name': emp.first_name or emp.email})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def superadmin_users(request):
    if not _check_superadmin(request):
        return Response(status=403)
    users = UserAccount.objects.filter(is_admin=False, is_staff=False).order_by('id')
    return Response(AdminClientSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def superadmin_logs(request):
    if not _check_superadmin(request):
        return Response(status=403)
    logs = LoginLog.objects.select_related('user')[:200]
    return Response(LoginLogSerializer(logs, many=True).data)
