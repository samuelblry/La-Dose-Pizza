from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0002_alter_pizza_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pizza',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
    ]
