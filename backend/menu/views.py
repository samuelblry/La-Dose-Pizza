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

        search = request.query_params.get('search', '')
        dispo_only = request.query_params.get('dispo_only', 'false').lower() == 'true'
        ingredients = request.query_params.get('ingredients', '')
        allergenes_exclude = request.query_params.get('allergenes_exclude', '')
        ordering = request.query_params.get('ordering', 'defaut')

        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        # les non-admins ne voient que les pizzas disponibles (ou si dispo_only est true)
        if dispo_only or not (request.user.is_authenticated and request.user.is_admin):
            qs = qs.filter(is_available=True)

        if ingredients:
            ing_list = [i.strip() for i in ingredients.split(',')]
            qs = qs.filter(ingredients__name__in=ing_list).distinct()

        if allergenes_exclude:
            al_list = [a.strip() for a in allergenes_exclude.split(',')]
            qs = qs.exclude(ingredients__allergens__name__in=al_list).distinct()

        if ordering == 'prix_asc':
            qs = qs.order_by('base_price')
        elif ordering == 'prix_desc':
            qs = qs.order_by('-base_price')
        elif ordering == 'nom':
            qs = qs.order_by('name')

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
