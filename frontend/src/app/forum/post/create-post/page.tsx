import React from "react";
import CreateEditPost from "@/app/components/forum_components/CreateEditPost";
import styles from "@/app/styles/forum.module.css";
import ForumSideBar from "@/app/components/forum_components/ForumSideBar";
import { Grid } from "@mui/material";
import { cookies } from "next/headers";

const page = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
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
