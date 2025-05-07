"use client";
import React, { useEffect } from "react";
import LoadingSpinner from "../components/global_components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const page = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, []);
  return <LoadingSpinner spinnerSize={60} />;
};

export default page;
