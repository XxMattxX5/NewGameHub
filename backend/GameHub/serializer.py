from rest_framework import serializers
from .models import Game, Video, Screenshot, Genre, Profile
from .validators import validate_exact_dimensions, validate_image_size
from django.contrib.auth.models import User


class ProfilePictureSerializer(serializers.ModelSerializer):
    """
    Serializes and validates data for updating a user's profile picture.
    Ensures uploaded images meet dimension and size requirements.
    """
    class Meta:
        model = Profile
        fields = ["profile_picture"]

    
    def validate_profile_image(self, image):
        # Ensure the image meets size and dimension constraints
        validate_exact_dimensions(image)
        validate_image_size(image)
        return image


class GenreSerializer(serializers.ModelSerializer):
    """Serializes data for the Genre model."""
    class Meta:
        model = Genre
        fields = ("name",)


class GetGameSerializer(serializers.ModelSerializer):
    """
    Serializes detailed data for the Game model, including related genres.
    """
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = '__all__'

class GetGameSuggetionsSerializer(serializers.ModelSerializer):
    """
    Serializes detailed data for the Game model, including related genres.
    """

    class Meta:
        model = Game
        fields = ["id","cover_image","slug", "title"]


class GetGamesSerializer(serializers.ModelSerializer):
    """
    Serializes a summarized list of Game model instances 
    for listing purposes.
    """

    class Meta:
        model = Game
        fields = ["game_id","slug","title", "cover_image", "release", "rating"]


class VideoSerializer(serializers.ModelSerializer):
    """Serializes data for the Video model."""
    class Meta:
        model = Video
        fields = "__all__"


class ScreenshotSerializer(serializers.ModelSerializer):
    """Serializes data for the Screenshot model."""
    class Meta:
        model = Screenshot
        fields = "__all__"




class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model.

    Fields:
        full_name (str): The full name of the user.
        post_count (int): The number of posts made by the user.
        comment_count (int): The number of comments made by the user.
    """
    class Meta:
        model = Profile
        fields = [ 'full_name', 'post_count', 'comment_count']

class UserInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model that includes profile information.

    Fields:
        username (str): The username of the user.
        email (str): The email address of the user.
        date_joined (datetime): The date and time when the user joined.
        profile (ProfileSerializer): The profile information associated with the user.
    """
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'email', 'date_joined', "profile"]

class ViewProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing the profile information of a user, with conditional visibility.

    Fields:
        full_name (str): The full name of the user, only visible if 'name_visibility' is 'visible'.
        post_count (int): The number of posts made by the user.
        comment_count (int): The number of comments made by the user.
    
    The `full_name` field will be excluded from the representation if `name_visibility` is not 'visible'.
    """
    class Meta:
        model = Profile
        fields = [ 'full_name', 'post_count', 'comment_count']

    def to_representation(self, instance):
        """
        Custom representation to conditionally hide the full name.

        If the 'name_visibility' field is not 'visible', the 'full_name' field will be excluded
        from the serialized output.

        Args:
            instance (Profile): The Profile instance being serialized.

        Returns:
            dict: The serialized data, with 'full_name' removed if not visible.
        """
        data = super().to_representation(instance)
        if instance.name_visibility != 'visible':
            data.pop('full_name', None)
        return data

  
class ViewUserInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing detailed information about a user, including their profile.

    Fields:
        username (str): The username of the user.
        date_joined (datetime): The date and time when the user joined.
        profile (ViewProfileSerializer): The profile information associated with the user,
            including the visibility of the user's full name.
    """
    profile = ViewProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'date_joined', "profile"]