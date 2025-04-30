from rest_framework import serializers
from .models import Game, Video, Screenshot, Genre, Profile
from .validators import validate_exact_dimensions, validate_image_size

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["profile_picture"]

    def validate_profile_image(self, image):
        validate_exact_dimensions(image)
        validate_image_size(image)
        return image

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("name",)

class GetGameSerializer(serializers.ModelSerializer):
    
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = '__all__'

class GetGamesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = ["game_id","slug","title", "cover_image", "release", "rating"]

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = "__all__"

class ScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Screenshot
        fields = "__all__"