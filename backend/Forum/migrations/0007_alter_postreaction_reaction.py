# Generated by Django 5.2 on 2025-05-04 03:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Forum', '0006_forumpost_header_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postreaction',
            name='reaction',
            field=models.CharField(choices=[('like', 'Like'), ('dislike', 'Dislike')], max_length=7, null=True),
        ),
    ]
