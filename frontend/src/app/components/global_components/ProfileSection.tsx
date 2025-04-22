"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import Link from "next/link";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { usePathname } from "next/navigation";

type Props = {
  loggedIn: boolean;
};

type UserInfo = {
  username: string;
  profile_picture: string | null;
};

const ProfileSection = ({ loggedIn }: Props) => {
  const path = usePathname();

  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: "Matthew15",
    profile_picture:
      "https://res.cloudinary.com/drk8ctpvl/image/upload/v1744220391/lanixrrigqjuyzbdnxgp.jpg",
  });
  const [isLogged, setIsLogged] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const [profileImageLoading, setProfileImageLoading] = useState(true);

  const toggleDropDown = useCallback(async (opt?: boolean) => {
    if (opt !== undefined) {
      setShowDropdown(opt);
    } else {
      setShowDropdown((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    toggleDropDown(false);
  }, [path]);

  useEffect(() => {
    if (userInfo.profile_picture) {
      const img = document.createElement("img");
      img.src = userInfo.profile_picture;
      img.onload = () => setProfileImageLoading(false);
    }
  }, [userInfo]);

  //   useEffect(() => {
  //     setTimeout(() => {
  //       setUserInfo((prevState) => ({
  //         ...prevState,
  //         profile_picture:
  //           "https://res.cloudinary.com/drk8ctpvl/image/upload/v1744220391/lanixrrigqjuyzbdnxgp.jpg",
  //       }));
  //     }, 5000);
  //   }, []);

  return (
    <Grid container>
      {loggedIn ? (
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
              ) : userInfo.profile_picture ? (
                <img
                  src={userInfo.profile_picture}
                  alt="User's profile picture"
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
              <Grid id="nav_profile_dropdown_box">
                <Grid id="dropdown_username_container">
                  <Typography>{userInfo.username}</Typography>
                </Grid>
                <Grid id="nav_profile_dropdown_content">
                  <Grid component="div">
                    <Link href="">
                      <PersonIcon />
                      <Typography component="p">View Profile</Typography>
                    </Link>
                  </Grid>
                  <Grid component="div">
                    <Link href="">
                      <SettingsIcon />
                      <Typography component="p">Settings</Typography>
                    </Link>
                  </Grid>
                  <Grid component="div">
                    <Link href="">
                      <LogoutIcon />
                      <Typography component="p">Logout</Typography>
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      ) : (
        <Grid id="nav_login_btn">
          <Link href="#">
            <Typography component="p">Login</Typography>
          </Link>
        </Grid>
      )}
    </Grid>
  );
};

export default ProfileSection;
