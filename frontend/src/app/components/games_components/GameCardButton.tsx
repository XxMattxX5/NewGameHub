"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Button, Box } from "@mui/material";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  slug: string;
  visibleCard: string | null;
  changeVisibleCard: (cardSlug: string | null) => void;
  cardType: "top_rated" | "default";
};

/**
 * GameCardButton component that conditionally renders either a link or a button.
 *
 * - If the `cardType` is "top_rated" or the `visibleCard` matches the `slug`, a `Link` is rendered to navigate to the game’s page.
 * - Otherwise, a `Button` is rendered that triggers `changeVisibleCard` to make the card visible.
 *
 */
const GameCardButton = ({
  children,
  slug,
  visibleCard,
  changeVisibleCard,
  cardType,
}: Props) => {
  // const [prefetchGame, setPrefetchGame] = useState(false);
  // const ref = useRef<HTMLAnchorElement | null>(null);

  // useEffect(() => {
  //   const observer = new IntersectionObserver(([entry]) => {
  //     if (entry.isIntersecting) {
  //       setPrefetchGame(true);
  //     }
  //   });

  //   const current = ref.current;
  //   if (current) observer.observe(current);

  //   return () => {
  //     if (current) observer.unobserve(current);
  //   };
  // }, []);
  return (
    <>
      <Link
        prefetch={false}
        href={`/games/${slug}`}
        onMouseEnter={() => changeVisibleCard(slug)}
        onMouseLeave={() => changeVisibleCard(null)}
        className={styles.card_button_container}
        style={{
          textTransform: "none",
          padding: 0,
          overflowY: "hidden",
          borderRadius: 0,
          flexShrink: 0,
        }}
      >
        <Grid className={styles.game_card}>{children}</Grid>
      </Link>
    </>
  );
};

export default GameCardButton;
