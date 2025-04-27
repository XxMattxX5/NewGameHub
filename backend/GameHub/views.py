from django.shortcuts import render, HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Game, Video, Screenshot, Genre
from .serializer import GetGameSerializer, VideoSerializer, ScreenshotSerializer, GenreSerializer
from .utils import getGameList, getSuggestionList
from django.core.cache import cache
import re
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

# Create your views here.
def home(request):
    return HttpResponse("OK")


class GetGameList(APIView):
    def get(self, request, format=None):
        perPage = 60

        sort_option = request.GET.get('s', "relevance")
        search_word = request.GET.get('q', '')
        page_num = request.GET.get('page', "1")
        genre_option = request.GET.get("g", "All")

        search_word = re.sub(r'-', ' ', search_word)
        data, pages = getGameList(search_word,perPage, page_num, sort_option,genre_option)

        if pages > 500:
            pages = 500

        if not data:
            return Response({"error": "No Games Found"}, status=status.HTTP_404_NOT_FOUND)
        genres = GenreSerializer(Genre.objects.all().order_by("name"), many=True).data

        return Response({"pages": pages, "data":data, "genres":genres}, status=status.HTTP_200_OK)


class GetGame(APIView):

    def get(self, request, slug):
   
        try:
            game = Game.objects.get(slug=slug)
        except:
            return Response({"error": "Game Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        videos = Video.objects.filter(game=game)
        videos = VideoSerializer(videos, many=True).data
        screenshots = Screenshot.objects.filter(game=game)
        screenshots = ScreenshotSerializer(screenshots, many=True).data
        data = GetGameSerializer(game).data

        return Response({"data": data, 'videos': videos, "screenshots": screenshots}, status=status.HTTP_200_OK)


class GetTopRatedList(APIView):
    
    def get(self, request):
        top_rated_cache = cache.get("top_rated_list")
        if (top_rated_cache):
            data = top_rated_cache
        else:
            games = Game.objects.filter(rating__isnull=False).order_by('-rating', 'title')[:20]
            data = GetGameSerializer(games, many=True).data
            cache.set("top_rated_list", data, timeout=1800)

        return Response({"data": data}, status=status.HTTP_200_OK)
    
class GetGameSuggestions(APIView):

    def get(self, request):
        search_word = request.GET.get('q', '')
    

        search_word = re.sub(r'-', ' ', search_word)
        data = getSuggestionList(search_word)
        data = GetGameSerializer(data, many=True).data

        

        if not data:
            return Response({"error": "No Games Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data":data,}, status=status.HTTP_200_OK)
    


class SessionLoginView(APIView):
    authentication_classes = []
    permission_classes = []    

    def post(self, request):
        username = request.data.get("username", "").strip().lower()
        password = request.data.get("password", "")

        if not username or not password:
            return Response({"message": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"})
        else:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class SessionLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

class UserInfo(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({"id":user.id, "username": user.username, "profile_picture": "/api" + user.profile.profile_picture.url})
