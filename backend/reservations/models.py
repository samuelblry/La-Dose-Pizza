from django.db import models
from users.models import UserAccount


class RestaurantTable(models.Model):
    table_number = models.IntegerField(unique=True)
    capacity = models.IntegerField()

    def __str__(self):
        return f'Table {self.table_number} ({self.capacity} places)'


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
    ]

    reservation_date = models.DateField()
    reservation_time = models.TimeField()
    guest_count = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='reservations')
    table = models.ForeignKey(RestaurantTable, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'Réservation {self.id} - {self.reservation_date}'

