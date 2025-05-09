"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Alert,
  Collapse,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import Tiptap from "../global_components/Tiptap";
import { GameSuggestion, Game } from "@/app/types";
import Image from "next/image";
import LoadingSpinner from "../global_components/LoadingSpinner";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

type Props = {
  formVersion: "create" | "edit";
  old_title?: string;
  old_header_image?: string;
  old_game?: {
    id: string;
    cover_image: string | null;
    title: string;
    slug: string;
  } | null;
  old_content?: string;
  old_slug?: string;
  old_type?: string;
};

const CreateEditPost = ({
  formVersion,
  old_title,
  old_header_image,
  old_game,
  old_content,
  old_slug,
  old_type,
}: Props) => {
  const router = useRouter();
  const { csrfToken, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const post_types = [
    { name: "General", value: "general" },
    { name: "Game", value: "game" },
  ];

  const [formErrors, setFormErrors] = useState({
    error1: "",
    error2: "",
  });

  const [type, setType] = useState(old_type ? old_type : "general");
  const [title, setTitle] = useState(old_title ? old_title : "");

  const [oldHeaderImage, setOldHeaderImage] = useState<string | null>("");
  const [headerImage, setHeaderImage] = useState<string | null>("");

  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [game, setGame] = useState<GameSuggestion | null>(
    old_game ? old_game : null
  );

  const [content, setContent] = useState(old_content ? old_content : "");
  const [gettingSuggestions, setGettingSuggestions] = useState(false);

  const [gameSearchSuggestions, setGameSearchSuggestions] = useState<Game[]>(
    []
  );

  const [sendingRequest, setSendingRequest] = useState(false);

  const toBase64 = async (imageUrl: string) => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Usage
  useEffect(() => {
    if (old_header_image) {
      toBase64("/api" + old_header_image).then((base64) => {
        setOldHeaderImage(base64);
        setHeaderImage(base64);
      });
    }
  }, []);

  const editPost = () => {
    const formData = new FormData();

    formData.append("type", type);
    formData.append("title", title);

    if (game) {
      formData.append("game_id", game.id.toString());
    }

    if (headerImage) {
      formData.append("image", headerImage);
    }

    if (headerImage === oldHeaderImage) {
      formData.append("sameImage", "true");
    }

    formData.append("content", content);
    const headers = {
      "X-CSRFToken": csrfToken,
    };
    setSendingRequest(true);
    fetch(`/api/forum/post/${old_slug}/`, {
      headers: headers,
      method: "PATCH",
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          router.push("/forum");
          return;
        } else if (res.status === 400) {
          return res.json();
        } else if (res.status === 403) {
          logout();
        } else {
          router.push("/forum");
        }
      })
      .then((data) => {
        if (data) {
          if (data.errors) {
            setFormErrors({
              error1: data.errors.title ?? "",
              error2: data.errors.content ?? "",
            });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      })
      .finally(() => {
        setSendingRequest(false);
      });
  };

  const createPost = () => {
    const formData = new FormData();

    formData.append("type", type);
    formData.append("title", title);

    if (game) {
      formData.append("game_id", game.id.toString());
    }

    if (headerImage) {
      formData.append("image", headerImage);
    }

    formData.append("content", content);
    const headers = {
      "X-CSRFToken": csrfToken,
    };

    setSendingRequest(true);
    fetch("/api/forum/post/create-post/", {
      headers: headers,
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          router.push("/forum");
          return;
        } else if (res.status === 400) {
          return res.json();
        } else if (res.status === 403) {
          logout();
        } else {
          router.push("/forum");
        }
      })
      .then((data) => {
        if (data) {
          if (data.errors) {
            setFormErrors({
              error1: data.errors.title ?? "",
              error2: data.errors.content ?? "",
            });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      })
      .finally(() => {
        setSendingRequest(false);
      });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleGameChange = (selectedGame: Game) => {
    setGameSearchSuggestions([]);
    setGame(selectedGame);
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
  };

  useEffect(() => {
    if (type === "general") {
      setGame(null);
      setGameSearchQuery("");
      setGameSearchSuggestions([]);
    }
  }, [type]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleGameSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value.length > 2) {
      setGettingSuggestions(true);
    }
    if (timeoutId.current) clearTimeout(timeoutId.current);

    timeoutId.current = setTimeout(() => {
      fetchSuggestions(e.target.value);
    }, 500);
    setGameSearchQuery(e.target.value);
  };

  // Fetches a list of 5 suggestions for the user while they are typing in their search
  const fetchSuggestions = async (search_word: string) => {
    if (search_word.length < 3) {
      setGameSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/games/gameSuggestions?q=${search_word}`,
        {
          method: "GET",
          cache: "no-cache",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        response.json().then((data) => {
          setGameSearchSuggestions(data.data);
          setGettingSuggestions(false);
        });
      } else if (response.status === 404) {
        setGameSearchSuggestions([]);
        setGettingSuggestions(false);
        return;
      } else {
        setGettingSuggestions(false);
        return;
      }
    } catch (error) {
      setGettingSuggestions(false);
      console.error("Fetch error:", error);
      return;
    }
  };

  function resizeImageFile(
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    minWidth = 200,
    minHeight = 200
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Reject if image is too small
        if (img.width < minWidth || img.height < minHeight) {
          return reject(
            new Error(`Image must be at least ${minWidth}x${minHeight}px.`)
          );
        }

        let width = img.width;
        let height = img.height;
        const aspectRatio = width / height;

        // Resize if too large
        if (width > maxWidth || height > maxHeight) {
          if (aspectRatio > 1) {
            // landscape
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            // portrait or square
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) return reject(new Error("Could not get canvas context."));

        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);

        resolve(resizedDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image."));
      };

      img.src = url;
    });
  }

  // Check if the file is an image
  function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    const file = input.files?.[0];

    // Reset early so selecting the same file again will re-trigger the change event
    input.value = "";

    if (!file) return;

    if (!isImageFile(file)) {
      alert("Please upload a valid image file.");
      return;
    }

    try {
      const resizedImageUrl = await resizeImageFile(file);
      setHeaderImage(resizedImageUrl);
    } catch (error: any) {
      alert(error.message || "Error processing image.");
    }
  };

  return (
    <Grid id={styles.edit_create_main_container}>
      <Typography component={"h1"} id={styles.create_edit_page_header}>
        {formVersion === "create" ? "Create Post" : "Edit Post"}
      </Typography>
      <Grid id={styles.create_edit_input_group1}>
        <Grid id={styles.edit_create_row1}>
          <Grid id={styles.edit_create_type_box}>
            <Typography>Post Type</Typography>

            <TextField
              select
              size="small"
              value={type}
              onChange={handleTypeChange}
              slotProps={{
                root: {
                  sx: {
                    borderRadius: 0, // TextField outer border
                  },
                },
                select: {
                  sx: {
                    borderRadius: 0, // <select> element itself
                  },
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        borderRadius: 0, // dropdown menu
                      },
                    },
                  },
                },
              }}
            >
              {post_types.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid id={styles.edit_create_title_box}>
            <Typography component={"p"}>Title</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter post title"
              value={title}
              onChange={handleTitleChange}
            />
            <Collapse in={formErrors.error1 ? true : false}>
              <Alert
                severity="error"
                sx={{ marginTop: "5px", padding: "0px 10px" }}
                onClose={() =>
                  setFormErrors((prev) => ({ ...prev, error1: "" }))
                }
              >
                {formErrors.error1}
              </Alert>
            </Collapse>
          </Grid>
        </Grid>
        {type === "game" ? (
          game ? (
            <Grid id={styles.create_edit_selected_game_box}>
              <Image
                src={
                  game.cover_image
                    ? "https://" + game.cover_image
                    : "/images/no_image_found.webp"
                }
                alt={`${game.title}'s cover image`}
                height={45}
                width={30}
              />
              <Typography component={"p"}>{game.title}</Typography>
              <IconButton onClick={() => setGame(null)}>
                <CloseIcon sx={{ fontSize: "25px", color: "white" }} />
              </IconButton>
            </Grid>
          ) : (
            <Grid id={styles.edit_create_game_box}>
              <Typography component={"p"}>Game</Typography>
              <TextField
                size="small"
                placeholder="Search for game"
                onChange={handleGameSearchQueryChange}
                fullWidth
                value={gameSearchQuery}
              />
              <Grid id={styles.create_edit_game_suggestions}>
                {gettingSuggestions ? (
                  <span style={{ padding: "10px 0px", width: "100%" }}>
                    <LoadingSpinner spinnerSize={40} />
                  </span>
                ) : (
                  gameSearchSuggestions.map((game) => (
                    <Button
                      fullWidth
                      key={game.id}
                      onClick={() => handleGameChange(game)}
                    >
                      <Image
                        src={
                          game.cover_image
                            ? "https://" + game.cover_image
                            : "/images/no_image_found.webp"
                        }
                        alt={`${game.title}'s cover image`}
                        height={45}
                        width={30}
                      />
                      <Typography component={"p"}>{game.title}</Typography>
                    </Button>
                  ))
                )}
              </Grid>
            </Grid>
          )
        ) : null}
      </Grid>
      {!headerImage ? (
        <Grid id={styles.create_edit_image_upload_box}>
          <Typography component={"p"}>Image</Typography>
          <TextField
            type={"file"}
            fullWidth
            onChange={handleFileChange}
            ref={fileInputRef}
            slotProps={{
              input: {
                inputProps: {
                  accept: "image/*",
                },
              },
            }}
          />
        </Grid>
      ) : (
        <Grid id={styles.create_edit_uploaded_image}>
          <img src={headerImage} />
          <IconButton onClick={() => setHeaderImage(null)}>
            <CloseIcon />
          </IconButton>
        </Grid>
      )}
      <Collapse in={formErrors.error2 ? true : false}>
        <Alert
          severity="error"
          sx={{ marginTop: "5px", padding: "0px 10px" }}
          onClose={() => setFormErrors((prev) => ({ ...prev, error2: "" }))}
        >
          {formErrors.error2}
        </Alert>
      </Collapse>
      <Tiptap contentCallBack={updateContent} original_content={content} />
      {formVersion === "create" ? (
        <Button
          onClick={createPost}
          disabled={sendingRequest ? true : false}
          className={styles.create_edit_submit_btn}
        >
          {sendingRequest ? (
            <LoadingSpinner spinnerSize={30} />
          ) : (
            "Create New Post"
          )}
        </Button>
      ) : (
        <Button
          onClick={editPost}
          disabled={sendingRequest ? true : false}
          className={styles.create_edit_submit_btn}
        >
          {sendingRequest ? <LoadingSpinner spinnerSize={30} /> : "Update Post"}
        </Button>
      )}
    </Grid>
  );
};

export default CreateEditPost;
