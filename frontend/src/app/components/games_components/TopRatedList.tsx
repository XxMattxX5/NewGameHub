"use client";
import React, { useRef, useState } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Typography } from "@mui/material";
import { Game } from "@/app/types";
import GameCardButton from "./GameCardButton";
import GameCard from "./GameCard";

const TopRatedList = () => {
  const [expandedCard, setExpandedCard] = useState<null | string>(null);
  const titleRefs = useRef<{ [slug: string]: HTMLDivElement | null }>({});
  const [titleHeights, setTitleHeights] = useState<{ [slug: string]: number }>(
    {}
  );

  const changeVisibleCard = (cardSlug: string) => {
    setExpandedCard(cardSlug);

    if (!titleHeights[cardSlug] && titleRefs.current[cardSlug]) {
      setTitleHeights((prev) => ({
        ...prev,
        [cardSlug]: titleRefs.current[cardSlug]?.offsetHeight || 0,
      }));
    }
  };
  const gameList: Game[] = [
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "3.5",
      release: "11/30/2029",
      slug: "1",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Bad Girl",
      rating: "2",
      release: "11/30/2029",
      slug: "2",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Cats Hidden in England",
      rating: "4.5",
      release: "11/30/2029",
      slug: "3",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Labyrinth of the Demon King",
      rating: "4.5",
      release: "11/30/2029",
      slug: "5",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "The Legend of Zelda: Breath of the Wild - Islands Expansion",
      rating: "4.5",
      release: "No Release Date",
      slug: "6",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title:
        "The Legend of Zelda: Breath of the Wild - Islands Expansion this is a test game to test if the length being too big will break it this is a test for how long it can be before it breaks lets",
      rating: "4.5",
      release: "11/30/2029",
      slug: "7",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "8",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "9",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "26",
    },
  ];

  return (
    <Grid id={styles.top_rated_list}>
      <Grid>
        {gameList.length !== 0 ? (
          gameList.map((game) => (
            <GameCardButton
              key={game.slug}
              slug={game.slug}
              visibleCard={expandedCard}
              changeVisibleCard={changeVisibleCard}
            >
              <GameCard
                game={game}
                titleRef={(el) => (titleRefs.current[game.slug] = el)}
                cardInfoHeight={
                  game.slug === expandedCard
                    ? titleHeights[game.slug]
                    : undefined
                }
              />
            </GameCardButton>
          ))
        ) : (
          <Typography id={styles.top_rated_not_found}>
            No Games Found
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default TopRatedList;
