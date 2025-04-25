import os
from .models import Token, Game, Video, Screenshot, Genre
from datetime import timedelta
from django.utils import timezone
from django.utils.timezone import make_aware
from requests import post
from django.db import transaction
import time
from django.utils.text import slugify
from django.db.models import F
from django.core.paginator import Paginator
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.core.cache import cache
from .serializer import GetGamesSerializer
import requests
import hashlib


download_batch_size = 500
CACHE_TIMEOUT = 3600
BATCH_SIZE = 10000

# Adds new or refreshed token to database
def add_or_refresh_token(data):
    access_token = data.get("access_token")
    expires_in = data.get("expires_in")
    token_type = data.get("token_type")
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    token = Token(access_token=access_token, expires_in=expires_in, token_type=token_type)
    token.save()
    return token

    

# Gets a token from twitch for the igdb or refreshes the current token.
def authenticate():
    token = Token.objects.all()
    # Checks if there is already a token
    if len(token) > 0:
        token = token[0]
        # Checks if the token is expired and refreshes it if it is
        if token.expires_in <= timezone.now():
            
            # Sends a request for a new token
            response = post("https://id.twitch.tv/oauth2/token", data={
                "client_id": os.getenv("CLIENT_ID"),
                "client_secret": os.getenv("CLIENT_SECRET"),
                "grant_type": "client_credentials"
            }).json()
            
            return add_or_refresh_token(response)


    else:
        # Sends a request for a token
        response = post("https://id.twitch.tv/oauth2/token", data={
                "client_id": os.getenv("CLIENT_ID"),
                "client_secret": os.getenv("CLIENT_SECRET"),
                "grant_type": "client_credentials"
            }).json()
        
        return add_or_refresh_token(response)


def bulk_create_in_batches(model_class, objects, batch_size=download_batch_size):
    """Helper function to bulk create objects in batches."""
    
    for i in range(0, len(objects), batch_size):
        model_class.objects.bulk_create(objects[i:i + batch_size])


def loadGames():
    token = Token.objects.all()
    if len(token) > 0 and token[0].expires_in > timezone.now():
        token = token[0]
    else:
        token = authenticate()

    headers = {
        "Client-ID": os.getenv("CLIENT_ID"),
        "Authorization": f"Bearer {token.access_token}",
    }

    games = Game.objects.all()
    params = {
        "fields": "id, name, first_release_date, storyline, summary, cover.url, videos.video_id, screenshots.url, rating, genres.name, aggregated_rating",
        "limit": 500,
        "offset": games.count(),
    }

    genre_list = [genre.name for genre in Genre.objects.all()]
    game_objects, video_objects, screenshot_objects = [], [], []
    seen_game_ids = set(Game.objects.values_list('game_id', flat=True))

    def insert_batch():
        if not game_objects:
            return

        bulk_create_in_batches(Game, game_objects)

        for game in game_objects:
            game.genres.add(*[genre for genre in game._genres])

        bulk_create_in_batches(Video, video_objects)
        bulk_create_in_batches(Screenshot, screenshot_objects)

        # Clear buffers
        game_objects.clear()
        video_objects.clear()
        screenshot_objects.clear()

    total_games_loaded = 0
    retries, attempt = 3, 1

    while params["offset"] < 200000:
        try:
            response = post("https://api.igdb.com/v4/games", params=params, headers=headers)
        except requests.exceptions.RequestException as e:
            print(f"Request failed on attempt {attempt + 1}/{retries}: {e}")
            time.sleep(2 * attempt)
            attempt += 1
            if attempt > retries:
                break
            continue

        if response.ok:
            response = response.json()

            with transaction.atomic():
                for game in response:
                    game_id = game.get("id")
                    title = game.get('name')[:149]
                    release = game.get("first_release_date")
                    genres_data = game.get("genres")
                    videos = game.get("videos")
                    screenshots = game.get("screenshots")
                    cover = game.get("cover")
                    storyline = game.get("storyline")[:6000] if game.get("storyline") else None
                    summary = game.get("summary")[:6000] if game.get("summary") else None
                    rating = game.get("rating")
                    critic_rating = game.get("aggregated_rating")

                    
                    if game_id in seen_game_ids:
                        continue

                    seen_game_ids.add(game_id)

                    # Cover processing
                    cover = cover.get('url').replace('t_thumb', 't_cover_big') if cover else None

                    # Timestamp conversion
                    if release:
                        try:
                            release = timezone.make_aware(timezone.datetime.fromtimestamp(release))
                        except:
                            release = None

                    # Rating fallback
                    rating = round(rating / 10, 1) if rating else round(critic_rating / 10, 1) if critic_rating else None

                    safe_title = title[:80]
                    slug = slugify(f"{safe_title}-{game_id}")

                    # Genre handling
                    game_genres = []
                    if genres_data:
                        for genre in genres_data:
                            name = genre.get("name")
                            if name in genre_list:
                                game_genres.append(Genre.objects.get(name=name))
                            else:
                                new_genre = Genre.objects.create(name=name)
                                genre_list.append(name)
                                game_genres.append(new_genre)

                    # Game object
                    game_obj = Game(game_id=game_id, title=title, cover_image=cover, release=release,
                                    storyline=storyline, summary=summary, rating=rating, slug=slug)
                    game_obj._genres = game_genres  # temporarily attach genres
                    game_objects.append(game_obj)

                    # Video objects
                    if videos:
                        for vid in videos:
                            video_objects.append(Video(game=game_obj, src=f"https://www.youtube.com/embed/{vid.get('video_id')}"))

                    # Screenshot objects
                    if screenshots:
                        for shot in screenshots:
                            screenshot_objects.append(Screenshot(game=game_obj, src=shot.get("url")))

                    total_games_loaded += 1

                    # Flush every BATCH_SIZE
                    if total_games_loaded % BATCH_SIZE == 0:
                        insert_batch()
                        print(f"{total_games_loaded} games inserted so far...")

            params["offset"] += 500
            print(f"Games Fetched: {params["offset"]}")
            time.sleep(1)
        else:
            break

    # Insert any remaining games
    with transaction.atomic():
        insert_batch()

    return f"{total_games_loaded} Games Loaded Successfully!"

# Returns a list of games to be displayed
def getGameList(search_word ,perPage, page, sort_option, genre):
    sort_options = ["relevance","name", "release(asc)","release(desc)", "rating"]
    search_word_length = len(search_word)
   
    if search_word_length >= 10:
        search_threshold = 0.5
    elif search_word_length >= 7:
        search_threshold = 0.4
    elif search_word_length >= 5:
        search_threshold = 0.2
    else:
        search_threshold = 0.15
    

    try:
        page = int(page)
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    # Create a cache key based on the search parameters
    cache_key = f"search_{hashlib.md5(f'{search_word}_{genre}_{sort_option}_{page}_{perPage}'.encode()).hexdigest()}"

    
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results["games_page"], cached_results["pages"]
        

    

    if search_word:
        search_query = SearchQuery(search_word)

        fulltext_results = Game.objects.annotate(
            rank=SearchRank('search_vector', search_query)
        ).filter(
            search_vector=search_query
        )
        fulltext_exists = fulltext_results.exists()

        if fulltext_exists:
            games = fulltext_results
            if (sort_option == "relevance"):
                games = games.order_by("-rank")
        else:
            # Fallback to Trigram
            trigram_results = Game.objects.annotate(
                similarity=TrigramSimilarity('title', search_word)
            ).filter(
                similarity__gt=search_threshold
            )

            games = trigram_results
            if (sort_option == "relevance"):
                games = games.order_by("-similarity")
    else:
        games = Game.objects.all()
        

    games.only("game_id","slug","title", "cover_image", "release","rating")
    
    if genre != "All":
        try:
            genre_obj = Genre.objects.get(name=genre)
            games = games.filter(genres=genre_obj)
        except Genre.DoesNotExist:
            pass

    # returns if no games were found with the search word
    if not games.exists():
        return [], 0

    # Applys sort to list if a sort was selected
    if sort_option in sort_options:
        if sort_option == "name":
            games = games.order_by(F("title").asc())
        elif sort_option == "release(asc)":
            games = games.order_by(F('release').asc(nulls_last=True), F('title').asc())
        elif sort_option == "release(desc)":
            games =games.order_by(F('release').desc(nulls_last=True), F('title').asc())
        elif sort_option == "rating":
            games =games.order_by(F('rating').desc(nulls_last=True), F('title').asc())
    else:
       games = games.order_by(F('release').desc(nulls_last=True), F('title').asc())

    cache_count_key = f"results_count_{hashlib.md5(f'{search_word}_{genre}'.encode()).hexdigest()}"
    cached_count = cache.get(cache_count_key)

    if cached_count is not None:
        game_count = cached_count
    else:
        game_count = games.count()
        if game_count > 100:
            cache.set(cache_count_key, game_count, timeout=CACHE_TIMEOUT)

    p = Paginator(games, perPage)
    p.count = game_count

    games_page = p.get_page(page)
    pages = p.num_pages

    serializer = GetGamesSerializer(games_page, many=True)
    serialized_games = serializer.data
   
    # Prepare the result to cache
    result = {
        'games_page': serialized_games,
        'pages': pages
    }

    # Cache the result for future queries if results contain at least 5 games
    if (game_count >= 5):
        cache.set(cache_key, result, timeout=CACHE_TIMEOUT)

    return result['games_page'], result['pages']

def getSuggestionList(search_word):
    search_word_length = len(search_word)

    if search_word_length >= 10:
        search_threshold = 0.5
    elif search_word_length >= 7:
        search_threshold = 0.4
    elif search_word_length >= 5:
        search_threshold = 0.2
    else:
        search_threshold = 0.15

    if search_word:
        search_query = SearchQuery(search_word)

        # Try full-text search first
        fulltext_results = Game.objects.annotate(
            rank=SearchRank('search_vector', search_query)
        ).filter(
            search_vector=search_query
        ).order_by('-rank')[:5]

        if fulltext_results.exists():
            return fulltext_results
        else:
            # Fallback to TrigramSimilarity
            trigram_results = Game.objects.annotate(
                similarity=TrigramSimilarity('title', search_word)
            ).filter(
                similarity__gt=search_threshold
            ).order_by('-similarity')[:5]

            return trigram_results
    else:
        return []

   
   