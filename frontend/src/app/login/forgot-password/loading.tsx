import React from "react";
import { Grid, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Grid container id="loading_container">
      <CircularProgress size={"100px"} />
    </Grid>
  );
}
