"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { Button, Grid } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import ImageCropper from "./ImageCropper";

const ProfileImage = () => {
  const { userInfo } = useAuth();
  const [showImageCropper, setShowImageCropper] = useState(false);

  const toggleImageCropper = () => {
    setShowImageCropper((prev) => !prev);
  };
  return (
    <>
      <Grid id={styles.profile_image_box}>
        <Image
          src={
            userInfo
              ? userInfo.profile_picture
              : "/image/blank-profile-picture.png"
          }
          alt="User's profile picture"
          width={120}
          height={120}
          unoptimized
        />
        <Button
          onClick={toggleImageCropper}
          sx={{
            "&:hover": {
              backgroundColor: "inherit",
              boxShadow: "none",
            },
          }}
        >
          Upload Image
        </Button>
      </Grid>
      {showImageCropper ? (
        <ImageCropper toggleImageCropper={toggleImageCropper} />
      ) : null}
    </>
  );
};

export default ProfileImage;
