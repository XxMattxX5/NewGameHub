"use client";
import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/login.module.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useSearchParams } from "next/navigation";

/**
 * LoginRegisterBlock component serves as the parent container for authentication forms.
 *
 * This component manages the toggle logic between the Login and Register forms.
 * It encapsulates the shared layout or styling and handles which form is currently visible.
 *
 * Responsibilities:
 * - Tracks which form (login or register) is currently active.
 * - Renders either the `LoginForm` or `RegisterForm` based on internal state.
 * - Passes down the `switchForms` function to child components to allow toggling.
 *
 * Usage:
 * Typically used on an authentication page to allow users to switch between creating a new account
 * and logging in to an existing one, without navigating away or changing routes.
 *
 */
const LoginRegisterBlock = () => {
  const params = useSearchParams();
  const registering = params.get("register");

  const [width, setWidth] = useState(2000);
  const [visibleForm, setVisibleForm] = useState<"login" | "register">(
    registering ? "register" : "login"
  );
  const [formChange, setFormChange] = useState<"login" | "register">(
    visibleForm
  );
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Switches between making the login or the register form visible
  const switchForms = (form: string) => {
    if (form === "register") {
      setFormChange("register");
      setShouldAnimate(true);
    } else {
      setFormChange("login");
      setShouldAnimate(true);
    }
  };

  useEffect(() => {
    // Function to update the width
    const updateWidth = () => {
      setWidth(window.innerWidth);
      setShouldAnimate(false);
    };

    // Set the initial width
    updateWidth();

    // Event listener to update width on resize
    window.addEventListener("resize", updateWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Checks and animates to appropriate form when search param registering changes
  useEffect(() => {
    if (!registering && formChange !== "login") {
      setFormChange("login");
      setShouldAnimate(true);
    } else if (registering && formChange !== "register") {
      setFormChange("register");
      setShouldAnimate(true);
    }
  }, [registering]);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    // Disables animations when screen width is below 1000px
    if (width <= 1000) {
      setVisibleForm(formChange);
      return;
    }

    // Sets a timer to change form so it changes while behind the image
    const timer = setTimeout(() => {
      setVisibleForm(formChange);
    }, 250);

    // Sets a timer to send animation as soon as it finishs
    const timer2 = setTimeout(() => {
      setShouldAnimate(false);
    }, 500);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [formChange]);

  return (
    <Grid id={styles.login_box} sx={{ backgroundColor: "var(--gray)" }}>
      <Grid
        className={styles.login_sections}
        sx={{
          animation:
            shouldAnimate && width > 1000
              ? "login_register_form_slide .5s linear"
              : "none",
          animationDirection: formChange === "login" ? "reverse" : "unset",
          transform:
            formChange === "register" && width > 1000
              ? "translateX(105%)"
              : "none",
        }}
      >
        {visibleForm === "register" ? (
          <RegisterForm switchForms={switchForms} />
        ) : (
          <LoginForm switchForms={switchForms} />
        )}
      </Grid>
      <Grid
        id={styles.login_image_section}
        className={styles.login_sections}
        sx={{
          animation:
            shouldAnimate && width > 1000
              ? "login_register_image_slide .5s linear"
              : "none",
          animationDirection: formChange === "login" ? "reverse" : "unset",
          transform:
            formChange === "register" && width > 1000
              ? "translateX(-105%)"
              : "none",
        }}
      >
        <Typography component={"p"}>
          Sign up to unlock all the features of the forum.
        </Typography>
        <ul id={styles.signup_features_list}>
          <li>
            <Typography component={"p"}>Create New Posts</Typography>
          </li>
          <li>
            <Typography component={"p"}>Comment On Posts</Typography>
          </li>
          <li>
            <Typography component={"p"}>Like and Dislike Posts</Typography>
          </li>
        </ul>
      </Grid>
    </Grid>
  );
};

export default LoginRegisterBlock;
