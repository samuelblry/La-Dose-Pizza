from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_add_delivery_fee'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerorder',
            name='points_credited',
            field=models.BooleanField(default=False),
        ),
    ]
