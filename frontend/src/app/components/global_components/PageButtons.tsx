"use client";
import React, { use } from "react";
import { Grid, TextField, Button, MenuItem, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useTheme } from "./ThemeProvider";

type Props = {
  page_amount: number;
};

const PageButtons = ({ page_amount }: Props) => {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";

  const createPageNumbers = (
    page_amount: number
  ): { label: string; value: number }[] => {
    return Array.from({ length: page_amount }, (_, i) => ({
      label: `Page ${i + 1}`,
      value: i + 1,
    }));
  };

  const page_numbers = createPageNumbers(page_amount);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > page_amount) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Grid id="page_button_container">
      <Grid>
        <TextField
          select
          value={parseInt(page)}
          onChange={(e) => handlePageChange(Number(e.target.value))}
          size="small"
          fullWidth
          sx={{
            "& .MuiInputBase-input": {
              color: theme === "dark" ? "white" : "black",
            },
            "& .MuiInputLabel-root": {
              color: theme === "dark" ? "white" : "black",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme === "dark" ? "white" : "black",
              },
              "&:hover fieldset": {
                borderColor: theme === "dark" ? "lightgray" : "gray",
              },
              "&.Mui-focused fieldset": {
                borderColor: theme === "dark" ? "lightblue" : "blue",
              },
            },
          }}
        >
          {page_numbers.map((page_info) => (
            <MenuItem key={page_info.value} value={page_info.value}>
              {page_info.label}
            </MenuItem>
          ))}
        </TextField>
        <Grid id="page_quick_change_container">
          <Button
            onClick={() => {
              handlePageChange(parseInt(page) - 1);
            }}
            className="page_change_button"
            id="page_prev_button"
            sx={{
              paddingRight: "20px",
              "&:hover": {
                backgroundColor: "inherit",
                boxShadow: "none",
              },
            }}
          >
            <KeyboardArrowLeftIcon />
            <Typography component={"p"}>Prev</Typography>
          </Button>
          <Button
            onClick={() => {
              handlePageChange(parseInt(page) + 1);
            }}
            className="page_change_button"
            id="page_next_button"
            sx={{
              paddingLeft: "20px",
              "&:hover": {
                backgroundColor: "inherit",
                boxShadow: "none",
              },
            }}
          >
            <Typography component={"p"}>Next</Typography>
            <KeyboardArrowRightIcon />
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PageButtons;
