import hashlib
from django.core.cache import cache
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.contrib.postgres.search import TrigramSimilarity
from django.core.paginator import Paginator
from django.db.models import F
from .models import ForumPost
from .serializer import PostSerializerWithGame

CACHE_TIMEOUT = 3600

def getPostList(posts,search_word,sort,type, page, user):
    perPage = 5


    sort_options = ["relevance","title", "created(asc)","created(desc)", "likes"]
    search_threshold = 0.2

    # Ensures page number is valid
    try:
        page = int(page)
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    # Create a cache key based on the search parameters
    cache_key = f"search_{hashlib.md5(f'{search_word}_{type}_{sort}_{page}_{perPage}'.encode()).hexdigest()}"

    
    cached_results = cache.get(cache_key)

    # Returns cached results if they exist
    if cached_results:
        return cached_results["forum_page"], cached_results["pages"]
    
    if not search_word and sort == "relevance":
        sort = "release(desc)"

    # Search using postgres full text search if it returns results
    # else it uses a trigram similiarity search instead
    if search_word:
        search_query = SearchQuery(search_word)

        # Try full-text search first
        fulltext_results = posts.annotate(
            rank=SearchRank('search_vector', search_query)
        ).filter(
            search_vector=search_query
        )
        fulltext_exists = fulltext_results.exists()

        if fulltext_exists:
            posts = fulltext_results
            if (sort == "relevance"):
                posts = posts.order_by("-rank")
        else:
            # Fallback to Trigram
            trigram_results = ForumPost.objects.annotate(
                similarity=TrigramSimilarity('title', search_word)
            ).filter(
                similarity__gt=search_threshold
            )

            posts = trigram_results
            if (sort == "relevance"):
                posts = posts.order_by("-similarity")
   

    # Filters by games that contain the selected genre
    if not posts.exists():
        return [], 0
    
    if sort in sort_options:
        if sort == "title":
            posts = posts.order_by(F("title").asc())
        elif sort == "created(asc)":
            posts = posts.order_by(F('created_at').asc(nulls_last=True), F('title').asc())
        elif sort == "created(desc)":
            posts =posts.order_by(F('created_at').desc(nulls_last=True), F('title').asc())
        elif sort == "likes":
            posts =posts.order_by(F('like_count').desc(), F('created_at').desc())
    else:
       posts = posts.order_by(F('created_at').desc(nulls_last=True), F('title').asc())
        

    cache_count_key = f"results_count_{hashlib.md5(f'{search_word}_{type}'.encode()).hexdigest()}"
    cached_count = cache.get(cache_count_key)

     # If game_count is greater then 100 the game_count gets cached
    # to speed up search times
    if cached_count is not None:
        post_count = cached_count
    else:
        post_count = posts.count()
        if post_count > 100:
            cache.set(cache_count_key, post_count, timeout=CACHE_TIMEOUT)
        

    p = Paginator(posts, perPage)
    p.count = post_count

    forum_page = p.get_page(page)
    pages = p.num_pages

    serialized_posts = PostSerializerWithGame(forum_page, many=True, context={'user': user}).data
    
    # Prepare the result to cache
    result = {
        'forum_page': serialized_posts,
        'pages': pages
    }

    # Cache the result for future queries if results contain at least 20 games
    if (post_count >= 20):
        cache.set(cache_key, result, timeout=CACHE_TIMEOUT)

    return result['forum_page'], result['pages']

def getPostSuggestions(search_word):
    """
    Retrieves a list of Forumposts suggestions based on a search keyword.

    The function uses a predefined threshold to find posts that closely match
    the provided search word.

    Parameters:
        search_word (str): The keyword used to find similar post titles.

    Returns:
        QuerySet: A list of max 5 posts sorted by there rank or similarity.
    """
    search_threshold = 0.2

    # Search using postgres full text search if it returns results
    # else it uses a trigram similiarity search instead
    if search_word:
        search_query = SearchQuery(search_word)

        # Try full-text search first
        fulltext_results = ForumPost.objects.annotate(
            rank=SearchRank('search_vector', search_query)
        ).filter(
            search_vector=search_query
        ).order_by('-rank')[:5]

        if fulltext_results.exists():
            return fulltext_results
        else:
            # Fallback to TrigramSimilarity
            trigram_results = ForumPost.objects.annotate(
                similarity=TrigramSimilarity('title', search_word)
            ).filter(
                similarity__gt=search_threshold
            ).order_by('-similarity')[:5]

            return trigram_results
    else:
        return []