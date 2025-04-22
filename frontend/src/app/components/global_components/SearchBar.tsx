"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
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

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const sort = searchParams.get("s");
  const genre = searchParams.get("g");
  const page = searchParams.get("page");
  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "release(asc)", label: "Release(Asc)" },
    { value: "release(desc)", label: "Release(Desc)" },
  ];

  const genres = [
    { value: "all", label: "All" },
    { value: "adventure", label: "Adventure" },
    { value: "puzzle", label: "puzzle" },
    { value: "shooter", label: "Shooter" },
  ];

  // Makes sure that the sort and genre variables are not null and are in
  // the list of options
  const isValidSort = sortOptions.some((option) => option.value === sort);
  const isValidGenre = genres.some((option) => option.value === genre);

  const [currentSearch, setCurrentSearch] = useState(
    search ? search.replace(/\-/g, " ") : ""
  );

  const [currentSortOption, setCurrentSortOption] = useState<string | null>(
    isValidSort ? sort! : "release(desc)"
  );
  const [newSort, setNewSort] = useState(currentSortOption);

  const [currentGenre, setCurrentGenre] = useState(
    isValidGenre ? genre : "all"
  );

  const [newGenre, setNewGenre] = useState(currentGenre);

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  useEffect(() => {
    setCurrentSearch(search ? search.replace(/\-/g, " ") : "");
    setCurrentSortOption(isValidSort ? sort : "release(desc)");
    setCurrentGenre(isValidGenre ? genre : "all");
    setNewSort(isValidSort ? sort : "release(desc)");
    setNewGenre(isValidGenre ? genre : "all");
  }, [search, genre, sort]);

  useEffect(() => {
    if (newSort !== currentSortOption || newGenre !== currentGenre) {
      updateSearchParams();
    }
  }, [newGenre, newSort]);

  const toggleFilterPopup = (opt?: boolean) => {
    if (opt !== undefined) {
      setShowFilterPopup(opt);
    } else {
      setShowFilterPopup((prev) => !prev);
    }
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSearch) {
      params.set("q", currentSearch.trim().replace(/\s+/g, "-"));
    }

    if (newSort && newSort !== currentSortOption) {
      params.set("s", newSort);
    }

    if (newGenre && newGenre !== currentGenre) {
      params.set("g", newGenre);
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Grid container id={"search_bar_container"}>
      <Grid id={"search_bar_input_box"}>
        <TextField
          placeholder="Search for games..."
          fullWidth
          onChange={handleSearchChange}
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
              <MenuItem key={genreOpt.value} value={genreOpt.value}>
                {genreOpt.label}
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
          search={updateSearchParams}
          updateSort={updateSort}
          updateGenre={updateGenre}
        />
      ) : null}
    </Grid>
  );
};

export default SearchBar;
