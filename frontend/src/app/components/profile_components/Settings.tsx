"use client";
import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import { useTheme } from "../global_components/ThemeProvider";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAuth } from "@/app/hooks/useAuth";

/**
 * Settings component renders the user settings page.
 *
 * This component allows users to manage their account settings, preferences, and possibly update profile information.
 * It acts as a container for various settings-related features and components that users can interact with to modify their preferences.
 *
 */
const Settings = () => {
  const { logout, csrfToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profile_visibility_options = ["visible", "hidden"];
  const name_visibility_options = ["visible", "hidden"];
  const theme_options = ["dark", "light"];

  const [profileVisibility, setProfileVisibility] = useState("");
  const [nameVisibility, setNameVisibility] = useState("");

  const handleProfileVisibilityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileVisibility(e.target.value);
    saveChanges(undefined, e.target.value);
  };

  const handleNameVisibilityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNameVisibility(e.target.value);
    saveChanges(e.target.value);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.value;
    if (newTheme === "dark" || newTheme === "light") {
      toggleTheme(newTheme);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetches the user's stored settings from the backend on first load
  useEffect(() => {
    const getUserSettings = async () => {
      await fetch("/api/user/settings/", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 403) {
            logout();
          } else {
            throw new Error("Failed to fetch user settings");
          }
        })
        .then((data) => {
          if (data) {
            setNameVisibility(data.settings.name_visibility);
            setProfileVisibility(data.settings.profile_visibility);
          }
        })
        .catch((err) => {
          console.error(err);
          return;
        });
    };
    getUserSettings();
  }, []);

  // Sends request to backend to update stored user settings
  const saveChanges = async (
    name_visibility?: string,
    profile_visibility?: string
  ) => {
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };

    await fetch("/api/user/settings/", {
      method: "PATCH",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
        show_last_seen: name_visibility ? name_visibility : nameVisibility,
        profile_visibility: profile_visibility
          ? profile_visibility
          : profileVisibility,
      }),
    })
      .then((res) => {
        if (res.ok) {
          return;
        } else if (res.status === 403) {
          logout();
        } else {
          throw new Error("Failed to update user settings");
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  };

  return (
    <Grid id={styles.settings_container}>
      <Grid className={styles.settings_section}>
        <Typography component={"h2"}>Visibilty</Typography>
        <Grid
          className={styles.settings_section_setting_box}
          sx={{
            backgroundColor: theme === "dark" ? "var(--gray2)" : "#fcfcf",
            color: theme === "dark" ? "white" : "black",
            borderBottom:
              theme === "dark" ? "#2c2f34 3px solid" : "#e0e0e0 3px solid",
          }}
        >
          <Tooltip
            title="Allow other users to view your profile"
            placement="top"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <Typography component={"p"}>Profile Visibility</Typography>
          <FormControl
            component="fieldset"
            className={styles.settings_radio_buttons}
            sx={{
              color: theme === "dark" ? "white" : "black",
            }}
          >
            <RadioGroup
              value={profileVisibility}
              sx={{ display: "flex", flexDirection: "row" }}
              onChange={handleProfileVisibilityChange}
            >
              {profile_visibility_options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={capitalizeFirstLetter(option)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid
          className={styles.settings_section_setting_box}
          sx={{
            backgroundColor: theme === "dark" ? "var(--gray2)" : "#fcfcf",
            color: theme === "dark" ? "white" : "black",
          }}
        >
          <Tooltip
            title="Allow other users to see your real name"
            placement="top"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <Typography component={"p"}>Name Visibility</Typography>
          <FormControl
            component="fieldset"
            className={styles.settings_radio_buttons}
            sx={{
              color: theme === "dark" ? "white" : "black",
            }}
          >
            <RadioGroup
              value={nameVisibility}
              sx={{ display: "flex", flexDirection: "row" }}
              onChange={handleNameVisibilityChange}
            >
              {name_visibility_options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={capitalizeFirstLetter(option)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Grid className={styles.settings_section}>
        <Typography component={"h2"}>Theme</Typography>
        <Grid
          className={styles.settings_section_setting_box}
          sx={{
            backgroundColor: theme === "dark" ? "var(--gray2)" : "#fcfcf",
            color: theme === "dark" ? "white" : "black",
          }}
        >
          <Tooltip
            title="Change the color theme of the website"
            placement="top"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <Typography component={"p"}>Toggle Color Theme</Typography>
          <FormControl
            component="fieldset"
            className={styles.settings_radio_buttons}
            sx={{
              color: theme === "dark" ? "white" : "black",
            }}
          >
            <RadioGroup
              value={theme}
              sx={{ display: "flex", flexDirection: "row" }}
              onChange={handleThemeChange}
            >
              {theme_options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={capitalizeFirstLetter(option)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Settings;
