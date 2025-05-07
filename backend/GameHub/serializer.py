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
    # release = serializers.DateField(format="%Y-%m-%d", required=False, allow_null=True)

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
    
    class Meta:
        model = Profile
        fields = [ 'full_name', 'post_count', 'comment_count']

class UserInfoSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'email', 'date_joined', "profile"]

class ViewProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = [ 'full_name', 'post_count', 'comment_count']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.name_visibility != 'visible':
            data.pop('full_name', None)
        return data

  
class ViewUserInfoSerializer(serializers.ModelSerializer):
    profile = ViewProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'date_joined', "profile"]