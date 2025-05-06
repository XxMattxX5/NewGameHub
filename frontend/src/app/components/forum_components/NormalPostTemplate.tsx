import React from "react";
import { Grid, Typography, Tooltip } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { ForumPost } from "@/app/types";
import Link from "next/link";

import CommentIcon from "@mui/icons-material/Comment";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { formatDistanceToNow } from "date-fns";
import FallbackProfileImage from "./FallbackProfileImage";
import LikeAndDislikeButtons from "./LikeAndDislikeButtons";
import ForumGamePopUp from "./ForumGamePopUp";

type Props = {
  forumPost: ForumPost;
};

const NormalPostTemplate = async ({ forumPost }: Props) => {
  const parsedDate = new Date(forumPost.created_at);
  const timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true });
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });

  return (
    <span className={styles.normal_post_parent}>
      <Link
        href={`/forum/post/${forumPost.slug}`}
        className={styles.normal_post_container}
      >
        <Grid className={styles.normal_post_header}>
          <FallbackProfileImage
            className={styles.normal_post_profile_picture}
            src={"/api" + forumPost.user.profile_picture}
            alt={`${forumPost.user.username}'s profile picture`}
            width={25}
            height={25}
          />

          <Typography className={styles.normal_post_username} component={"p"}>
            {forumPost.user.username}
          </Typography>
          {"|"}
          {forumPost.game ? <ForumGamePopUp game={forumPost.game} /> : null}

          <Typography component={"p"} className={styles.normal_post_time_ago}>
            {timeAgo}
          </Typography>
        </Grid>
        <Typography component={"h2"} className={styles.normal_post_title}>
          {forumPost.title}
        </Typography>
        <Grid
          className={styles.normal_post_content}
          sx={{ justifyContent: forumPost.header_image ? "center" : "left" }}
        >
          {forumPost.header_image ? (
            <Grid className={styles.normal_post_image_wrapper}>
              <Grid className={styles.image_blur_wrapper}>
                <img
                  src={"/api" + forumPost.header_image}
                  alt={`${forumPost.title}-blurred`}
                  className={styles.blurred_background_image}
                  aria-hidden="true"
                />
                <img
                  src={"/api" + forumPost.header_image}
                  alt={`${forumPost.title}-image`}
                  className={styles.normal_post_image}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography
              component={"p"}
              dangerouslySetInnerHTML={{ __html: forumPost.content }}
            ></Typography>
          )}
        </Grid>
        <Grid className={styles.normal_post_bottom_bar}>
          <LikeAndDislikeButtons
            postId={forumPost.id}
            like_count={forumPost.like_count}
            dislike_count={forumPost.dislike_count}
            reaction={forumPost.user_reaction}
          />
          <Tooltip title="User Comments">
            <Grid className={styles.normal_post_comment_count}>
              <CommentIcon />
              <Typography component={"p"}>
                {formatter.format(forumPost.comment_count)}
              </Typography>
            </Grid>
          </Tooltip>
          <Tooltip title="Views">
            <Grid className={styles.normal_post_view_count}>
              <RemoveRedEyeIcon />
              <Typography component={"p"}>
                {formatter.format(forumPost.views)}
              </Typography>
            </Grid>
          </Tooltip>
        </Grid>
      </Link>
    </span>
  );
};

export default NormalPostTemplate;
