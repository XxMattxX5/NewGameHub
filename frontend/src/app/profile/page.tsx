import React from "react";
import dynamic from "next/dynamic";
import { Grid, Button, Typography } from "@mui/material";
import styles from "@/app/styles/profile.module.css";

// const ProfileNav = dynamic(
//   () => import("@/app/components/profile_components/ProfileNav"),
//   {
//     ssr: !!false,
//   }
// );
// const ProfileImage = dynamic(
//   () => import("@/app/components/profile_components/ProfileImage"),
//   {
//     ssr: !!false,
//   }
// );

const ProfileSideBar = dynamic(
  () => import("@/app/components/profile_components/ProfileSideBar"),
  { ssr: !!false }
);

const Dashboard = dynamic(
  () => import("@/app/components/profile_components/Dashboard"),
  {
    ssr: !!false,
  }
);

const Settings = dynamic(
  () => import("@/app/components/profile_components/Settings"),
  {
    ssr: !!false,
  }
);

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
