"use client";
import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Grid, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import NavSideBar from "./NavSideBar";

const ToggleSideBarBtn = () => {
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
    const disablePullToRefresh = (e: TouchEvent) => {
      // Prevent default action if the touch move is vertical
      if (e.touches.length > 1 || e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    };

    let timeoutId: NodeJS.Timeout;

    const enablePullToRefreshTemporarily = () => {
      if (showSideBar) {
        // Add event listener to disable pull-to-refresh
        document.addEventListener("touchmove", disablePullToRefresh, {
          passive: false,
        });

        // Set timeout to enable pull-to-refresh again after 3 seconds (3000 ms)
        timeoutId = setTimeout(() => {
          // Remove the event listener to re-enable pull-to-refresh
          document.removeEventListener("touchmove", disablePullToRefresh);
        }, 3000); // 3000 ms = 3 seconds
      }
    };

    // Call the function to disable pull-to-refresh when sidebar is shown
    enablePullToRefreshTemporarily();

    // Clean up the event listener and timeout when the component unmounts or the sidebar state changes
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("touchmove", disablePullToRefresh);
    };
  }, [showSideBar]);

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
};

export default ToggleSideBarBtn;
