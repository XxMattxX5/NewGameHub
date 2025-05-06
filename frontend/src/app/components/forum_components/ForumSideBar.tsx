"use client";
import React, { useEffect, useState } from "react";
import { Grid, IconButton, Typography } from "@mui/material";
import Link from "next/link";
import styles from "@/app/styles/forum.module.css";
import { useSearchParams, usePathname } from "next/navigation";
import { RecentlyViewedPost } from "@/app/types";
import FallbackProfileImage from "./FallbackProfileImage";
import { useTheme } from "../global_components/ThemeProvider";
import dynamic from "next/dynamic";
import { useAuth } from "@/app/hooks/useAuth";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const ForumNav = dynamic(() => import("../forum_components/ForumNav"), {
  ssr: true,
});

const ForumSideBar = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const display = searchParams.get("posts");

  const [showSideBar, setShowSideBar] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedPost[]>(
    []
  );

  const deleteViewedPost = (slug: string) => {
    const newList = recentlyViewed.filter((item) => item.slug !== slug);
    setRecentlyViewed(newList);
    localStorage.setItem("recent_viewed", JSON.stringify(newList));
  };

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const viewedPosts = localStorage.getItem("recent_viewed");
      setRecentlyViewed(viewedPosts ? JSON.parse(viewedPosts) : []);
    }
  }, []);

  useEffect(() => {
    setShowSideBar(false);
  }, [searchParams]);

  return (
    <Grid
      id={styles.forum_side_bar_container}
      sx={{
        backgroundColor: theme === "dark" ? "var(--gray2)" : "#fcfcfc",
        left: showSideBar ? 0 : "-275px",
      }}
    >
      <Grid>
        <Grid id={styles.forum_side_bar_content}>
          <Grid
            className={styles.forum_side_bar_content_section}
            sx={{
              borderBottom:
                theme === "dark" ? "3px solid #2c2f34" : "3px solid #e0e0e0",
            }}
          >
            <ForumNav
              display={display}
              theme={theme}
              isAuthenticated={isAuthenticated}
              path={pathname}
            />
          </Grid>
          {recentlyViewed && recentlyViewed.length !== 0 ? (
            <Grid
              className={styles.forum_side_bar_content_section}
              sx={{
                borderBottom:
                  theme === "dark" ? "3px solid #2c2f34" : "3px solid #e0e0e0",
              }}
            >
              <Typography
                component={"h2"}
                sx={{ color: theme === "dark" ? "white" : "black" }}
              >
                Recently Viewed
              </Typography>
              {recentlyViewed.map((post) => (
                <Link
                  href={"/forum/post/" + post.slug}
                  key={post.slug}
                  className={styles.forum_recent_post_link}
                >
                  <FallbackProfileImage
                    src={"/api" + post.user_profile_picture}
                    alt="User profile picture"
                    width={30}
                    height={30}
                  />
                  <Typography
                    component={"p"}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: theme === "dark" ? "white" : "black",
                      paddingRight: "20px",
                    }}
                  >
                    {post.post_title}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteViewedPost(post.slug);
                    }}
                    className={styles.forum_recent_post_link_delete}
                    sx={{
                      color: theme === "dark" ? "white" : "var(--fontBlack)",
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Link>
              ))}
            </Grid>
          ) : null}
          {isAuthenticated ? (
            <Grid className={styles.forum_side_bar_content_section}>
              <Link
                href="/forum/post/create-post"
                id={styles.forum_create_post_link}
              >
                <AddIcon />
                <Typography component={"p"}>Create Post</Typography>
              </Link>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      <IconButton onClick={toggleSideBar} id={styles.forum_side_bar_toggle_btn}>
        {showSideBar ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
    </Grid>
  );
};

export default ForumSideBar;
