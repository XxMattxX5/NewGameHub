"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Grid,
  Typography,
  TextField,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
} from "@mui/material";
import styles from "@/app/styles/login.module.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/app/hooks/useAuth";

type Props = {
  switchForms: (form: string) => void;
};
/**
 * RegisterForm component renders a form for creating a new user account.
 *
 * This component allows users to sign up by providing credentials like username and password.
 * It may also include logic for validating input, displaying errors, and handling submission.
 *
 */
const RegisterForm = ({ switchForms }: Props) => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [formErrors, setFormErrors] = useState({
    error1: "",
    error2: "",
    error3: "",
    error4: "",
    error5: "",
  });
  // Handles changes to the username variable and also validates the input setting errors in the formErrors variable
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 3) {
      setFormErrors((prev) => ({
        ...prev,
        error1: "Username must be At least 3 characters",
      }));
    } else if (e.target.value.length > 30) {
      setFormErrors((prev) => ({
        ...prev,
        error1: "Username must be 30 characters or less",
      }));
      return;
    } else {
      setFormErrors((prev) => ({
        ...prev,
        error1: "",
      }));
    }

    setUsername(e.target.value);
  };

  // Handles changes to the fullName variable and also validates the input setting errors in the formErrors variable
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 3) {
      setFormErrors((prev) => ({
        ...prev,
        error2: "Name must be At least 3 characters",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        error2: "",
      }));
    }
    setFullName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handles changes to the password variable and also validates the input setting errors in the formErrors variable
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    const lengthValid = newPass.length >= 8;
    const uppercaseValid = /[A-Z]/.test(newPass);
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);

    // Makes sure password contains a special character, a capital letter, and is a valid length
    if (!lengthValid) {
      setFormErrors((prev) => ({
        ...prev,
        error4: "Password must be at least 8 characters long",
      }));
    } else if (!uppercaseValid) {
      setFormErrors((prev) => ({
        ...prev,
        error4: "Password must contain at least one uppercase letter",
      }));
    } else if (!specialCharValid) {
      setFormErrors((prev) => ({
        ...prev,
        error4: "Password must contain at least one special character",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        error4: "",
      }));
    }

    setPassword(e.target.value);
  };

  // Handles changes to the password_confirm variable and also validates the input setting errors in the formErrors variable
  const handlePasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value !== password) {
      setFormErrors((prev) => ({
        ...prev,
        error5: "Confirm password must match password",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, error5: "" }));
    }
    setPasswordConfirm(e.target.value);
  };

  // Toggles between hide and plain text for both password and password_confirm
  const toggleShowPass = (showPassNum: number) => {
    if (showPassNum === 1) {
      setShowPassword((prev) => !prev);
    } else {
      setShowPasswordConfirm((prev) => !prev);
    }
  };

  // Sends registeration input to the backend for account to be created and sets the form to a state of loading
  const registerClick = () => {
    if (
      !formErrors.error1 &&
      !formErrors.error2 &&
      !formErrors.error3 &&
      !formErrors.error4 &&
      !formErrors.error5
    ) {
      setIsRegistering(true);
      register(username, fullName, email, password, passwordConfirm).then(
        (data) => {
          if (data) {
            setFormErrors({
              error1: data.username ? data.username[0] : "",
              error2: data.full_name ? data.full_name[0] : "",
              error3: data.email ? data.email[0] : "",
              error4: data.password ? data.password[0] : "",
              error5: data.password_confirm ? data.password_confirm[0] : "",
            });
          }
          setIsRegistering(false);
        }
      );
    }
  };

  return (
    <Grid id={styles.register_input_container}>
      <Typography component={"h2"}>Register</Typography>
      <Grid id={styles.register_input_box_container}>
        <Grid className={styles.register_input_box}>
          <Typography component={"p"}>Username</Typography>
          <TextField
            fullWidth
            placeholder="Enter Your Username"
            variant="standard"
            size="small"
            onChange={handleUsernameChange}
            value={username}
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
        <Collapse in={formErrors.error1 ? true : false}>
          <Alert
            severity="error"
            onClose={() => setFormErrors((prev) => ({ ...prev, error1: "" }))}
            sx={{ marginBottom: "15px", padding: "2px 16px" }}
          >
            {formErrors.error1}
          </Alert>
        </Collapse>
        <Grid className={styles.register_input_box}>
          <Typography component={"p"}>Full Name</Typography>
          <TextField
            fullWidth
            placeholder="Enter Your Full Name"
            variant="standard"
            size="small"
            onChange={handleFullNameChange}
            value={fullName}
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
        <Collapse in={formErrors.error2 ? true : false}>
          <Alert
            severity="error"
            onClose={() => setFormErrors((prev) => ({ ...prev, error2: "" }))}
            sx={{ marginBottom: "15px", padding: "2px 16px" }}
          >
            {formErrors.error2}
          </Alert>
        </Collapse>
        <Grid className={styles.register_input_box}>
          <Typography component={"p"}>Email</Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="Enter Your Email"
            variant="standard"
            size="small"
            onChange={handleEmailChange}
            value={email}
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
        <Collapse in={formErrors.error3 ? true : false}>
          <Alert
            severity="error"
            onClose={() => setFormErrors((prev) => ({ ...prev, error3: "" }))}
            sx={{ marginBottom: "15px", padding: "2px 16px" }}
          >
            {formErrors.error3}
          </Alert>
        </Collapse>
        <Grid className={styles.register_input_box}>
          <Typography component={"p"}>Password</Typography>
          <Grid className={styles.register_password_container}>
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
              sx={{ position: "absolute", right: 0, top: 0, bottom: 0 }}
              onClick={() => {
                toggleShowPass(1);
              }}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Grid>
        </Grid>
        <Collapse in={formErrors.error4 ? true : false}>
          <Alert
            severity="error"
            onClose={() => setFormErrors((prev) => ({ ...prev, error4: "" }))}
            sx={{ marginBottom: "15px", padding: "2px 16px" }}
          >
            {formErrors.error4}
          </Alert>
        </Collapse>
        <Grid className={styles.register_input_box}>
          <Typography component={"p"}>Confirm Password</Typography>
          <Grid className={styles.register_password_container}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Re-Enter Password"
              size="small"
              onChange={handlePasswordConfirmChange}
              value={passwordConfirm}
              type={showPasswordConfirm ? "text" : "password"}
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
              sx={{ position: "absolute", right: 0, top: 0, bottom: 0 }}
              onClick={() => {
                toggleShowPass(2);
              }}
            >
              {showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Grid>
        </Grid>
        <Collapse in={formErrors.error5 ? true : false}>
          <Alert
            severity="error"
            onClose={() => setFormErrors((prev) => ({ ...prev, error5: "" }))}
            sx={{ marginBottom: "15px", padding: "2px 16px" }}
          >
            {formErrors.error5}
          </Alert>
        </Collapse>
      </Grid>
      <Grid id={styles.register_btn_container}>
        <Button
          disabled={isRegistering ? true : false}
          id={styles.register_page_register_btn}
          onClick={registerClick}
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
            {isRegistering ? (
              <CircularProgress size={"20px"} sx={{ marginTop: "5px" }} />
            ) : (
              "Register"
            )}
          </Typography>
        </Button>
        <Link
          id={styles.register_page_backtolog_btn}
          style={{
            color: "white",
          }}
          href="/login"
          onClick={() => {
            switchForms("login");
          }}
        >
          <Typography component={"p"}>Back To Login</Typography>
        </Link>
      </Grid>
    </Grid>
  );
};

export default RegisterForm;
