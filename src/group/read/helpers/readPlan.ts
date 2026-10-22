import type { CommentPage, FeedPage, GroupComment, GroupPost, ReadCursor } from "../types.ts";
import { commentResponses, commentsFromPostPage, commentsFromResponse } from "./extractComments.ts";
import { feedResponses, postsFromFeedResponse, postsFromGroupPage } from "./extractPosts.ts";
import { documentsOf, groupIdFromPage } from "./json.ts";

type Har = { log?: { entries?: unknown[] } };

/** The menu item that sorts a post's comments newest first, as recorded (run 20261020T151100, step 07). */
export const NEWEST_COMMENTS = "Newest Show all comments with the newest comments first.";

/** A post's own page, the way the recording opened it (`/groups/<id>/permalink/<post>/`). Pure. */
export const postPageOf = (groupId: string, postId: string): string => `https://www.facebook.com/groups/${groupId}/permalink/${postId}/`;

/** The dialog a post's page shows its comments in, by its accessible name ("Jada Seidenberger's post", run 20261020T151100). Pure. */
export const postDialogOf = (post: GroupPost): string => `${post.author.name || "Anonymous member"}'s post`;

/** The group's numeric id from a step's HAR (the group page's own feed), or null. Pure. */
export function groupIdFromStep(har: Har | undefined): string | null {
  for (const html of documentsOf(har ?? {})) {
    const id = groupIdFromPage(html);
    if (id) return id;
  }
  return null;
}

/** Every feed page a step holds: the page's own HTML first (a goto), then each feed query, in order. Pure. */
export function feedPagesOf(har: Har | undefined, groupId: string): FeedPage[] {
  const pages = documentsOf(har ?? {}).map((html) => postsFromGroupPage(html, groupId));
  for (const text of feedResponses(har ?? {})) pages.push(postsFromFeedResponse(text, groupId));
  return pages.filter((p) => p.posts.length || Object.keys(p.rejected).length || Object.keys(p.skipped).length || p.hasNextPage !== null);
}

/** Every comment page a step holds: a post page's HTML first, then each comment query's answer. Pure. */
export function commentPagesOf(har: Har | undefined, groupId: string): CommentPage[] {
  const pages = documentsOf(har ?? {}).map((html) => commentsFromPostPage(html, groupId));
  for (const text of commentResponses(har ?? {})) pages.push(commentsFromResponse(text, groupId));
  return pages;
}

/** Posts merged by id (the later reading wins: its comment count is newer), newest first. Pure. */
export function mergePosts(seen: GroupPost[], more: GroupPost[]): GroupPost[] {
  const byId = new Map(seen.map((p) => [p.postId, p]));
  for (const post of more) byId.set(post.postId, post);
  return [...byId.values()].sort((a, b) => b.createdTime - a.createdTime);
}

/** Comments merged by id, oldest first, as a thread reads. Pure. */
export function mergeComments(seen: GroupComment[], more: GroupComment[]): GroupComment[] {
  const byId = new Map(seen.map((c) => [c.commentId, c]));
  for (const comment of more) byId.set(comment.commentId, comment);
  return [...byId.values()].sort((a, b) => a.createdTime - b.createdTime);
}

/** Counts added together. Pure. */
export function addCounts<K extends string>(into: Partial<Record<K, number>>, more: Partial<Record<K, number>>): Partial<Record<K, number>> {
  const out = { ...into };
  for (const [key, n] of Object.entries(more) as [K, number][]) out[key] = (out[key] ?? 0) + n;
  return out;
}

/** The feed showed a post the last read already had: older than its watermark, or one of the posts at it. Pure. */
export function reachedCursor(posts: GroupPost[], cursor: ReadCursor): boolean {
  if (cursor.watermark === null) return cursor.lastPostId !== null && posts.some((p) => p.postId === cursor.lastPostId);
  const atMark = new Set(cursor.idsAtWatermark ?? (cursor.lastPostId ? [cursor.lastPostId] : []));
  return posts.some((p) => p.createdTime < cursor.watermark! || (p.createdTime === cursor.watermark && atMark.has(p.postId)));
}

/**
 * The posts whose comments this read opens, newest first, at most `max`: any post the feed showed whose
 * comment count grew since its comments were last read (`commentsRead`, 0 for a post never read), and a new
 * post whose count the feed didn't give. A post with no comments is never opened. Pure.
 */
export function commentTargets(seen: GroupPost[], fresh: GroupPost[], commentsRead: Record<string, number>, max: number): GroupPost[] {
  const isFresh = new Set(fresh.map((p) => p.postId));
  return seen
    .filter((p) => (p.commentCount === null ? isFresh.has(p.postId) : p.commentCount > (commentsRead[p.postId] ?? 0)))
    .slice(0, Math.max(0, max));
}
