from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserAccountManager(BaseUserManager):
    def create_user(self, email, password, phone='', **extra):
        if not email:
            raise ValueError('Email requis')
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra):
        extra.setdefault('is_admin', True)
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('is_superadmin', True)
        return self.create_user(email, password, **extra)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    loyalty_points = models.IntegerField(default=0)
    is_admin = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Address(models.Model):
    street = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=20)
    city = models.CharField(max_length=255)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='addresses')

    def __str__(self):
        return f"{self.street}, {self.city}"


class LoginLog(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='login_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
