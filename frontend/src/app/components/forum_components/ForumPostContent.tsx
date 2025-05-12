"use client";
import React from "react";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";

type Props = {
  children: React.ReactNode;
};

/**
 * ForumPostContent Component
 *
 * This component serves as a styled container for displaying the main content
 * of a single forum post. It wraps its children with a div and applies
 * dynamic styling based on the current UI theme.
 *
 */
const ForumPostContent = ({ children }: Props) => {
  const { theme } = useTheme();
  return (
    <div
      className={`${styles.view_post_main_container} ${
        theme === "dark"
          ? styles.view_post_main_container_dark
          : styles.view_post_main_container_light
      }`}
    >
      {children}
    </div>
  );
};

export default ForumPostContent;
