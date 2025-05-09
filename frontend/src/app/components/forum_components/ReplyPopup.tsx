"use client";
import React from "react";
import Tiptap from "../global_components/Tiptap";
import { Grid, Button, Typography, IconButton } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { PostComment } from "@/app/types";
import CloseIcon from "@mui/icons-material/Close";
import LoadingSpinner from "../global_components/LoadingSpinner";

type Props = {
  contentCallBack: (cont: string) => void;
  content: string;
  placeholder_text: string;
  submitCallback: () => void;
  comment?: PostComment;
  closeCallBack: () => void;
  creating: boolean;
};

const ReplyPopup = ({
  contentCallBack,
  content,
  placeholder_text,
  submitCallback,
  comment,
  closeCallBack,
  creating,
}: Props) => {
  return (
    <Grid className={styles.reply_popup_container}>
      <Grid>
        <Grid className={styles.reply_popup_header}>
          <Grid className={styles.reply_popup_header_row1}>
            <IconButton onClick={closeCallBack}>
              <CloseIcon sx={{ fontSize: "30px", color: "white" }} />
            </IconButton>
            <Typography component={"p"}>
              {comment ? `Reply to ${comment.user.username}` : "Reply"}
            </Typography>
          </Grid>
          {comment ? (
            <Grid className={styles.reply_comment_details}>
              <Typography
                component={"p"}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              ></Typography>
            </Grid>
          ) : null}
        </Grid>
        <Tiptap
          contentCallBack={contentCallBack}
          original_content={content}
          placeholder_text={placeholder_text}
        />
        <Button
          disabled={creating ? true : false}
          fullWidth
          onClick={submitCallback}
        >
          {creating ? (
            <LoadingSpinner spinnerSize={30} />
          ) : comment ? (
            "Create Reply"
          ) : (
            "Create Comment"
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ReplyPopup;
