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
import { Game } from "@/app/types";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  genreList: Array<{ name: string }>;
};

type GenreObj = {
  name: string;
};

const SearchBar = ({ genreList }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const sort = searchParams.get("s");
  const genre = searchParams.get("g");

  const genres: GenreObj[] = [{ name: "All" }, ...genreList];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "name", label: "Name" },
    { value: "release(asc)", label: "Release(Asc)" },
    { value: "release(desc)", label: "Release(Desc)" },
    { value: "rating", label: "Rating" },
  ];

  const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
  const [gettingSuggestions, setGettingSuggestions] = useState(false);

  // Makes sure that the sort and genre variables are not null and are in
  // the list of options
  const isValidSort = sortOptions.some((option) => option.value === sort);
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

  useEffect(() => {
    setCurrentSearch(search ? search.replace(/\-/g, " ") : "");
    setCurrentSortOption(isValidSort ? sort : "relevance");
    setCurrentGenre(isValidGenre ? genre : "All");
    setNewSort(isValidSort ? sort : "relevance");
    setNewGenre(isValidGenre ? genre : "All");
  }, [search, genre, sort]);

  useEffect(() => {
    if (newSort !== currentSortOption || newGenre !== currentGenre) {
      updateSearchParams();
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
    setSearchSuggestions([]);
  }, [searchParams]);

  const toggleFilterPopup = (opt?: boolean) => {
    if (opt !== undefined) {
      setShowFilterPopup(opt);
    } else {
      setShowFilterPopup((prev) => !prev);
    }
  };

  const fetchSuggestions = async (search_word: string) => {
    if (search_word.length < 3) {
      setSearchSuggestions([]);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());

    params.set("q", search_word.trim().replace(/\s+/g, "-"));
    try {
      const response = await fetch(
        `/api/games/gameSuggestions?${params.toString()}`,
        {
          method: "GET",
          cache: "no-cache",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        response.json().then((data) => {
          setSearchSuggestions(data.data);
          setGettingSuggestions(false);
        });
      } else if (response.status === 404) {
        setSearchSuggestions([]);
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

  const updateSearchParams = () => {
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
      updateSearchParams();
    }
  };

  return (
    <Grid container id={"search_bar_container"}>
      <Grid id={"search_bar_input_box"}>
        <Grid id="search_input_box">
          <TextField
            placeholder="Search for games..."
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
            {gettingSuggestions ? (
              <span style={{ padding: "10px 0px", width: "100%" }}>
                <LoadingSpinner spinnerSize={40} />
              </span>
            ) : searchSuggestions ? (
              searchSuggestions.map((suggestion) => (
                <Link
                  href={`/games/${suggestion.slug}/`}
                  key={suggestion.game_id}
                >
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
          </Grid>
        </Grid>
        <Grid id={"search_bar_search_btn"}>
          <IconButton
            onClick={() => {
              updateSearchParams();
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
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
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
          sortOptions={sortOptions}
          genres={genres}
          toggleFilterPopup={toggleFilterPopup}
          currentSort={currentSortOption}
          currentGenre={currentGenre}
          updateSort={updateSort}
          updateGenre={updateGenre}
        />
      ) : null}
    </Grid>
  );
};

export default SearchBar;
