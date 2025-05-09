import React from "react";
import { Typography } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Link Invalid",
};

const Invalid = () => {
  return (
    <div style={{ alignContent: "center" }} id="password_recover_code_invalid">
      <div>
        <Typography component={"p"} fontSize={"30px"} textAlign={"center"}>
          Your recover link has expired or is invalid
        </Typography>
      </div>
    </div>
  );
};

export default Invalid;
