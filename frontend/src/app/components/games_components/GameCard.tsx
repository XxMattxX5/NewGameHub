import React from "react";
import { Game } from "@/app/types";
import styles from "../../styles/games.module.css";
import Image from "next/image";
import { Grid, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

type Props = {
  game: Game;
  titleRef?: (el: HTMLDivElement | null) => void;
  cardInfoHeight?: number;
  cardType: "top_rated" | "default";
};

export default function GameCard({
  game,
  titleRef,
  cardInfoHeight,
  cardType,
}: Props) {
  return (
    <Grid key={game.slug} className={styles.game_card_box}>
      <Typography className={styles.game_card_release}>
        {cardType === "top_rated" ? <StarIcon /> : null}
        {cardType === "top_rated"
          ? game.rating
            ? game.rating
            : "N/A"
          : game.release
          ? new Date(game.release).toLocaleDateString()
          : "No Release Date"}
      </Typography>
      <Image
        src={
          game.cover_image ? game.cover_image : "/images/no_image_found.webp"
        }
        height={320}
        width={270}
        alt={`${game.title} cover`}
        unoptimized
      />
      <Grid
        className={styles.game_card_info}
        ref={titleRef}
        sx={{
          display: cardType === "top_rated" ? "none" : "block",
          top: cardInfoHeight ? `calc(100% - ${cardInfoHeight}px)` : undefined,
          transition: "all 1s linear",
        }}
      >
        <Grid className={styles.game_card_rating}>
          <StarIcon />
          <Typography>{game.rating ? game.rating : "N/A"}</Typography>
        </Grid>
        <Grid className={styles.game_card_title_container}>
          <Typography>{game.title}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
