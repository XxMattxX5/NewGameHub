from django.contrib import admin
from .models import ForumPost, PostReaction, Comment



@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    search_fields = ['user__username', 'post__title', 'content', 'parent__content']
    list_display = ('user', 'post', 'content', 'created_at', 'parent', 'reply_count')
    list_filter = ('created_at', 'user', 'parent')
    ordering = ('-created_at',)
    raw_id_fields = ('post', 'user', 'parent')

    def delete_model(self, request, obj):
        """
        Delete all replies before deleting the comment itself
        """
        obj.replies.all().delete()
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """
        Ensure replies of all comments in the queryset are deleted
        """
        for obj in queryset:
            obj.replies.all().delete()
        super().delete_queryset(request, queryset)

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    search_fields = ['title', 'content', 'user__username', 'game__name']
    list_display = ('title', 'user', 'game', 'post_type', 'created_at', 'like_count', 'dislike_count', 'comment_count')
    list_filter = ('post_type', 'created_at', 'user')
    ordering = ('-created_at',)
    raw_id_fields = ('game', 'user')

    def delete_model(self, request, obj):
        """
        Start with deleting the parent comments (which will set child comments' parent to NULL)
        """
        self.delete_root_comments(obj)
        
        # Finally, delete the forum post
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """
        Handle bulk deletion of forum posts and their associated comments
        """
        for obj in queryset:
            self.delete_root_comments(obj)
        
        # Now delete the selected forum posts
        super().delete_queryset(request, queryset)

    def delete_root_comments(self, post):
        """
        Recursively delete root comments and their replies.
        """
        # Find all root comments (those with no parent)
        root_comments = post.comments.filter(parent__isnull=True)
        
        while root_comments.exists():
            for comment in root_comments:
                # Delete the comment (this will also cascade delete its replies)
                comment.delete()
            
            # Check again for root comments (they may have become root after cascading deletes)
            root_comments = post.comments.filter(parent__isnull=True)


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    search_fields = ['user__username', 'post__title'] 
    list_display = ('user', 'post', 'reaction')
    raw_id_fields = ('post', 'user')
