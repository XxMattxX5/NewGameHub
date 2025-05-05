"use client";
import React from "react";
import { Grid, Button, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/app/hooks/useAuth";
import { useSearchParams } from "next/navigation";

type Props = {
  toggleSideNav: () => void;
};

/**
 * ProfileNav component renders a navigation menu with links to the profile sections.
 *
 * This component includes a link or button that toggles the side navigation (sidebar) visibility when clicked.
 * The `toggleSideNav` function is called to either open or close the sidebar, allowing users to navigate through different sections of the profile.
 *
 */
const ProfileNav = ({ toggleSideNav }: Props) => {
  const params = useSearchParams();
  const menu = params.get("menu");
  const { logout } = useAuth();

  return (
    <Grid id={styles.profile_nav_box}>
      <Link
        onClick={toggleSideNav}
        className={styles.profile_nav_link_box}
        href={`/profile`}
        style={{
          backgroundColor: !menu ? "var(--purple)" : "unset",
        }}
      >
        <HomeIcon sx={{ color: !menu ? "white" : "var(--purple)" }} />{" "}
        <Typography component={"p"}>Dashboard</Typography>
      </Link>
      <Link
        onClick={toggleSideNav}
        className={styles.profile_nav_link_box}
        href={`/profile?menu=settings`}
        style={{
          backgroundColor: menu === "settings" ? "var(--purple)" : "unset",
        }}
      >
        <SettingsIcon
          sx={{ color: menu === "settings" ? "white" : "var(--purple)" }}
        />
        <Typography component={"p"}>Settings</Typography>{" "}
      </Link>
      <Button
        onClick={logout}
        className={styles.profile_nav_link_box}
        sx={{
          textTransform: "none",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "inherit",
            boxShadow: "none",
          },
        }}
      >
        <LogoutIcon sx={{ marginLeft: "3px", color: "var(--purple)" }} />
        <Typography component={"p"}>Logout</Typography>
      </Button>
    </Grid>
  );
};

export default ProfileNav;
