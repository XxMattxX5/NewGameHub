
from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("games/game_list/", views.GetGameList.as_view(), name="Get_Game_List"),
    path("games/top_rated_list/", views.GetTopRatedList.as_view(), name="Get_Top_Rated_Game_List"),
    path("games/gameSuggestions/", views.GetGameSuggestions.as_view(), name="Get_Game_Suggestions"),
    path("games/<slug:slug>/", views.GetGame.as_view(), name="Get_Game"),
]