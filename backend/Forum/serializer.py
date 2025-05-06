from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumPost
from GameHub.models import Game

User = get_user_model()

class GameMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id','slug','title', 'cover_image']

class UserMiniSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(source='profile.profile_picture', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', "profile_picture"]

   
   

class PostSerializerWithGame(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    game = GameMiniSerializer(read_only=True)
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        exclude = ['search_vector',]

    def get_user_reaction(self, obj):
        user = self.context.get('user')
        if user.is_authenticated:
            return obj.get_user_reaction(user)
        return None
        
    