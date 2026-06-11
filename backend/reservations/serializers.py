from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    table_number = serializers.IntegerField(source='table.table_number', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_date', 'reservation_time',
            'guest_count', 'status', 'user_email', 'table_number',
        ]
