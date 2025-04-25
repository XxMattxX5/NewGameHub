"use client";
import React, { useRef, useState, useEffect } from "react";
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

  const [loading, setLoading] = useState(true);

  const changeVisibleCard = (cardSlug: string) => {
    setExpandedCard(cardSlug);

    if (!titleHeights[cardSlug] && titleRefs.current[cardSlug]) {
      setTitleHeights((prev) => ({
        ...prev,
        [cardSlug]: titleRefs.current[cardSlug]?.offsetHeight || 0,
      }));
    }
  };
  const [gameList, setGameList] = useState<Game[]>([]);

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
          console.log("NOT FOUND");
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
