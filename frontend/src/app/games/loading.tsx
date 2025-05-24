import React from "react";
import { Grid, Typography } from "@mui/material";
import { Metadata } from "next";
import styles from "@/app/styles/games.module.css";

export const metadata: Metadata = {
  title: "Game Hub - Loading...",
};

export default function Loading() {
  return (
    <Grid container id={styles.games_loading_container}>
      <Typography component={"p"} id={styles.games_loading_h1}></Typography>
      <Grid id={styles.games_loading_content}>
        <Grid id={styles.games_loading_top_rated}>
          <Typography component={"p"}></Typography>
          <Grid>
            <Grid></Grid>
            <Grid></Grid>
            <Grid></Grid>
            <Grid></Grid>
            <Grid></Grid>
            <Grid></Grid>
          </Grid>
        </Grid>
        <Grid id={styles.games_loading_games}>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>
              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>
              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>

              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>

              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>
              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>

              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>

              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid className={styles.games_loading_info}>
              <Grid className={styles.games_loading_info_rating}>
                <Typography component={"p"}></Typography>
              </Grid>

              <Grid className={styles.games_loading_info_title}>
                <Typography component={"p"}></Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
