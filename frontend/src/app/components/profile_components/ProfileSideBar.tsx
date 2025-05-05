"use client";
import React, { useState } from "react";
import { Button, Grid } from "@mui/material";
import ProfileNav from "./ProfileNav";
import ProfileImage from "./ProfileImage";
import styles from "@/app/styles/profile.module.css";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

/**
 * ProfileSideBar component renders the sidebar for the user's profile.
 *
 * This component includes the `ProfileNav` for navigating between different profile sections and the `ProfileImage` for displaying and updating the user's profile image.
 * The sidebar provides a convenient space for users to interact with their profile settings.
 *
 */
const ProfileSideBar = () => {
  const [showSideBar, setShowSideBar] = useState(false);

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };

  return (
    <Grid
      id={styles.profile_nav_sidebar_container}
      sx={{ left: showSideBar ? 0 : "-240px" }}
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
        {/* {showSideBar ? (
          <KeyboardDoubleArrowLeftIcon />
        ) : (
          <KeyboardDoubleArrowRightIcon />
        )} */}
        {showSideBar ? <CloseIcon /> : <MenuIcon />}
      </Button>
    </Grid>
  );
};

export default ProfileSideBar;
