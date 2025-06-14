# Generated by Django 5.2 on 2025-04-22 18:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0004_alter_game_rating'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='game',
            name='screenshots',
        ),
        migrations.RemoveField(
            model_name='game',
            name='videos',
        ),
        migrations.RemoveField(
            model_name='screenshot',
            name='screenshot_id',
        ),
        migrations.RemoveField(
            model_name='video',
            name='video_id',
        ),
        migrations.AddField(
            model_name='screenshot',
            name='game',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='GameHub.game'),
        ),
        migrations.AddField(
            model_name='video',
            name='game',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='GameHub.game'),
        ),
    ]
