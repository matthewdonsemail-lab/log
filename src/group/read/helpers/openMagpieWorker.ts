/**
 * OpenMagpie's `facebook_group` worker contract (obris-dev/openmagpie#178, #188), at the boundary:
 * its connector (`apps/core/sources/connectors/facebook/client.py`) runs the script at
 * `FACEBOOK_WORKER_PATH` with one JSON request on stdin and reads one JSON answer on stdout.
 *
 *   in   { action: "groups.search", params: { group_ids, terms, limit }, account_id, cookies, proxy }
 *   out  { ok: true, result: { results: [record…] }, new_cookies }
 *        { ok: false, code, error }
 *
 * A record is its `NewFacebookPostPayload.from_record` shape: `external_id`, `group_id`, `content`,
 * `url`, `author { name, id, url }`, `occurred_at`, `metrics { likes, comments, shares }`,
 * `matched_terms`. Its snake_case names are OpenMagpie's, kept as they are at the boundary only.
 * `account_id`, `cookies` and `proxy` are never used: the answer comes from Twenty, which the host
 * fills from each account's own browser (rules 12, 13, 35). Pure.
 */
import type { TwentyObjects } from "../../../twenty/graphql/index.ts";

type PostRow = TwentyObjects["agencyGroupPosts"]["row"];

export interface WorkerRequest {
  groupIds: string[];
  terms: string[];
  limit: number;
}

export interface WorkerRecord {
  record_id: string;
  external_id: string;
  group_id: string;
  content: string;
  url: string;
  author: { name: string; id: string; url: string };
  occurred_at: string;
  metrics: { likes: number | null; comments: number | null; shares: number | null };
  matched_terms: string[];
}

export type WorkerAnswer =
  | { ok: true; result: { results: WorkerRecord[]; errors: { group_id: string; code: string; error: string }[] }; new_cookies: [] }
  | { ok: false; code: string; error: string };

/** OpenMagpie's default `count`, and the most a request may ask for. */
export const WORKER_DEFAULT_LIMIT = 20;
export const WORKER_MAX_LIMIT = 100;

/** The request's JSON → what log-cli reads, or why not. Only `groups.search` is answered. Pure. */
export function parseWorkerRequest(text: string): WorkerRequest | { code: string; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { code: "bad_request", error: "the request is not JSON" };
  }
  const request = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (request.action !== "groups.search") return { code: "unsupported_action", error: `log-cli answers groups.search, not ${JSON.stringify(request.action)}` };
  const params = request.params && typeof request.params === "object" ? (request.params as Record<string, unknown>) : {};
  const groupIds = Array.isArray(params.group_ids) ? params.group_ids.map((id) => String(id).trim()).filter(Boolean) : [];
  if (!groupIds.length) return { code: "bad_request", error: "params.group_ids is empty" };
  const bad = groupIds.find((id) => !/^\d+$/.test(id));
  if (bad) return { code: "bad_request", error: `group id "${bad}" is not Facebook's numeric group id` };
  const terms = Array.isArray(params.terms) ? params.terms.map((t) => String(t).trim()).filter(Boolean) : [];
  const limit = typeof params.limit === "number" && Number.isInteger(params.limit) && params.limit > 0 ? Math.min(params.limit, WORKER_MAX_LIMIT) : WORKER_DEFAULT_LIMIT;
  return { groupIds: [...new Set(groupIds)], terms, limit };
}

/** The terms a text contains, case-insensitively; with no terms, every text matches with none. Pure. */
export function termsIn(text: string, terms: string[]): string[] | null {
  if (!terms.length) return [];
  const lower = text.toLowerCase();
  const found = terms.filter((t) => lower.includes(t.toLowerCase()));
  return found.length ? found : null;
}

/** A saved post → OpenMagpie's record, or null when it matches none of the terms. Likes and shares aren't read: null. Pure. */
export function recordOf(post: PostRow, groupId: string, terms: string[]): WorkerRecord | null {
  const matched = termsIn(post.text ?? "", terms);
  if (!matched || !post.facebookPostId) return null;
  return {
    record_id: post.facebookPostId,
    external_id: post.facebookPostId,
    group_id: groupId,
    content: post.text ?? "",
    url: post.permalink || `https://www.facebook.com/groups/${groupId}/posts/${post.facebookPostId}/`,
    author: { name: post.authorName ?? "", id: post.authorFacebookId ?? "", url: post.authorUrl ?? "" },
    occurred_at: post.postedAt ?? "",
    metrics: { likes: null, comments: typeof post.commentCount === "number" ? post.commentCount : null, shares: null },
    matched_terms: matched,
  };
}

/** The group's newest saved posts as records, newest first, at most `limit`. Pure. */
export function recordsOf(posts: PostRow[], groupId: string, terms: string[], limit: number): WorkerRecord[] {
  return [...posts]
    .sort((a, b) => String(b.postedAt ?? "").localeCompare(String(a.postedAt ?? "")))
    .map((p) => recordOf(p, groupId, terms))
    .filter((r): r is WorkerRecord => r !== null)
    .slice(0, limit);
}

/** A group's posts across its rows (the same group on two accounts), each once: the later reading wins. Pure. */
export function uniquePosts(posts: PostRow[]): PostRow[] {
  const byId = new Map<string, PostRow>();
  for (const post of posts) if (post.facebookPostId) byId.set(post.facebookPostId, post);
  return [...byId.values()];
}

/** No host has read a group in this long: the answer says so, beside the posts it has. */
export const STALE_AFTER_MS = 3 * 60 * 60_000;

/** Whether the group's posts are current: never read by any account, or not for STALE_AFTER_MS; null when they are. Pure. */
export function readFreshness(lastReadAts: (string | null)[], now: Date): { code: "groupNotReadYet" | "groupReadStale"; detail: string } | null {
  const times = lastReadAts.filter((t): t is string => Boolean(t)).map((t) => Date.parse(t)).filter(Number.isFinite);
  if (!times.length) return { code: "groupNotReadYet", detail: "no host has read it yet (log host start --account <a>, an account in it)" };
  const last = Math.max(...times);
  if (now.getTime() - last > STALE_AFTER_MS) return { code: "groupReadStale", detail: `last read ${new Date(last).toISOString().slice(0, 16)}Z; is its account's host running?` };
  return null;
}
