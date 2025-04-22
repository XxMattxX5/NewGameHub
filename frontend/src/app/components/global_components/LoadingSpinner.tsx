import React from "react";
import { CircularProgress } from "@mui/material";

type Props = {
  spinnerSize: number;
};

const LoadingSpinner = ({ spinnerSize }: Props) => {
  return (
    <div id="loading_spinner">
      <CircularProgress size={spinnerSize} />
    </div>
  );
};

export default LoadingSpinner;
