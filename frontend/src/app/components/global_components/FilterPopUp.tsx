import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
} from "@mui/material";

type Props = {
  sortOptions?: Array<{ value: string; label: string }>;
  genres?: Array<{ name: string }>;
  toggleFilterPopup: (opt?: boolean) => void;
  currentSort?: string | null;
  currentGenre?: string | null;
  updateSort?: (newSort: string) => void;
  updateGenre?: (newGenre: string) => void;
};

/**
 * FilterPopUp component displays a popup box allowing users to filter and sort game listings.
 *
 * - Users can filter games by genre and sort them based on provided options (e.g., rating, date).
 * - The popup can be toggled open or closed using `toggleFilterPopup`.
 * - `currentSort` and `currentGenre` determine the currently selected filter/sort state.
 * - `updateSort` and `updateGenre` are callbacks that update the parent component’s state.
 *
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered filter popup component.
 */
const FilterPopUp = ({
  sortOptions,
  genres,
  toggleFilterPopup,
  currentSort,
  currentGenre,
  updateSort,
  updateGenre,
}: Props) => {
  const [openSection, setOpenSection] = useState<null | string>(
    sortOptions ? "sort" : "searchBy"
  );

  const toggleSection = (section: string) => {
    if (section === openSection) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <Grid id="filter_popup_container">
      {sortOptions && updateSort ? (
        <Grid id="filter_popup_sort_container">
          <Accordion
            square
            expanded={openSection === "sort"}
            onChange={() => toggleSection("sort")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{ backgroundColor: "var(--gray)", color: "white" }}
            >
              <Typography>Sort By</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {sortOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={option.value === currentSort}
                      onChange={() => {
                        updateSort(option.value);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>
      ) : null}
      {genres && updateGenre ? (
        <Grid id="filter_popup_genre_container">
          <Accordion
            square
            sx={{ maxHeight: "300px", overflowY: "scroll" }}
            expanded={openSection === "genre"}
            onChange={() => toggleSection("genre")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{ backgroundColor: "var(--gray)", color: "white" }}
            >
              <Typography>Genres</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {genres.map((option) => (
                <FormControlLabel
                  key={option.name}
                  control={
                    <Checkbox
                      checked={option.name === currentGenre}
                      onChange={() => {
                        updateGenre(option.name);
                      }}
                    />
                  }
                  label={option.name}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>
      ) : null}

      <Grid id="filter_popup_btns">
        <Button
          onClick={() => {
            toggleFilterPopup(false);
          }}
        >
          Close
        </Button>
      </Grid>
    </Grid>
  );
};

export default FilterPopUp;
