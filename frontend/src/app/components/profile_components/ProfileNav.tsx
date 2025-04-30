"use client";
import React from "react";
import { Grid, Button, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/app/hooks/useAuth";

const ProfileNav = () => {
  const { logout } = useAuth();
  return (
    <Grid id={styles.profile_nav_box}>
      <Link className={styles.profile_nav_link_box} href={`/profile`}>
        <HomeIcon /> <Typography component={"p"}>Dashboard</Typography>
      </Link>
      <Link
        className={styles.profile_nav_link_box}
        href={`/profile?menu=settings`}
      >
        <SettingsIcon /> <Typography component={"p"}>Settings</Typography>{" "}
      </Link>
      <Button
        onClick={logout}
        className={styles.profile_nav_link_box}
        fullWidth
        sx={{
          textTransform: "none",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "inherit",
            boxShadow: "none",
          },
        }}
      >
        <LogoutIcon sx={{ marginLeft: "3px" }} />{" "}
        <Typography component={"p"}>Logout</Typography>
      </Button>
    </Grid>
  );
};

export default ProfileNav;
