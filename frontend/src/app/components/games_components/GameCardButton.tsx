"use client";
import React from "react";
import styles from "../../styles/games.module.css";
import { Grid } from "@mui/material";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  slug: string;
  changeVisibleCard: (cardSlug: string | null) => void;
};

/**
 * GameCardButton component that conditionally renders either a link or a button.
 *
 
 */
const GameCardButton = ({ children, slug, changeVisibleCard }: Props) => {
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
