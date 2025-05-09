import React from "react";
import CreateEditPost from "@/app/components/forum_components/CreateEditPost";
import { ForumPost } from "@/app/types";
import { Grid } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import ForumSideBar from "@/app/components/forum_components/ForumSideBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Edit Post",
};

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

  return (
    <Grid
      id={styles.create_post_container}
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "700px",
        position: "relative",
      }}
    >
      <ForumSideBar />

      <CreateEditPost
        formVersion="edit"
        old_title={post.title}
        old_game={post.game}
        old_content={post.content}
        old_slug={slug}
        old_header_image={post.header_image}
        old_type={post.post_type}
      />
    </Grid>
  );
};

export default page;
