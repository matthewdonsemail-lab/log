import { load } from "cheerio/slim";

import type { AuthenticatedRedditAuthenticationContext } from "./authentication.js";
import { RedditJavaScriptChallenge } from "./challenge.js";

const HOME_FEED_PATH = "/svc/shreddit/feeds/home-feed";
const SUBREDDIT_FEED_PARTIAL_PREFIX = "/svc/shreddit/community-more-posts/";
const PARTIAL_HTML_ACCEPT = "text/vnd.reddit.partial+html";
const HTML_ACCEPT = "text/html";
const DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/";

/** Sort orders exposed by Reddit's authenticated home feed. */
export type RedditHomeFeedSort = "BEST" | "HOT" | "NEW" | "TOP";

/** Sort orders exposed by Reddit's subreddit feed menu. */
export type RedditSubredditFeedSort =
  | "BEST"
  | "HOT"
  | "NEW"
  | "TOP"
  | "RISING";

/** Time windows exposed after selecting the TOP subreddit sort. */
export type RedditSubredditTopTime =
  | "HOUR"
  | "DAY"
  | "WEEK"
  | "MONTH"
  | "YEAR"
  | "ALL";

/** The subset of fetch options required by the feed client. */
export interface RedditFetchInit {
  readonly body?: string | URLSearchParams | null;
  readonly headers?: Readonly<Record<string, string>>;
  readonly method?: string;
  readonly redirect?: "follow" | "manual" | "error";
  readonly signal?: AbortSignal | null;
}

/** A fetch response compatible with both `wreq-js` and the standard Fetch API. */
export interface RedditFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly url: string;
  text(): Promise<string>;
}

/** Pluggable HTTP transport used by Reddit clients. */
export interface RedditFetchTransport {
  fetch(
    input: string | URL,
    init?: RedditFetchInit,
  ): Promise<RedditFetchResponse>;
}

export interface RedditFeedClientOptions {
  /** Override Reddit's origin for testing or a compatible frontend. */
  readonly origin?: string | URL;
}

export interface RedditHomeFeedRequest {
  /** Opaque URL returned by a previous page. Cannot be combined with `sort`. */
  readonly pageUrl?: string | URL;
  readonly signal?: AbortSignal | null;
  readonly sort?: RedditHomeFeedSort;
}

export interface RedditSubredditFeedRequest {
  readonly signal?: AbortSignal | null;
  readonly sort?: RedditSubredditFeedSort;
  /** Only valid with the TOP sort. Omit to use Reddit's default window. */
  readonly time?: RedditSubredditTopTime;
}

export interface RedditFeedCollectOptions {
  /** Maximum number of unique posts to return. */
  readonly maxPosts: number;
  readonly signal?: AbortSignal | null;
}

/** Stable attributes currently exposed by a `shreddit-post` element. */
export interface RedditFeedPost {
  readonly author: string | null;
  readonly authorId: string | null;
  readonly body: string | null;
  readonly bodyHtml: string | null;
  readonly commentCount: number | null;
  readonly contentHref: string | null;
  readonly createdUtc: number | null;
  readonly domain: string | null;
  readonly id: `t3_${string}`;
  readonly permalink: string;
  readonly score: number | null;
  readonly subredditId: string | null;
  readonly subredditName: string | null;
  readonly subredditPrefixedName: string | null;
  readonly title: string;
}

export interface RedditHomeFeedPage {
  /** Opaque same-origin URL to pass back as `pageUrl`; null on the last page. */
  readonly nextPageUrl: string | null;
  readonly posts: readonly RedditFeedPost[];
  readonly requestUrl: string;
}

export interface RedditSubredditFeedPage {
  /** Opaque same-origin continuation used internally by the listing. */
  readonly nextPageUrl: string | null;
  readonly posts: readonly RedditFeedPost[];
  readonly requestUrl: string;
}

type RedditSubredditPageFetcher = (
  pageUrl: string,
  signal?: AbortSignal | null,
) => Promise<RedditSubredditFeedPage>;

/** Lazy, reusable view over a sorted subreddit's opaque feed cursor. */
export class RedditFeedListing implements AsyncIterable<RedditFeedPost> {
  readonly #fetchPage: RedditSubredditPageFetcher;
  readonly #initialPage: RedditSubredditFeedPage;

  constructor(
    initialPage: RedditSubredditFeedPage,
    fetchPage: RedditSubredditPageFetcher,
  ) {
    this.#initialPage = initialPage;
    this.#fetchPage = fetchPage;
  }

  get loaded(): readonly RedditFeedPost[] {
    return this.#initialPage.posts;
  }

  async *pages(
    signal?: AbortSignal | null,
  ): AsyncGenerator<RedditSubredditFeedPage> {
    yield this.#initialPage;

    const seen = new Set<string>();
    let nextPageUrl = this.#initialPage.nextPageUrl;
    while (nextPageUrl !== null && !seen.has(nextPageUrl)) {
      signal?.throwIfAborted();
      seen.add(nextPageUrl);
      const page = await this.#fetchPage(nextPageUrl, signal);
      yield page;
      nextPageUrl = page.nextPageUrl;
    }
  }

  async *values(
    signal?: AbortSignal | null,
  ): AsyncGenerator<RedditFeedPost> {
    const seen = new Set<string>();
    for await (const page of this.pages(signal)) {
      for (const post of page.posts) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        yield post;
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<RedditFeedPost> {
    return this.values();
  }

  async collect(
    options: RedditFeedCollectOptions,
  ): Promise<readonly RedditFeedPost[]> {
    if (!Number.isSafeInteger(options.maxPosts) || options.maxPosts <= 0) {
      throw new TypeError("maxPosts must be a positive safe integer");
    }

    const posts: RedditFeedPost[] = [];
    for await (const post of this.values(options.signal)) {
      posts.push(post);
      if (posts.length >= options.maxPosts) break;
    }
    return posts;
  }
}

/** Reddit returned a non-success status while loading a feed page. */
export class RedditFeedRequestError extends Error {
  override readonly name = "RedditFeedRequestError";

  constructor(
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(`Reddit feed request failed with HTTP ${status}`);
  }
}

/** The session must complete Reddit's edge challenge before retrying. */
export class RedditFeedChallengeRequiredError extends Error {
  override readonly name = "RedditFeedChallengeRequiredError";

  constructor(readonly challenge: RedditJavaScriptChallenge) {
    super("Reddit returned a JavaScript challenge instead of a feed page");
  }
}

/** Authenticated reader for Reddit's Shreddit home-feed fragments. */
export class RedditFeedClient {
  readonly #origin: URL;

  constructor(
    readonly transport: RedditFetchTransport,
    readonly authentication: AuthenticatedRedditAuthenticationContext,
    options: RedditFeedClientOptions = {},
  ) {
    this.#origin = normalizeOrigin(options.origin ?? DEFAULT_REDDIT_ORIGIN);
  }

  async getHome(
    request: RedditHomeFeedRequest = {},
  ): Promise<RedditHomeFeedPage> {
    const requestUrl = this.#createHomeFeedUrl(request);
    const { html, responseUrl } = await this.#requestHtml(
      requestUrl,
      PARTIAL_HTML_ACCEPT,
      request.signal,
    );
    return parseRedditHomeFeed(html, responseUrl);
  }

  /** Load one subreddit and lazily follow its sorted feed cursor. */
  async getSubreddit(
    name: string,
    request: RedditSubredditFeedRequest = {},
  ): Promise<RedditFeedListing> {
    const subredditName = normalizeSubredditName(name);
    const sort = request.sort ?? "BEST";
    if (!isSubredditFeedSort(sort)) {
      throw new TypeError(`Unsupported Reddit subreddit-feed sort: ${sort}`);
    }
    if (request.time !== undefined && sort !== "TOP") {
      throw new TypeError("Reddit subreddit-feed time requires the TOP sort");
    }
    if (request.time !== undefined && !isSubredditTopTime(request.time)) {
      throw new TypeError(`Unsupported Reddit TOP time: ${request.time}`);
    }

    const url = new URL(
      `/r/${subredditName}/${sort.toLowerCase()}/`,
      this.#origin,
    );
    if (request.time !== undefined) {
      url.searchParams.set("t", request.time.toLowerCase());
    }
    const initialPage = await this.#getSubredditPage(
      url,
      HTML_ACCEPT,
      request.signal,
    );
    return new RedditFeedListing(
      initialPage,
      (pageUrl, signal) =>
        this.#getSubredditPage(
          this.#subredditContinuationUrl(pageUrl, subredditName, sort),
          PARTIAL_HTML_ACCEPT,
          signal,
        ),
    );
  }

  async #getSubredditPage(
    url: URL,
    accept: string,
    signal?: AbortSignal | null,
  ): Promise<RedditSubredditFeedPage> {
    const response = await this.#requestHtml(url, accept, signal);
    return parseRedditSubredditFeed(response.html, response.responseUrl);
  }

  async #requestHtml(
    requestUrl: URL,
    accept: string,
    signal?: AbortSignal | null,
  ): Promise<{ html: string; responseUrl: string | URL }> {
    signal?.throwIfAborted();
    const response = await this.transport.fetch(requestUrl, {
      headers: { accept, referer: this.#origin.href },
      ...(signal === undefined ? {} : { signal }),
    });
    if (!response.ok) {
      throw new RedditFeedRequestError(response.status, requestUrl.href);
    }

    const html = await response.text();
    const responseUrl = response.url.length === 0 ? requestUrl : response.url;
    const challenge = RedditJavaScriptChallenge.parse(responseUrl, html);
    if (challenge !== undefined) {
      throw new RedditFeedChallengeRequiredError(challenge);
    }
    return { html, responseUrl };
  }

  #createHomeFeedUrl(request: RedditHomeFeedRequest): URL {
    if (request.pageUrl !== undefined) {
      if (request.sort !== undefined) {
        throw new TypeError("Reddit feed pageUrl cannot be combined with sort");
      }

      const pageUrl = new URL(request.pageUrl, this.#origin);
      if (
        pageUrl.origin !== this.#origin.origin ||
        pageUrl.pathname !== HOME_FEED_PATH
      ) {
        throw new TypeError(
          "Reddit feed pageUrl must target the configured home-feed endpoint",
        );
      }

      return pageUrl;
    }

    const sort = request.sort ?? "BEST";
    if (!isHomeFeedSort(sort)) {
      throw new TypeError(`Unsupported Reddit home-feed sort: ${sort}`);
    }

    const url = new URL(HOME_FEED_PATH, this.#origin);
    url.searchParams.set("sort", sort);
    return url;
  }

  #subredditContinuationUrl(
    value: string,
    subredditName: string,
    sort: RedditSubredditFeedSort,
  ): URL {
    const url = new URL(value, this.#origin);
    if (
      url.origin !== this.#origin.origin ||
      url.pathname !==
        `${SUBREDDIT_FEED_PARTIAL_PREFIX}${sort.toLowerCase()}/` ||
      url.searchParams.get("name")?.toLowerCase() !==
        subredditName.toLowerCase()
    ) {
      throw new TypeError(
        "Reddit feed cursor must target the configured subreddit endpoint",
      );
    }
    url.hash = "";
    return url;
  }
}

/** Parse one Shreddit home-feed response without making a request. */
export function parseRedditHomeFeed(
  html: string,
  responseUrl: string | URL,
): RedditHomeFeedPage {
  return parseRedditFeedPage(html, responseUrl, resolveHomeFeedPartial);
}

/** Parse one full or partial sorted subreddit feed response. */
export function parseRedditSubredditFeed(
  html: string,
  responseUrl: string | URL,
): RedditSubredditFeedPage {
  return parseRedditFeedPage(html, responseUrl, resolveSubredditFeedPartial);
}

function parseRedditFeedPage(
  html: string,
  responseUrl: string | URL,
  resolvePartial: (
    value: string | undefined,
    sourceUrl: URL,
  ) => string | null,
): RedditHomeFeedPage {
  const $ = load(html, undefined, false);
  const posts = $("shreddit-post")
    .toArray()
    .flatMap((element) => {
      const post = $(element);
      const id = post.attr("id");
      const permalink = post.attr("permalink");
      if (!isPostId(id) || permalink === undefined || permalink.length === 0) {
        return [];
      }

      const bodyElement = post.find(`[id="${id}-post-rtjson-content"], [slot="text-body"]`).first();
      const bodyText = normalizeText(bodyElement.text());
      const bodyMarkup = bodyElement.html()?.trim() ?? "";
      const created = Date.parse((post.attr("created-timestamp") ?? "").replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));

      return [
        {
          author: attributeOrNull(post.attr("author")),
          authorId: attributeOrNull(post.attr("author-id")),
          body: bodyText.length === 0 ? null : bodyText,
          bodyHtml: bodyMarkup.length === 0 ? null : bodyMarkup,
          commentCount: integerOrNull(post.attr("comment-count")),
          contentHref: attributeOrNull(post.attr("content-href")),
          createdUtc: Number.isFinite(created) ? Math.floor(created / 1000) : null,
          domain: attributeOrNull(post.attr("domain")),
          id,
          permalink,
          score: integerOrNull(post.attr("score")),
          subredditId: attributeOrNull(post.attr("subreddit-id")),
          subredditName: attributeOrNull(post.attr("subreddit-name")),
          subredditPrefixedName: attributeOrNull(
            post.attr("subreddit-prefixed-name"),
          ),
          title: normalizeText(
            post.find('[slot="title"], h1, h2, h3').first().text(),
          ),
        },
      ];
    });

  const sourceUrl = new URL(responseUrl);
  const partialUrls = [
    $("#feed-next-page-partial").attr("src"),
    ...$("faceplate-partial[src]")
      .toArray()
      .map((element) => $(element).attr("src")),
  ];
  const nextPageUrl =
    partialUrls
      .map((url) => resolvePartial(url, sourceUrl))
      .find((url) => url !== null) ?? null;

  return {
    nextPageUrl,
    posts,
    requestUrl: sourceUrl.href,
  };
}

function normalizeOrigin(origin: string | URL): URL {
  const url = new URL(origin);
  if (url.username.length > 0 || url.password.length > 0) {
    throw new TypeError("Reddit origin cannot contain credentials");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function resolveHomeFeedPartial(
  value: string | undefined,
  sourceUrl: URL,
): string | null {
  if (value === undefined) return null;

  const url = new URL(value, sourceUrl);
  return url.origin === sourceUrl.origin && url.pathname === HOME_FEED_PATH
    ? url.href
    : null;
}

function resolveSubredditFeedPartial(
  value: string | undefined,
  sourceUrl: URL,
): string | null {
  if (value === undefined) return null;

  const url = new URL(value, sourceUrl);
  return url.origin === sourceUrl.origin &&
      url.pathname.startsWith(SUBREDDIT_FEED_PARTIAL_PREFIX) &&
      /^\/(?:svc\/shreddit\/community-more-posts)\/(?:best|hot|new|top|rising)\/$/i
        .test(url.pathname) &&
      url.searchParams.has("name") &&
      url.searchParams.has("after")
    ? url.href
    : null;
}

function isHomeFeedSort(value: string): value is RedditHomeFeedSort {
  return value === "BEST" || value === "HOT" || value === "NEW" || value === "TOP";
}

function isSubredditFeedSort(value: string): value is RedditSubredditFeedSort {
  return value === "BEST" || value === "HOT" || value === "NEW" ||
    value === "TOP" || value === "RISING";
}

function isSubredditTopTime(value: string): value is RedditSubredditTopTime {
  return value === "HOUR" || value === "DAY" || value === "WEEK" ||
    value === "MONTH" || value === "YEAR" || value === "ALL";
}

function normalizeSubredditName(value: string): string {
  const match = /^(?:r\/)?([a-z0-9_]{2,21})\/?$/i.exec(value.trim());
  if (match?.[1] === undefined) {
    throw new TypeError("Reddit subreddit must be a valid name or r/name");
  }
  return match[1];
}

function isPostId(value: string | undefined): value is `t3_${string}` {
  return value !== undefined && /^t3_[a-z0-9]+$/i.test(value);
}

function attributeOrNull(value: string | undefined): string | null {
  return value === undefined || value.length === 0 ? null : value;
}

function integerOrNull(value: string | undefined): number | null {
  if (value === undefined || !/^-?\d+$/.test(value)) return null;

  const integer = Number(value);
  return Number.isSafeInteger(integer) ? integer : null;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
