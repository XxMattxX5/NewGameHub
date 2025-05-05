from django.urls import path, include
from . import views

urlpatterns = [
   path("", views.home, name="home"),
   path("get-posts/", views.GetPosts.as_view(), name="Get_Posts"),
   path ("get-suggestions/", views.GetPostSuggestions.as_view(), name="Get_Suggestions"),
   path ("post/like/<int:id>/", views.LikePost.as_view(), name="Like_Post"),
   path ("post/dislike/<int:id>/", views.DislikePost.as_view(), name="Dislike_Post"),
   path("post/view/<slug:slug>/", views.IncreasePostViews.as_view(), name="Increase_Views"),
   path("post/<slug:slug>/", views.GetPostDetails.as_view(), name="Get_Post_Details"),
]