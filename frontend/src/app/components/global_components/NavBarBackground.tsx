"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Grid } from "@mui/material";

const Background = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <Grid
      id="nav_background"
      sx={{
        background: isHomePage ? "transparent" : "var(--lightGray)",
        position: isHomePage ? "absolute" : "relative",
      }}
    >
      {children}
    </Grid>
  );
};

export default Background;
