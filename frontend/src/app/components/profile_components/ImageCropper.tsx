"use client";
import React, { useState, useRef } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styles from "@/app/styles/profile.module.css";
import {
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Alert,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "../global_components/ThemeProvider";

type Props = {
  toggleImageCropper: () => void;
};

const ImageCropper = ({ toggleImageCropper }: Props) => {
  const { fetchUserInfo, logout, csrfToken, userInfo } = useAuth();
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const hasImageLoaded = useRef(false);
  const [uploadError, setUploadError] = useState("");

  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const resizeImage = (file: File, maxSize = 200): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, maxSize, maxSize);
          canvas.toBlob((blob) => {
            const resizedReader = new FileReader();
            resizedReader.onloadend = () => {
              resolve(resizedReader.result as string);
            };
            if (blob) resizedReader.readAsDataURL(blob);
          }, "image/png");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const resized = await resizeImage(file, 200);
    setSrc(resized);
  };

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCropX = crop.x! * scaleX;
    const pixelCropY = crop.y! * scaleY;
    const pixelCropWidth = crop.width! * scaleX;
    const pixelCropHeight = crop.height! * scaleY;

    const outputWidth = 120;
    const outputHeight = 120;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    if (ctx) {
      ctx.drawImage(
        image,
        pixelCropX,
        pixelCropY,
        pixelCropWidth,
        pixelCropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );
    }

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }, "image/webp");
    });
  };

  const handleComplete = async (crop: Crop) => {
    if (src) {
      const image = new window.Image();
      image.src = src;
      image.onload = async () => {
        const croppedImageUrl = await getCroppedImg(image, crop);
        setCroppedImageUrl(croppedImageUrl);
      };
    }
  };

  const uploadCroppedImage = async (base64Url: string) => {
    const response = await fetch(base64Url);
    const blob = await response.blob();
    const file = new File(
      [blob],
      `${userInfo?.username}'s-profile-picture.webp`,
      { type: "image/webp" }
    );
    const formData = new FormData();
    formData.append("profile_picture", file);

    const headers = {
      "X-CSRFToken": csrfToken,
    };

    await fetch("/api/user/profile/image/", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: headers,
    })
      .then((res) => {
        if (res.ok) {
          toggleImageCropper();
          fetchUserInfo();
          return;
        } else if (res.status === 403) {
          logout();
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setUploadError(data.error);
        }
      })
      .catch((err) => {
        console.error(err);
        setUploadError("Failed to upload image");
        return;
      });
  };

  return (
    <Grid id={styles.image_cropper_container}>
      <Grid
        id={styles.image_cropper_box}
        sx={{ backgroundColor: theme === "dark" ? "var(--gray)" : "white" }}
      >
        <IconButton
          id={styles.close_image_cropper}
          onClick={toggleImageCropper}
        >
          <CloseIcon
            sx={{
              color: theme === "dark" ? "white" : "black",
              fontSize: "30px",
            }}
          />
        </IconButton>
        <Typography component={"h2"}>Upload and Crop Image</Typography>
        <Grid id={styles.image_cropping_box}>
          {src && (
            <Grid id={styles.image_to_be_cropped_box}>
              <Typography component={"h3"}>Original Image</Typography>
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={handleComplete}
                ruleOfThirds
                maxHeight={200}
                maxWidth={200}
                aspect={1}
              >
                <img
                  src={src}
                  id={styles.image_to_be_cropped}
                  onLoad={(e) => {
                    if (!hasImageLoaded.current) {
                      hasImageLoaded.current = true;
                      setCroppedImageUrl((e.target as HTMLImageElement).src);
                    }
                  }}
                />
              </ReactCrop>
            </Grid>
          )}

          {croppedImageUrl && (
            <Grid id={styles.cropped_image_box}>
              <Typography component={"h3"}>Cropped Image</Typography>
              <Image
                src={croppedImageUrl}
                alt="Cropped"
                id={styles.cropped_image}
                width={120}
                height={120}
              />
            </Grid>
          )}
        </Grid>
        <Grid id={styles.crop_image_buttons}>
          <Collapse in={uploadError ? true : false}>
            <Alert
              severity="error"
              sx={{ margin: "10px 0px" }}
              onClose={() => setUploadError("")}
            >
              {uploadError}
            </Alert>
          </Collapse>
          <TextField
            fullWidth
            inputRef={fileInputRef}
            type="file"
            onChange={handleImageChange}
            sx={{ backgroundColor: "white" }}
            slotProps={{
              input: {
                inputProps: {
                  accept: "image/*",
                },
              },
            }}
          />
          <Button
            fullWidth
            onClick={() => {
              croppedImageUrl
                ? uploadCroppedImage(croppedImageUrl)
                : setUploadError("Must select image");
            }}
            id={styles.crop_image_upload}
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
      </Grid>
    </Grid>
  );
};

export default ImageCropper;
