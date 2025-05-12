"use client";
import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Button, Typography, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";
import { useRouter } from "next/navigation";

type Props = {
  user_id: string;
  slug: string;
};

/**
 * EditButton Component
 *
 * This component renders an "Edit" button for forum posts, allowing the post author
 * to navigate to the post editing page. The button is only visible to the post's owner.
 */
const EditButton = ({ user_id, slug }: Props) => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const { theme } = useTheme();
  const id = userInfo?.id.toString();

  const handleClick = () => {
    router.push(`/forum/post/edit/${slug}`);
  };

  return (
    <Tooltip title="Edit Post">
      <Button
        onClick={handleClick}
        id={styles.post_edit_button}
        sx={{
          display: user_id.toString() === id ? "flex" : "none",
          backgroundColor:
            theme === "dark"
              ? "rgb(39, 42, 48, 0.5)"
              : "rgba(39, 42, 48, 0.09)",
          "&:hover": {
            backgroundColor:
              theme === "dark"
                ? "rgb(39, 42, 48, 0.8)"
                : "rgba(39, 42, 48, 0.2)",
          },
        }}
      >
        <EditIcon />
        <Typography component={"p"}>Edit</Typography>
      </Button>
    </Tooltip>
  );
};

export default EditButton;
