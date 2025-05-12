"use client";
import react, { useEffect } from "react";
import { RecentlyViewedPost } from "@/app/types";
import { useAuth } from "@/app/hooks/useAuth";

type Props = {
  slug: string;
  user_profile_picture: string;
  post_title: string;
};

/**
 * RecentlyViewed Component
 *
 * This component tracks the posts that the user has recently viewed. It:
 * - Retrieves the list of recently viewed posts from `localStorage`.
 * - Checks if the current post has already been viewed. If not, it sends a request to the server to register the view.
 * - Adds the current post to the front of the recently viewed list and stores it back in `localStorage`.
 * - Limits the recently viewed list to a maximum of 5 posts.
 *
 * Features:
 * - Retrieves and updates the list of recently viewed posts from `localStorage`.
 * - Sends a view request to the backend for posts that have not been viewed yet.
 * - Ensures that the list does not exceed 5 posts by trimming older entries.
 *
 */
const RecentlyViewed = ({ slug, user_profile_picture, post_title }: Props) => {
  const { csrfToken } = useAuth();

  useEffect(() => {
    const raw = localStorage.getItem("recent_viewed");
    let list: RecentlyViewedPost[] = raw ? JSON.parse(raw) : [];

    const alreadyViewed = list.some((item) => item.slug === slug);

    // If the post isn't already in recently viewed post view count on post is increased
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
