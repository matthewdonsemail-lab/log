import type { CommentPage, FeedPage, GroupComment, GroupPost, ReadCursor } from "../types.ts";
import { commentResponses, commentsFromPostPage, commentsFromResponse } from "./extractComments.ts";
import { feedResponses, postsFromFeedResponse, postsFromGroupPage, seenBy } from "./extractPosts.ts";
import { documentsOf, groupIdFromPage } from "./json.ts";

type Har = { log?: { entries?: unknown[] } };

export const NEWEST_COMMENTS = "Newest Show all comments with the newest comments first.";

export const postPageOf = (groupId: string, postId: string): string => `https://www.facebook.com/groups/${groupId}/permalink/${postId}/`;

export const postDialogOf = (post: GroupPost): string => `${post.author.name || "Anonymous member"}'s post`;

export function groupIdFromStep(har: Har | undefined): string | null {
  for (const html of documentsOf(har ?? {})) {
    const id = groupIdFromPage(html);
    if (id) return id;
  }
  return null;
}

export function feedPagesOf(har: Har | undefined, groupId: string): FeedPage[] {
  const pages = documentsOf(har ?? {}).map((html) => postsFromGroupPage(html, groupId));
  for (const text of feedResponses(har ?? {})) pages.push(postsFromFeedResponse(text, groupId));
  return pages.filter((p) => p.posts.length || Object.keys(p.rejected).length || Object.keys(p.skipped).length || p.hasNextPage !== null);
}

export function commentPagesOf(har: Har | undefined, groupId: string): CommentPage[] {
  const pages = documentsOf(har ?? {}).map((html) => commentsFromPostPage(html, groupId));
  for (const text of commentResponses(har ?? {})) pages.push(commentsFromResponse(text, groupId));
  return pages;
}

export function mergePosts(seen: GroupPost[], more: GroupPost[]): GroupPost[] {
  const byId = new Map(seen.map((p) => [p.postId, p]));
  for (const post of more) byId.set(post.postId, post);
  return [...byId.values()].sort((a, b) => b.createdTime - a.createdTime);
}

export function mergeComments(seen: GroupComment[], more: GroupComment[]): GroupComment[] {
  const byId = new Map(seen.map((c) => [c.commentId, c]));
  for (const comment of more) byId.set(comment.commentId, comment);
  return [...byId.values()].sort((a, b) => a.createdTime - b.createdTime);
}

export function addCounts<K extends string>(into: Partial<Record<K, number>>, more: Partial<Record<K, number>>): Partial<Record<K, number>> {
  const out = { ...into };
  for (const [key, n] of Object.entries(more) as [K, number][]) out[key] = (out[key] ?? 0) + n;
  return out;
}

export const STOP_AFTER_SEEN = 3;

export function reachedCursor(posts: GroupPost[], cursor: ReadCursor): boolean {
  const seen = seenBy(cursor);
  const count = posts.filter(seen).length;
  if (!cursor.seenIds) return count > 0;
  const known = new Set([...cursor.seenIds, ...(cursor.idsAtWatermark ?? []), ...(cursor.lastPostId ? [cursor.lastPostId] : [])]).size;
  return count > 0 && count >= Math.min(STOP_AFTER_SEEN, known);
}

export function commentTargets(seen: GroupPost[], fresh: GroupPost[], commentsRead: Record<string, number>, max: number): GroupPost[] {
  const isFresh = new Set(fresh.map((p) => p.postId));
  return seen
    .filter((p) => (p.commentCount === null ? isFresh.has(p.postId) : p.commentCount > (commentsRead[p.postId] ?? 0)))
    .slice(0, Math.max(0, max));
}
