"use client";
import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  Collapse,
  CircularProgress,
} from "@mui/material";
import styles from "@/app/styles/login.module.css";
import { useAuth } from "@/app/hooks/useAuth";

/**
 * ForgotPasswordForm component renders a form for users to request a password reset.
 *
 * Users enter the email address associated with their account. Upon submission, the component:
 * - Validates and submits the form using a CSRF token for protection.
 * - Sends a password reset request to the backend.
 * - Displays success or error messages based on the response.
 * - Disables form submission while the request is in progress.
 *
 */
const ForgotPasswordForm = () => {
  const { csrfToken } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Sends email to backend to start recover password flow if email input is valid
  const sendEmail = async () => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Ensures email input field isn't blank
    if (!email) {
      return;
    }

    // Ensures email is valid
    if (!regex.test(email)) {
      setError("Email Invalid");
      return;
    }

    setSendingEmail(true);
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };
    await fetch("/api/auth/login/forgot-password/", {
      headers: headers,
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        email: email,
      }),
    }).then(() => {
      setError("");
      setEmailSent(true);
      setSendingEmail(false);
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Grid id={styles.forgot_password_container}>
      <Grid id={styles.forgot_password_box}>
        <Typography component={"h2"}>Recover Password</Typography>
        <Typography component={"p"}>
          Provide the email address associated with your account to recover your
          password.
        </Typography>
        <Grid id={styles.forgot_password_email_box}>
          <TextField
            type="email"
            required
            placeholder="Enter Your Email"
            size="small"
            value={email}
            id={styles.forgot_password_email_input}
            fullWidth
            onChange={handleEmailChange}
            sx={{
              backgroundColor: "white",
              "& input": {
                color: "black",
              },
              "& .MuiInputLabel-root": {
                color: "black",
              },
            }}
          />
          <Collapse in={error ? true : false}>
            <Alert
              severity="error"
              onClose={() => {
                setError("");
              }}
              sx={{ marginTop: "10px", padding: "2px 16px" }}
            >
              {error}
            </Alert>
          </Collapse>
          <Collapse in={emailSent ? true : false}>
            <Alert
              severity="success"
              onClose={() => {
                setEmailSent(false);
              }}
              sx={{ marginTop: "10px", padding: "2px 16px" }}
            >
              Reset Link Sent To Email.
            </Alert>
          </Collapse>
        </Grid>
        <Button
          disabled={sendingEmail ? true : false}
          onClick={sendEmail}
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
          {/* Sets the button to loading state while email is being sent */}
          {sendingEmail ? (
            <CircularProgress size={"20px"} sx={{ marginTop: "5px" }} />
          ) : (
            "Send Email"
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ForgotPasswordForm;
