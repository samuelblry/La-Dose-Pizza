from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_loginlog'),
    ]

    operations = [
        migrations.AddField(
            model_name='loginlog',
            name='email',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='loginlog',
            name='success',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='loginlog',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='login_logs', to='users.useraccount'),
        ),
    ]
