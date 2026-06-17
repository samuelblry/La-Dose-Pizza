from django.db import migrations


TABLES = [
    (1, 2),   # fenêtre gauche
    (2, 2),   # fenêtre gauche
    (3, 4),   # centre-gauche
    (4, 4),   # centre-gauche
    (5, 4),   # centre-droit
    (6, 4),   # centre-droit
    (7, 6),   # grande table fond
    (8, 6),   # grande table fond
    (9, 2),   # bar/comptoir
    (10, 8),  # grande tablée privatisable
]


def seed(apps, schema_editor):
    RestaurantTable = apps.get_model('reservations', 'RestaurantTable')
    for number, capacity in TABLES:
        RestaurantTable.objects.get_or_create(table_number=number, defaults={'capacity': capacity})


def unseed(apps, schema_editor):
    RestaurantTable = apps.get_model('reservations', 'RestaurantTable')
    RestaurantTable.objects.filter(table_number__in=[n for n, _ in TABLES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
