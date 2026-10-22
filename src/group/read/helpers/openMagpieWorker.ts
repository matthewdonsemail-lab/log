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
 * `account_id`, `cookies` and `proxy` are never used: `log facebook poll` reads in the account's own open
 * browser, its session, proxy and device from Twenty (rules 12, 13, 35). Pure.
 */
import type { GroupPost } from "../types.ts";

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

/** A post the read saw → OpenMagpie's record, or null when it matches none of the terms. Likes and shares aren't read: null. Pure. */
export function recordOf(post: GroupPost, terms: string[]): WorkerRecord | null {
  const matched = termsIn(post.text, terms);
  if (!matched) return null;
  return {
    record_id: post.postId,
    external_id: post.postId,
    group_id: post.groupId,
    content: post.text,
    url: post.permalink || `https://www.facebook.com/groups/${post.groupId}/posts/${post.postId}/`,
    author: { name: post.author.name, id: post.author.id, url: post.author.url },
    occurred_at: post.createdAt,
    metrics: { likes: null, comments: post.commentCount, shares: null },
    matched_terms: matched,
  };
}

/** The posts a poll's read saw as records, newest first, at most `limit`, those matching a term. OpenMagpie dedups repeats. Pure. */
export function recordsOf(posts: GroupPost[], terms: string[], limit: number): WorkerRecord[] {
  return [...posts]
    .sort((a, b) => b.createdTime - a.createdTime)
    .map((p) => recordOf(p, terms))
    .filter((r): r is WorkerRecord => r !== null)
    .slice(0, limit);
}

/**
 * A log-cli code → the code OpenMagpie's `map_worker_error` acts on: a checkpoint, a login wall or a video
 * selfie is `auth_required` (not retried); the rest keep log-cli's own code (retried with backoff). Pure.
 */
export function workerCodeOf(code: string): string {
  return ["checkpointed", "loginWall", "videoSelfieRequired", "sessionExpired", "neverConnected"].includes(code) ? "auth_required" : code;
}

/** Feed scrolls for a poll asking `limit` posts: about three posts a scroll (run 20261022T054544: 16 over the page and 6 scrolls). Pure. */
export const scrollsFor = (limit: number): number => Math.max(1, Math.min(6, Math.ceil(limit / 3)));
