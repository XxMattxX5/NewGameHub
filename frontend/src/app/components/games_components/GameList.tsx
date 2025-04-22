"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Typography } from "@mui/material";
import { Game } from "@/app/types";
import GameCardButton from "./GameCardButton";
import GameCard from "./GameCard";
import PageButtons from "@/app/components/global_components/PageButtons";

const GameList = () => {
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
  let gameList: Game[] = [
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
      title: "Memoreum",
      rating: "4.5",
      release: "11/30/2029",
      slug: "4",
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
        "The Legend of Zelda: Breath of the Wild - Islands Expansion this is a test game to test if the length being too big will break it this is a test for how long it can be before it breaks lets see how far i can go without breaking it completely messing it up",
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
      slug: "10",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "No Release Date",
      slug: "11",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "12",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "13",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "14",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "15",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "No Release Date",
      slug: "16",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "17",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "18",
    },
    {
      cover_image:
        "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      title: "Zelda II: Paracosm",
      rating: "4.5",
      release: "11/30/2029",
      slug: "19",
    },
  ];

  let page_amount = 100;

  return (
    <Grid id={styles.game_list}>
      <Grid id={styles.game_list_content}>
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
            <Typography id={styles.no_games_found}>No Games Found</Typography>
          )}
        </Grid>
        <PageButtons page_amount={page_amount} />
      </Grid>
    </Grid>
  );
};

export default GameList;
