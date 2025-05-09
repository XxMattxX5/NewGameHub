import React from "react";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Unauthorized",
};

const page = () => {
  return (
    <Grid id={styles.unauthorized_container}>
      <Grid>
        <Typography component={"h1"}>Unauthorized</Typography>
        <Typography component={"p"}>
          This user has chosen to keep their profile private.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default page;
