from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Pizza, Drink, Dessert
from .serializers import PizzaSerializer, DrinkSerializer, DessertSerializer


def _is_admin(request):
    return request.user.is_authenticated and request.user.is_admin


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def pizzas(request):
    if request.method == 'GET':
        qs = Pizza.objects.all()
        # les non-admins ne voient que les pizzas disponibles
        if not (request.user.is_authenticated and request.user.is_admin):
            qs = qs.filter(is_available=True)
        serializer = PizzaSerializer(qs, many=True)
        return Response(serializer.data)

    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    serializer = PizzaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def pizza_detail(request, pk):
    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        pizza = Pizza.objects.get(pk=pk)
    except Pizza.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = PizzaSerializer(pizza, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    pizza.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def drinks(request):
    qs = Drink.objects.filter(is_available=True)
    return Response(DrinkSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def desserts(request):
    qs = Dessert.objects.filter(is_available=True)
    return Response(DessertSerializer(qs, many=True).data)
