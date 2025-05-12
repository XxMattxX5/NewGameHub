import React from "react";
import { ProfileInfo } from "@/app/types";
import { notFound, redirect } from "next/navigation";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchProfileInfo(id);

  if (!profile) {
    return {
      title: "Game Hub - Profile Not Found",
    };
  }

  return {
    title: `Game Hub - ${profile.username}'s Profile`,
  };
}

const fetchProfileInfo = async (id: string): Promise<ProfileInfo | void> => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost";

  return fetch(`${backendUrl}/api/user/profile/${id}/`, {
    method: "GET",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 401) {
        return 401;
      } else if (res.status === 404) {
        return 404;
      } else {
        return;
      }
    })
    .then((data) => {
      if (data.data) {
        return data.data;
      } else if (typeof data === "number") {
        return data;
      }
      return;
    })
    .catch((err) => {
      console.error(err);
      return;
    });
};

/**
 * Profile Page Component
 *
 * This async server component renders a user's profile page based on the provided `id` parameter.
 * It fetches user profile information from the backend using the `fetchProfileInfo()` function
 * and handles different error scenarios:
 * - Redirects to an unauthorized page if the response status is 401.
 * - Redirects to a 404 page if the user profile is not found (status 404).
 * - Redirects to the home page if the profile information is invalid or missing.
 *
 */
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const response = await fetchProfileInfo(id);
  let profileInfo: ProfileInfo | undefined;

  const isProfileInfo = (response: any): response is ProfileInfo => {
    return typeof response !== "number" && response !== undefined;
  };

  if (typeof response === "number") {
    if (response === 401) {
      redirect("/profile/view/unauthorized");
    } else if (response === 404) {
      notFound();
    }
  }

  if (response && isProfileInfo(response)) {
    profileInfo = response;
  } else {
    console.error("Failed to fetch user profile");
    redirect("/");
  }

  return (
    <Grid id={styles.view_profile_main_container}>
      <Typography component={"h1"} id={styles.view_profile_header}>
        {`${profileInfo.username}'s Profile`}
      </Typography>

      <Grid id={styles.view_profile_content}>
        <Grid className={styles.view_profile_box}>
          <Grid>
            <Typography component={"h2"}>Username</Typography>
            <Typography component={"p"}>{profileInfo?.username}</Typography>
          </Grid>
        </Grid>
        {profileInfo.profile.full_name ? (
          <Grid className={styles.view_profile_box}>
            <Grid>
              <Typography component={"h2"}>Full Name</Typography>
              <Typography component={"p"}>
                {profileInfo?.profile.full_name}
              </Typography>
            </Grid>
          </Grid>
        ) : null}

        <Grid className={styles.view_profile_box}>
          <Grid>
            <Typography component={"h2"}>Date Joined</Typography>
            <Typography component={"p"}>
              {profileInfo?.date_joined
                ? new Date(profileInfo.date_joined).toLocaleDateString()
                : ""}
            </Typography>
          </Grid>
        </Grid>
        <Grid className={styles.view_profile_box}>
          <Grid>
            <Typography component={"h2"}>Posts</Typography>
            <Typography component={"p"}>
              {profileInfo?.profile.post_count}
            </Typography>
          </Grid>
        </Grid>
        <Grid className={styles.view_profile_box}>
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

export default page;
