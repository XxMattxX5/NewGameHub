# Generated by Django 5.2 on 2025-05-01 02:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0022_profile_last_seen_profile_profile_visiblity_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profile',
            old_name='profile_visiblity',
            new_name='profile_visibility',
        ),
    ]
