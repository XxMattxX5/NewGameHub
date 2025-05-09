import React from "react";
import CreateEditPost from "@/app/components/forum_components/CreateEditPost";
import styles from "@/app/styles/forum.module.css";
import ForumSideBar from "@/app/components/forum_components/ForumSideBar";
import { Grid } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Create New Post",
};

const page = async () => {
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

      <CreateEditPost formVersion="create" />
    </Grid>
  );
};

export default page;
