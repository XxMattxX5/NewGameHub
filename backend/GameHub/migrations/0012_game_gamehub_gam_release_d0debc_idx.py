# Generated by Django 5.2 on 2025-04-24 00:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0011_game_search_vector_game_game_search_vector_idx'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='game',
            index=models.Index(fields=['release'], name='GameHub_gam_release_d0debc_idx'),
        ),
    ]
