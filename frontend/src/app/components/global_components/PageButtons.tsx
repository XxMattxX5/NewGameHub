"use client";
import React from "react";
import { Grid, TextField, Button, MenuItem, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

type Props = {
  page_amount: number;
};

/**
 * PageButtons component renders pagination buttons based on the total number of pages.
 *
 * Allows users to navigate between different pages of game results.
 *
 */
const PageButtons = ({ page_amount }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  // Creates of list of page numbers giving the total amount of pages
  const createPageNumbers = (
    page_amount: number
  ): { label: string; value: number }[] => {
    return Array.from({ length: page_amount }, (_, i) => ({
      label: `Page ${i + 1}`,
      value: i + 1,
    }));
  };

  const page_numbers = createPageNumbers(page_amount);

  // handles changes to page number and makes sure new page is within the valid range
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
            backgroundColor: "white",
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
