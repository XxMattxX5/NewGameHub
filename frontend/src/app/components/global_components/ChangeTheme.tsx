"use client";
import React from "react";
import { Grid, Typography, Switch } from "@mui/material";
import { useTheme } from "./ThemeProvider";

const ChangeTheme = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Grid
      display={"flex"}
      alignItems={"center"}
      width={"fit-content"}
      margin={"0 auto"}
      padding={"5px 0px"}
    >
      <Typography component={"p"} color="white">
        {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </Typography>
      <Switch
        checked={theme === "dark" ? true : false}
        onChange={() => toggleTheme()}
      />
    </Grid>
  );
};

export default ChangeTheme;
