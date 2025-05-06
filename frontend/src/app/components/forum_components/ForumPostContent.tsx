"use client";
import React from "react";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";

type Props = {
  children: React.ReactNode;
};

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
