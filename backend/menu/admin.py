from django.contrib import admin
from .models import Pizza, Ingredient, Allergen, Drink, Dessert

admin.site.register(Pizza)
admin.site.register(Ingredient)
admin.site.register(Allergen)
admin.site.register(Drink)
admin.site.register(Dessert)
