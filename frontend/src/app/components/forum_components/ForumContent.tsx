"use client";
import React from "react";
import { Grid } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { ForumPost } from "@/app/types";
import dynamic from "next/dynamic";
import { useTheme } from "../global_components/ThemeProvider";

type Props = {
  children: React.ReactNode;
};

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
