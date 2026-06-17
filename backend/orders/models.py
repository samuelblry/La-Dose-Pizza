from django.db import models
from users.models import UserAccount
from menu.models import Pizza, Drink, Dessert, Ingredient


class CustomerOrder(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_preparation', 'En préparation'),
        ('en_livraison', 'En livraison'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    TYPE_CHOICES = [
        ('livraison', 'Livraison'),
        ('sur_place', 'Sur place'),
    ]

    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='en_attente')
    invoice_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # montant avant réduction des points fidélité
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # frais de livraison inclus dans total_amount
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    order_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='livraison')
    street = models.CharField(max_length=255, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='orders')
    points_used = models.IntegerField(default=0)

    def __str__(self):
        return self.invoice_number


class OrderLine(models.Model):
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey(CustomerOrder, on_delete=models.CASCADE, related_name='lines')
    pizza = models.ForeignKey(Pizza, on_delete=models.SET_NULL, null=True, blank=True)
    drink = models.ForeignKey(Drink, on_delete=models.SET_NULL, null=True, blank=True)
    dessert = models.ForeignKey(Dessert, on_delete=models.SET_NULL, null=True, blank=True)


class LineSupplement(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    order_line = models.ForeignKey(OrderLine, on_delete=models.CASCADE, related_name='supplements')
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ('ingredient', 'order_line')

