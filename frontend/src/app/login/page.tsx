import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import styles from "../styles/login.module.css";

const LoginRegisterBlock = dynamic(
  () => import("../components/login_components/LoginRegisterBlock"),
  {
    ssr: !!false,
  }
);

export const metadata: Metadata = {
  title: "Game Hub - Login",
  description: "Log in to unlock all features of GameHub",
};

const Login = () => {
  return (
    <div id={styles.login_container}>
      <LoginRegisterBlock />
    </div>
  );
};

export default Login;
