"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  post_link: string;
};

/**
 * ClickPostWrapper component is a wrapper around the Next.js Link component
 * that enables post prefetching when the link enters the viewport.
 *
 * It uses IntersectionObserver to detect when the link becomes visible in
 * the viewport, and once visible, it enables prefetching to speed up navigation
 * to the linked post.
 *
 * The component accepts a `post_link` for the destination URL and `children`
 * for the content inside the link, and it ensures that the link is not underlined
 * by applying inline styles.
 *
 * This is useful for optimizing user experience by preloading linked content
 * only when the user is likely to click it, reducing unnecessary network requests.
 */
const ClickPostWrapper = ({ children, post_link }: Props) => {
  const [prefetchPost, setPrefetchPost] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  // Prefetchs post once they have entered the viewport
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
