"use client";
import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Grid, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import NavSideBar from "./NavSideBar";

export default function ToggleSideBarBtn() {
  const path = usePathname();

  const [showSideBar, setShowSideBar] = useState(false);

  const toggleSideBar = useCallback(async (opt?: boolean) => {
    if (opt !== undefined) {
      setShowSideBar(opt);
    } else {
      setShowSideBar((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    toggleSideBar(false);
  }, [path]);

  return (
    <Grid container id="side_nav">
      <Grid id="side_nav_btn">
        <IconButton
          onClick={() => {
            toggleSideBar();
          }}
        >
          <MenuIcon />
        </IconButton>
      </Grid>
      <Grid id="side_nav_bar" sx={{ left: showSideBar ? "0" : "-500px" }}>
        <NavSideBar toggleSideBar={toggleSideBar} />
      </Grid>
    </Grid>
  );
}
