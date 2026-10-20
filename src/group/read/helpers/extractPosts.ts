import type { FeedPage, GroupPost, ReadCursor, RejectReason } from "../types.ts";

/** The feed query, by the name Facebook's client sends it under (`fb_api_req_friendly_name`). */
export const FEED_QUERY = "GroupsCometFeedRegularStoriesPaginationQuery";

type Json = Record<string, unknown>;
const obj = (v: unknown): Json | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const at = (o: unknown, ...keys: (string | number)[]): unknown => keys.reduce<unknown>((v, k) => (Array.isArray(v) ? v[k as number] : obj(v)?.[k as string]), o);

/**
 * The feed units in one response. Facebook streams it: the first chunk holds the first unit
 * at `data.node.group_feed.edges[0].node`, each `$stream` chunk one more at `data.node`, and the
 * last `$defer` chunk `data.page_info` (recorded 2026-10-20). Pure.
 */
function chunksOf(text: string): Json[] {
  const body = text.startsWith("for (;;);") ? text.slice(9) : text;
  const chunks: Json[] = [];
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const chunk = obj(JSON.parse(line));
      if (chunk) chunks.push(chunk);
    } catch {
      // A line cut short: the rest of the response still counts.
    }
  }
  return chunks;
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
  };
}

/** Every post in one feed response, each kept once, and the page's cursor. Pure. */
export function postsFromFeedResponse(text: string, expectedGroupId: string): FeedPage {
  const page: FeedPage = { posts: [], rejected: {}, endCursor: null, hasNextPage: null };
  const seen = new Set<string>();
  for (const chunk of chunksOf(text)) {
    const data = obj(chunk.data);
    const units: unknown[] = [];
    const edges = at(data, "node", "group_feed", "edges");
    if (Array.isArray(edges)) for (const edge of edges) units.push(at(edge, "node"));
    else if (Array.isArray(chunk.path) && chunk.path.includes("edges") && at(data, "node")) units.push(at(data, "node"));
    const info = obj(at(data, "page_info")) ?? obj(at(data, "node", "group_feed", "page_info"));
    if (info) {
      page.endCursor = str(info.end_cursor) || page.endCursor;
      if (typeof info.has_next_page === "boolean") page.hasNextPage = info.has_next_page;
    }
    for (const unit of units) {
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

/** The feed responses a recorded step holds, in the order they came (a HAR's entries). Pure. */
export function feedResponses(har: { log?: { entries?: unknown[] } }): string[] {
  const out: string[] = [];
  for (const entry of har.log?.entries ?? []) {
    const request = obj(at(entry, "request"));
    const form = obj(request?.postData);
    const params = Array.isArray(form?.params) ? (form?.params as Json[]) : [];
    const name = params.find((p) => p.name === "fb_api_req_friendly_name")?.value ?? new URLSearchParams(str(form?.text)).get("fb_api_req_friendly_name");
    if (name !== FEED_QUERY) continue;
    const text = str(at(entry, "response", "content", "text"));
    if (text) out.push(text);
  }
  return out;
}

/**
 * Only the posts newer than the cursor (facebook-camofox-client's `listen.py`: the last post id
 * and the time watermark), newest first, and the cursor after them. The cursor only moves forward. Pure.
 */
export function newPosts(posts: GroupPost[], cursor: ReadCursor): { posts: GroupPost[]; cursor: ReadCursor } {
  const fresh = posts
    .filter((p) => p.postId !== cursor.lastPostId && (cursor.watermark === null || p.createdTime > cursor.watermark))
    .sort((a, b) => b.createdTime - a.createdTime);
  const newest = fresh[0];
  if (!newest) return { posts: [], cursor };
  return { posts: fresh, cursor: { lastPostId: newest.postId, watermark: newest.createdTime } };
}
