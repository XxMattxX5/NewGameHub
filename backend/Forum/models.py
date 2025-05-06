from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.utils.text import slugify
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.search import SearchVector
from django.db.models import Value

from GameHub.models import Game

# Create your models here.
class ForumPost(models.Model):
    """
    Represents a forum post created by a user.

    Attributes:
        title (str): The title of the forum post, limited to 255 characters.
        user (User): The user who created the post. Deletes the post if the user is deleted.
        content (str): The main body of the forum post.
        created_at (datetime): Timestamp of when the post was created. Automatically set once.
        updated_at (datetime): Timestamp of the last update to the post. Automatically updated.
        slug (str): A unique, URL-friendly identifier for the post, generated from the title.
        like_count (int): Total number of likes the post has received.
        dislike_count (int): Total number of dislikes the post has received.
        views (int): Number of times the post has been viewed.
        comment_count (int): Number of comments made on the post.
        search_vector (SearchVectorField): A full-text search vector for advanced querying.

    Meta:
        - Adds indexes on title and created_at for faster filtering and sorting.
        - Uses a trigram GIN index on the title field for efficient fuzzy searching.
        - Adds a GIN index on the search_vector for full-text search support.
    """
    POST_TYPE_CHOICES = [("game", 'Game'), ('general', 'General')]

    title = models.CharField(max_length=255)
    header_image = models.ImageField(upload_to='forum_pictures/', null=True, blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, default="general")
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, related_name='game_posts', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    content = models.TextField( max_length=30000)
    created_at = models.DateTimeField(default=now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True, blank=True, max_length=150)
    like_count = models.PositiveIntegerField(default=0)
    dislike_count = models.PositiveIntegerField(default=0)
    views = models.PositiveIntegerField(default=0)
    comment_count =models.PositiveIntegerField(default=0)
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['created_at']),
            models.Index(fields=['title', 'created_at']),
            GinIndex(fields=['title'], name='forum_title_trigram_idx', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['search_vector'], name='forum_search_vector_idx'),
        ]


    def save(self, *args, **kwargs):
        
        # Regenerate slug if new object or title has changed
        if self.pk:
            old_title = ForumPost.objects.filter(pk=self.pk).values_list('title', flat=True).first()
        else:
            old_title = None
        
        if not self.slug or self.title != old_title:
            truncated_title = self.title[:80]
            base_slug = slugify(f"{truncated_title}")
            slug = base_slug
            num = 1
            while ForumPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug

        # Materialize the actual title into the search vector
        self.search_vector = SearchVector(Value(self.title), config='simple')
        print(self.slug)
        print(len(self.slug))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    def increase_views(self):
        self.views += 1
        self.save()

    def get_user_reaction(self, user):
        """
        Returns the reaction of the given user to this post.

        Args:
            user (User): The user whose reaction is to be checked.

        Returns:
            str or None: "like" if the user liked the post, "dislike" if the user disliked it, or None if no reaction.
        """
        reaction = PostReaction.objects.filter(user=user, post=self).first()
        return reaction.reaction if reaction else None
    
class PostReaction(models.Model):
    """
    Represents a user's reaction (like or dislike) to a forum post.
    
    Each user can only have one reaction per post. This model ensures that
    duplicate reactions are not allowed and provides methods for managing
    and updating reaction states and associated counters on the post.
    """
    LIKE = 'like'
    DISLIKE = 'dislike'
    REACTION_CHOICES = [(LIKE, 'Like'), (DISLIKE, 'Dislike')]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=7, choices=REACTION_CHOICES, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f'{self.user.username}-{self.reaction}'

    def increase_like(self):
        """
        Increases the like count on the related post if the user hasn't ready liked the post
        """
        # Ensure that the user hasn't already liked the post
        if self.reaction != self.LIKE:
            if self.reaction == self.DISLIKE:
                self.post.dislike_count = max(0, self.post.dislike_count - 1)
            self.reaction = self.LIKE
            self.save()
            self.post.like_count += 1
            self.post.save()

    def increase_dislike(self):
        """
        Increases the dislike count on the related post if the user hasn't ready disliked the post
        """
        # Ensure that the user hasn't already disliked the post
        if self.reaction != self.DISLIKE:
            if self.reaction == self.LIKE:
                self.post.like_count = max(0, self.post.like_count - 1)
            self.reaction = self.DISLIKE
            self.save()
            self.post.dislike_count += 1
            self.post.save()

    def delete_reaction(self):
        """
        Deletes the post reaction and adjusts the like or dislike count accordingly.
        Used when a user sets their reaction back to neutral.
        """
        if self.reaction == self.LIKE:
            self.post.like_count = max(0, self.post.like_count - 1)
        elif self.reaction == self.DISLIKE:
            self.post.dislike_count = max(0, self.post.dislike_count - 1)

        self.post.save()
        self.delete()

class Comment(models.Model):
    """
    Represents a comment made by a user on a forum post.
    
    Each comment is tied to a specific user and post. Comments are
    automatically timestamped when created.
    """
    post = models.ForeignKey('ForumPost', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user} on {self.post}'
