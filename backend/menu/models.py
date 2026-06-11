from django.db import models


class Pizza(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=255, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    name = models.CharField(max_length=255)
    extra_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    pizzas = models.ManyToManyField(Pizza, through='PizzaRecipe', related_name='ingredients')

    def __str__(self):
        return self.name


class PizzaRecipe(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('ingredient', 'pizza')


class Allergen(models.Model):
    name = models.CharField(max_length=255)
    ingredients = models.ManyToManyField(Ingredient, through='HasAllergen', related_name='allergens')

    def __str__(self):
        return self.name


class HasAllergen(models.Model):
    allergen = models.ForeignKey(Allergen, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('allergen', 'ingredient')


class Drink(models.Model):
    name = models.CharField(max_length=255)
    volume_cl = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Dessert(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name
