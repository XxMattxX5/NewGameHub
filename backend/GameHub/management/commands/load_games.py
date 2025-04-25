
from django.core.management.base import BaseCommand
from GameHub.utils import loadGames 

class Command(BaseCommand):
    help = 'Runs the authenticate function from utils.py'

    def handle(self, *args, **kwargs):
        loadGames()