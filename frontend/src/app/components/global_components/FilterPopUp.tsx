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
  sortOptions: Array<{ value: string; label: string }>;
  genres: Array<{ value: string; label: string }>;
  toggleFilterPopup: (opt?: boolean) => void;
  currentSort: string | null;
  currentGenre: string | null;
  search: () => void;
  updateSort: (newSort: string) => void;
  updateGenre: (newGenre: string) => void;
};

const FilterPopUp = ({
  sortOptions,
  genres,
  toggleFilterPopup,
  currentSort,
  currentGenre,
  search,
  updateSort,
  updateGenre,
}: Props) => {
  const [openSection, setOpenSection] = useState<null | string>("sort");

  const toggleSection = (section: string) => {
    if (section === openSection) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <Grid id="filter_popup_container">
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
      <Grid id="filter_popup_genre_container">
        <Accordion
          square
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
                key={option.value}
                control={
                  <Checkbox
                    checked={option.value === currentGenre}
                    onChange={() => {
                      updateGenre(option.value);
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </AccordionDetails>
        </Accordion>
        <Grid id="filter_popup_btns">
          {/* <Button
            onClick={() => {
              search();
              toggleFilterPopup();
            }}
          >
            Filter
          </Button> */}
          <Button
            onClick={() => {
              toggleFilterPopup(false);
            }}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FilterPopUp;
