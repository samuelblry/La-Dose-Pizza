from rest_framework import serializers
from .models import Pizza, Drink, Dessert, Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'extra_cost']


class PizzaSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Pizza
        fields = ['id', 'name', 'description', 'base_price', 'image_url', 'is_available', 'ingredients']


class DrinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drink
        fields = ['id', 'name', 'volume_cl', 'price', 'is_available']


class DessertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dessert
        fields = ['id', 'name', 'price', 'is_available']
