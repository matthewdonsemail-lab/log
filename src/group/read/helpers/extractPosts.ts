import type { FeedPage, GroupPost, ReadCursor, RejectReason } from "../types.ts";
import { at, chunksOf, embeddedResults, type Json, obj, responsesOf, str } from "./json.ts";

/** The feed query, by the name Facebook's client sends it under (`fb_api_req_friendly_name`). */
export const FEED_QUERY = "GroupsCometFeedRegularStoriesPaginationQuery";

/** Where a feed unit carries the post's comment count (run 20261020T143506). */
const COMMENT_COUNT_PATH = ["comet_sections", "feedback", "story", "story_ufi_container", "story", "feedback_context", "feedback_target_with_context", "comment_rendering_instance", "comments", "total_count"] as const;

/** The comment count the feed showed for a unit, or null when it had none. Pure. */
export function commentCountOf(unit: unknown): number | null {
  const count = at(unit, ...COMMENT_COUNT_PATH);
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

/** One feed unit → a post, or why not (facebook-camofox-client's `validate_identity`: rejected, never filled in). Pure. */
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

/**
 * The posts in a run of feed chunks. Facebook streams the feed: the first chunk holds the first unit
 * under `group_feed.edges`, each `$stream` chunk one more at `data.node`, and the last `$defer` chunk
 * `data.page_info` (recorded 2026-10-20). The feed sits under `data.node` in the query's answer and under
 * `data.group` in the group page's HTML; a unit that isn't a `Story` (the "New posts" `GroupsSectionHeaderUnit`
 * the page starts with, run 20261020T143506) is not a post: counted in `skipped`, never rejected. Pure.
 */
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

/** Every post in one feed response, each kept once, and the page's cursor. Pure. */
export function postsFromFeedResponse(text: string, expectedGroupId: string): FeedPage {
  return pageOf(chunksOf(text), expectedGroupId);
}

/**
 * The first posts, which the group page carries in its own HTML before any feed query: its JSON script
 * blocks hold `__bbox.result`s in the query's chunk shapes (the first unit under `data.group.group_feed`,
 * `$stream` chunks, the `$defer` page_info), recorded 2026-10-20 (run 20261020T143506). Pure.
 */
export function postsFromGroupPage(html: string, expectedGroupId: string): FeedPage {
  const chunks = embeddedResults(html).filter((r) => at(r, "data", "group", "group_feed") || str(r.label).includes("group_feed"));
  return pageOf(chunks, expectedGroupId);
}

/** The feed responses a recorded step holds, in the order they came (a HAR's entries). Pure. */
export function feedResponses(har: { log?: { entries?: unknown[] } }): string[] {
  return responsesOf(har, [FEED_QUERY]);
}

/**
 * Only the posts newer than the cursor (facebook-camofox-client's `listen.py`: the last post id
 * and the time watermark), newest first, and the cursor after them. Posts can share a second (run
 * 20261020T143506 had five in 30 s), so one at the watermark's second is new unless the cursor already
 * holds its id. The cursor only moves forward. Pure.
 */
export function newPosts(posts: GroupPost[], cursor: ReadCursor): { posts: GroupPost[]; cursor: ReadCursor } {
  const atMark = new Set(cursor.idsAtWatermark ?? (cursor.lastPostId ? [cursor.lastPostId] : []));
  const fresh = posts
    .filter((p) => cursor.watermark === null || p.createdTime > cursor.watermark || (p.createdTime === cursor.watermark && !atMark.has(p.postId)))
    .filter((p) => cursor.watermark !== null || p.postId !== cursor.lastPostId)
    .sort((a, b) => b.createdTime - a.createdTime);
  const newest = fresh[0];
  if (!newest) return { posts: [], cursor };
  const sameSecond = fresh.filter((p) => p.createdTime === newest.createdTime).map((p) => p.postId);
  const ids = newest.createdTime === cursor.watermark ? [...atMark, ...sameSecond] : sameSecond;
  return { posts: fresh, cursor: { lastPostId: newest.postId, watermark: newest.createdTime, idsAtWatermark: ids } };
}
