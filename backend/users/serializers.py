from rest_framework import serializers
from .models import UserAccount, Address


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = UserAccount
        fields = ['email', 'password', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        return UserAccount.objects.create_user(**validated_data)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'zip_code', 'city']


class UserProfileSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'loyalty_points', 'address']

    def get_address(self, obj):
        adresse = obj.addresses.first()
        if adresse:
            return AddressSerializer(adresse).data
        return None


class AdminClientSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'loyalty_points', 'address']

    def get_address(self, obj):
        adresse = obj.addresses.first()
        if adresse:
            return AddressSerializer(adresse).data
        return None
