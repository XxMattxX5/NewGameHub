from rest_framework import serializers
from .models import Game, Video, Screenshot, Genre

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