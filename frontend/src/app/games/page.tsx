import { Metadata } from "next";
import { Grid, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import styles from "../styles/games.module.css";
import LoadingSpinner from "../components/global_components/LoadingSpinner";

const SearchBar = dynamic(
  () => import("../components/global_components/SearchBar"),
  {
    ssr: !!false,
  }
);

const TopRatedList = dynamic(
  () => import("../components/games_components/TopRatedList"),
  {
    ssr: !!false,
    loading: () => <LoadingSpinner spinnerSize={60} />,
  }
);

const GameList = dynamic(
  () => import("../components/games_components/GameList"),
  {
    ssr: !!false,
    loading: () => <LoadingSpinner spinnerSize={100} />,
  }
);

export const metadata: Metadata = {
  title: "Game Hub - Explore Games",
  description:
    "Search through our game libray to discover new games and learn more about them",
};

const fetchGames = async (
  q?: string,
  s?: string,
  g?: string,
  page?: string
) => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (s) params.set("s", s);
  if (g) params.set("g", g);

  if (page) params.set("page", page);

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost";
    const response = await fetch(
      `${backendUrl}/api/games/game_list?${params.toString()}`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      console.log("NOT FOUND");

      return { genres: [], data: [], pages: 0 };
    } else {
      return { genres: [], data: [], pages: 0 };
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return { genres: [], data: [], pages: 0 };
  }
};

const Games = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q: string;
    s: string;
    g: string;
    page: string;
  }>;
}) => {
  const { q, s, g, page } = await searchParams;
  const data = await fetchGames(q, s, g, page);

  return (
    <>
      <SearchBar genreList={data.genres} />
      <Grid container id={styles.games_container}>
        <Typography variant="h1" id={styles.games_page_header}>
          Explore Our Library of Games
        </Typography>
        <Grid>
          <Grid id={styles.top_rated_container}>
            <Typography variant="h2" id={styles.top_rated_header}>
              Top Rated Games
            </Typography>
            <Grid>
              <TopRatedList />
            </Grid>
          </Grid>
          <Grid id={styles.game_list_container}>
            <GameList gameList={data.data} pageAmount={data.pages} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Games;
