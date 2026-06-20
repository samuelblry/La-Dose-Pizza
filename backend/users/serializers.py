from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import UserAccount, Address, LoginLog
from .validators import validate_phone, validate_name


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(validators=[validate_name])
    last_name = serializers.CharField(validators=[validate_name])

    class Meta:
        model = UserAccount
        fields = ['email', 'password', 'phone', 'first_name', 'last_name']

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_phone(self, value):
        if value:
            validate_phone(value)
        return value

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
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'loyalty_points', 'is_admin', 'is_superadmin', 'address']

    def get_address(self, obj):
        adresse = obj.addresses.first()
        if adresse:
            return AddressSerializer(adresse).data
        return None


class AdminClientSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'loyalty_points', 'is_admin', 'is_superadmin', 'address']

    def get_address(self, obj):
        adresse = obj.addresses.first()
        if adresse:
            return AddressSerializer(adresse).data
        return None


class EmployeeSerializer(serializers.ModelSerializer):
    last_login_at = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'is_admin', 'is_superadmin', 'last_login_at']

    def get_last_login_at(self, obj):
        log = obj.login_logs.filter(success=True).first()
        return log.timestamp.isoformat() if log else None


class LoginLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = LoginLog
        fields = ['id', 'user_email', 'user_name', 'success', 'timestamp', 'ip_address']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else (obj.email or '—')

    def get_user_name(self, obj):
        if obj.user:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return name or obj.user.email
        # tentative sur un email inconnu
        return obj.email or 'Inconnu'
