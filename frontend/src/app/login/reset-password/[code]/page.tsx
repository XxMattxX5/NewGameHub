import React from "react";
import dynamic from "next/dynamic";
import { checkRecoveryCode } from "@/app/lib/backend";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Hub - Reset Password",
};

const ResetPasswordForm = dynamic(
  () => import("@/app/components/login_components/ResetPasswordForm"),
  {
    ssr: !!false,
  }
);

const page = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  const tokenStatus = await checkRecoveryCode(code);

  if (!tokenStatus) {
    redirect("/login/reset-password/invalid");
  }

  return <ResetPasswordForm />;
};

export default page;
