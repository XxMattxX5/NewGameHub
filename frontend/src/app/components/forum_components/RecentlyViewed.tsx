"use client";
import React, { useEffect } from "react";
import { RecentlyViewedPost } from "@/app/types";
import { useAuth } from "@/app/hooks/useAuth";

type Props = {
  slug: string;
  user_profile_picture: string;
  post_title: string;
};

const RecentlyViewed = ({ slug, user_profile_picture, post_title }: Props) => {
  const { csrfToken } = useAuth();
  useEffect(() => {
    const raw = localStorage.getItem("recent_viewed");
    let list: RecentlyViewedPost[] = raw ? JSON.parse(raw) : [];

    const alreadyViewed = list.some((item) => item.slug === slug);

    if (!alreadyViewed) {
      fetch("/api/forum/post/view/" + slug + "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
    }

    // Remove the item if it already exists
    list = list.filter((item) => item.slug !== slug);

    // Add the new item to the front
    list.unshift({ slug, user_profile_picture, post_title });

    // Trim the list to a max of 5 items
    if (list.length > 5) {
      list = list.slice(0, 5);
    }

    // Save the updated list
    localStorage.setItem("recent_viewed", JSON.stringify(list));
  }, [slug, user_profile_picture, post_title]);

  return null;
};

export default RecentlyViewed;
