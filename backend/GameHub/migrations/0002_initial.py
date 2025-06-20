# Generated by Django 5.2 on 2025-04-22 17:23

import django.contrib.postgres.indexes
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('GameHub', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Genre',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(verbose_name=255)),
            ],
        ),
        migrations.CreateModel(
            name='Screenshot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('screenshot_id', models.CharField(max_length=100)),
                ('src', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='Token',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token', models.CharField(max_length=50)),
                ('expires_in', models.DateTimeField()),
                ('token_type', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video_id', models.CharField(max_length=100)),
                ('src', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_id', models.CharField(max_length=100)),
                ('title', models.CharField(max_length=255)),
                ('cover_image', models.URLField(blank=True, null=True)),
                ('summary', models.TextField(blank=True, max_length=20000, null=True)),
                ('rating', models.CharField(blank=True, max_length=255, null=True)),
                ('release', models.DateTimeField(blank=True, null=True)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('genres', models.ManyToManyField(related_name='games', to='GameHub.genre')),
                ('screenshots', models.ManyToManyField(related_name='games', to='GameHub.screenshot')),
                ('videos', models.ManyToManyField(related_name='games', to='GameHub.video')),
            ],
            options={
                'indexes': [django.contrib.postgres.indexes.GinIndex(fields=['title'], name='title_trigram_idx', opclasses=['gin_trgm_ops'])],
            },
        ),
    ]
