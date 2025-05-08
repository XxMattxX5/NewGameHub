import React from "react";
import { Grid, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import Link from "next/link";
import styles from "@/app/styles/forum.module.css";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

type Props = {
  display?: string | null;
  theme: string | null;
  isAuthenticated: boolean;
  path: string;
};

const ForumNav = ({ display, theme, isAuthenticated, path }: Props) => {
  return (
    <Grid>
      <Link
        href="/forum"
        className={styles.forum_side_bar_link_box}
        style={{
          backgroundColor:
            !display && path === "/forum" ? "var(--purple)" : undefined,
        }}
      >
        <HomeIcon
          sx={{
            color: !display && path === "/forum" ? "white" : "var(--purple)",
          }}
        />
        <Typography
          component={"p"}
          sx={{
            color:
              !display && path === "/forum"
                ? "white"
                : theme === "dark"
                ? "white"
                : "black",
          }}
        >
          Home
        </Typography>
      </Link>
      <Link
        href="/forum?posts=general"
        className={styles.forum_side_bar_link_box}
        style={{
          backgroundColor: display === "general" ? "var(--purple)" : undefined,
        }}
      >
        <NotesIcon
          sx={{ color: display === "general" ? "white" : "var(--purple)" }}
        />
        <Typography
          component={"p"}
          sx={{
            color:
              display === "general"
                ? "white"
                : theme === "dark"
                ? "white"
                : "black",
          }}
        >
          General Posts
        </Typography>
      </Link>
      <Link
        href="/forum?posts=game"
        className={styles.forum_side_bar_link_box}
        style={{
          backgroundColor: display === "game" ? "var(--purple)" : undefined,
        }}
      >
        <SportsEsportsIcon
          sx={{ color: display === "game" ? "white" : "var(--purple)" }}
        />
        <Typography
          component={"p"}
          sx={{
            color:
              display === "game"
                ? "white"
                : theme === "dark"
                ? "white"
                : "black",
          }}
        >
          Game Posts
        </Typography>
      </Link>
      {isAuthenticated ? (
        <Link
          href="/forum?posts=liked"
          className={styles.forum_side_bar_link_box}
          style={{
            backgroundColor: display === "liked" ? "var(--purple)" : undefined,
          }}
        >
          <ThumbUpAltIcon
            sx={{ color: display === "liked" ? "white" : "var(--purple)" }}
          />
          <Typography
            component={"p"}
            sx={{
              color:
                display === "liked"
                  ? "white"
                  : theme === "dark"
                  ? "white"
                  : "black",
            }}
          >
            Liked Posts
          </Typography>
        </Link>
      ) : null}
      {isAuthenticated ? (
        <Link
          href="/forum?posts=myposts"
          className={styles.forum_side_bar_link_box}
          style={{
            backgroundColor:
              display === "myposts" ? "var(--purple)" : undefined,
          }}
        >
          <PersonIcon
            sx={{ color: display === "myposts" ? "white" : "var(--purple)" }}
          />
          <Typography
            component={"p"}
            sx={{
              color:
                display === "myposts"
                  ? "white"
                  : theme === "dark"
                  ? "white"
                  : "black",
            }}
          >
            My Posts
          </Typography>
        </Link>
      ) : null}
    </Grid>
  );
};

export default ForumNav;
