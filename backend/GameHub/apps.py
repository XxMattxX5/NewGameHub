from django.apps import AppConfig


class GamehubConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'GameHub'

    def ready(self):
        import GameHub.signals

