"use client";
import React, { useState } from "react";
import { Button, Grid } from "@mui/material";
import ProfileNav from "./ProfileNav";
import ProfileImage from "./ProfileImage";
import styles from "@/app/styles/profile.module.css";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

const ProfileSideBar = () => {
  const [showSideBar, setShowSideBar] = useState(false);

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };
  return (
    <Grid
      id={styles.profile_nav_sidebar_container}
      sx={{ left: showSideBar ? 0 : "-250px" }}
    >
      <Grid>
        <Grid id={styles.profile_main_image_container}>
          <ProfileImage />
        </Grid>
        <Grid id={styles.profile_main_nav_container}>
          <ProfileNav toggleSideNav={toggleSideBar} />
        </Grid>
      </Grid>
      <Button
        sx={{
          minWidth: 0,
          "&:hover": {
            backgroundColor: "inherit",
            boxShadow: "none",
          },
        }}
        onClick={toggleSideBar}
        id={styles.profile_sidebar_toggle_btn}
      >
        {showSideBar ? (
          <KeyboardDoubleArrowLeftIcon />
        ) : (
          <KeyboardDoubleArrowRightIcon />
        )}
      </Button>
    </Grid>
  );
};

export default ProfileSideBar;
