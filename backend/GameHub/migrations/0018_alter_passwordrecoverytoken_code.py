# Generated by Django 5.2 on 2025-04-27 23:16

import GameHub.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0017_passwordrecoverytoken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='passwordrecoverytoken',
            name='code',
            field=models.CharField(default=GameHub.models.generate_unique_code, max_length=250, unique=True),
        ),
    ]
