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

const GameDetails = () => {
  const game_details: GameDetail = {
    game_id: "33454",
    // cover_image:
    //   "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    // title:
    //   "The Legend of Zelda: Breath of the Wild - Islands Expansion this is a test game to test if the length being too big will break it this is a test for how long it can be before it breaks lets see how far i can go without breaking it completely messing it up",
    // rating: "4.5",
    // release: "11/30/2029",
    // slug: "7",

    cover_image:
      "http://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    title: "Zelda II: Paracosm",
    rating: "4.5",
    release: "11/30/2029",
    slug: "8",
    genres: ["Adventure", "Shooter", "Puzzle"],
    summary: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum
numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium
optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis
obcaecati tenetur iure eius earum ut molestias architecto voluptate aliquam
nihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,
tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,
quia. Quo neque error repudiandae fuga? Ipsa laudantium molestias eos 
sapiente officiis modi at sunt excepturi expedita sint?`,
    videos: [
      { id: "1", src: "https://www.youtube.com/embed/anyE3Mhwh0s" },
      { id: "2", src: "https://www.youtube.com/embed/anyE3Mhwh0s" },
    ],
    screenshots: [
      {
        id: "1",
        src: "http://images.igdb.com/igdb/image/upload/t_original/sc7t6q.jpg",
      },
      {
        id: "2",
        src: "http://images.igdb.com/igdb/image/upload/t_original/sc7t6r.jpg",
      },
    ],
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
          <Typography component={"p"}>{game_details.release}</Typography>
        </Grid>
      </Grid>
      <Grid id={styles.game_details_intro_container}>
        <Grid>
          <Grid id={styles.game_details_cover_container}>
            <Image
              id={styles.game_details_cover_image}
              src={
                game_details.cover_image
                  ? game_details.cover_image
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
                  <Typography component={"p"}>{game_details.rating}</Typography>
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
