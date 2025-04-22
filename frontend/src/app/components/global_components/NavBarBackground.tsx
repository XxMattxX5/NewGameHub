"use client";

import { usePathname } from "next/navigation";
import { Grid } from "@mui/material";

const Background = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <Grid
      container
      id="nav_background"
      style={{
        background: isHomePage ? "transparent" : "var(--lightGray)",
        position: isHomePage ? "absolute" : "relative",
      }}
    >
      {children}
    </Grid>
  );
};

export default Background;
