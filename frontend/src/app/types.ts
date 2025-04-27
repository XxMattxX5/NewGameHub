export type Game = {
  game_id: string;
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
  rating: number;
  release: string;
  slug: string;
  genres: string[];
  summary: string;
  videos: VideoScreenshot[];
  screenshots: VideoScreenshot[];
};

export type UserInfo = {
  id: number;
  username: string;
  profile_picture: string;
};
