# Generated by Django 5.2 on 2025-05-02 20:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0030_forumpost_postreaction'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PostReaction',
        ),
    ]
