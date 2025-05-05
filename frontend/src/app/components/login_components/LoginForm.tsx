"use client";
import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  IconButton,
  Alert,
  Collapse,
  Button,
  CircularProgress,
} from "@mui/material";
import styles from "@/app/styles/login.module.css";
import { useAuth } from "@/app/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";

type Props = {
  switchForms: (form: string) => void;
};

/**
 * LoginForm component renders a login interface for users to authenticate.
 *
 * It allows users to enter their username and password to sign in.
 * - Displays a success message if redirected from account creation.
 * - Handles login via the `useAuth` hook and shows relevant error messages.
 * - Provides a toggle for showing/hiding the password input.
 * - Manages a redirect path if provided via URL query parameters.
 *
 */
const LoginForm = ({ switchForms }: Props) => {
  const { login } = useAuth();
  const params = useSearchParams();

  const redirect = params.get("redirect");
  const created = params.get("created");

  const [loggingIn, setLoggingIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showCreated, setShowCreated] = useState(created ? true : false);

  // Displays an account created succesfully message if user just come from registering an account
  useEffect(() => {
    if (!showCreated) {
    }

    // Sets a timer to remove clear account created message after 3s
    const timer = setTimeout(() => {
      setShowCreated(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginSubmit = () => {
    setLoggingIn(true);
    login(username, password, redirect).then((res) => {
      if (res) {
        setLoginError(res);
      }
      setLoggingIn(false);
    });
  };

  // Toggles whether the password is hidden or in plain text
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Grid id={styles.login_input_container}>
      <Typography component={"h2"}>Login</Typography>
      <Collapse in={showCreated ? true : false}>
        <Alert
          severity="success"
          sx={{ marginBottom: "15px", padding: "2px 16px" }}
        >
          Account Created Successfully!
        </Alert>
      </Collapse>
      <Grid className={styles.login_input_box}>
        <Typography component={"p"}>Username</Typography>
        <TextField
          fullWidth
          placeholder="Enter Your Username"
          variant="standard"
          size="small"
          value={username}
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
            value={password}
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
          onClose={() => setLoginError("")}
          sx={{ marginBottom: "15px", padding: "2px 16px" }}
        >
          {loginError}
        </Alert>
      </Collapse>
      <Grid id={styles.login_btn_container}>
        <Button
          disabled={loggingIn ? true : false}
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
          <Typography component={"p"}>
            {loggingIn ? (
              <CircularProgress size={"20px"} sx={{ marginTop: "5px" }} />
            ) : (
              "Sign In"
            )}
          </Typography>
        </Button>
        <Link
          id={styles.login_page_register_btn}
          style={{
            color: "white",
          }}
          href="/login?register=true"
          onClick={() => {
            switchForms("register");
          }}
        >
          <Typography component={"p"}>Sign Up</Typography>
        </Link>
      </Grid>
      <Link id={styles.login_forgot_password} href="/login/forgot-password">
        Forgot Password?
      </Link>
    </Grid>
  );
};

export default LoginForm;
