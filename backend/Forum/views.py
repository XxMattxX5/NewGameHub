from django.shortcuts import render, HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import ForumPost, PostReaction, Comment
from .serializer import PostSerializerWithGame, CommentSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .utils import getPostList, getPostSuggestions
from .forms import PostForm, CommentForm, ReplyForm
from GameHub.models import Game
from datetime import timedelta

# Create your views here.
def home(request):
    return HttpResponse("OK")

class GetPosts(APIView):
    def get(self, request):
        """
        Retrieve a paginated list of forum posts filtered by type, search query, and sort order.

        Query Parameters:
            type (str): Filter by post type. Options: "general", "game", "myposts", "liked".
            q (str): Optional search query string. Defaults to empty.
            s (str): Sort order. Options: "relevance", "title", "created(asc)", "created(desc)", "likes". Defaults to "relevance".
            page (int): Page number for pagination. Defaults to 1.

        Returns:
            200 OK: JSON with list of serialized posts and total page count.
        """
        type = request.GET.get("type")
        search = request.GET.get("q", "")
        sort = request.GET.get("s", "relevance")
        page = request.GET.get("page", 1)
        
        
        if (type == "general"):
            posts = ForumPost.objects.filter(post_type=type)
        elif (type == "game"):
            posts = ForumPost.objects.filter(post_type=type)
        elif ((type == "myposts") and request.user.is_authenticated):
            posts = ForumPost.objects.filter(user=request.user)
        elif ((type == "liked") and request.user.is_authenticated):
            posts = ForumPost.objects.filter(
                postreaction__user=request.user,
                postreaction__reaction=PostReaction.LIKE
            )
        else: 
            posts = ForumPost.objects.all()

        # skip_cache = request.COOKIES.get('skip_forum_cache') == 'True'

        # if type in ("liked", "myposts"):
        #     skip_cache = True

        data, pages = getPostList(posts,search,sort,type,page,request.user)

        return Response({"data": data, "pages":pages}, status=status.HTTP_200_OK)
    

class GetPostSuggestions(APIView):
    def get(self, request):
        """
        Get post suggestions based on a search query.

        Query Parameters:
            q (str): The search query string.

        Returns:
            200 OK: JSON with list of suggested posts.
            404 NOT FOUND: If no posts match the search query.
        """
        search = request.GET.get("q", "")

        posts = getPostSuggestions(search)

        data = PostSerializerWithGame(posts,many=True, context={"user":request.user}).data

        if not data:
            return Response({"error": "No Posts Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data":data}, status=status.HTTP_200_OK)
    
class LikePost(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request, id):
        """
        Like or unlike a post.

        POST Parameters:
            id (int): ID of the post to like.

        Behavior:
            - If the post is not yet liked, it will be liked.
            - If the post is already liked, the like will be removed.
            - Users cannot like their own posts.

        Returns:
            200 OK: On successful like/unlike.
            401 UNAUTHORIZED: If trying to like own post.
            400 BAD REQUEST: If post doesn't exist or other errors occur.
        """
        try:
            user = request.user
            post = ForumPost.objects.get(id=id)

            if post.user == user:
                return Response({"error": "Can't like your own post"},status=status.HTTP_401_UNAUTHORIZED)


            reaction, created = PostReaction.objects.get_or_create(user=user, post=post)

            if reaction.reaction != PostReaction.LIKE:
                reaction.increase_like()
                return Response(status=status.HTTP_200_OK)
            else:
                reaction.delete_reaction()
                return Response(status=status.HTTP_200_OK)

       
        except ForumPost.DoesNotExist:
            return Response({"error": "Post does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"error": "An unexpected error occured"}, status=status.HTTP_400_BAD_REQUEST)

class DislikePost(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request, id):
        """
        Dislike or remove dislike from a post.

        POST Parameters:
            id (int): ID of the post to dislike.

        Behavior:
            - If the post is not yet disliked, it will be disliked.
            - If the post is already disliked, the dislike will be removed.
            - Users cannot dislike their own posts.

        Returns:
            200 OK: On successful dislike/removal.
            401 UNAUTHORIZED: If trying to dislike own post.
            400 BAD REQUEST: If post doesn't exist or other errors occur.
        """
        try:
            user = request.user
            post = ForumPost.objects.get(id=id)

            if post.user == user:
                return Response({"error": "Can't dislike your own post"},status=status.HTTP_401_UNAUTHORIZED)

            reaction, created = PostReaction.objects.get_or_create(user=user, post=post)

            if reaction.reaction != PostReaction.DISLIKE:
                reaction.increase_dislike()
                return Response(status=status.HTTP_200_OK)
            else:
                reaction.delete_reaction()
                return Response(status=status.HTTP_200_OK)

       
        except ForumPost.DoesNotExist:
            return Response({"error": "Post does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"error": "An unexpected error occured"}, status=status.HTTP_400_BAD_REQUEST)
        

class Post(APIView):

    def get(self, request, slug):
        """
        Retrieve a single forum post by its slug.

        Args:
            slug (str): The slug of the post to retrieve.

        Returns:
            Response: 200 OK with serialized post data or 404 NOT FOUND if post does not exist.
        """
        post = get_object_or_404(ForumPost, slug=slug)
        data = PostSerializerWithGame(post, context={"user":request.user}).data
        return Response({"data": data}, status=status.HTTP_200_OK)
    

    def delete(self, request, slug):
        """
        Delete a post if the request user is the post's author.

        Args:
            slug (str): The slug of the post to delete.

        Returns:
            Response:
                - 200 OK on successful deletion.
                - 403 FORBIDDEN if user is not logged in.
                - 401 UNAUTHORIZED if user is not the post author.
        """
        # Ensure user is logged in
        if not request.user.is_authenticated:
            return Response({"error": "Must be logged in"}, status=status.HTTP_403_FORBIDDEN)

        user = request.user
        post = get_object_or_404(ForumPost, slug=slug)

        if (post.user != user):
            return Response({"error": "You can't delete another user's post"}, status=status.HTTP_401_UNAUTHORIZED)

        post.delete()
        return Response(status=status.HTTP_200_OK)
    
    def patch(self, request, slug):
        """
        Update a post if the request user is the post's author.

        Args:
            slug (str): The slug of the post to update.

        Returns:
            Response:
                - 200 OK on successful update.
                - 400 BAD REQUEST if form data is invalid.
                - 403 FORBIDDEN if user is not logged in.
                - 401 UNAUTHORIZED if user is not the post author.
        """
        # Ensure user is logged in
        if not request.user.is_authenticated:
            return Response({"error": "Must be logged in"}, status=status.HTTP_403_FORBIDDEN)

        user = request.user

        # Retrieve the post using the slug
        post = get_object_or_404(ForumPost,slug=slug)

        if (user != post.user):
            return Response({"error": "You can't edit other user's post"}, status=status.HTTP_401_UNAUTHORIZED)
        

        form = PostForm(request.data, request.FILES)  # Handling form data and image files

        if form.is_valid():
            # Form data is valid, proceed with the action
            type = form.cleaned_data['type']
            title = form.cleaned_data['title']
            id = form.cleaned_data.get('game_id')
            image = form.cleaned_data.get('image')
            content = form.cleaned_data.get('content')
            sameImage = request.POST.get("sameImage")

            # Update post fields
            post.title = title
            post.post_type = type
            post.content = content

            if id:
                post.game = Game.objects.get(id=id)

            if (image and sameImage != "true"):
                post.header_image = image
            elif (image and sameImage == "true"):
                pass
            else:
                post.header_image = None

            post.save()  # Save the updated post

            response = Response(status=status.HTTP_200_OK)

            # # Set the skip_forum_cache cookie to True with an expiration of 15 minutes
            # response.set_cookie(
            #     'skip_forum_cache',  
            #     'True',                  
            #     max_age=timedelta(minutes=10),
            #     httponly=True,            
            #     secure=True,              
            #     samesite='Strict',        
            # )

            return response
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class CreatePost(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
        """
        Create a new post in the forum.

        The user must be authenticated. Validates the form data and creates a new forum post
        with the provided content, title, type, associated game (if any), and image (if provided).

        Returns:
            200 OK: On successful creation of the post.
            400 BAD REQUEST: If form data is invalid.
        """
        form = PostForm(request.data, request.FILES)  # Handling form data and image files

        if form.is_valid():
            # Form data is valid, proceed with the action
            user = request.user
            type = form.cleaned_data['type']
            title = form.cleaned_data['title']
            id = form.cleaned_data.get('game_id')
            image = form.cleaned_data.get('image')
            content = form.cleaned_data.get('content')

            post_data = {
                'user': user,
                'post_type': type,
                'title': title,
                "content": content
            }
            if id:
                post_data['game'] = Game.objects.get(id=id)

            if image:
                post_data['header_image'] = image

            ForumPost.objects.create(**post_data)

            response = Response(status=status.HTTP_200_OK)

            # # Set the skip_forum_cache cookie to True with an expiration of 15 minutes
            # response.set_cookie(
            #     'skip_forum_cache',  
            #     'True',                  
            #     max_age=timedelta(minutes=10),
            #     httponly=True,            
            #     secure=True,              
            #     samesite='Strict',        
            # )

            return response

        # If form is not valid, return the errors
        return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    
class IncreasePostViews(APIView):
    def post(self, request, slug):
        """
        Increment the view count of a forum post.

        Args:
            slug (str): The slug of the post whose views should be increased.

        Returns:
            200 OK: On successful increment of views.
        """
        post = get_object_or_404(ForumPost, slug=slug)
        post.increase_views()
        return Response( status=status.HTTP_200_OK)
    
class GetPostComments(APIView):

    def get(self, request, id):
        """
        Retrieve the top-level comments for a given post.

        Args:
            id (int): The ID of the post to get comments for.

        Returns:
            200 OK: A list of top-level comments for the post.
            404 NOT FOUND: If the post does not exist.
        """
        post = get_object_or_404(ForumPost, id=id)

        comments = post.comments.filter(parent__isnull=True)

        data = CommentSerializer(comments, many=True).data

        return Response({"data":data}, status=status.HTTP_200_OK)
    

class CreateComment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        """
        Create a new comment on a forum post.

        Args:
            request (Request): The HTTP request object containing the comment content.
            id (int): The ID of the post to comment on.

        Returns:
            Response: 
                - 200 OK if the comment is created successfully.
                - 400 BAD REQUEST if the form is invalid.
        """
        form = CommentForm(request.data)

        if form.is_valid():
            user = request.user
            post = get_object_or_404(ForumPost, id=id)
            content = form.cleaned_data.get("content")

            Comment.objects.create(post=post, user=user, content=content)

            return Response( status=status.HTTP_200_OK)

        else:
            return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)

class Reply(APIView):

    def get(self, request, id): 
        """
        Retrieve all replies to a specific comment.

        Args:
            request (Request): The HTTP request object.
            id (int): The ID of the comment for which replies are retrieved.

        Returns:
            Response: 
                - 200 OK with a list of serialized replies.
        """
        comment = get_object_or_404(Comment, id=id)
        comments = comment.replies.all()
        data = CommentSerializer(comments, many=True).data

        return Response({"data":data}, status=status.HTTP_200_OK)

    def post(self, request, id):
        """
        Create a reply to a specific comment.

        Args:
            request (Request): The HTTP request object containing the reply content and comment ID.
            id (int): The ID of the post being replied to.

        Returns:
            Response: 
                - 200 OK if the reply is created successfully.
                - 400 BAD REQUEST if the form is invalid.
        """
        # Ensure user is logged in
        if not request.user.is_authenticated:
            return Response({"error": "Must be logged in"}, status=status.HTTP_403_FORBIDDEN)
        
        form = ReplyForm(request.data)

        if form.is_valid():
            user = request.user
            post = get_object_or_404(ForumPost, id=id)
            content = form.cleaned_data.get("content")
            comment_id = form.cleaned_data.get("comment_id")
            comment = Comment.objects.get(id=comment_id)

            Comment.objects.create(post=post, user=user, content=content, parent=comment)

            return Response( status=status.HTTP_200_OK)

        else:
            return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)