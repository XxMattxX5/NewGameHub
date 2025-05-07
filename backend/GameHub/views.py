from django.shortcuts import render, HttpResponse, get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Game, Video, Screenshot, Genre, PasswordRecoveryToken, Profile
from .serializer import (
    GetGameSerializer, 
    VideoSerializer, 
    ScreenshotSerializer, 
    GenreSerializer, 
    ProfilePictureSerializer, 
    GetGameSuggetionsSerializer,
    UserInfoSerializer,
    ViewUserInfoSerializer,
    )
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
        """
        Handles GET requests to retrieve a list of games based on search criteria.

        Query Parameters:
            q (str): Search keyword to filter games by title.
            s (str): Sort option ('relevance', 'rating', 'release', etc.). Defaults to 'relevance'.
            page (str): Page number for pagination. Defaults to '1'.
            g (str): Genre to filter games. Defaults to 'All'.

        Returns:
            Response: JSON containing:
                - "pages": total number of pages (max 500),
                - "data": list of serialized game data,
                - "genres": list of available game genres.

        Responses:
            200 OK: Successfully returns games and genres.
            404 Not Found: No matching games found.
        """
        perPage = 60

        sort_option = request.GET.get('s', "relevance")
        search_word = request.GET.get('q', '')
        page_num = request.GET.get('page', "1")
        genre_option = request.GET.get("g", "All")

        search_word = re.sub(r'-', ' ', search_word)
        data, pages = getGameList(search_word,perPage, page_num, sort_option,genre_option)

        # Limits the amount of visible pages to the user to 500 pages
        if pages > 500:
            pages = 500

        if not data:
            return Response({"error": "No Games Found"}, status=status.HTTP_404_NOT_FOUND)
        genres = GenreSerializer(Genre.objects.all().order_by("name"), many=True).data

        return Response({"pages": pages, "data":data, "genres":genres}, status=status.HTTP_200_OK)


class GetGame(APIView):

    def get(self, request, slug):
        """
        Handles GET requests to retrieve detailed information about a specific game.

        Path Parameters:
            slug (str): The unique slug identifying the game.

        Returns:
            Response: JSON containing:
                - "data": Serialized game details,
                - "videos": List of associated game trailers/clips,
                - "screenshots": List of related screenshots.

        Responses:
            200 OK: Successfully returns game data, videos, and screenshots.
            404 Not Found: Game with the given slug does not exist.
        """
   
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
        """
        Handles GET requests to retrieve a list of the top 20 highest-rated games.

        Utilizes caching to reduce database load. Cached data expires every 30 minutes.

        Returns:
            Response: JSON containing:
                - "data": A list of serialized top-rated games sorted by rating (descending) and title.

        Responses:
            200 OK: Successfully returns the top-rated games list.
        """
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
        """
        Handles GET requests to return a list of up to 5 suggested games based on a search query.

        The search word is sanitized (replacing hyphens with spaces) and passed to a suggestion algorithm
        that returns relevant game matches. These results are then serialized and returned in the response.

        Query Parameters:
            q (str): The search keyword used to find matching game suggestions.

        Returns:
            Response: JSON containing:
                - "data": A list of up to 5 serialized game suggestions.

        Responses:
            200 OK: Successfully returns the game suggestions.
            404 Not Found: No matching games were found.
        """
        search_word = request.GET.get('q', '')
    
        # Removes dashes from the search word and replace it with spaces
        search_word = re.sub(r'-', ' ', search_word)
        
        data = getSuggestionList(search_word)
        data = GetGameSuggetionsSerializer(data, many=True).data

        if not data:
            return Response({"error": "No Games Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data":data,}, status=status.HTTP_200_OK)
    
class IsLogged(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handles GET requests to verify if the user is authenticated.

        If authenticated, updates the user's profile `last_seen` field to today's date,
        indicating recent activity.

        Permissions:
            - The user must be authenticated.

        Returns:
            Response: 
                - 200 OK if the user is authenticated and `last_seen` is updated.
        """
        profile = request.user.profile
        profile.last_seen = datetime.date.today()
        profile.save(update_fields=["last_seen"])

        return Response(status=status.HTTP_200_OK)

class SessionLoginView(APIView):
    authentication_classes = []
    permission_classes = []    

    def post(self, request):
        """
        Authenticates a user using session-based login.

        Accepts username and password from the request body. If the credentials are valid,
        logs the user in by creating a session.

        Request Body:
            - username (str): The user's username.
            - password (str): The user's password.

        Returns:
            - 200 OK with success message if authentication succeeds.
            - 400 Bad Request if either field is missing.
            - 401 Unauthorized if credentials are invalid.
        """
        username = request.data.get("username", "").strip().lower()
        password = request.data.get("password", "")

        # Ensures neither of the inputs are empty
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
        """
        Registers a new user account.

        Expects a JSON body containing username, email, full name, password, and password confirmation.
        Uses Django form validation to check input data. If valid, creates a new user, sets the profile
        full name, and returns a 201 response.

        Request Body (JSON):
            - username (str): Desired username for the new user.
            - full_name (str): Full name of the user.
            - email (str): User's email address.
            - password (str): Password for the account.
            - password_confirm (str): Confirmation of the password (checked in the form).

        Returns:
            - 201 Created if registration is successful.
            - 400 Bad Request if form validation fails.
        """
        data = json.loads(request.body)
        form = UserRegistrationForm(data)

        if form.is_valid():
            
            username = form.cleaned_data['username'].lower()
            full_name = form.cleaned_data["full_name"].title()
            email = form.cleaned_data['email'].lower()
            password = form.cleaned_data['password']

            # Create user and adds full_name to user's profile
            user = User.objects.create_user(username=username, email=email, password=password)
            user.profile.full_name=full_name
            user.profile.save()
            
            return Response(status=status.HTTP_201_CREATED)

        # Return error response with form errors
        return Response({"errors": form.errors}, status=status.HTTP_400_BAD_REQUEST)


class SessionLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logs out the currently authenticated user.

        Requires the user to be authenticated. Ends the user's session using Django's logout mechanism.

        Returns:
            - 200 OK with a success message on successful logout.
        """
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

class UserInfo(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieves basic information about the currently authenticated user.

        Returns:
            - 200 OK with the user's ID, username, and profile picture URL.
        """
        user = request.user

        return Response({"id":user.id, "username": user.username, "profile_picture": "/api" + user.profile.profile_picture.url})


class ForgotPassword(APIView):
    permission_classes = []

    def post(self, request):
        """
        Initiates the password reset process by sending a recovery email.

        - If the user is already authenticated, returns 403 Forbidden.
        - If the provided email exists, deletes any existing recovery token and creates a new one.
        - Sends a password reset link to the user's email.
        - Returns 200 OK regardless of whether the email exists, to avoid email enumeration.
        - Returns 500 Internal Server Error if an unexpected issue occurs.
        """
        # Ensure user is not logged in
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)
        
        email = request.data.get("email", "")
        
        try:
            user = User.objects.get(email=email)
            recovery_token = PasswordRecoveryToken.objects.filter(user=user)

            # Deletes old recovery_token if one exists
            if (recovery_token.exists()):
                recovery_token.delete()

            token = PasswordRecoveryToken.objects.create(user=user)
            host = request.get_host()
           
            # Sends email with reset password link
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
        """
        Verifies the validity and expiration of the password recovery token.

        - If the user is already authenticated, returns 403 Forbidden.
        - If the recovery token is valid and not expired, returns a message indicating that the code is valid.
        - If the recovery token is expired, returns a 401 Unauthorized error.
        - If the code is invalid or not found, returns a 400 Bad Request error.
        """
        # Ensure user is not logged in 
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            recovery_token = PasswordRecoveryToken.objects.get(code=code)

            # Checks if recovery token is expired
            if (recovery_token.is_expired()):
                return Response({"message": "Code Expired"}, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({"message": "Code Valid"}, status=status.HTTP_200_OK)
        except:
             return Response({"message": "Code Invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
        
    def post(self, request, code):
        """
        Resets the user's password using the provided password recovery token code.

        - Ensures the user is not authenticated; if authenticated, returns a 403 Forbidden status.
        - Verifies that the recovery token is valid and not expired:
            - If the token is expired, returns a 401 Unauthorized status.
            - If the token is invalid, returns a 400 Bad Request status.
        - Validates the new password:
            - The password must match the required pattern (at least 8 characters, containing uppercase letters and special characters).
            - If the password doesn't meet the requirements, returns a 400 Bad Request status.
        - Confirms that the "password" and "password_confirm" fields match. If they don't, returns a 400 Bad Request status.
        - If everything is valid, resets the user's password, deletes the recovery token, and returns a 200 OK status.
        - If an unexpected error occurs during the process, logs the error and returns a 400 Bad Request status.

        Parameters:
        - code (str): The recovery token code used to verify and reset the password.
        
        Returns:
        - Response: A response with the appropriate HTTP status based on the outcome of the request.
        """
        # Ensures user isn't logged in
        if request.user.is_authenticated:
            return Response({"message": "Already authenticated"}, status=status.HTTP_403_FORBIDDEN)

        try:
            recovery_token = PasswordRecoveryToken.objects.get(code=code)

            # Checks to makes sure recovery_token isn't expired
            if (recovery_token.is_expired()):
                return Response({"message": "Code Invalid"}, status=status.HTTP_401_UNAUTHORIZED)
            

            password = request.data.get("password")
            passwordConfirm = request.data.get("password_confirm")

            pattern = r'^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})'

            # Ensures password is at least 8 characters, contain a capital letter, and contains a special character
            if not re.match(pattern, password):
                return Response({"message": "Password Invalid"}, status=status.HTTP_400_BAD_REQUEST)
            elif passwordConfirm != password:
                return Response({"message": "Passwords must match"}, status=status.HTTP_400_BAD_REQUEST)

            # Updates user's password then deletes the recovery token
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
        """
        Handles the upload of a profile image for an authenticated user.

        - Verifies that the user is authenticated using the `IsAuthenticated` permission class.
        - Accepts an uploaded image through the `profile_picture` field in the request.
        - Uses the `ProfilePictureSerializer` to validate and update the user's profile picture.
        - Ensures that the uploaded image is of an allowed type (jpeg, png, or webp).
        - Deletes the user's old profile picture (if any) and replaces it with the newly uploaded image.

        Returns:
        - Response: A response with the appropriate HTTP status and message indicating the result of the upload process.

        Status codes:
        - 200 OK: If the image is successfully uploaded.
        - 400 Bad Request: If the image is not valid or its type is not allowed.
        """
        profile = request.user.profile 
        uploaded_image = request.FILES.get("profile_picture")
        serializer = ProfilePictureSerializer(profile, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response({"error": "Image not valid"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensures image is a valid image type
        if (not self.is_valid_image(uploaded_image)):
            return Response({"error": "Image be an allowed type: jpeg, png, or webp"}, status=status.HTTP_400_BAD_REQUEST)

        old_image = profile.profile_picture
        
        # Saves user new profile picture and deletes the old one if it wasn't the default image
        serializer.save()
        self.delete_old_image(old_image)

        return Response({"message": "Image uploaded successfully"}, status=status.HTTP_200_OK)
        

    
    def is_valid_image(self, image):
        """
        Checks if the uploaded image is of an allowed type (jpeg, png, or webp).

        Parameters:
        - image (UploadedFile): The image file uploaded by the user.

        Returns:
        - bool: True if the image type is allowed, False otherwise.
        """
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if image.content_type not in allowed_types:
            return False

        return True

    def delete_old_image(self, old_image):
        """
        Deletes the old profile image if it exists and is not the default image.

        Parameters:
        - old_image (ImageField): The old profile image to be deleted.

        This method checks if the image is not the default "blank-profile-picture.png" before attempting to delete it.
        """
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
        """
        Retrieves the current user's settings for profile and name visibility.

        - Fetches the user's profile and returns the current visibility settings.
        - Returns the visibility options for both the user's name and profile.

        Returns:
        - Response: A JSON response containing the current visibility settings.

        Status code:
        - 200 OK: If the settings are successfully retrieved.
        """
        profile = request.user.profile

        return Response({"settings": {"name_visibility": profile.name_visibility, "profile_visibility": profile.profile_visibility}}, status=status.HTTP_200_OK)
        
    def patch(self, request):
        """
        Updates the current user's settings for profile and name visibility.

        - Allows the user to update their profile visibility and name visibility settings.
        - Validates the visibility options before applying the changes.

        Parameters:
        - show_last_seen (str): The visibility setting for showing the user's last seen status.
        - profile_visibility (str): The visibility setting for the user's profile.

        Returns:
        - Response: A JSON response indicating the success or failure of the update.

        Status codes:
        - 200 OK: If the settings are successfully updated.
        - 400 Bad Request: If invalid visibility options are provided.

        Errors:
        - If invalid options are provided for either `name_visibility` or `profile_visibility`, error messages are returned.
        """
        profile = request.user.profile
        visibility_options = ["visible", "hidden"]
        name_options = ["visible", "hidden"]
        name_visibility = request.data.get("show_last_seen")
        profile_visibility = request.data.get("profile_visibility")

        name_visibility_error=""
        profile_visibility_error=""

        # Ensures name_visibility input by user is a valid option
        if (name_visibility not in name_options):
            name_visibility_error = "Invalid Option"
        
        # Ensures profile_visibility input by user is a valid option
        if (profile_visibility not in visibility_options):
            profile_visibility_error = "Invalid Option"

        # Returns an error if either profile_visibility or name_visibility are invalid
        if (name_visibility_error or profile_visibility_error):
            return Response({"name_visibility_error": name_visibility_error, "profile_visibility_error": profile_visibility_error}, status=status.HTTP_400_BAD_REQUEST)

        profile.name_visibility = name_visibility
        profile.profile_visibility = profile_visibility
        profile.save(update_fields=["name_visibility", "profile_visibility"])

        return Response(status=status.HTTP_200_OK)
    
class UserProfile(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserInfoSerializer(user).data

        return Response({"data":data}, status=status.HTTP_200_OK)
    
class ViewUserProfile(APIView):
    
    def get(self, request, id):
        user = get_object_or_404(User, id=id)

        if (user.profile.profile_visibility != "visible"):
            return Response( status=status.HTTP_401_UNAUTHORIZED)

        data = ViewUserInfoSerializer(user).data

        return Response({"data":data}, status=status.HTTP_200_OK)

        
