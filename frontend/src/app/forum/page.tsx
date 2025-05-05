import React from "react";
import dynamic from "next/dynamic";
import { Grid } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import { cookies } from "next/headers";
import { ForumPost } from "../types";
import NormalPostTemplate from "../components/forum_components/NormalPostTemplate";
import { Metadata } from "next";
import ForumSideBar from "../components/forum_components/ForumSideBar";
import SearchBar from "../components/global_components/SearchBar";
import ForumContent from "../components/forum_components/ForumContent";
import PageButtons from "../components/global_components/PageButtons";

export const metadata: Metadata = {
  title: "Game Hub - Forum",
  description:
    "Explore forum post and chat with other users about your favorite games or other topics",
};

// const SearchBar = dynamic(
//   () => import("../components/global_components/SearchBar"),
//   { ssr: !!false }
// );

// const ForumSideBar = dynamic(
//   () => import("../components/forum_components/ForumSideBar"),
//   { ssr: true }
// );
// const ForumContent = dynamic(
//   () => import("../components/forum_components/ForumContent"),
//   { ssr: !!false }
// );
// const PageButtons = dynamic(
//   () => import("../components/global_components/PageButtons"),
//   { ssr: !!false }
// );

const getForumPost = async (
  type?: string,
  q?: string,
  s?: string,
  page?: string
) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionid")?.value;
  const backendUrl = process.env.BACKEND_URL || "http://localhost";

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (q) params.set("q", q);
  if (s) params.set("s", s);
  if (page) params.set("page", page);

  return fetch(`${backendUrl}/api/forum/get-posts/?${params.toString()}`, {
    method: "GET",
    next: { revalidate: 0 },
    headers: {
      Cookie: `sessionid=${sessionId}`,
      Accept: "application/json",
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("failed to fetch forum posts");
      }
    })
    .then((data) => {
      if (data) {
        return data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
};

const Forum = async ({
  searchParams,
}: {
  searchParams: Promise<{ posts: string; q: string; s: string; page: string }>;
}) => {
  const { posts, q, s, page } = await searchParams;
  const data = await getForumPost(posts, q, s, page);
  const postList: ForumPost[] = data.data;

  const page_amount = data.pages;

  return (
    <>
      <Grid id={styles.forum_search_bar_container}>
        <SearchBar searchType="forum" />
      </Grid>
      <Grid id={styles.forum_main_container}>
        <ForumSideBar />
        <Grid id={styles.forum_main_content_container}>
          <ForumContent>
            {postList.map((post) => (
              <NormalPostTemplate key={post.slug} forumPost={post} />
            ))}
          </ForumContent>
          {page_amount > 1 ? (
            <Grid id={styles.forum_page_buttons}>
              <PageButtons page_amount={page_amount} />
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
};

export default Forum;
