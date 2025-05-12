"use client";
import React from "react";
import { Grid } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";

type Props = {
  children: React.ReactNode;
};

/**
 * ForumContent Component
 *
 * A layout wrapper for forum-related content that adjusts styling based on the current theme.
 * It uses a MUI Grid component along with custom CSS modules to apply consistent styling
 * for light and dark modes.
 *
 * Styling:
 * - `forum_content_box`: Base styles for the content box.
 * - `forum_content_box_dark`: Dark theme-specific styles.
 * - `forum_content_box_light`: Light theme-specific styles.
 */
const ForumContent = ({ children }: Props) => {
  const { theme } = useTheme();

  return (
    <Grid
      className={`${styles.forum_content_box} ${
        theme === "dark"
          ? styles.forum_content_box_dark
          : styles.forum_content_box_light
      }`}
    >
      {children}
    </Grid>
  );
};

export default ForumContent;
