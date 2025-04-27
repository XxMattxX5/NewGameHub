import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import styles from "../styles/login.module.css";

const LoginForm = dynamic(
  () => import("../components/global_components/LoginForm"),
  {
    ssr: !!false,
  }
);

export const metadata: Metadata = {
  title: "GameHub - Login",
  description: "Log in to unlock all features of GameHub",
};

const Login = () => {
  return (
    <div id={styles.login_container}>
      <LoginForm />
    </div>
  );
};

export default Login;
