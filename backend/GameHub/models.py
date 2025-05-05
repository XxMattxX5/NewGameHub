from django.db import models
from django.utils.text import slugify
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.search import SearchVector
from django.contrib.auth.models import User
import secrets
from django.utils import timezone
from datetime import timedelta
import datetime


NAME_VISIBILITY = [
    ('visible', 'Visible'),
    ('hidden', 'Hidden'),
]
PROFILE_VISIBILITY_OPTIONS = [
   ('visible', 'Visible'),
    ('hidden', 'Hidden'),
]

# -------------------- Profile & Authentication --------------------

class Profile(models.Model):
    """
    Profile model that holds extra user information,
    such as full name, visibility settings, and profile picture.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', default="profile_pics/blank-profile-picture.png")
    last_seen = models.DateField(default=datetime.date.today)
    profile_visibility = models.CharField(
        max_length=20,
        choices=PROFILE_VISIBILITY_OPTIONS,
        default='visible'
    )
    name_visibility = models.CharField(
        max_length=20,
        choices=NAME_VISIBILITY,
        default='hidden'
    )

    def __str__(self):
        return f'{self.user.username} Profile'


class Token(models.Model):
    """
    Stores API authentication tokens.
    """
    access_token = models.CharField(max_length=50)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)



# -------------------- Game & Media Models --------------------

class Genre(models.Model):
    """
    Represents a genre associated with games.
    """
    name = models.CharField(255)

    def __str__(self):
        return self.name


class Game(models.Model):
    """
    Stores information about a game, including metadata, genre, and search indexing.
    """
    game_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    cover_image =  models.URLField(null=True, blank=True)
    summary = models.TextField(max_length=10000, blank=True, null=True)
    storyline = models.TextField(max_length=10000, null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='games')
    rating = models.FloatField(null=True, blank=True)
    release = models.DateTimeField( null=True, blank=True)
    slug = models.SlugField(unique=True, blank=True, max_length=120)
    search_vector = SearchVectorField(null=True)

    def save(self, *args, **kwargs):
        """
        Auto-generates a unique slug and updates the search vector for the title field.
        """
        if not self.slug or self._state.old_values.get('title') != self.title:
            self.slug = slugify(f"{self.title[:80]}-{self.game_id}")
            count = Game.objects.filter(slug=self.slug).count()
            if count:
                self.slug = f"{self.slug}-{count+1}"

        self.search_vector = SearchVector('title')
        super(Game, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['release']),
            models.Index(fields=['rating']),
            models.Index(fields=['title', 'release']),
            GinIndex(fields=['title'], name='title_trigram_idx', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['search_vector'], name='game_search_vector_idx'),
        ]


class Video(models.Model):
    """
    Stores a video related to a game.
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    src = models.URLField()

    def __str__(self):
        return f"{self.game.title}-{self.id}"


class Screenshot(models.Model):
    """
    Stores a screenshot related to a game.
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    src = models.URLField()

    def __str__(self):
        return f"{self.game.title}-{self.id}"

# -------------------- Password Recovery --------------------

def generate_unique_code(length=50):
    """
    Generates a unique URL-safe token string for password recovery.
    """
    while True:
        code = secrets.token_urlsafe(length)[:length]
        if not PasswordRecoveryToken.objects.filter(code=code).exists():
            return code


def expiration_time():
    """
    Returns a timestamp 20 minutes from now for token expiration.
    """
    return timezone.now() + timedelta(minutes=20)


class PasswordRecoveryToken(models.Model):
    """
    Stores password recovery tokens for users.
    Each token is unique and expires after 20 minutes.
    """
    code = models.CharField(max_length=250,unique=True, default=generate_unique_code)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_recovery_tokens'
    )

    expiration_date = models.DateTimeField(default=expiration_time)

    def __str__(self):
        return f"{self.user.username}"

    def is_expired(self):
        """
        Returns True if the token has expired.
        """
        return timezone.now() > self.expiration_date 
    
    