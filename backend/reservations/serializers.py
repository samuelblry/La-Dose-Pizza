from rest_framework import serializers
from .models import Reservation, RestaurantTable


class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    table_number = serializers.IntegerField(source='table.table_number', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_date', 'reservation_time',
            'guest_count', 'status', 'user_email',
            'user_first_name', 'user_last_name', 'user_phone', 'table_number',
        ]


class RestaurantTableSerializer(serializers.ModelSerializer):
    is_reserved = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = RestaurantTable
        fields = ['id', 'table_number', 'capacity', 'is_reserved']
