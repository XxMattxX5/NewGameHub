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
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.core.cache import cache
from .serializer import GetGamesSerializer
import requests
import hashlib


download_batch_size = 500
CACHE_TIMEOUT = 3600
BATCH_SIZE = 10000


def add_or_refresh_token(data):
    """
    Adds new or refreshed token to the database

    Parameters:
        data: the data returned from a request to twitch igdb
    """
    access_token = data.get("access_token")
    expires_in = data.get("expires_in")
    token_type = data.get("token_type")
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    token = Token(access_token=access_token, expires_in=expires_in, token_type=token_type)
    token.save()
    return token

    

def authenticate():
    """
    Gets a token from twitch for the igdb or refreshes the current token
    """
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
    """
    Efficiently bulk-create objects in smaller batches to avoid memory overload.

    Parameters:
        model_class (models.Model): The Django model class (e.g., Game, Genre) whose instances are being created.
        objects (list): A list of unsaved model instances (objects of model_class) to be inserted into the database.
        batch_size (int): The number of objects to create in each batch. Defaults to 'download_batch_size'.

    Example:
        Example:
        games = [Game(title="Game 1", ...), Game(title="Game 2", ...)]
        bulk_create_in_batches(Game, games)
    """
    for i in range(0, len(objects), batch_size):
        model_class.objects.bulk_create(objects[i:i + batch_size])


def loadGames():
    """
    Fetches games from IGDB in batches of 500 and stores them temporarily in memory.

    Once 10,000 games have been collected, they are bulk created in the database
    using the `bulk_create_in_batches` function to minimize database hits and improve performance.

    After each bulk insert, the in-memory list is cleared to avoid RAM overuse.
    """
    token = Token.objects.all()

    # Checks to see if there is a valid token else it gets a new one
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

    # Inserts stored instance models into the database then clears them from the memory
    def insert_batch():
        if not game_objects:
            return

        bulk_create_in_batches(Game, game_objects)

        # Updates the search_vector field after Game objects have been created
        Game.objects.update(search_vector=SearchVector('title'))

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

    while True:
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


def getGameList(search_word ,perPage, page, sort_option, genre):
    """
    Retrieves a paginated and optionally filtered list of games based on search criteria.

    Parameters:
        search_word (str): The keyword to search games by title.
        perPage (int): Number of games to return per page.
        page (int): The current page number.
        sort_option (str): The field to sort results by (e.g., rating, release date).
        genre (str): Optional genre to filter games by.

    Returns:
        QuerySet: A list of games matching the criteria.
    """
    sort_options = ["relevance","name", "release(asc)","release(desc)", "rating"]
    search_threshold = 0.2
    
    # Ensures page number is valid
    try:
        page = int(page)
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    # Create a cache key based on the search parameters
    cache_key = f"search_{hashlib.md5(f'{search_word}_{genre}_{sort_option}_{page}_{perPage}'.encode()).hexdigest()}"

    
    cached_results = cache.get(cache_key)

    # Returns cached results if they exist
    if cached_results:
        return cached_results["games_page"], cached_results["pages"]
        
    # Sets sort option to release(desc) if the current option is relevance
    # and there is no search_word
    if not search_word and sort_option == "relevance":
        sort_option = "release(desc)"

    # Search using postgres full text search if it returns results
    # else it uses a trigram similiarity search instead
    if search_word:
        search_query = SearchQuery(search_word)

        # Try full-text search first
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
    
    # Filters by games that contain the selected genre
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
    
    # If game_count is greater then 100 the game_count gets cached
    # to speed up search times
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

    # Cache the result for future queries if results contain at least 20 games
    if (game_count >= 20):
        cache.set(cache_key, result, timeout=CACHE_TIMEOUT)

    return result['games_page'], result['pages']

def getSuggestionList(search_word):
    """
    Retrieves a list of game suggestions based on a search keyword.

    The function uses a predefined threshold to find games that closely match
    the provided search word.

    Parameters:
        search_word (str): The keyword used to find similar game titles.

    Returns:
        QuerySet: A list of max 5 games sorted by there rank or similarity.
    """
    search_threshold = 0.2

    # Search using postgres full text search if it returns results
    # else it uses a trigram similiarity search instead
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

   
   