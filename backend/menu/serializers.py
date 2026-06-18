from rest_framework import serializers
from .models import Pizza, Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'extra_cost']


class PizzaSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, read_only=True)
    allergens = serializers.SerializerMethodField()

    class Meta:
        model = Pizza
        fields = ['id', 'name', 'description', 'base_price', 'image_url', 'is_available', 'ingredients', 'allergens']

    def get_allergens(self, obj):
        from .models import Allergen
        return list(set(
            Allergen.objects.filter(ingredients__pizzas=obj).values_list('name', flat=True)
        ))
