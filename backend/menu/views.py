from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Pizza, Drink, Dessert, Ingredient, PizzaRecipe, Allergen, HasAllergen
from .serializers import PizzaSerializer, DrinkSerializer, DessertSerializer

# Mapping ingrédient → allergènes (EU-14), miroir de frontend/src/data/ingredients.js
_ALLERGENES = {
    'Crème fraîche': ['Lactose'],
    'Mozzarella': ['Lactose'],
    'Burrata': ['Lactose'],
    'Gorgonzola': ['Lactose'],
    'Parmesan': ['Lactose'],
    'Ricotta': ['Lactose'],
    'Chèvre': ['Lactose'],
    'Emmental': ['Lactose'],
    'Pepperoni': ['Gluten'],
    'Chorizo': ['Gluten'],
    'Merguez': ['Gluten'],
    'Anchois': ['Poisson'],
    'Thon': ['Poisson'],
    'Crevettes': ['Crustacés'],
    'Œuf': ['Œufs'],
}


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

        # La gestion de l'affichage (grisé / à la fin) se fait maintenant côté front
        if dispo_only:
            qs = qs.filter(is_available=True)

        if ingredients:
            ing_list = [i.strip() for i in ingredients.split(',')]
            qs = qs.filter(ingredients__name__in=ing_list).distinct()

        if allergenes_exclude:
            al_list = [a.strip() for a in allergenes_exclude.split(',')]
            qs = qs.exclude(ingredients__allergens__name__in=al_list).distinct()

        if ordering == 'prix_asc':
            qs = qs.order_by('base_price', 'id')
        elif ordering == 'prix_desc':
            qs = qs.order_by('-base_price', 'id')
        elif ordering == 'nom':
            qs = qs.order_by('name', 'id')
        else:
            qs = qs.order_by('id')

        serializer = PizzaSerializer(qs, many=True)
        return Response(serializer.data)

    if not _is_admin(request):
        return Response(status=status.HTTP_403_FORBIDDEN)
    serializer = PizzaSerializer(data=request.data)
    if serializer.is_valid():
        pizza = serializer.save()
        noms = request.data.getlist('ingredients')
        for nom in noms:
            nom = nom.strip()
            if not nom:
                continue
            ing, _ = Ingredient.objects.get_or_create(name=nom)
            for al_nom in _ALLERGENES.get(nom, []):
                al, _ = Allergen.objects.get_or_create(name=al_nom)
                HasAllergen.objects.get_or_create(ingredient=ing, allergen=al)
            PizzaRecipe.objects.get_or_create(pizza=pizza, ingredient=ing)
        return Response(PizzaSerializer(pizza).data, status=status.HTTP_201_CREATED)
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
