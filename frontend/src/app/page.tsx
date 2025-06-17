import type { Metadata } from "next";
import styles from "./styles/home.module.css";
import { Grid, Typography, Link } from "@mui/material";
import dynamic from "next/dynamic";
import LoadingSpinner from "./components/global_components/LoadingSpinner";
import Image from "next/image";

const HomeForumSection = dynamic(
  () => import("@/app/components/global_components/HomeForumSection"),
  {
    loading: () => <LoadingSpinner spinnerSize={50} />,
  }
);

export const metadata: Metadata = {
  title: "Your Ultimate Game Database & Community Hub | Game Hub",
  description:
    "Browse a massive library of games, discover your next favorite title, and join lively discussions with passionate gamers. Game Hub is where the gaming community connects.",
};

const Home = () => {
  return (
    <Grid container>
      <Grid className={styles.home_landing_container} container>
        <Grid component={"div"} className={styles.home_landing_box}>
          <Grid className={styles.home_landing_box_content}>
            <Grid>
              <Typography component={"h1"}>
                Your Ultimate
                <br /> <span>Game</span> Database <br />
                And Community <span>Hub</span>
              </Typography>
              <Typography component={"p"}>
                Browse a massive library of games, find new games to play, and
                jump into discussions with a passionate gaming community. Your
                next favorite game—and the people who love it—are waiting.
              </Typography>
              <Link href="/games">
                <Typography>Start Exploring Games</Typography>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Image
          src="/images/home_background.webp"
          alt="Two Game Controllers"
          width={1920}
          height={1200}
          id={styles.home_landing_background_image}
          priority={true}
          unoptimized
        />
      </Grid>
      <Grid className={styles.home_page_main_container}>
        <Grid className={styles.home_page_game_section}>
          <Grid className={styles.home_page_game_section_info}>
            <Typography component={"h2"}>
              Explore Our Vast Library Of Games
            </Typography>
            <Grid>
              <Image
                src="/images/games_image3.png"
                alt="Game Preview"
                width={600}
                height={600}
              />
              <Typography component={"p"}>
                Discover an ever-growing collection of games spanning every
                genre and platform. Whether you're into action-packed
                adventures, immersive RPGs, competitive multiplayer, or casual
                puzzle games, our library has something for everyone. Dive in
                and explore titles from indie gems to blockbuster hits—all in
                one place. With new games added regularly, there's always
                something fresh and exciting to play.
              </Typography>
            </Grid>
            <Link href="/games">
              <Typography>Start Searching Now</Typography>
            </Link>
          </Grid>
          <Grid className={styles.home_page_game_section_image}>
            <picture>
              <source
                media="(max-width: 1100px)"
                srcSet="/images/games_image2.webp"
              />

              <img src="/images/games_image.webp" alt="Game Preview" />
            </picture>
          </Grid>
        </Grid>
        <Grid className={styles.home_page_forum_section}>
          <HomeForumSection />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
