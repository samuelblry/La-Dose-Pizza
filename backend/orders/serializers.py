from rest_framework import serializers
from .models import CustomerOrder, OrderLine


class OrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLine
        fields = ['id', 'quantity', 'unit_price', 'pizza', 'drink', 'dessert']


class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CustomerOrder
        fields = [
            'id', 'invoice_number', 'order_date', 'status',
            'total_amount', 'order_type', 'street', 'zip_code', 'city',
            'user_email', 'lines',
        ]
