"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "./ThemeProvider";
import Image from "next/image";

/**
 * ProfileSection component displays the user's profile picture and a dropdown menu.
 *
 * The dropdown includes the username, links to the user's profile and settings pages,
 * and an option to log out. Typically used in the top navigation bar.
 *
 */
const ProfileSection = () => {
  const hostname = process.env.NEXT_PUBLIC_HOST_NAME || "";
  const isProd = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";
  const { theme } = useTheme();
  const { userInfo, logout } = useAuth();
  const path = usePathname();

  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(true);

  const toggleDropDown = useCallback(async (opt?: boolean) => {
    if (opt !== undefined) {
      setShowDropdown(opt);
    } else {
      setShowDropdown((prev) => !prev);
    }
  }, []);

  // Closes dropdown menu when url pathname changes
  useEffect(() => {
    toggleDropDown(false);
  }, [path]);

  useEffect(() => {
    if (userInfo?.profile_picture) {
      const img = document.createElement("img");
      img.src = userInfo.profile_picture;
      img.onload = () => setProfileImageLoading(false);
    }
  }, [userInfo]);

  return (
    <Grid container>
      {userInfo ? (
        <Grid id="nav_profile">
          <Grid
            component={"div"}
            id="nav_profile_icon_btn"
            onClick={() => {
              toggleDropDown();
            }}
          >
            <Grid id="profile_image_background" component={"div"}>
              {profileImageLoading ? (
                <Grid id="profile_image_placeholder"></Grid>
              ) : userInfo?.profile_picture ? (
                <Image
                  src={
                    `${isProd ? "https" : "http"}://${hostname}` +
                    userInfo.profile_picture
                  }
                  alt="User's profile picture"
                  width={50}
                  height={50}
                  priority={true}
                />
              ) : null}
            </Grid>
            {showDropdown ? (
              <ArrowDropUpIcon id="profile_dropdown_arrow" />
            ) : (
              <ArrowDropDownIcon id="profile_dropdown_arrow" />
            )}
          </Grid>
          {showDropdown ? (
            <Grid component={"div"} id="nav_profile_dropdown_menu">
              <Grid
                id="nav_profile_dropdown_box"
                sx={{
                  backgroundColor: theme === "dark" ? "var(--gray2)" : "white",
                }}
              >
                <Grid id="dropdown_username_container">
                  <Typography
                    sx={{
                      color: theme === "dark" ? "white" : "black",
                    }}
                  >
                    {userInfo?.username}
                  </Typography>
                </Grid>
                <Grid id="nav_profile_dropdown_content">
                  <Grid component="div">
                    <Link href={`/profile`}>
                      <PersonIcon />
                      <Typography
                        component="p"
                        sx={{
                          color: theme === "dark" ? "white" : "var(--purple)",
                        }}
                      >
                        View Profile
                      </Typography>
                    </Link>
                  </Grid>
                  <Grid component="div">
                    <Link href={`/profile?menu=settings`}>
                      <SettingsIcon />
                      <Typography
                        component="p"
                        sx={{
                          color: theme === "dark" ? "white" : "var(--purple)",
                        }}
                      >
                        Settings
                      </Typography>
                    </Link>
                  </Grid>
                  <Grid component="div">
                    <Button
                      onClick={logout}
                      fullWidth
                      sx={{
                        textTransform: "none",
                        borderRadius: 0,
                        justifyContent: "left",
                        "&:hover": {
                          backgroundColor: "inherit",
                          boxShadow: "none",
                        },
                      }}
                    >
                      <LogoutIcon />
                      <Typography
                        component="p"
                        sx={{
                          color: theme === "dark" ? "white" : "var(--purple)",
                        }}
                      >
                        Logout
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      ) : (
        <Grid id="nav_login_register_container">
          <Grid id="nav_login_btn">
            <Link href="/login">
              <Typography component="p">Login</Typography>
            </Link>
          </Grid>
          <Grid id="nav_register_btn">
            <Link href="/login?register=true">
              <Typography component="p">Sign Up</Typography>
            </Link>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProfileSection;
