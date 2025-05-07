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

# Create your views here.
def home(request):
    return HttpResponse("OK")

class GetPosts(APIView):
    def get(self, request):
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

        data, pages = getPostList(posts,search,sort,type,page,request.user)

        return Response({"data": data, "pages":pages}, status=status.HTTP_200_OK)
    

class GetPostSuggestions(APIView):
    def get(self, request):
        search = request.GET.get("q", "")

        posts = getPostSuggestions(search)

        data = PostSerializerWithGame(posts,many=True, context={"user":request.user}).data

        if not data:
            return Response({"error": "No Posts Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data":data}, status=status.HTTP_200_OK)
    
class LikePost(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request, id):
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
    
        post = get_object_or_404(ForumPost, slug=slug)
        data = PostSerializerWithGame(post, context={"user":request.user}).data
        return Response({"data": data}, status=status.HTTP_200_OK)
    

    def delete(self, request, slug):
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

            return Response(status=status.HTTP_200_OK)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class CreatePost(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request):
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

            return Response(status=status.HTTP_200_OK)

        # If form is not valid, return the errors
        return Response({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    
class IncreasePostViews(APIView):
    def post(self, request, slug):
         post = get_object_or_404(ForumPost, slug=slug)
         post.increase_views()
         return Response( status=status.HTTP_200_OK)
    
class GetPostComments(APIView):

    def get(self, request, id):

        post = get_object_or_404(ForumPost, id=id)

        comments = post.comments.filter(parent__isnull=True)

        data = CommentSerializer(comments, many=True).data

        return Response({"data":data}, status=status.HTTP_200_OK)
    

class CreateComment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
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
    permission_classes = [IsAuthenticated]

    def get(self, request, id): 
        
        comment = get_object_or_404(Comment, id=id)
        comments = comment.replies.all()
        data = CommentSerializer(comments, many=True).data

        return Response({"data":data}, status=status.HTTP_200_OK)

    def post(self, request, id):
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