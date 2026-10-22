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

export const WORKER_DEFAULT_LIMIT = 20;
export const WORKER_MAX_LIMIT = 100;

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

export function termsIn(text: string, terms: string[]): string[] | null {
  if (!terms.length) return [];
  const lower = text.toLowerCase();
  const found = terms.filter((t) => lower.includes(t.toLowerCase()));
  return found.length ? found : null;
}

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

export function recordsOf(posts: GroupPost[], terms: string[], limit: number): WorkerRecord[] {
  return [...posts]
    .sort((a, b) => b.createdTime - a.createdTime)
    .map((p) => recordOf(p, terms))
    .filter((r): r is WorkerRecord => r !== null)
    .slice(0, limit);
}

export function workerCodeOf(code: string): string {
  return ["checkpointed", "loginWall", "videoSelfieRequired", "sessionExpired", "neverConnected"].includes(code) ? "auth_required" : code;
}

export const scrollsFor = (limit: number): number => Math.max(1, Math.min(6, Math.ceil(limit / 3)));
