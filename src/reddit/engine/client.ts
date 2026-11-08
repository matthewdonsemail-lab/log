import { RedditClient, RedditLoginError } from "../../../vendor/reverseChud/src/index.ts";
import type { RedditComment, RedditFeedPost, RedditPost } from "../../../vendor/reverseChud/src/index.ts";
import { TwoCaptchaRecaptchaSolver, twoCaptchaKey } from "../../captcha/twoCaptchaToken/index.ts";
import type { RedditBridgeAnswer, RedditBridgeComment, RedditBridgePost, RedditBridgeRequest, RedditBridgeSubreddit, RedditVoteDirection } from "./types.ts";

const ORIGIN = "https://www.reddit.com";
const DEFAULT_SPACING_MS: [number, number] = [800, 2500];
const MAX_PAGES = 20;
const LINK = /https?:\/\/[^\s)\]>"'|]+/gi;
const HREF = /href="(https?:\/\/[^"]+)"/gi;

export interface RedditBridgeDeps {
  resume: (request: RedditBridgeRequest) => Promise<RedditClient>;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
}

export const redditBridgeDeps: RedditBridgeDeps = {
  resume: (request) =>
    RedditClient.resume({
      state: { version: 1, username: request.account, origin: ORIGIN, browser: "chrome_140", os: "windows", cookies: Object.entries(request.cookies).map(([name, value]) => ({ name, value, domain: ".reddit.com", path: "/" })) },
      ...(request.proxy ? { proxy: request.proxy } : {}),
      ...(request.action === "create" || request.action === "reply" ? { captchaSolver: new TwoCaptchaRecaptchaSolver(request.captchaKey ?? twoCaptchaKey(), request.account) } : {}),
    }),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now: () => Date.now(),
};

export function linksOf(...texts: Array<string | null | undefined>): string[] {
  const found: string[] = [];
  for (const text of texts) {
    for (const raw of (text ?? "").match(LINK) ?? []) {
      const url = raw.replace(/[.,;:!?*_~]+$/, "");
      if (!found.includes(url)) found.push(url);
    }
  }
  return found;
}

function absolute(href: string | null): string {
  if (!href) return "";
  return href.startsWith("http") ? href : ORIGIN + href;
}

export function postOf(post: RedditFeedPost): RedditBridgePost {
  const url = absolute(post.contentHref);
  const hrefs = [...(post.bodyHtml ?? "").matchAll(HREF)].map((m) => m[1]).join(" ");
  return {
    id: post.id.replace(/^t3_/, ""),
    subreddit: post.subredditName,
    title: post.title,
    author: post.author,
    created: post.createdUtc,
    score: post.score ?? 0,
    upvoteRatio: null,
    comments: post.commentCount ?? 0,
    flair: null,
    permalink: absolute(post.permalink),
    url,
    text: post.body ?? "",
    links: linksOf(url, post.body, hrefs).filter((link) => !(link.includes("reddit.com/") && link.includes("/r/"))),
  };
}

export function refusalOf(error: unknown): RedditBridgeAnswer {
  const name = (error as { name?: string } | null)?.name ?? "";
  const status = (error as { status?: number } | null)?.status;
  const detail = error instanceof Error ? error.message : String(error);
  if (error instanceof RedditLoginError || status === 401) return { ok: false, code: "sessionDead", detail, loginState: "loggedOut", httpStatus: status ?? 401 };
  if (status === 429) return { ok: false, code: "rateLimited", detail, loginState: "unknown", httpStatus: 429, event: "throttled" };
  if (/ChallengeRequired/.test(name)) return { ok: false, code: "challengeRequired", detail, loginState: "unknown", event: "automated" };
  if (/CaptchaRequired/.test(name)) return { ok: false, code: "captchaRequired", detail, loginState: "unknown", event: "automated" };
  if (status === 403) return { ok: false, code: "forbidden", detail, loginState: "unknown", httpStatus: 403 };
  if (typeof status === "number") return { ok: false, code: "platformError", detail, loginState: "unknown", httpStatus: status };
  return { ok: false, code: "networkDropped", detail, loginState: "unknown" };
}

function refreshedOf(client: RedditClient, sent: Record<string, string>): Record<string, string> {
  const now: Record<string, string> = {};
  for (const cookie of client.exportSession().cookies) now[cookie.name] = cookie.value;
  return Object.fromEntries(Object.entries(now).filter(([name, value]) => sent[name] !== value));
}

function spacing(request: RedditBridgeRequest): number {
  const [low, high] = request.readSpacingMs ?? DEFAULT_SPACING_MS;
  return low + Math.random() * (high - low);
}

async function ping(client: RedditClient): Promise<RedditBridgeAnswer> {
  return { ok: true, loginState: "loggedIn", httpStatus: 200, screenName: client.username };
}

async function subreddits(client: RedditClient, request: RedditBridgeRequest): Promise<RedditBridgeAnswer> {
  const query = (request.query ?? "").trim();
  if (!query) return { ok: false, code: "queryMissing", detail: "give the words to look a subreddit up by" };
  const listing = await client.search.communities(query);
  const found = await listing.collect({ maxCommunities: request.limit ?? 15 });
  const out: RedditBridgeSubreddit[] = found.map((c) => ({
    name: c.name,
    title: c.prefixedName,
    subscribers: c.weeklyVisitors,
    activeUsers: c.weeklyContributions,
    created: null,
    about: (c.description ?? "").trim(),
    over18: c.isNsfw,
    url: absolute(c.permalink),
  }));
  return { ok: true, loginState: "loggedIn", query, subreddits: out };
}

async function posts(client: RedditClient, request: RedditBridgeRequest, deps: RedditBridgeDeps): Promise<RedditBridgeAnswer> {
  const subreddit = (request.subreddit ?? "").trim().replace(/^\/?r\//, "").replace(/\/$/, "");
  if (!subreddit) return { ok: false, code: "subredditMissing", detail: "give the subreddit to read" };
  const days = request.days ?? 7;
  const since = deps.now() / 1000 - days * 86400;
  const maxPages = Math.min(request.maxPages ?? MAX_PAGES, MAX_PAGES);
  const kept: RedditBridgePost[] = [];
  let pages = 0;
  let complete = false;
  let stopped: RedditBridgeAnswer | null = null;
  try {
    const listing = await client.feeds.getSubreddit(subreddit, { sort: "NEW" });
    const iterator = listing.pages();
    while (pages < maxPages) {
      if (pages > 0) await deps.sleep(spacing(request));
      const next = await iterator.next();
      if (next.done) {
        complete = true;
        break;
      }
      pages += 1;
      let older = false;
      for (const post of next.value.posts) {
        if (post.createdUtc !== null && post.createdUtc < since) {
          older = true;
          continue;
        }
        if (!kept.some((p) => p.id === post.id.replace(/^t3_/, ""))) kept.push(postOf(post));
      }
      if (older || next.value.posts.length === 0 || next.value.nextPageUrl === null) {
        complete = true;
        break;
      }
    }
  } catch (error) {
    stopped = refusalOf(error);
  }
  if (stopped && kept.length === 0) return stopped;
  return {
    ok: true,
    loginState: "loggedIn",
    subreddit,
    days,
    since,
    pages,
    complete: complete && !stopped,
    posts: kept,
    ...(stopped ? { stoppedBy: { code: stopped.code, detail: stopped.detail, httpStatus: stopped.httpStatus ?? null }, event: stopped.event } : {}),
  };
}

function epochOf(iso: string | null): number | null {
  const at = Date.parse(iso ?? "");
  return Number.isFinite(at) ? Math.floor(at / 1000) : null;
}

export function threadPostOf(post: RedditPost): RedditBridgePost {
  return { ...postOf({ ...post, createdUtc: epochOf(post.createdAt) }), upvoteRatio: post.upvoteRatio };
}

export function commentOf(comment: RedditComment): RedditBridgeComment {
  return {
    id: comment.id,
    author: comment.author,
    created: epochOf(comment.createdAt),
    depth: comment.depth,
    parentId: comment.parentId,
    score: comment.score,
    permalink: absolute(comment.permalink),
    text: comment.body ?? "",
  };
}

function postUrl(request: RedditBridgeRequest): string | null {
  const url = (request.url ?? "").trim();
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : absolute(url.startsWith("/") ? url : `/${url}`);
}

async function home(client: RedditClient): Promise<RedditBridgeAnswer> {
  const page = await client.feeds.getHome();
  return { ok: true, loginState: "loggedIn", posts: page.posts.map(postOf) };
}

async function post(client: RedditClient, request: RedditBridgeRequest): Promise<RedditBridgeAnswer> {
  const url = postUrl(request);
  if (!url) return { ok: false, code: "postMissing", detail: "give the post's link (its permalink)" };
  const thread = await client.posts.get(url);
  const limit = request.limit ?? 50;
  const comments = await thread.comments.collect({ maxComments: limit });
  return { ok: true, loginState: "loggedIn", post: threadPostOf(thread.post), comments: comments.map(commentOf) };
}

async function create(client: RedditClient, request: RedditBridgeRequest): Promise<RedditBridgeAnswer> {
  const subreddit = (request.subreddit ?? "").trim().replace(/^\/?r\//, "");
  const title = (request.title ?? "").trim();
  if (!subreddit || !title) return { ok: false, code: "postIncomplete", detail: "a post needs its subreddit and title" };
  const made = await client.posts.create({ subreddit, title, ...(request.text ? { text: request.text } : {}), ...(request.flair ? { flair: request.flair } : {}) });
  return { ok: true, loginState: "loggedIn", posted: { id: made.id, permalink: absolute(made.permalink), subreddit, title } };
}

async function reply(client: RedditClient, request: RedditBridgeRequest): Promise<RedditBridgeAnswer> {
  const url = postUrl(request);
  const text = (request.text ?? "").trim();
  if (!url || !text) return { ok: false, code: "replyIncomplete", detail: "a reply needs the post's link and its text" };
  const thread = await client.posts.get(url);
  let comment: RedditComment | null = null;
  if (request.commentId) {
    const wanted = request.commentId.startsWith("t1_") ? request.commentId : `t1_${request.commentId}`;
    comment = (await thread.comments.collect({ maxComments: 500 })).find((c) => c.id === wanted) ?? null;
    if (!comment) return { ok: false, code: "commentNotFound", detail: `${wanted} isn't among this post's comments` };
  }
  const made = await client.posts.reply(comment ?? thread, { text });
  return { ok: true, loginState: "loggedIn", replied: commentOf(made), to: comment ? comment.id : thread.post.id };
}

async function vote(client: RedditClient, request: RedditBridgeRequest): Promise<RedditBridgeAnswer> {
  const direction: RedditVoteDirection = request.direction ?? "up";
  if (!["up", "down", "none"].includes(direction)) return { ok: false, code: "voteDirection", detail: "the direction is up, down or none" };
  let target = (request.target ?? "").trim();
  if (!target) {
    const url = postUrl(request);
    if (!url) return { ok: false, code: "voteTarget", detail: "give the post's link or a t3_/t1_ id" };
    target = (await client.posts.get(url)).post.id;
  }
  if (!/^t[13]_[a-z0-9]+$/i.test(target)) return { ok: false, code: "voteTarget", detail: `${target} isn't a t3_ post or t1_ comment id` };
  await client.posts.vote(target as `t3_${string}`, direction);
  return { ok: true, loginState: "loggedIn", voted: { target, direction } };
}

export async function runRedditBridge(request: RedditBridgeRequest, deps: RedditBridgeDeps = redditBridgeDeps): Promise<RedditBridgeAnswer> {
  let client: RedditClient;
  try {
    client = await deps.resume(request);
  } catch (error) {
    return refusalOf(error);
  }
  try {
    const answer =
      request.action === "ping" ? await ping(client)
      : request.action === "subreddits" ? await subreddits(client, request)
      : request.action === "posts" ? await posts(client, request, deps)
      : request.action === "home" ? await home(client)
      : request.action === "post" ? await post(client, request)
      : request.action === "create" ? await create(client, request)
      : request.action === "reply" ? await reply(client, request)
      : request.action === "vote" ? await vote(client, request)
      : { ok: false, code: "actionUnknown", detail: `${String(request.action)} is not one of ping, subreddits, posts, home, post, create, reply, vote` };
    const refreshed = refreshedOf(client, request.cookies);
    return Object.keys(refreshed).length ? { ...answer, refreshedCookies: refreshed } : answer;
  } catch (error) {
    return refusalOf(error);
  } finally {
    await client.close().catch(() => undefined);
  }
}
