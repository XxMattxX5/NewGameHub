from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from .models import Comment, ForumPost

# --- Update post count on user.profile when a post is created/deleted ---
@receiver(post_save, sender=ForumPost)
def increase_user_post_count(sender, instance, created, **kwargs):
    if created:
        profile = instance.user.profile
        profile.post_count = models.F('post_count') + 1
        profile.save(update_fields=['post_count'])

@receiver(post_delete, sender=ForumPost)
def decrease_user_post_count(sender, instance, **kwargs):
    profile = instance.user.profile
    profile.post_count = models.F('post_count') - 1
    profile.save(update_fields=['post_count'])

@receiver(post_save, sender=Comment)
def increase_comment_count(sender, instance, created, **kwargs):
    if created:
        # Increment the post's comment count
        instance.post.comment_count = models.F('comment_count') + 1
        instance.post.save(update_fields=['comment_count'])

        # If it's a reply, increment the parent comment's reply_count (if it's not a top-level comment)
        if instance.parent:
            instance.parent.reply_count = models.F('reply_count') + 1
            instance.parent.save(update_fields=['reply_count'])

        # Increment the comment author's comment count (assuming you have a `profile` model)
        profile = instance.user.profile
        profile.comment_count = models.F('comment_count') + 1
        profile.save(update_fields=['comment_count'])

@receiver(post_delete, sender=Comment)
def decrease_comment_count(sender, instance, **kwargs):
    # Decrement the post's comment count
    instance.post.comment_count = models.F('comment_count') - 1
    instance.post.save(update_fields=['comment_count'])

    # If it's a reply, decrement the parent comment's reply_count
    if instance.parent:
        instance.parent.reply_count = models.F('reply_count') - 1
        instance.parent.save(update_fields=['reply_count'])

    # Decrement the comment author's comment count
    profile = instance.user.profile
    profile.comment_count = models.F('comment_count') - 1
    profile.save(update_fields=['comment_count'])