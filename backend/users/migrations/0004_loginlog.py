from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_useraccount_is_superadmin'),
    ]

    operations = [
        migrations.CreateModel(
            name='LoginLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.CharField(blank=True, max_length=50, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='login_logs', to='users.useraccount')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
