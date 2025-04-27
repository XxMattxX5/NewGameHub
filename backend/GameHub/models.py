from django.db import models
from django.utils.text import slugify
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.search import SearchVector
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pics/', default="profile_pics/blank-profile-picture.png", null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'

# Auth Tokens
class Token(models.Model):
    access_token = models.CharField(max_length=50)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

# Game genres
class Genre(models.Model):
    name = models.CharField(255)

    def __str__(self):
        return self.name



# Models for games and there details
class Game(models.Model):
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
       
        # Check if the title has changed or if the slug is missing
        if not self.slug or self._state.old_values.get('title') != self.title:
            # Generate a new slug based on the title and game_id
            self.slug = slugify(f"{self.title[:80]}-{self.game_id}")
        
            # Ensure the slug is unique
            count = Game.objects.filter(slug=self.slug).count()
            if count:
                self.slug = f"{self.slug}-{count+1}"

        # Automatically update the search_vector with only the title
        self.search_vector = SearchVector('title')

        # Call save again to update the slug field
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

# Game related videos
class Video(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    src = models.URLField()

    def __str__(self):
        return f"{self.game.title}-{self.id}"

# Game related screenshots
class Screenshot(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    src = models.URLField()

    def __str__(self):
        return f"{self.game.title}-{self.id}"