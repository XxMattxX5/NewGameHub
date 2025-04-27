"use client";
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Collapse,
  Alert,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import styles from "@/app/styles/login.module.css";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginForm = () => {
  const { login } = useAuth();
  const params = useSearchParams();

  const redirect = params.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginSubmit = () => {
    login(username, password, redirect).then((res) => {
      if (res) {
        setLoginError(res);
      }
    });
  };

  const handleClose = () => {
    setLoginError("");
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Grid id={styles.login_box} sx={{ backgroundColor: "var(--gray)" }}>
      <Grid id={styles.login_input_container} className={styles.login_sections}>
        <Typography component={"h2"}>Login</Typography>
        <Grid className={styles.login_input_box}>
          <Typography component={"p"}>Username</Typography>
          <TextField
            fullWidth
            placeholder="Enter Your Username"
            variant="standard"
            size="small"
            onChange={handleUsernameChange}
            sx={{
              "& input": {
                color: "white",
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "white",
              },
              "& .MuiInput-underline:before": {
                borderBottom: "1px solid white",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottom: "1px solid white !important",
              },
            }}
          />
        </Grid>
        <Grid className={styles.login_input_box}>
          <Typography component={"p"}>Password</Typography>
          <Grid id={styles.login_password_container}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Enter Your Password"
              size="small"
              onChange={handlePasswordChange}
              type={showPassword ? "text" : "password"}
              sx={{
                "& input": {
                  color: "white",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "white",
                },
                "& .MuiInput-underline:before": {
                  borderBottom: "1px solid white",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottom: "1px solid white !important",
                },
              }}
            />
            <IconButton
              onClick={toggleShowPassword}
              sx={{ position: "absolute", right: 0, top: 0, bottom: 0 }}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Grid>
        </Grid>
        <Collapse in={loginError ? true : false}>
          <Alert
            severity="error"
            onClose={handleClose}
            sx={{ marginBottom: "15px" }}
          >
            {loginError}
          </Alert>
        </Collapse>
        <Grid id={styles.login_btn_container}>
          <Button
            id={styles.login_page_signin_btn}
            onClick={handleLoginSubmit}
            sx={{
              textTransform: "none",
              borderRadius: 0,
              justifyContent: "left",
              "&:hover": {
                backgroundColor: "inherit",
                boxShadow: "none",
              },
            }}
          >
            <Typography component={"p"}>Sign In</Typography>
          </Button>
          <Link
            id={styles.login_page_register_btn}
            style={{
              color: "white",
            }}
            href=""
          >
            <Typography component={"p"}>Register</Typography>
          </Link>
        </Grid>
        <Link id={styles.login_forgot_password} href="/login/forgot-password">
          Forgot Password?
        </Link>
      </Grid>

      <Grid id={styles.login_image_section} className={styles.login_sections}>
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

export default LoginForm;
