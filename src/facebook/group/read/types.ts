import type { ErrorCode } from "../../../errors/catalog/index.ts";

export interface GroupPost {
  postId: string;
  groupId: string;
  createdTime: number;
  createdAt: string;
  author: { id: string; name: string; url: string };
  text: string;
  permalink: string;
  feedbackId: string;
  commentCount: number | null;
}

export type RejectReason = "missingPostId" | "missingGroup" | "wrongGroup" | "missingCreationTime";

export interface FeedPage {
  posts: GroupPost[];
  rejected: Partial<Record<RejectReason, number>>;
  skipped: Record<string, number>;
  endCursor: string | null;
  hasNextPage: boolean | null;
}

export interface GroupComment {
  commentId: string;
  postId: string;
  groupId: string;
  parentCommentId: string | null;
  depth: number;
  createdTime: number;
  createdAt: string;
  author: { id: string; name: string; url: string; anonymous: boolean };
  text: string;
  permalink: string;
  feedbackId: string;
  replyCount: number;
}

export type CommentRejectReason = "missingCommentId" | "missingPost" | "missingGroup" | "wrongGroup" | "missingCreationTime";

export interface CommentPage {
  comments: GroupComment[];
  rejected: Partial<Record<CommentRejectReason, number>>;
  endCursor: string | null;
  hasNextPage: boolean | null;
}

export interface ReadCursor {
  lastPostId: string | null;
  watermark: number | null;
  idsAtWatermark?: string[];
  seenIds?: string[];
}

export interface ReadStepInput {
  action: "goto" | "scroll" | "scrollIn" | "clickRole";
  args: string[];
}

export interface ReadStepReply {
  ok: boolean;
  error?: string;
  url?: string;
  title?: string;
  folder?: string;
  har?: { log?: { entries?: unknown[] } };
}

export interface GroupReadInput {
  account: string;
  group: { key: string; url: string; facebookGroupId: string | null };
  cursor: ReadCursor;
  commentsRead: Record<string, number>;
  maxScrolls: number;
  maxCommentPosts: number;
  live: boolean;
}

export interface CommentRead {
  postId: string;
  commentCount: number | null;
  comments: number;
  problem: string | null;
}

export interface GroupReadContext extends GroupReadInput {
  groupId: string | null;
  seen: GroupPost[];
  rejected: Partial<Record<RejectReason, number>>;
  skipped: Record<string, number>;
  scrolls: number;
  hasNextPage: boolean | null;
  reachedCursor: boolean;
  feedDone: boolean;
  fresh: GroupPost[];
  cursorAfter: ReadCursor;
  targets: GroupPost[];
  index: number;
  commentScrolls: number;
  pageComments: GroupComment[];
  commentHasNext: boolean | null;
  postProblem: string | null;
  comments: GroupComment[];
  commentReads: CommentRead[];
  problem: { code: ErrorCode; detail: string } | null;
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[];
}

export interface GroupReadOutput {
  account: string;
  groupId: string | null;
  result: "read" | "stopped";
  posts: GroupPost[];
  seen: GroupPost[];
  comments: GroupComment[];
  commentReads: CommentRead[];
  cursor: ReadCursor;
  feedDone: boolean;
  reachedCursor: boolean;
  gap: boolean;
  rejected: Partial<Record<RejectReason, number>>;
  skipped: Record<string, number>;
  problem: { code: ErrorCode; detail: string } | null;
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[];
}
