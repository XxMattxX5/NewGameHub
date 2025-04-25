from django.contrib import admin
from .models import Token, Game, Genre, Video, Screenshot


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
admin.site.register(Token)
admin.site.register(Game, GameAdmin)
admin.site.register(Genre)
admin.site.register(Video, VideoAdmin)
admin.site.register(Screenshot, ScreenshotAdmin)
