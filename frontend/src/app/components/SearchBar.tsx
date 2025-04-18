import React from "react";
import { Grid, Typography, TextField } from "@mui/material";
import styles from "../styles/games.module.css";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  return (
    <Grid container id={styles.search_bar_container}>
      <Grid id={styles.search_bar_input_box}>
        <TextField
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.75rem",
              height: "30px",
            },
            "& .MuiInputBase-input": {
              padding: "6px 8px",
            },
          }}
        />
      </Grid>
      <Grid id={styles.search_bar_search_btn}>
        <SearchIcon />
      </Grid>
    </Grid>
  );
}
