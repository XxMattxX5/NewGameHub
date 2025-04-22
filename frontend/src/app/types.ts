export type Game = {
  cover_image: string;
  title: string;
  rating: string;
  release: string;
  slug: string;
};

export type VideoScreenshot = {
  id: string;
  src: string;
};

export type GameDetail = {
  game_id: string;
  cover_image: string;
  title: string;
  rating: string;
  release: string;
  slug: string;
  genres: string[];
  summary: string;
  videos: VideoScreenshot[];
  screenshots: VideoScreenshot[];
};
