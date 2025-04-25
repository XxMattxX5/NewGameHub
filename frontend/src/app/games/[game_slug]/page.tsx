import React from "react";
import { notFound } from "next/navigation";
import { Grid, Typography } from "@mui/material";
import styles from "@/app/styles/gamedetail.module.css";
import { GameDetail, VideoScreenshot } from "@/app/types";
import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/app/components/global_components/LoadingSpinner";

const GameSlideShow = dynamic(
  () => import("@/app/components/games_components/GameSlideShow"),
  {
    ssr: !!false,
    loading: () => <LoadingSpinner spinnerSize={60} />,
  }
);

const getGame = async (slug: string) => {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost";
    const response = await fetch(`${backendUrl}/api/games/${slug}`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      console.log("NOT FOUND");
    } else {
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

const GameDetails = async ({
  params,
}: {
  params: Promise<{ game_slug: string }>;
}) => {
  const { game_slug } = await params;
  const data = await getGame(game_slug);

  if (!data) {
    notFound();
  }
  const game_details: GameDetail = {
    game_id: data.data.game_id,
    cover_image: data.data.cover_image,
    title: data.data.title,
    rating: data.data.rating ?? 0,
    release: data.data.release ?? "No Release Date",
    slug: data.data.slug,
    genres: data.data.genres.map((genre: { name: string }) => genre.name),
    summary: data.data.storyline
      ? data.data.storyline
      : data.data.summary
      ? data.data.summary
      : "No Summary",
    videos: data.videos,
    screenshots: data.screenshots,
  };

  const getGameVideo = () => {
    if (game_details.videos.length > 0) {
      return game_details.videos[0].src;
    }
    return "https://www.youtube.com/embed/YZ0Qbemz4lI";
  };

  return (
    <Grid container id={styles.game_details_container}>
      <Grid id={styles.game_details_title_date}>
        <Grid>
          <Typography component={"h1"}>{game_details.title}</Typography>
          <Typography component={"p"}>
            {game_details.release
              ? new Date(game_details.release).toLocaleDateString()
              : "No Release Date"}
          </Typography>
        </Grid>
      </Grid>
      <Grid id={styles.game_details_intro_container}>
        <Grid>
          <Grid id={styles.game_details_cover_container}>
            <Image
              id={styles.game_details_cover_image}
              src={
                game_details.cover_image
                  ? "https://" + game_details.cover_image
                  : "/images/no_image_found.webp"
              }
              height={400}
              width={300}
              alt={`${game_details.title} cover`}
            />
            <iframe
              key={game_details.game_id}
              src={getGameVideo()}
              title={`${game_details.title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              width={600}
              height={400}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid id={styles.game_details_detail_container}>
        <Typography component={"h2"}>Game Details</Typography>
        <Grid>
          <Grid id={styles.game_details_genre_rating_container}>
            <Grid id={styles.game_details_genre}>
              <Grid>
                <Typography component={"h3"}>Genres</Typography>
                <Grid>
                  {game_details.genres.map((gen) => (
                    <Typography key={gen}>{gen}</Typography>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid id={styles.game_details_rating}>
              <Grid>
                <Typography component={"h3"}>Rating</Typography>
                <Grid>
                  <StarIcon />
                  <Typography component={"p"}>
                    {game_details.rating === 0 ? "N/A" : game_details.rating}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid id={styles.game_details_summary}>
            <Typography component={"h3"}>Summary/Storyline</Typography>
            <Typography component={"p"}>{game_details.summary}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid id={styles.game_details_video_screenshots}>
        <Typography component={"h2"}>Videos And Screenshots</Typography>
        <Grid>
          <GameSlideShow
            videos={game_details.videos}
            screenshots={game_details.screenshots}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default GameDetails;
