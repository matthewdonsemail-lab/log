import type { FeedPage, GroupPost, ReadCursor, RejectReason } from "../types.ts";
import { at, chunksOf, embeddedResults, type Json, obj, responsesOf, str } from "./json.ts";

export const FEED_QUERY = "GroupsCometFeedRegularStoriesPaginationQuery";

const COMMENT_COUNT_PATH = ["comet_sections", "feedback", "story", "story_ufi_container", "story", "feedback_context", "feedback_target_with_context", "comment_rendering_instance", "comments", "total_count"] as const;

export function commentCountOf(unit: unknown): number | null {
  const count = at(unit, ...COMMENT_COUNT_PATH);
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

export function postOf(unit: unknown, expectedGroupId: string): GroupPost | RejectReason {
  const story = at(unit, "comet_sections", "content", "story");
  const postId = str(at(unit, "post_id")) || str(at(story, "post_id"));
  if (!postId) return "missingPostId";
  const groupId = str(at(story, "target_group", "id"));
  if (!groupId) return "missingGroup";
  if (groupId !== expectedGroupId) return "wrongGroup";
  const created = at(unit, "creation_time") ?? at(unit, "comet_sections", "timestamp", "story", "creation_time");
  if (typeof created !== "number" || !Number.isFinite(created)) return "missingCreationTime";
  const actor = at(story, "actors", 0);
  return {
    postId,
    groupId,
    createdTime: created,
    createdAt: new Date(created * 1000).toISOString(),
    author: { id: str(at(actor, "id")), name: str(at(actor, "name")), url: str(at(actor, "url")) },
    text: str(at(story, "message", "text")),
    permalink: str(at(story, "wwwURL")),
    feedbackId: str(at(story, "feedback", "id")),
    commentCount: commentCountOf(unit),
  };
}

function pageOf(chunks: Json[], expectedGroupId: string): FeedPage {
  const page: FeedPage = { posts: [], rejected: {}, skipped: {}, endCursor: null, hasNextPage: null };
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const data = obj(chunk.data);
    const feed = at(data, "node", "group_feed") ?? at(data, "group", "group_feed");
    const units: unknown[] = [];
    const edges = at(feed, "edges");
    if (Array.isArray(edges)) for (const edge of edges) units.push(at(edge, "node"));
    else if (Array.isArray(chunk.path) && chunk.path.includes("edges") && at(data, "node")) units.push(at(data, "node"));
    const info = obj(at(data, "page_info")) ?? obj(at(feed, "page_info"));
    if (info) {
      page.endCursor = str(info.end_cursor) || page.endCursor;
      if (typeof info.has_next_page === "boolean") page.hasNextPage = info.has_next_page;
    }
    for (const unit of units) {
      const type = str(at(unit, "__typename"));
      if (type && type !== "Story") {
        page.skipped[type] = (page.skipped[type] ?? 0) + 1;
        continue;
      }
      const post = postOf(unit, expectedGroupId);
      if (typeof post === "string") page.rejected[post] = (page.rejected[post] ?? 0) + 1;
      else if (!seen.has(post.postId)) {
        seen.add(post.postId);
        page.posts.push(post);
      }
    }
  }
  return page;
}

export function postsFromFeedResponse(text: string, expectedGroupId: string): FeedPage {
  return pageOf(chunksOf(text), expectedGroupId);
}

export function postsFromGroupPage(html: string, expectedGroupId: string): FeedPage {
  const chunks = embeddedResults(html).filter((r) => at(r, "data", "group", "group_feed") || str(r.label).includes("group_feed"));
  return pageOf(chunks, expectedGroupId);
}

export function feedResponses(har: { log?: { entries?: unknown[] } }): string[] {
  return responsesOf(har, [FEED_QUERY]);
}

export const SEEN_IDS_KEPT = 500;

export function seenBy(cursor: ReadCursor): (post: GroupPost) => boolean {
  const atMark = new Set(cursor.idsAtWatermark ?? (cursor.lastPostId ? [cursor.lastPostId] : []));
  if (cursor.seenIds) {
    const known = new Set([...cursor.seenIds, ...atMark]);
    return (post) => known.has(post.postId);
  }
  return (post) =>
    post.postId === cursor.lastPostId ||
    (cursor.watermark !== null && (post.createdTime < cursor.watermark || (post.createdTime === cursor.watermark && atMark.has(post.postId))));
}

export function newPosts(posts: GroupPost[], cursor: ReadCursor): { posts: GroupPost[]; cursor: ReadCursor } {
  const seen = seenBy(cursor);
  const byTime = [...posts].sort((a, b) => b.createdTime - a.createdTime);
  const fresh = byTime.filter((p) => !seen(p));
  const read = byTime.map((p) => p.postId);
  const before = cursor.seenIds ?? [...(cursor.idsAtWatermark ?? []), ...(cursor.lastPostId ? [cursor.lastPostId] : [])];
  const seenIds = [...new Set([...read, ...before])].slice(0, SEEN_IDS_KEPT);
  const newest = byTime[0];
  if (!newest || (cursor.watermark !== null && newest.createdTime < cursor.watermark)) return { posts: fresh, cursor: { ...cursor, seenIds } };
  const sameSecond = byTime.filter((p) => p.createdTime === newest.createdTime).map((p) => p.postId);
  const atMark = newest.createdTime === cursor.watermark ? [...new Set([...(cursor.idsAtWatermark ?? []), ...sameSecond])] : sameSecond;
  return { posts: fresh, cursor: { lastPostId: newest.postId, watermark: newest.createdTime, idsAtWatermark: atMark, seenIds } };
}
