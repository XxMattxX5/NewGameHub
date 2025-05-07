"use client";
import React from "react";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/forum.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  game: { slug: string; title: string; cover_image: string };
};

const ForumGamePopUp = ({ game }: Props) => {
  const router = useRouter();

  const gameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/games/${game.slug}`);
  };

  return (
    <Grid className={styles.normal_post_game_container}>
      <span onClick={gameClick} className={styles.normal_post_game_title}>
        <Typography component={"p"}>{game.title}</Typography>
        <Grid className={styles.normal_post_game_info}>
          <Image
            src={
              game.cover_image
                ? "http:" + game.cover_image
                : "/images/no_image_found.webp"
            }
            alt={`${game.title}'s cover image`}
            width={40}
            height={60}
            unoptimized
          />
          <Typography component={"p"}>{game.title}</Typography>
        </Grid>
      </span>

      {"|"}
    </Grid>
  );
};

export default ForumGamePopUp;
