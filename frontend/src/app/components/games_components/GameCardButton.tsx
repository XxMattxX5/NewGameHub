"use client";
import React from "react";
import styles from "../../styles/games.module.css";
import { Grid, Button, Box } from "@mui/material";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  slug: string;
  visibleCard: string | null;
  changeVisibleCard: (cardSlug: string) => void;
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
  return (
    <>
      {cardType === "top_rated" || visibleCard === slug ? (
        // Renders a Link if the card is top-rated or it matches the visibleCard
        <Link
          href={`/games/${slug}`}
          passHref
          className={
            styles.card_button_container + " " + styles.card_button_active
          }
          style={{
            boxShadow: cardType === "top_rated" ? "none" : undefined,
          }}
        >
          <Grid className={styles.game_card}>{children}</Grid>
        </Link>
      ) : (
        // Renders a Button if the card is not top-rated or not visible
        <Button
          onClick={() => {
            changeVisibleCard(slug);
          }}
          className={styles.card_button_container}
          sx={{
            textTransform: "none",
            padding: 0,
            overflowY: "hidden",
            borderRadius: 0,
            flexShrink: 0,
          }}
        >
          <Grid className={styles.game_card}>{children}</Grid>
        </Button>
      )}
    </>
  );
};

export default GameCardButton;
