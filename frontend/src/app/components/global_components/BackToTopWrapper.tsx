"use client";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const BackToTopWrapper = ({ children }: Props) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      onClick={scrollToTop}
      style={{ cursor: "pointer", width: "100%", height: "fit-content" }}
    >
      {children}
    </div>
  );
};

export default BackToTopWrapper;
