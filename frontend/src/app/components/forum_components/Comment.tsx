"use client";
import React, { useEffect, useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import { PostComment } from "@/app/types";
import Image from "next/image";
import styles from "@/app/styles/forum.module.css";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/hooks/useAuth";
import ReplyPopup from "./ReplyPopup";
import Link from "next/link";

type Props = {
  comment: PostComment;
  parentUserName?: string;
  activeReplyId: number | null;
  setActiveReplyId: (id: number | null) => void;
  postid: string;
  depth?: number;
};

/**
 * Comment component displays an individual comment and its replies, allowing users
 * to reply to a comment and view existing replies. It supports nested replies up to
 * a depth of 5, with a button to load or hide replies.
 *
 * The component manages the reply content input and sends a POST request to create
 * a reply for a comment. It also fetches existing replies for a comment using a GET request.
 * The component updates the display of replies dynamically, showing or hiding them as needed.
 *
 * It also includes a timestamp for the comment creation and allows users to navigate to
 * the comment author's profile by clicking on their username.
 *
 * The component automatically handles the active reply state to manage showing/hiding the
 * reply text editor for a given comment and makes sure to clear the reply input when switching
 * between comments.
 *
 * This component is useful for rendering a threaded comment system with support for replies,
 * managing user interactions, and integrating with backend APIs for comment management.
 */
const Comment = ({
  comment,
  activeReplyId,
  setActiveReplyId,
  postid,

  depth = 1,
}: Props) => {
  const { logout, csrfToken } = useAuth();

  // Makes created_at date into a time ago format
  const parsedDate = new Date(comment.created_at);
  const timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true });

  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<PostComment[]>([]);
  const [showReplies, setShowReplies] = useState(true);

  const [creatingReply, setCreatingReply] = useState(false);

  // Sends a request to backend to to create a reply and creating reply
  // to true while waiting for a response
  const createReply = () => {
    setCreatingReply(true);
    fetch(`/api/forum/post/comments/reply/${postid}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        content: replyContent,
        comment_id: comment.id,
      }),
    })
      .then((res) => {
        if (res.ok) {
          fetchReplies();
          setActiveReplyId(null);
        } else if (res.status === 403) {
          logout();
        } else {
          alert("failed to create reply");
          console.error(res.status);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      })
      .finally(() => {
        setCreatingReply(false);
      });
  };

  const handleReplyContentChange = (reply: string) => {
    setReplyContent(reply);
  };

  // Ensures that only 1 reply box is open at a time
  const showReplyBox = () => {
    if (activeReplyId === comment.id) {
      setActiveReplyId(null);
    } else {
      setActiveReplyId(comment.id);
    }
  };

  const closeReplyBox = () => {
    setActiveReplyId(null);
  };

  // Sets reply input back to empy when visible reply box changes
  useEffect(() => {
    setReplyContent("");
  }, [activeReplyId]);

  // Fetches replies for the given comment
  const fetchReplies = () => {
    fetch(`/api/forum/post/comments/reply/${comment.id}/`, {
      method: "GET",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          alert("Failed to fetch replies");
          return;
        }
      })
      .then((data) => {
        if (data) {
          setReplies(data.data);
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };

  return (
    <>
      <Grid
        className={styles.comment_box}
        sx={{ borderLeft: "1px solid purple" }}
      >
        <Grid className={styles.comment_box_content}>
          <Link
            className={styles.comment_box_content_header}
            href={`/profile/view/${comment.user.id}`}
          >
            <Image
              src={"/api" + comment.user.profile_picture}
              alt={`${comment.user.username}'s profile picture`}
              height={35}
              width={35}
              unoptimized
            />
            <Grid className={styles.comment_box_content_header_info}>
              <Typography
                component={"p"}
                id={styles.comment_box_content_header_username}
              >
                {comment.user.username}
              </Typography>
              <Typography
                component={"p"}
                id={styles.omment_box_content_header_created}
              >
                {timeAgo}
              </Typography>
            </Grid>
          </Link>
          <Typography
            component={"p"}
            className={styles.comment_reply_content}
            dangerouslySetInnerHTML={{ __html: comment.content }}
          ></Typography>
          <Grid className={styles.comment_bottom_bar}>
            {depth < 5 ? (
              <Button
                className={styles.comment_reply_button}
                onClick={showReplyBox}
              >
                Reply
              </Button>
            ) : null}
            {comment.reply_count > 0 && replies.length === 0 ? (
              <Button
                onClick={fetchReplies}
                className={styles.comment_load_replies}
                sx={{
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >{`load ${comment.reply_count} replies`}</Button>
            ) : null}
            {replies.length !== 0 && showReplies ? (
              <Button
                onClick={() => setShowReplies(false)}
                className={styles.comment_load_replies}
                sx={{
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                hide replies
              </Button>
            ) : replies.length !== 0 && !showReplies ? (
              <Button
                onClick={() => setShowReplies(true)}
                className={styles.comment_load_replies}
                sx={{
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                show replies
              </Button>
            ) : null}
          </Grid>
          {comment.id === activeReplyId ? (
            <Grid className={styles.reply_text_editor_box}>
              <ReplyPopup
                contentCallBack={handleReplyContentChange}
                content={replyContent}
                placeholder_text={"Start writing your reply..."}
                submitCallback={createReply}
                comment={comment}
                closeCallBack={closeReplyBox}
                creating={creatingReply}
              />
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      {replies && replies.length > 0 && (
        <Grid
          className={styles.comment_reply_container}
          style={{ marginLeft: 10 }}
          sx={{ display: showReplies ? "block" : "none" }}
        >
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              parentUserName={comment.user.username}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              postid={postid}
              depth={depth + 1}
            />
          ))}
        </Grid>
      )}
    </>
  );
};

export default Comment;
