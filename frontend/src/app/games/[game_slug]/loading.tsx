import React from "react";
import { Grid, CircularProgress } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Loading...",
};

export default function Loading() {
  return (
    <Grid container id="loading_container">
      <CircularProgress size={"100px"} />
    </Grid>
  );
}
