import React from "react";
import dynamic from "next/dynamic";
import { Grid } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import ProfileSideBar from "@/app/components/profile_components/ProfileSideBar";
import LoadingSpinner from "../components/global_components/LoadingSpinner";

const Dashboard = dynamic(
  () => import("@/app/components/profile_components/Dashboard"),
  {
    loading: () => <LoadingSpinner spinnerSize={50} />,
  }
);

const Settings = dynamic(
  () => import("@/app/components/profile_components/Settings"),
  {
    loading: () => <LoadingSpinner spinnerSize={50} />,
  }
);

/**
 * Profile page component that renders the user dashboard or settings based on URL query parameters.
 *
 * This page extracts the `menu` search parameter to determine which section to display.
 * - If `menu` is `"settings"`, it renders the `Settings` component.
 * - Otherwise, it renders the `Dashboard` component.
 *
 * It also displays the user's profile navigation and image section via `ProfileSideBar`.
 *
 */
const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ menu: string }>;
}) => {
  const { menu } = await searchParams;

  return (
    <Grid id={styles.profile_main_container}>
      <Grid id={styles.profile_image_nav_container}>
        <ProfileSideBar />
      </Grid>
      <Grid id={styles.profile_main_content}>
        {menu === "settings" ? <Settings /> : <Dashboard />}
      </Grid>
    </Grid>
  );
};

export default page;
