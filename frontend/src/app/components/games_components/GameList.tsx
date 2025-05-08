"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Typography } from "@mui/material";
import { Game } from "@/app/types";
import GameCardButton from "./GameCardButton";
// import GameCard from "./GameCard";
import PageButtons from "@/app/components/global_components/PageButtons";
import dynamic from "next/dynamic";

const GameCard = dynamic(() => import("./GameCard"), {
  ssr: true,
});

type Props = {
  gameList: Game[];
  pageAmount: number;
};

/**
 * GameList component that displays a list of games and handles expanding cards.
 *
 * The component renders a list of `GameCardButton` components containing game details.
 * It also tracks the expanded card for showing additional details and updates the scroll position when the list changes.
 *
 */
const GameList = ({ gameList, pageAmount }: Props) => {
  // State to track the currently expanded card
  const [expandedCard, setExpandedCard] = useState<null | string>(null);

  // Ref to hold the references for each game's title element
  const titleRefs = useRef<{ [slug: string]: HTMLDivElement | null }>({});

  // State to store the height of each game title for managing card expansion
  const [titleHeights, setTitleHeights] = useState<{ [slug: string]: number }>(
    {}
  );

  // Scrolls to the top of the page when the list of games changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameList]);

  // Function to update the expanded card and store its title height
  const changeVisibleCard = (cardSlug: string | null) => {
    setExpandedCard(cardSlug);

    if (cardSlug) {
      // Store the height of the title element if not already stored
      if (!titleHeights[cardSlug] && titleRefs.current[cardSlug]) {
        setTitleHeights((prev) => ({
          ...prev,
          [cardSlug]: titleRefs.current[cardSlug]?.offsetHeight || 0,
        }));
      }
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
        {/* Conditionally render pagination buttons */}

        {pageAmount === 0 ? null : (
          <Grid
            sx={{
              maxWidth: "600px",
              margin: "0px auto !important",
              marginTop: "30px !important",
            }}
          >
            <PageButtons page_amount={pageAmount} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default GameList;
