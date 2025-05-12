"use client";
import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Button, Typography, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "@/app/styles/forum.module.css";
import { useTheme } from "../global_components/ThemeProvider";
import { useRouter } from "next/navigation";

type Props = {
  user_id: string;
  slug: string;
};

/**
 * DeleteButton Component
 *
 * This component renders a delete button for forum posts. It is only visible
 * to the user who created the post (based on user ID comparison).
 *
 */
const DeleteButton = ({ user_id, slug }: Props) => {
  const { theme } = useTheme();
  const { userInfo, csrfToken } = useAuth();
  const router = useRouter();
  const id = userInfo?.id.toString();

  // Sends a delete request to the backend
  // Only works if the user is the author of the post
  const deletePost = () => {
    const headers = {
      "X-CSRFToken": csrfToken,
    };
    fetch(`/api/forum/post/${slug}/`, {
      method: "DELETE",
      headers: headers,
    })
      .then((res) => {
        if (res.ok) {
          router.push("/forum");
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          alert(data.error);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };

  // Gives a confirm prompt before going through with deletion
  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmed) {
      deletePost();
    }
  };

  return (
    <Tooltip title="Delete Post">
      <Button
        onClick={handleDelete}
        id={styles.post_delete_button}
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
        <DeleteIcon />
        <Typography component={"p"}> Delete</Typography>
      </Button>
    </Tooltip>
  );
};

export default DeleteButton;
