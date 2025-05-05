from django.shortcuts import render, HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import ForumPost, PostReaction
from .serializer import PostSerializerWithGame
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .utils import getPostList, getPostSuggestions

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
        elif (type == "myposts" and request.user.is_authenticated):
            posts = ForumPost.objects.filter(user=request.user)
        elif (type == "liked" and request.user.is_authenticated):
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
        

class GetPostDetails(APIView):

    def get(self, request, slug):

        post = get_object_or_404(ForumPost, slug=slug)
        # post.increase_views()
        data = PostSerializerWithGame(post, context={"user":request.user}).data
        return Response({"data": data}, status=status.HTTP_200_OK)
    
class IncreasePostViews(APIView):
    def post(self, request, slug):
         post = get_object_or_404(ForumPost, slug=slug)
         post.increase_views()
         return Response( status=status.HTTP_200_OK)