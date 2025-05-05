from django.contrib import admin
from .models import ForumPost, PostReaction
from GameHub.models import Game
from django.contrib.auth.models import User

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    search_fields = ['title', 'content', 'user__username', 'game__name']  # Search by user and game name
    list_display = ('title', 'user', 'game', 'post_type', 'created_at', 'like_count', 'dislike_count', 'comment_count')
    list_filter = ('post_type', 'created_at', 'user')  # Filters for quicker admin browsing
    ordering = ('-created_at',)  # Default ordering by created_at (newest first)
    raw_id_fields = ('game', 'user')

@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    search_fields = ['user__username', 'post__title']  # Search by username and post title
    list_display = ('user', 'post', 'reaction')  # Display key fields in the admin
    raw_id_fields = ('post', 'user')
