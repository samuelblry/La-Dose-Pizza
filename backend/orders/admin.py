from django.contrib import admin
from .models import CustomerOrder, OrderLine

admin.site.register(CustomerOrder)
admin.site.register(OrderLine)
