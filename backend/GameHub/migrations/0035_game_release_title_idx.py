# Generated by Django 5.2.1 on 2025-05-22 17:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GameHub', '0034_rename_comments_made_profile_comment_count_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='game',
            index=models.Index(fields=['-release', 'title'], name='release_title_idx'),
        ),
    ]
