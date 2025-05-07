"use client";
import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSearchParams, usePathname } from "next/navigation";
import FilterPopUp from "./FilterPopUp";
import TuneIcon from "@mui/icons-material/Tune";
import { useRouter } from "next/navigation";
import { ForumPost, GameSuggestion } from "@/app/types";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  genreList?: Array<{ name: string }>;
  searchType: "game" | "forum";
};

type GenreObj = {
  name: string;
};

/**
 * SearchBar component allows users to search for games by title,
 * filter them by genre, and sort the results.
 *
 * It updates the URL with query parameters based on the search input,
 * selected genre, and sort option—useful for integrating with routing or
 * fetching filtered/sorted data from the backend.
 *
 */
const SearchBar = ({ genreList, searchType }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const sort = searchParams.get("s");
  const genre = searchParams.get("g");
  const display = searchParams.get("posts");
  let forumSearchType = "";

  if (!display) {
  } else if (
    display === "general" ||
    display === "liked" ||
    display === "game"
  ) {
    forumSearchType = display + " posts";
  } else if (display === "myposts") {
    forumSearchType = "my posts";
  }

  const genres: GenreObj[] = [{ name: "All" }, ...(genreList || [])];
  const gameSortOptions =
    searchType === "game"
      ? [
          { value: "relevance", label: "Relevance" },
          { value: "name", label: "Name" },
          { value: "release(asc)", label: "Release(Asc)" },
          { value: "release(desc)", label: "Release(Desc)" },
          { value: "rating", label: "Rating" },
        ]
      : [
          { value: "relevance", label: "Relevance" },
          { value: "title", label: "Title" },
          { value: "likes", label: "Likes" },
          { value: "created(asc)", label: "Created(Asc)" },
          { value: "created(desc)", label: "Created(Desc)" },
        ];

  const [gameSearchSuggestions, setGameSearchSuggestions] = useState<
    GameSuggestion[]
  >([]);
  const [postSearchSuggestions, setPostSearchSuggestions] = useState<
    ForumPost[]
  >([]);
  const [gettingSuggestions, setGettingSuggestions] = useState(false);

  // Makes sure that the sort and genre variables are not null and are in
  // the list of options
  const isValidSort = gameSortOptions.some((option) => option.value === sort);
  const isValidGenre = genres.some((option) => option.name === genre);

  const [currentSearch, setCurrentSearch] = useState(
    search ? search.replace(/\-/g, " ") : ""
  );

  const [currentSortOption, setCurrentSortOption] = useState<string | null>(
    isValidSort ? sort! : "relevance"
  );
  const [newSort, setNewSort] = useState(currentSortOption);

  const [currentGenre, setCurrentGenre] = useState(
    isValidGenre ? genre : "All"
  );

  const [newGenre, setNewGenre] = useState(currentGenre);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Sets the useState variables to the search params
  useEffect(() => {
    setCurrentSearch(search ? search.replace(/\-/g, " ") : "");
    setCurrentSortOption(isValidSort ? sort : "relevance");
    setCurrentGenre(isValidGenre ? genre : "All");
    setNewSort(isValidSort ? sort : "relevance");
    setNewGenre(isValidGenre ? genre : "All");
  }, [search, genre, sort]);

  // Automatically sets genre or sort in the url when one of the options is changed
  useEffect(() => {
    if (newSort !== currentSortOption || newGenre !== currentGenre) {
      updateGameSearchParams();
    }
  }, [newGenre, newSort]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  useEffect(() => {
    setGameSearchSuggestions([]);
    setPostSearchSuggestions([]);
  }, [searchParams]);

  const toggleFilterPopup = (opt?: boolean) => {
    if (opt !== undefined) {
      setShowFilterPopup(opt);
    } else {
      setShowFilterPopup((prev) => !prev);
    }
  };

  // Fetches a list of 5 suggestions for the user while they are typing in their search
  const fetchSuggestions = async (search_word: string) => {
    if (search_word.length < 3) {
      setGameSearchSuggestions([]);
      setPostSearchSuggestions([]);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());

    params.set("q", search_word.trim().replace(/\s+/g, "-"));
    const url =
      searchType === "game"
        ? "/api/games/gameSuggestions"
        : "/api/forum/get-suggestions/";
    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        cache: "no-cache",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        response.json().then((data) => {
          if (searchType === "game") {
            setGameSearchSuggestions(data.data);
          } else {
            setPostSearchSuggestions(data.data);
          }

          setGettingSuggestions(false);
        });
      } else if (response.status === 404) {
        setPostSearchSuggestions([]);
        setGameSearchSuggestions([]);
        setGettingSuggestions(false);
        return;
      } else {
        setGettingSuggestions(false);
        return;
      }
    } catch (error) {
      setGettingSuggestions(false);
      console.error("Fetch error:", error);
      return;
    }
  };

  // Updates the search params with the useState variables
  const updateGameSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("q", currentSearch.trim().replace(/\s+/g, "-"));

    if (newSort && newSort !== currentSortOption) {
      params.set("s", newSort);
    }

    if (newGenre && newGenre !== currentGenre) {
      params.set("g", newGenre);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 2) {
      setGettingSuggestions(true);
    }
    if (timeoutId.current) clearTimeout(timeoutId.current);

    timeoutId.current = setTimeout(() => {
      fetchSuggestions(e.target.value);
    }, 500);
    setCurrentSearch(e.target.value);
  };

  const handleSortChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSort(e.target.value);
  };

  const handleGenreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewGenre(e.target.value);
  };

  const updateSort = (newSort: string) => {
    setNewSort(newSort);
  };

  const updateGenre = (newGenre: string) => {
    setNewGenre(newGenre);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateGameSearchParams();
    }
  };

  return (
    <Grid container id={"search_bar_container"}>
      <Grid id={"search_bar_input_box"}>
        <Grid id="search_input_box">
          <TextField
            placeholder={
              searchType === "game"
                ? "Search for games..."
                : `Search for ${
                    forumSearchType ? forumSearchType : "forum posts"
                  }...`
            }
            fullWidth
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            value={currentSearch}
            slotProps={{
              input: {
                className: "search_bar_input",
              },
              root: {
                className: "search_bar_input_root",
              },
            }}
          />
          <Grid>
            {gettingSuggestions && searchType === "game" ? (
              <span style={{ padding: "10px 0px", width: "100%" }}>
                <LoadingSpinner spinnerSize={40} />
              </span>
            ) : gameSearchSuggestions && searchType === "game" ? (
              gameSearchSuggestions.map((suggestion) => (
                <Link href={`/games/${suggestion.slug}/`} key={suggestion.id}>
                  <Image
                    src={
                      suggestion.cover_image
                        ? "https://" + suggestion.cover_image
                        : "/images/no_image_found.webp"
                    }
                    alt={`${suggestion.title} cover`}
                    height={45}
                    width={30}
                  />
                  <Typography component={"p"}>{suggestion.title}</Typography>
                </Link>
              ))
            ) : null}
            {gettingSuggestions && searchType === "forum" ? (
              <span style={{ padding: "10px 0px", width: "100%" }}>
                <LoadingSpinner spinnerSize={40} />
              </span>
            ) : postSearchSuggestions && searchType === "forum" ? (
              postSearchSuggestions.map((suggestion) => (
                <Link
                  href={`/forum/post/${suggestion.slug}/`}
                  key={suggestion.id}
                >
                  <Typography component={"p"} sx={{ paddingLeft: "10px" }}>
                    {suggestion.title}
                  </Typography>
                </Link>
              ))
            ) : null}
          </Grid>
        </Grid>
        <Grid id={"search_bar_search_btn"}>
          <IconButton
            onClick={() => {
              updateGameSearchParams();
            }}
          >
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid id={"search_bar_filters"}>
        <Grid>
          <Typography component={"p"}>Sort By:</Typography>
          <TextField
            select
            value={currentSortOption}
            onChange={handleSortChange}
            slotProps={{
              input: {
                className: "search_bar_select",
              },
              root: {
                className: "search_bar_input_root",
              },
            }}
          >
            {gameSortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {searchType === "game" ? (
          <Grid>
            <Typography component={"p"}>Genre:</Typography>
            <TextField
              select
              value={currentGenre}
              onChange={handleGenreChange}
              slotProps={{
                input: {
                  className: "search_bar_select",
                },
                root: {
                  className: "search_bar_input_root",
                },
              }}
            >
              {genres.map((genreOpt) => (
                <MenuItem key={genreOpt.name} value={genreOpt.name}>
                  {genreOpt.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}
      </Grid>
      <Button
        id="filter_popup_btn"
        onClick={() => {
          toggleFilterPopup();
        }}
      >
        <TuneIcon />
        <Typography component={"p"}>Filters</Typography>
      </Button>
      {showFilterPopup ? (
        <FilterPopUp
          sortOptions={gameSortOptions}
          genres={searchType === "game" ? genres : undefined}
          toggleFilterPopup={toggleFilterPopup}
          currentSort={currentSortOption}
          currentGenre={searchType === "game" ? currentGenre : undefined}
          updateSort={updateSort}
          updateGenre={searchType === "game" ? updateGenre : undefined}
        />
      ) : null}
    </Grid>
  );
};

export default SearchBar;
