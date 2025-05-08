"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "../../styles/games.module.css";
import { Grid, Typography } from "@mui/material";
import { Game } from "@/app/types";
import GameCardButton from "./GameCardButton";
import GameCard from "./GameCard";

/**
 * TopRatedList component that displays a list of top-rated games in an interactive format.
 *
 * This component maintains which game card is currently expanded and uses `titleRefs` to measure the
 * height of each game title when expanded. The measurements are stored in `titleHeights` to dynamically
 * adjust the UI and ensure correct card positioning.
 *
 * State:
 * - `expandedCard`: Tracks the slug of the currently expanded game card or `null` if none is expanded.
 * - `titleRefs`: Stores references to each game's title div for measuring height.
 * - `titleHeights`: Stores the calculated height for each game title (by slug) to apply dynamic styling.
 *
 */
const TopRatedList = () => {
  const [expandedCard, setExpandedCard] = useState<null | string>(null);
  const titleRefs = useRef<{ [slug: string]: HTMLDivElement | null }>({});
  const [titleHeights, setTitleHeights] = useState<{ [slug: string]: number }>(
    {}
  );
  const [gameList, setGameList] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Changes which card is visible and becomes a link
  const changeVisibleCard = (cardSlug: string | null) => {
    setExpandedCard(cardSlug);

    if (cardSlug) {
      if (!titleHeights[cardSlug] && titleRefs.current[cardSlug]) {
        setTitleHeights((prev) => ({
          ...prev,
          [cardSlug]: titleRefs.current[cardSlug]?.offsetHeight || 0,
        }));
      }
    }
  };

  // Fetches a list of top_rated games from the backend sets them to the gameList useState variable
  useEffect(() => {
    const fetchTopRatedGames = async () => {
      try {
        const response = await fetch(`/api/games/top_rated_list`, {
          method: "GET",
          cache: "no-cache",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          response.json().then((data) => {
            setGameList(data.data);
            setLoading(false);
          });
        } else if (response.status === 404) {
          setLoading(false);
          return;
        } else {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
        return;
      }
    };
    fetchTopRatedGames();
  }, []);

  return (
    <Grid id={styles.top_rated_list}>
      <Grid>
        {/* Displays a list of game card components as long as gameList isn't empty and the component isn't loading */}
        {!loading && gameList.length !== 0 ? (
          gameList.map((game) => (
            <GameCardButton
              cardType="top_rated"
              key={game.slug}
              slug={game.slug}
              visibleCard={expandedCard}
              changeVisibleCard={changeVisibleCard}
            >
              <GameCard
                game={game}
                cardType="top_rated"
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
