import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Forgot Password",
};

const ForgotPasswordForm = dynamic(
  () => import("@/app/components/login_components/ForgotPasswordForm"),
  {
    ssr: !!false,
  }
);

const ForgotPassword = () => {
  return <ForgotPasswordForm />;
};

export default ForgotPassword;
