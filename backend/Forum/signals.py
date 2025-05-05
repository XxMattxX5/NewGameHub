from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from .models import Comment

@receiver(post_save, sender=Comment)
def increase_comment_count(sender, instance, created, **kwargs):
    if created:
        post = instance.post
        post.comment_count = models.F('comment_count') + 1
        post.save(update_fields=['comment_count'])

@receiver(post_delete, sender=Comment)
def decrease_comment_count(sender, instance, **kwargs):
    post = instance.post
    post.comment_count = models.F('comment_count') - 1
    post.save(update_fields=['comment_count'])