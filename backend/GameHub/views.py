from django.shortcuts import render, HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Game, Video, Screenshot, Genre, PasswordRecoveryToken
from .serializer import GetGameSerializer, VideoSerializer, ScreenshotSerializer, GenreSerializer, ProfilePictureSerializer
from .utils import getGameList, getSuggestionList
from django.core.cache import cache
import re
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated
from .forms import UserRegistrationForm
from django.contrib.auth.models import User
import json
from django.core.mail import send_mail
import os
from django.conf import settings
import datetime

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
    
class IsLogged(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        profile.last_seen = datetime.date.today()
        profile.save(update_fields=["last_seen"])
        return Response(status=status.HTTP_200_OK)

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
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterUser(APIView):

    def post(self, request):
        data = json.loads(request.body)
        form = UserRegistrationForm(data)

        if form.is_valid():
            # Create user
            username = form.cleaned_data['username'].lower()
            email = form.cleaned_data['email'].lower()
            password = form.cleaned_data['password']
            User.objects.create_user(username=username, email=email, password=password)
            
            return Response(status=status.HTTP_201_CREATED)

           

        # Return error response with form errors
        return Response({"errors": form.errors}, status=status.HTTP_400_BAD_REQUEST)


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


class ForgotPassword(APIView):
    permission_classes = []

    def post(self, request):
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)
        
        email = request.data.get("email", "")
        
        try:
            user = User.objects.get(email=email)
            recovery_token = PasswordRecoveryToken.objects.filter(user=user)
            if (recovery_token.exists()):
                recovery_token.delete()

            token = PasswordRecoveryToken.objects.create(user=user)
            host = request.get_host()
           
            send_mail(
                subject='Password Reset',
                message=f'Click the link to reset your password. http://{host}/login/reset-password/{token.code}',
                from_email='matthewhicks8070@gmail.com',
                recipient_list=[email],
                fail_silently=False,
            )

            return Response(status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # If the email doesn't match any user
            return Response(status=status.HTTP_200_OK)

        except Exception as e:
            # Log the unexpected error (optional)
            print(f"Unexpected error: {e}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPassword(APIView):

    def get(self, request, code):
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            recovery_token = PasswordRecoveryToken.objects.get(code=code)

            if (recovery_token.is_expired()):
                return Response({"message": "Code Expired"}, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({"message": "Code Valid"}, status=status.HTTP_200_OK)
        except:
             return Response({"message": "Code Invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
        
    def post(self, request, code):
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)

        try:
            recovery_token = PasswordRecoveryToken.objects.get(code=code)
            if (recovery_token.is_expired()):
                return Response({"message": "Code Invalid"}, status=status.HTTP_401_UNAUTHORIZED)
            
            password = request.data.get("password")
            passwordConfirm = request.data.get("password_confirm")

            pattern = r'^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})'

            if not re.match(pattern, password):
                return Response({"message": "Password Invalid"}, status=status.HTTP_400_BAD_REQUEST)
            elif passwordConfirm != password:
                return Response({"message": "Passwords must match"}, status=status.HTTP_400_BAD_REQUEST)

            recovery_token.user.set_password(password)
            recovery_token.user.save()

            recovery_token.delete()
            return Response(status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"message": "Code Invalid"}, status=status.HTTP_400_BAD_REQUEST)

class UploadImageView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
        profile = request.user.profile 
        uploaded_image = request.FILES.get("profile_picture") # get the profile of the authenticated user
        serializer = ProfilePictureSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "Image not valid"}, status=status.HTTP_400_BAD_REQUEST)
        
        if (not self.is_valid_image(uploaded_image)):
            return Response({"error": "Image be an allowed type: jpeg, png, or webp"}, status=status.HTTP_400_BAD_REQUEST)

        old_image = profile.profile_picture

        serializer.save()
        self.delete_old_image(old_image)

        return Response({"message": "Image uploaded successfully"}, status=status.HTTP_200_OK)
        

    
    def is_valid_image(self, image):
      
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if image.content_type not in allowed_types:
            return False

        return True

    def delete_old_image(self, old_image):
        try:
            if not old_image:
                return  # No image to delete

            image_name = str(old_image)

            # Skip deletion if it's the default profile picture
            if image_name.endswith("blank-profile-picture.png"):
                return

            old_image_path = os.path.join(settings.MEDIA_ROOT, image_name)

            if os.path.exists(old_image_path):
                os.remove(old_image_path)
        except Exception as e:
            print(f"Error deleting old image: {e}")

class UserSettings(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        profile = request.user.profile

        return Response({"settings": {"show_last_seen": profile.show_last_seen, "profile_visibility": profile.profile_visibility}}, status=status.HTTP_200_OK)
        
    def patch(self, request):
        profile = request.user.profile
        visibility_options = ["allow", "hide"]
        seen_options = ["visible", "hidden"]
        show_last_seen = request.data.get("show_last_seen")
        profile_visibility = request.data.get("profile_visibility")

        last_seen_error=""
        profile_visibility_error=""

        if (show_last_seen not in seen_options):
            last_seen_error = "Invalid Option"
        
        if (profile_visibility not in visibility_options):
            profile_visibility_error = "Invalid Option"

        if (last_seen_error or profile_visibility_error):
            return Response({"last_seen_error": last_seen_error, "profile_visibility_error": profile_visibility_error}, status=status.HTTP_400_BAD_REQUEST)

        profile.show_last_seen = show_last_seen
        profile.profile_visibility = profile_visibility
        profile.save(update_fields=["show_last_seen", "profile_visibility"])

        return Response(status=status.HTTP_200_OK)

        
