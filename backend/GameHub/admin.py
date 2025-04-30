from django.contrib import admin
from .models import Token, Game, Genre, Video, Screenshot, Profile, PasswordRecoveryToken
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)

class ScreenshotAdmin(admin.ModelAdmin):
    autocomplete_fields = ['game']
    list_display = ('id', 'game', 'src')
    list_select_related = ('game',)

class VideoAdmin(admin.ModelAdmin):
    autocomplete_fields = ['game']
    list_display = ('id', 'game', 'src')
    list_select_related = ('game',)

class GameAdmin(admin.ModelAdmin):
    search_fields = ['title']

# Register your models
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Token)
admin.site.register(Game, GameAdmin)
admin.site.register(Genre)
admin.site.register(Video, VideoAdmin)
admin.site.register(Screenshot, ScreenshotAdmin)
admin.site.register(PasswordRecoveryToken)
