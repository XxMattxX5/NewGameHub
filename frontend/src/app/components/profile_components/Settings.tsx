"use client";
import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import styles from "@/app/styles/profile.module.css";
import { useTheme } from "../global_components/ThemeProvider";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAuth } from "@/app/hooks/useAuth";

const Settings = () => {
  const { logout, csrfToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profile_visibility_options = ["allow", "hide"];
  const last_seen_options = ["visible", "hidden"];
  const theme_options = ["dark", "light"];

  const [profileVisibility, setProfileVisibility] = useState("allow");
  const [lastSeen, setLastSeen] = useState("visible");

  const handleProfileVisibilityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileVisibility(e.target.value);
    saveChanges(undefined, e.target.value);
  };

  const handleLastSeenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastSeen(e.target.value);
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
            setLastSeen(data.settings.show_last_seen);
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

  const saveChanges = async (
    last_seen?: string,
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
        show_last_seen: last_seen ? last_seen : lastSeen,
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
            title="Allow other users to see when you were last on the site"
            placement="top"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <Typography component={"p"}>Last Seen</Typography>
          <FormControl
            component="fieldset"
            className={styles.settings_radio_buttons}
            sx={{
              color: theme === "dark" ? "white" : "black",
            }}
          >
            <RadioGroup
              value={lastSeen}
              sx={{ display: "flex", flexDirection: "row" }}
              onChange={handleLastSeenChange}
            >
              {last_seen_options.map((option) => (
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
