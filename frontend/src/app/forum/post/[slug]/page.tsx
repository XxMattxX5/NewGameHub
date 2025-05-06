import React from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ForumPost } from "@/app/types";
import RecentlyViewed from "@/app/components/forum_components/RecentlyViewed";
import ForumSideBar from "@/app/components/forum_components/ForumSideBar";
import { Grid, Typography, Tooltip } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { cookies } from "next/headers";
import FallbackProfileImage from "@/app/components/forum_components/FallbackProfileImage";
import ForumGamePopUp from "@/app/components/forum_components/ForumGamePopUp";
import { formatDistanceToNow } from "date-fns";
import LikeAndDislikeButtons from "@/app/components/forum_components/LikeAndDislikeButtons";
import CommentIcon from "@mui/icons-material/Comment";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ForumPostContent from "@/app/components/forum_components/ForumPostContent";
import DeleteButton from "@/app/components/forum_components/DeleteButton";
import EditButton from "@/app/components/forum_components/EditButton";

const getPost = async (slug: string) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost";

  return fetch(`${backendUrl}/api/forum/post/${slug}/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error("Failed to fetch forum post");
      }
    })
    .then((data) => {
      if (data) {
        return data.data;
      }
    })
    .catch((err) => {
      console.error(err);
      return;
    });
};

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const post: ForumPost = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });

  const parsedDate = new Date(post.created_at);
  const timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true });

  return (
    <>
      <RecentlyViewed
        slug={post.slug}
        user_profile_picture={post.user.profile_picture}
        post_title={post.title}
      />
      <ForumPostContent>
        <Grid id={styles.view_forum_post_container}>
          <ForumSideBar />
          <Grid id={styles.view_forum_post_content_container}>
            <Grid id={styles.view_forum_post_header}>
              <FallbackProfileImage
                src={"/api" + post.user.profile_picture}
                alt={`${post.user.username}'s profile picture`}
                width={30}
                height={30}
              />
              <Typography component={"p"} id={styles.view_post_username}>
                {post.user.username}
              </Typography>
              {"|"}
              {post.game ? <ForumGamePopUp game={post.game} /> : null}
              <Typography component={"p"} id={styles.view_post_time_ago}>
                {timeAgo}
              </Typography>
            </Grid>
            <Typography component={"h2"} id={styles.view_post_title}>
              {post.title}
            </Typography>
            <Grid id={styles.view_forum_post_content_box}>
              <Typography
                id={styles.view_forum_post_content_text}
                component={"p"}
                dangerouslySetInnerHTML={{ __html: post.content }}
              ></Typography>

              {post.header_image ? (
                <Grid className={styles.normal_post_image_wrapper}>
                  <Grid className={styles.image_blur_wrapper}>
                    <img
                      src={"/api" + post.header_image}
                      alt={`${post.title}-blurred`}
                      className={styles.blurred_background_image}
                      aria-hidden="true"
                    />
                    <img
                      src={"/api" + post.header_image}
                      alt={`${post.title}-image`}
                      className={styles.normal_post_image}
                    />
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
            <Grid id={styles.view_post_bottom_bar}>
              <LikeAndDislikeButtons
                postId={post.id}
                like_count={post.like_count}
                dislike_count={post.dislike_count}
                reaction={post.user_reaction}
              />
              <Tooltip title="User Comments">
                <Grid id={styles.view_post_comment_count}>
                  <CommentIcon />
                  <Typography component={"p"}>
                    {formatter.format(post.comment_count)}
                  </Typography>
                </Grid>
              </Tooltip>
              <Tooltip title="Views">
                <Grid id={styles.view_post_view_count}>
                  <RemoveRedEyeIcon />
                  <Typography component={"p"}>
                    {formatter.format(post.views)}
                  </Typography>
                </Grid>
              </Tooltip>
              <EditButton user_id={post.user.id} slug={post.slug} />
              <DeleteButton user_id={post.user.id} slug={post.slug} />
            </Grid>
          </Grid>
        </Grid>
      </ForumPostContent>
    </>
  );
};

export default page;
