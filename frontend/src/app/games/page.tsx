import { Metadata } from "next";
import { Grid, Typography } from "@mui/material";
import styles from "../styles/games.module.css";
import SearchBar from "../components/global_components/SearchBar";
import TopRatedList from "../components/games_components/TopRatedList";
import GameList from "../components/games_components/GameList";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    q: string;
    s: string;
    g: string;
    page: string;
  }>;
}) {
  const metadata: Metadata = {
    title: "Game Hub - Explore Games",
    description:
      "Search through our game library to discover new games and learn more about them",
  };

  return metadata;
}

/**
 * Fetches a list of games from the backend based on optional query parameters.
 *
 * This function sends a GET request to the `/api/games` endpoint with optional search,
 * sorting, genre filtering, and pagination.
 *
 */
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

/**
 * Games server component that renders a list of games based on search parameters.
 *
 * This component is responsible for:
 * - Awaiting the `searchParams` which includes query parameters for filtering and sorting.
 * - Fetching the game data from the backend using `fetchGames`.
 * - Passing the data to the appropriate child components for rendering (not shown in snippet).
 *
 */
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
      <SearchBar searchType="game" genreList={data.genres} />
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
