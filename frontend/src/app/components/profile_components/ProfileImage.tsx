"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { Button, Grid } from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import ImageCropper from "./ImageCropper";

/**
 * ProfileImage component displays the user's current profile image and a button to trigger the image cropping/uploading process.
 *
 * This component shows the user's existing profile picture, if available, and provides a button that opens an image cropping interface
 * (using the `ImageCropper` component) for uploading a new profile image.
 *
 */
const ProfileImage = () => {
  const hostname = process.env.NEXT_PUBLIC_HOST_NAME || "";
  const isProd = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";
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
              ? `${isProd ? "https" : "http"}://${hostname}` +
                userInfo.profile_picture
              : "/image/blank-profile-picture.png"
          }
          alt="User's profile picture"
          width={120}
          height={120}
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
