"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  post_link: string;
};

const ClickPostWrapper = ({ children, post_link }: Props) => {
  const [prefetchPost, setPrefetchPost] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  //   useEffect(() => {
  //     const observer = new IntersectionObserver(
  //       (entries) => {
  //         const [entry] = entries;
  //         if (entry.isIntersecting) {
  //           setPrefetchLink(true);
  //           observer.disconnect();
  //         }
  //       },

  //     );

  //     if (ref.current) {
  //       observer.observe(ref.current);
  //     }

  //     return () => observer.disconnect();
  //   }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPrefetchPost(true);
      }
    });

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);
  return (
    <Link
      ref={ref}
      href={post_link}
      style={{ textDecoration: "none" }}
      prefetch={prefetchPost ? true : false}
    >
      {children}
    </Link>
  );
};

export default ClickPostWrapper;
