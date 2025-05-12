"use client";
import React, { useState, useEffect } from "react";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Grid, Button, Typography, Tooltip } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";
import { useAuth } from "@/app/hooks/useAuth";

type Props = {
  postId: string;
  like_count: number;
  dislike_count: number;
  reaction: string | null;
};

/**
 * LikeAndDislikeButtons Component
 *
 * This component allows users to like or dislike a post. It displays the current
 * counts for likes and dislikes, and manages the user's reaction state.
 *
 */
const LikeAndDislikeButtons = ({
  postId,
  like_count,
  dislike_count,
  reaction,
}: Props) => {
  const { theme } = useTheme();
  const { csrfToken } = useAuth();

  const handleClick = (e: React.MouseEvent, action: "like" | "dislike") => {
    e.preventDefault();
    e.stopPropagation();
    reactToPost(action);
  };

  const [postReaction, setPostReaction] = useState(reaction);
  const [likeCount, setLikeCount] = useState(like_count);
  const [dislikeCount, setDislikeCount] = useState(dislike_count);

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });

  useEffect(() => {
    setPostReaction(reaction);
    setLikeCount(like_count);
    setDislikeCount(dislike_count);
  }, [reaction, like_count, dislike_count]);

  // Sends reaction to backend to be stored then changes the like and dislike count
  // on frontend based on user action
  const reactToPost = (action: "like" | "dislike") => {
    const url =
      action === "like"
        ? `/api/forum/post/like/${postId}/`
        : `/api/forum/post/dislike/${postId}/`;

    const headers = {
      "X-CSRFToken": csrfToken,
    };

    fetch(url, {
      headers: headers,
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          if (action === postReaction) {
            if (postReaction === "like") {
              setLikeCount((prev) => prev - 1);
            } else {
              setDislikeCount((prev) => prev - 1);
            }
            setPostReaction(null);
          } else if (postReaction && action !== postReaction) {
            if (postReaction === "like") {
              setDislikeCount((prev) => prev + 1);
              setLikeCount((prev) => prev - 1);
            } else {
              setLikeCount((prev) => prev + 1);
              setDislikeCount((prev) => prev - 1);
            }
            setPostReaction(action);
          } else {
            if (action === "like") {
              setLikeCount((prev) => prev + 1);
            } else {
              setDislikeCount((prev) => prev + 1);
            }

            setPostReaction(action);
          }
          return;
        } else if (res.status === 403) {
          alert("Must be logged in to like or dislike post");
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          alert(data.error);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };

  return (
    <Grid
      className={styles.like_dislike_container}
      sx={{
        backgroundColor:
          theme === "dark" ? "rgb(39, 42, 48, 0.5)" : "rgba(39, 42, 48, 0.09)",
      }}
    >
      <Tooltip title="Like Post">
        <Button
          onClick={(e) => {
            handleClick(e, "like");
          }}
          sx={{
            "&:hover": {
              backgroundColor:
                theme === "dark"
                  ? "rgb(39, 42, 48, 0.8)"
                  : "rgba(39, 42, 48, 0.2)",
            },
          }}
        >
          {postReaction === "like" ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          <Typography component={"span"} variant="button">
            {formatter.format(likeCount)}
          </Typography>
        </Button>
      </Tooltip>

      <Tooltip title="Dislike Post">
        <Button
          onClick={(e) => {
            handleClick(e, "dislike");
          }}
          sx={{
            "&:hover": {
              backgroundColor:
                theme === "dark"
                  ? "rgb(39, 42, 48, 0.8)"
                  : "rgba(39, 42, 48, 0.2)",
            },
          }}
        >
          {postReaction === "dislike" ? (
            <ThumbDownAltIcon />
          ) : (
            <ThumbDownOffAltIcon />
          )}
          <Typography component={"span"} variant="button">
            {formatter.format(dislikeCount)}
          </Typography>
        </Button>
      </Tooltip>
    </Grid>
  );
};

export default LikeAndDislikeButtons;
