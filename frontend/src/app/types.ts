export type Game = {
  id: string;
  game_id: string;
  cover_image: string;
  title: string;
  rating: string;
  release: string;
  slug: string;
};
export type GameSuggestion = {
  id: string;
  cover_image: string | null;
  title: string;
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

export type RegistrationError = {
  username?: string;
  full_name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
};

export type Theme = "light" | "dark";

export type RecentlyViewedPost = {
  slug: string;
  user_profile_picture: string;
  post_title: string;
};

export type ForumPost = {
  id: string;
  title: string;
  header_image: string;
  user: { id: string; username: string; profile_picture: string };
  game: { id: string; slug: string; title: string; cover_image: string } | null;
  post_type: string;
  content: string;
  created_at: string;
  updated_at: string;
  slug: string;
  like_count: number;
  dislike_count: number;
  views: number;
  comment_count: number;
  user_reaction: string | null;
};

export interface PostComment {
  id: number;
  content: string;
  created_at: string;
  reply_count: number;
  user: UserInfo;
}
