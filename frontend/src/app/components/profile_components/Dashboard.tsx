"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { ProfileInfo } from "@/app/types";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";

/**
 * Dashboard component displays the authenticated user's account details.
 *
 * Upon mounting, it makes a GET request to `/api/user/profile/` to fetch the user's profile info.
 * - If the request is successful, the returned data is stored in the `profileInfo` state.
 * - If the request fails with a 403 status, the user is logged out via the `logout()` function from `useAuth`.
 * - Other errors are logged to the console.
 *
 */
const Dashboard = () => {
  const { logout } = useAuth();

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);

  const fetchUserInfo = () => {
    fetch("/api/user/profile/", {
      method: "GET",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 403) {
          logout();
          return;
        } else {
          throw Error("failed to fetch user info");
        }
      })
      .then((data) => {
        if (data) {
          setProfileInfo(data.data);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <Grid id={styles.profile_dashboard_main_container}>
      <Typography component={"h1"} id={styles.dashboard_header}>
        Account Details
      </Typography>

      <Grid id={styles.profile_dashboard_content}>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Username</Typography>
            <Typography component={"p"}>{profileInfo?.username}</Typography>
          </Grid>
        </Grid>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Full Name</Typography>
            <Typography component={"p"}>
              {profileInfo?.profile.full_name}
            </Typography>
          </Grid>
        </Grid>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Email</Typography>
            <Typography component={"p"}>{profileInfo?.email}</Typography>
          </Grid>
        </Grid>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Date Joined</Typography>
            <Typography component={"p"}>
              {profileInfo?.date_joined
                ? new Date(profileInfo.date_joined).toLocaleDateString()
                : ""}
            </Typography>
          </Grid>
        </Grid>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Posts</Typography>
            <Typography component={"p"}>
              {profileInfo?.profile.post_count}
            </Typography>
          </Grid>
        </Grid>
        <Grid className={styles.profile_dashboard_box}>
          <Grid>
            <Typography component={"h2"}>Comments</Typography>
            <Typography component={"p"}>
              {profileInfo?.profile.comment_count}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
