"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Grid } from "@mui/material";

const Background = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    setIsClient(true); // This ensures the code runs only on the client side
  }, []);

  if (!isClient) {
    // Return an empty div or similar for the server-rendered content
    return <div>{children}</div>;
  }
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
