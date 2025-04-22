"use client";
import React, { useState } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Button, Box } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  children: React.ReactNode;
  slug: string;
  visibleCard: string | null;
  changeVisibleCard: (cardSlug: string) => void;
};

const GameCardButton = ({
  children,
  slug,
  visibleCard,
  changeVisibleCard,
}: Props) => {
  return (
    <>
      {visibleCard === slug ? (
        <Link
          href={`/games/${slug}`}
          passHref
          className={
            styles.card_button_container + " " + styles.card_button_active
          }
        >
          <Grid className={styles.game_card}>{children}</Grid>
        </Link>
      ) : (
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
