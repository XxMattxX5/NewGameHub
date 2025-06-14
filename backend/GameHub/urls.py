
from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("games/game_list/", views.GetGameList.as_view(), name="Get_Game_List"),
    path("games/top_rated_list/", views.GetTopRatedList.as_view(), name="Get_Top_Rated_Game_List"),
    path("games/gameSuggestions/", views.GetGameSuggestions.as_view(), name="Get_Game_Suggestions"),
    path("games/<slug:slug>/", views.GetGame.as_view(), name="Get_Game"),
    path("auth/login/", views.SessionLoginView.as_view(), name="Login"),
    path("auth/is-logged/", views.IsLogged.as_view(), name="Is-Logged"),
    path("auth/register/", views.RegisterUser.as_view(), name="Register"),
    path("auth/logout/", views.SessionLogoutView.as_view(), name="Logout"),
    path('auth/login/forgot-password/', views.ForgotPassword.as_view(), name="Forgot_Password"),
    path("auth/login/reset-password/<str:code>/", views.ResetPassword.as_view(), name="Reset_Password"),
    path("user/info/", views.UserInfo.as_view(), name="User_Info"),
    path("user/profile/image/",views.UploadImageView.as_view(), name="Upload_Profile_Picture"),
    path("user/settings/",views.UserSettings.as_view(), name="User_Settings"),
    path("user/profile/", views.UserProfile.as_view(), name="Profile"),
    path("user/profile/<int:id>/", views.ViewUserProfile.as_view(), name="View-Profile"),
    path("contact/email/", views.SendEmail.as_view(), name="Send_Email"),
]