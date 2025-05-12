from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumPost,Comment
from GameHub.models import Game

User = get_user_model()

class GameMiniSerializer(serializers.ModelSerializer):
    """
    Serializer for a minimal representation of the Game model.

    Includes:
        - id: Game ID.
        - slug: URL-friendly identifier.
        - title: Title of the game.
        - cover_image: Game's cover image.
    """
    class Meta:
        model = Game
        fields = ['id','slug','title', 'cover_image']

class UserMiniSerializer(serializers.ModelSerializer):
    """
    Serializer for a minimal representation of the User model.

    Includes:
        - id: User ID.
        - username: User's username.
        - profile_picture: The profile picture from the related Profile model.
    """
    profile_picture = serializers.ImageField(source='profile.profile_picture', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', "profile_picture"]

class PostSerializerWithGame(serializers.ModelSerializer):
    """
    Serializer for ForumPost model with nested user and game data.

    Includes:
        - user: Nested UserMiniSerializer.
        - game: Nested GameMiniSerializer.
        - user_reaction: Current user's reaction to the post (if authenticated).

    Excludes:
        - search_vector: Internal field used for search indexing.
    """
    user = UserMiniSerializer(read_only=True)
    game = GameMiniSerializer(read_only=True)
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        exclude = ['search_vector',]

    def get_user_reaction(self, obj):
        """
        Returns the reaction of the currently authenticated user to the post.

        Args:
            obj (ForumPost): The post instance.

        Returns:
            str or None: The reaction type if the user is authenticated, otherwise None.
        """
        user = self.context.get('user')
        if user.is_authenticated:
            return obj.get_user_reaction(user)
        return None
        
    
class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Comment model with nested user information.

    Includes:
        - id: Comment ID.
        - user: Nested UserMiniSerializer.
        - content: The body of the comment.
        - created_at: Timestamp of when the comment was created.
        - reply_count: Number of replies associated with the comment.
    """
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at',  'reply_count']
