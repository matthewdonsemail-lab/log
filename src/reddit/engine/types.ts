export type RedditBridgeAction = "ping" | "subreddits" | "posts" | "home" | "post" | "create" | "reply" | "vote";

export const REDDIT_BRIDGE_WRITES: readonly RedditBridgeAction[] = ["create", "reply", "vote"];

export type RedditVoteDirection = "up" | "down" | "none";

export interface RedditBridgeRequest {
  action: RedditBridgeAction;
  account: string;
  cookies: Record<string, string>;
  proxy?: string | null;
  query?: string;
  limit?: number;
  subreddit?: string;
  days?: number;
  maxPages?: number;
  readSpacingMs?: [number, number];
  url?: string;
  commentId?: string;
  title?: string;
  text?: string;
  flair?: string;
  direction?: RedditVoteDirection;
  target?: string;
  captchaKey?: string;
}

export interface RedditBridgePost {
  id: string;
  subreddit: string | null;
  title: string;
  author: string | null;
  created: number | null;
  score: number;
  upvoteRatio: number | null;
  comments: number;
  flair: null;
  permalink: string;
  url: string;
  text: string;
  links: string[];
}

export interface RedditBridgeComment {
  id: string;
  author: string | null;
  created: number | null;
  depth: number | null;
  parentId: string | null;
  score: number | null;
  permalink: string;
  text: string;
}

export interface RedditBridgeSubreddit {
  name: string;
  title: string;
  subscribers: number | null;
  activeUsers: number | null;
  created: null;
  about: string;
  over18: boolean | null;
  url: string;
}

export type RedditBridgeAnswer = Record<string, unknown> & { ok: boolean; code?: string; detail?: string };
