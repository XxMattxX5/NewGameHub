"use client";
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Alert,
  Collapse,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import styles from "@/app/styles/login.module.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/app/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";

const ResetPasswordForm = () => {
  const router = useRouter();
  const { csrfToken } = useAuth();
  const params = useParams();
  const code = params.code;
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [formErrors, setFormErrors] = useState({
    error1: "",
    error2: "",
  });

  const [tokenExpired, setTokenExpired] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    const lengthValid = newPass.length >= 8;
    const uppercaseValid = /[A-Z]/.test(newPass);
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);

    if (!lengthValid) {
      setFormErrors((prev) => ({
        ...prev,
        error1: "Password must be at least 8 characters long",
      }));
    } else if (!uppercaseValid) {
      setFormErrors((prev) => ({
        ...prev,
        error1: "Password must contain at least one uppercase letter",
      }));
    } else if (!specialCharValid) {
      setFormErrors((prev) => ({
        ...prev,
        error1: "Password must contain at least one special character",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        error1: "",
      }));
    }

    setPassword(e.target.value);
  };

  const handlePasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value !== password) {
      setFormErrors((prev) => ({
        ...prev,
        errror2: "Password confirm must match password",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, errror2: "" }));
    }
    setPasswordConfirm(e.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleShowPasswordConfirm = () => {
    setShowPasswordConfirm((prev) => !prev);
  };

  const resetPassword = async () => {
    if (formErrors.error1 || formErrors.error2) {
      return;
    }
    if (password === "" || passwordConfirm === "") {
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };
    await fetch(`/api/auth/login/reset-password/${code}/`, {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        password: password,
        password_confirm: passwordConfirm,
      }),
    })
      .then((res) => {
        if (res.ok) {
          router.push("/login");
          return;
        } else if (res.status === 401) {
          setTokenExpired(true);
        } else {
          setFormErrors((prev) => ({
            ...prev,
            error2: "Failed to reset password",
          }));
          return;
        }
      })
      .catch((err) => {
        console.error(err);
        setFormErrors((prev) => ({
          ...prev,
          error2: "Failed to reset password",
        }));
        return;
      });
  };

  return (
    <Grid id={styles.recover_password_container}>
      <Grid id={styles.recover_password_box}>
        <Typography component={"h2"}>Password Reset</Typography>
        <Typography component={"p"}>
          Enter a new password below to change your password
        </Typography>

        {tokenExpired ? (
          <Typography sx={{ margin: "auto", fontSize: "24px" }}>
            Token is expired or invalid{" "}
          </Typography>
        ) : (
          <Grid id={styles.recover_password_password_box}>
            <Grid className={styles.recover_password_password_input}>
              <TextField
                required
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your New Password"
                size="small"
                fullWidth
                onChange={handlePasswordChange}
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
              <IconButton onClick={toggleShowPassword}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Grid>
            <Collapse in={formErrors.error1 ? true : false}>
              <Alert
                severity="error"
                sx={{ padding: "2px 16px", marginBottom: "10px" }}
                onClose={() => {
                  setFormErrors((prev) => ({ ...prev, error1: "" }));
                }}
              >
                {formErrors.error1}
              </Alert>
            </Collapse>
            <Grid className={styles.recover_password_password_input}>
              <TextField
                required
                value={passwordConfirm}
                placeholder="Confirm Our Password"
                size="small"
                type={showPasswordConfirm ? "text" : "password"}
                fullWidth
                onChange={handlePasswordConfirmChange}
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
              <IconButton onClick={toggleShowPasswordConfirm}>
                {showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Grid>
            <Collapse in={formErrors.error2 ? true : false}>
              <Alert
                sx={{ padding: "2px 16px" }}
                severity="error"
                onClose={() => {
                  setFormErrors((prev) => ({ ...prev, error2: "" }));
                }}
              >
                {formErrors.error2}
              </Alert>
            </Collapse>
            <Button
              onClick={resetPassword}
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
              Reset Password
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default ResetPasswordForm;
