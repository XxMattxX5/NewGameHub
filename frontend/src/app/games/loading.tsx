import React from "react";
import { Grid, CircularProgress } from "@mui/material";
import Head from "next/head";

export default function Loading() {
  return (
    <Grid container id="loading_container">
      <Head>
        <title>Game Hub - Loading...</title>
      </Head>
      <CircularProgress size={"100px"} />
    </Grid>
  );
}
