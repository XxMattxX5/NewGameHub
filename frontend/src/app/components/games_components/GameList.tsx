"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Typography } from "@mui/material";
import { Game } from "@/app/types";
import GameCardButton from "./GameCardButton";
import GameCard from "./GameCard";
import PageButtons from "@/app/components/global_components/PageButtons";

type Props = {
  gameList: Game[];
  pageAmount: number;
};

const GameList = ({ gameList, pageAmount }: Props) => {
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

  return (
    <Grid id={styles.game_list}>
      <Grid id={styles.game_list_content}>
        <Grid>
          {gameList.length === 0 ? (
            <Typography id={styles.no_games_found}>No Games Found</Typography>
          ) : (
            gameList.map((game) => (
              <GameCardButton
                cardType="default"
                key={game.slug}
                slug={game.slug}
                visibleCard={expandedCard}
                changeVisibleCard={changeVisibleCard}
              >
                <GameCard
                  cardType="default"
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
          )}
        </Grid>
        {pageAmount === 0 ? null : <PageButtons page_amount={pageAmount} />}
      </Grid>
    </Grid>
  );
};

export default GameList;
