"use client";
import React from "react";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/home.module.css";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

import ExploreIcon from "@mui/icons-material/Explore";
import CreateIcon from "@mui/icons-material/Create";
import CommentIcon from "@mui/icons-material/Comment";

const HomeForumSection = () => {
  const { theme } = useTheme();
  return (
    <Grid className={styles.home_forum_container}>
      <Typography component={"h2"}>Join The Game Hub Community</Typography>
      <Typography component={"p"}>
        Join the Game Hub community — a vibrant space where gamers and creators
        come together to share their passion! Whether you're posting about your
        favorite games, sharing general thoughts, or joining conversations by
        commenting on others' posts, there's always something exciting
        happening. Game Hub is the perfect place to connect, express yourself,
        and be part of a growing community that lives and breathes games.
      </Typography>
      <Grid
        className={styles.home_page_forum_section_content}
        sx={{ color: theme === "dark" ? "white" : "var(--fontBlack)" }}
      >
        <Grid>
          <Grid
            className={styles.home_page_forum_box}
            sx={{
              backgroundColor: theme === "dark" ? "var(--lightGray)" : "white",
            }}
          >
            <Grid>
              <ExploreIcon />
              <Typography component={"h3"}>Explore</Typography>
            </Grid>
            <Typography component={"p"}>
              Explore a variety of posts and find something that sparks your
              interest.
            </Typography>
            <Link href="/forum">
              <Typography component={"p"}>Explore Posts</Typography>
            </Link>
          </Grid>
        </Grid>
        <Grid>
          <Grid
            className={styles.home_page_forum_box}
            sx={{
              backgroundColor: theme === "dark" ? "var(--lightGray)" : "white",
            }}
          >
            <Grid>
              <CreateIcon />
              <Typography component={"h3"}>Create a Post</Typography>
            </Grid>
            <Typography component={"p"}>
              Connect with others who share your passion and chat about the
              games you love.
            </Typography>
            <Link href="/forum/post/create-post">
              <Typography component={"p"}>Create Post</Typography>
            </Link>
          </Grid>
        </Grid>
        <Grid>
          <Grid
            className={styles.home_page_forum_box}
            sx={{
              backgroundColor: theme === "dark" ? "var(--lightGray)" : "white",
            }}
          >
            <Grid>
              <CommentIcon />
              <Typography component={"h3"}>Comment</Typography>
            </Grid>
            <Typography component={"p"}>
              Found a cool post? Join the conversation and share your thoughts.
            </Typography>
            <Link href="/forum">
              <Typography component={"p"}>Start Chatting</Typography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomeForumSection;
