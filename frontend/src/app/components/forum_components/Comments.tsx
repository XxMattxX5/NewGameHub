"use client";
import React, { useEffect, useState } from "react";
import { Grid, Typography, Button } from "@mui/material";
import Tiptap from "../global_components/Tiptap";
import styles from "@/app/styles/forum.module.css";
import Comment from "./Comment";
import { PostComment } from "@/app/types";
import { useAuth } from "@/app/hooks/useAuth";
import ReplyPopup from "./ReplyPopup";
import { useTheme } from "@/app/components/global_components/ThemeProvider";

type Props = {
  id: string;
};

const Comments = ({ id }: Props) => {
  const { isAuthenticated, userInfo, logout, csrfToken } = useAuth();
  const { theme } = useTheme();
  const [commentList, setCommentList] = useState<PostComment[]>([]);
  const [content, setContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [creatingComment, setCreatingComment] = useState(false);

  const handleContentChange = (cont: string) => {
    setContent(cont);
  };

  const toggleShowCommentBox = () => {
    setShowCommentBox((prev) => !prev);
  };

  const createComment = () => {
    setCreatingComment(true);
    fetch(`/api/forum/post/comments/comment/${id}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        content: content,
      }),
    })
      .then((res) => {
        if (res.ok) {
          toggleShowCommentBox();
          getComments();
        } else if (res.status === 403) {
          logout();
          return;
        } else {
          alert("failed to create comment");
          console.error(res.status);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      })
      .finally(() => {
        setCreatingComment(false);
      });
  };

  const getComments = () => {
    fetch(`/api/forum/post/comments/${id}/`, {
      method: "GET",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setCommentList(data.data);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };
  useEffect(() => {
    getComments();
  }, []);
  return (
    <Grid id={styles.comment_main_container}>
      <Grid className={styles.make_comment_container}>
        {isAuthenticated ? (
          showCommentBox ? (
            <>
              <ReplyPopup
                contentCallBack={handleContentChange}
                content={content}
                placeholder_text={"Start writing your comment..."}
                submitCallback={createComment}
                closeCallBack={toggleShowCommentBox}
                creating={creatingComment}
              />
            </>
          ) : (
            <Button
              onClick={toggleShowCommentBox}
              id={styles.leave_comment_button}
              sx={{
                backgroundColor: theme === "dark" ? "var(--gray)" : "#cacaca",
                color: theme === "dark" ? "white" : "inherit",
              }}
            >
              Leave a Comment
            </Button>
          )
        ) : (
          <Typography component={"p"}>
            You need to be logged in to post a comment. Please sign in to join
            the discussion.
          </Typography>
        )}
      </Grid>
      <Grid id={styles.comments_comment_container}>
        {commentList.map((com) => (
          <Comment
            postid={id}
            comment={com}
            key={com.id}
            activeReplyId={activeReplyId}
            setActiveReplyId={setActiveReplyId}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default Comments;
