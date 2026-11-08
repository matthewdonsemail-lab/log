import { load, type Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";

import type { AuthenticatedRedditAuthenticationContext } from "./authentication.js";
import { RedditJavaScriptChallenge } from "./challenge.js";
import type { RedditFetchTransport } from "./feed.js";
import { normalizeRedditOrigin } from "./session-state.js";

const DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/";
const COMMUNITY_SEARCH_PATH = "/search/";
const COMMUNITY_SEARCH_PARTIAL_PATH = "/svc/shreddit/search/";
const SEARCH_TYPEAHEAD_PATH = "/svc/shreddit/search-typeahead";
const HTML_ACCEPT = "text/html";
const PARTIAL_HTML_ACCEPT = "text/vnd.reddit.partial+html";
const SUBREDDIT_PATH = /^\/r\/([^/]+)\/?$/i;

export interface RedditSearchClientOptions {
  /** Override Reddit's origin for testing or a compatible frontend. */
  readonly origin?: string | URL;
}

export interface RedditSearchRequest {
  readonly signal?: AbortSignal | null;
}

export interface RedditCommunityCollectOptions extends RedditSearchRequest {
  /** Maximum number of unique communities to return. */
  readonly maxCommunities: number;
}

export interface RedditCommunity {
  readonly description: string | null;
  readonly iconUrl: string | null;
  readonly id: `t5_${string}`;
  readonly isNsfw: boolean | null;
  readonly isQuarantined: boolean | null;
  readonly name: string;
  readonly permalink: string;
  readonly prefixedName: `r/${string}`;
  readonly weeklyContributions: number | null;
  readonly weeklyVisitors: number | null;
}

export interface RedditCommunitySearchPage {
  readonly communities: readonly RedditCommunity[];
  /** Opaque same-origin continuation retained for debugging. */
  readonly nextPageUrl: string | null;
  readonly requestUrl: string;
}

export interface RedditQuerySuggestion {
  readonly query: string;
  readonly searchUrl: string;
}

export interface RedditCommunitySuggestion {
  readonly description: string | null;
  readonly iconUrl: string | null;
  readonly id: `t5_${string}`;
  readonly name: string;
  readonly permalink: string;
  readonly prefixedName: `r/${string}`;
  readonly weeklyVisitors: number | null;
}

export interface RedditSearchSuggestions {
  readonly communities: readonly RedditCommunitySuggestion[];
  readonly queries: readonly RedditQuerySuggestion[];
  readonly requestUrl: string;
}

type RedditCommunityPageFetcher = (
  pageUrl: string,
  request?: RedditSearchRequest,
) => Promise<RedditCommunitySearchPage>;

/** Lazy, reusable view over Reddit's opaque community-search cursor. */
export class RedditCommunityListing implements AsyncIterable<RedditCommunity> {
  readonly #fetchPage: RedditCommunityPageFetcher;
  readonly #initialPage: RedditCommunitySearchPage;

  constructor(
    initialPage: RedditCommunitySearchPage,
    fetchPage: RedditCommunityPageFetcher,
  ) {
    this.#initialPage = initialPage;
    this.#fetchPage = fetchPage;
  }

  get loaded(): readonly RedditCommunity[] {
    return this.#initialPage.communities;
  }

  get nextPageUrl(): string | null {
    return this.#initialPage.nextPageUrl;
  }

  async *pages(
    request: RedditSearchRequest = {},
  ): AsyncGenerator<RedditCommunitySearchPage> {
    yield this.#initialPage;

    const seen = new Set<string>();
    let nextPageUrl = this.#initialPage.nextPageUrl;
    while (nextPageUrl !== null && !seen.has(nextPageUrl)) {
      request.signal?.throwIfAborted();
      seen.add(nextPageUrl);
      const page = await this.#fetchPage(nextPageUrl, request);
      yield page;
      nextPageUrl = page.nextPageUrl;
    }
  }

  async *values(
    request: RedditSearchRequest = {},
  ): AsyncGenerator<RedditCommunity> {
    const seen = new Set<string>();
    for await (const page of this.pages(request)) {
      for (const community of page.communities) {
        if (seen.has(community.id)) continue;
        seen.add(community.id);
        yield community;
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<RedditCommunity> {
    return this.values();
  }

  async collect(
    options: RedditCommunityCollectOptions,
  ): Promise<readonly RedditCommunity[]> {
    if (!Number.isSafeInteger(options.maxCommunities) || options.maxCommunities <= 0) {
      throw new TypeError("maxCommunities must be a positive safe integer");
    }

    const communities: RedditCommunity[] = [];
    const request = options.signal === undefined ? {} : { signal: options.signal };
    for await (const community of this.values(request)) {
      communities.push(community);
      if (communities.length >= options.maxCommunities) break;
    }
    return communities;
  }
}

/** Reddit returned a non-success status while searching. */
export class RedditSearchRequestError extends Error {
  override readonly name = "RedditSearchRequestError";

  constructor(
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(`Reddit search request failed with HTTP ${status}`);
  }
}

/** The session must complete Reddit's edge challenge before retrying. */
export class RedditSearchChallengeRequiredError extends Error {
  override readonly name = "RedditSearchChallengeRequiredError";

  constructor(readonly challenge: RedditJavaScriptChallenge) {
    super("Reddit returned a JavaScript challenge instead of search results");
  }
}

/** Authenticated reader for Reddit community discovery and typeahead. */
export class RedditSearchClient {
  readonly #origin: URL;

  constructor(
    readonly transport: RedditFetchTransport,
    readonly authentication: AuthenticatedRedditAuthenticationContext,
    options: RedditSearchClientOptions = {},
  ) {
    this.#origin = normalizeRedditOrigin(
      options.origin ?? DEFAULT_REDDIT_ORIGIN,
    );
  }

  /** Search communities and lazily follow Reddit's opaque continuation. */
  async communities(
    query: string,
    request: RedditSearchRequest = {},
  ): Promise<RedditCommunityListing> {
    const normalizedQuery = normalizeQuery(query);
    const url = new URL(COMMUNITY_SEARCH_PATH, this.#origin);
    url.searchParams.set("q", normalizedQuery);
    url.searchParams.set("type", "communities");
    const page = await this.#getCommunityPage(url, request);
    return new RedditCommunityListing(
      page,
      (pageUrl, pageRequest) =>
        this.#getCommunityPage(
          this.#communityContinuationUrl(pageUrl, normalizedQuery),
          pageRequest,
        ),
    );
  }

  /** Return Reddit's lightweight query and community autocomplete results. */
  async suggest(
    query: string,
    request: RedditSearchRequest = {},
  ): Promise<RedditSearchSuggestions> {
    const url = new URL(SEARCH_TYPEAHEAD_PATH, this.#origin);
    url.searchParams.set("query", normalizeQuery(query));
    url.searchParams.set("recentSearchesCount", "0");
    const { html, responseUrl } = await this.#request(url, PARTIAL_HTML_ACCEPT, request);
    return parseRedditSearchSuggestions(html, responseUrl);
  }

  async #getCommunityPage(
    url: URL,
    request: RedditSearchRequest = {},
  ): Promise<RedditCommunitySearchPage> {
    const accept = url.pathname === COMMUNITY_SEARCH_PATH
      ? HTML_ACCEPT
      : PARTIAL_HTML_ACCEPT;
    const { html, responseUrl } = await this.#request(url, accept, request);
    return parseRedditCommunitySearch(html, responseUrl);
  }

  async #request(
    url: URL,
    accept: string,
    request: RedditSearchRequest,
  ): Promise<{ html: string; responseUrl: string }> {
    request.signal?.throwIfAborted();
    const response = await this.transport.fetch(url, {
      headers: { accept, referer: this.#origin.href },
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });
    if (!response.ok) {
      throw new RedditSearchRequestError(response.status, url.href);
    }

    const html = await response.text();
    const responseUrl = response.url.length === 0 ? url.href : response.url;
    const challenge = RedditJavaScriptChallenge.parse(responseUrl, html);
    if (challenge !== undefined) {
      throw new RedditSearchChallengeRequiredError(challenge);
    }
    return { html, responseUrl };
  }

  #communityContinuationUrl(value: string, query: string): URL {
    const url = new URL(value, this.#origin);
    if (
      url.origin !== this.#origin.origin ||
      url.pathname !== COMMUNITY_SEARCH_PARTIAL_PATH ||
      url.searchParams.get("q") !== query ||
      url.searchParams.get("type") !== "communities" ||
      !url.searchParams.has("cursor")
    ) {
      throw new TypeError(
        "Reddit community cursor must target the configured search endpoint",
      );
    }
    url.hash = "";
    return url;
  }
}

/** Parse one full or partial Reddit community-search response. */
export function parseRedditCommunitySearch(
  html: string,
  responseUrl: string | URL,
): RedditCommunitySearchPage {
  const $ = load(html, undefined, false);
  const sourceUrl = new URL(responseUrl);
  const communities = $('[data-testid="search-community"]')
    .toArray()
    .flatMap((element) => {
      const result = $(element);
      const context = parseCommunityContext(
        result.closest("search-telemetry-tracker").attr(
          "data-faceplate-tracking-context",
        ) ?? result.find("[data-faceplate-tracking-context]").first().attr(
          "data-faceplate-tracking-context",
        ),
      );
      const link = result.find('a[href^="/r/"]').first();
      const permalink = communityPermalink(link.attr("href"), sourceUrl);
      const id = context.id ?? communityIdFromTitle(result);
      if (permalink === null || !isCommunityId(id)) return [];

      const name = context.name ?? communityName(permalink);
      if (name === null) return [];
      return [{
        description: textOrNull(
          result.find('[data-testid="search-subreddit-desc-text"]').first().text(),
        ),
        iconUrl: resolvedUrlOrNull(
          result.find("img.shreddit-subreddit-icon__icon, img").first().attr("src"),
          sourceUrl,
        ),
        id,
        isNsfw: context.isNsfw,
        isQuarantined: context.isQuarantined,
        name,
        permalink,
        prefixedName: `r/${name}` as const,
        weeklyContributions: metric(result, "weekly contributions"),
        weeklyVisitors: metric(result, "weekly visitor"),
      }];
    });

  const nextPageUrl = $("faceplate-partial[src]")
    .toArray()
    .map((element) => communityContinuation($(element).attr("src"), sourceUrl))
    .find((url) => url !== null) ?? null;

  return { communities, nextPageUrl, requestUrl: sourceUrl.href };
}

/** Parse Reddit's mixed search-typeahead fragment. */
export function parseRedditSearchSuggestions(
  html: string,
  responseUrl: string | URL,
): RedditSearchSuggestions {
  const $ = load(html, undefined, false);
  const sourceUrl = new URL(responseUrl);
  const queries = $('a[role="menuitem"]:not([data-search-scope-id])')
    .toArray()
    .flatMap((element) => {
      const href = $(element).attr("href");
      if (href === undefined) return [];
      const url = new URL(href, sourceUrl);
      const query = url.pathname === COMMUNITY_SEARCH_PATH
        ? url.searchParams.get("q")
        : null;
      if (query === null || query.trim().length === 0) return [];
      const searchUrl = new URL(COMMUNITY_SEARCH_PATH, sourceUrl);
      searchUrl.searchParams.set("q", query);
      return [{ query, searchUrl: searchUrl.href }];
    });
  const communities = $('a[role="menuitem"][data-search-scope-id]')
    .toArray()
    .flatMap((element) => {
      const item = $(element);
      const id = item.attr("data-search-scope-id");
      const permalink = communityPermalink(item.attr("href"), sourceUrl);
      if (!isCommunityId(id) || permalink === null) return [];
      const name = communityName(permalink);
      if (name === null) return [];
      const visitors = metric(item, "weekly visitor");
      const details = normalizeText(item.text())
        .replace(new RegExp(`^r/${escapeRegExp(name)}\\s*`, "i"), "")
        .replace(/^\S+\s+weekly visitors?$/i, "")
        .trim();
      return [{
        description: visitors === null && details.length > 0 ? details : null,
        iconUrl: resolvedUrlOrNull(item.find("img").first().attr("src"), sourceUrl),
        id,
        name,
        permalink,
        prefixedName: `r/${name}` as const,
        weeklyVisitors: visitors,
      }];
    });

  return { communities, queries, requestUrl: sourceUrl.href };
}

function parseCommunityContext(value: string | undefined): {
  id: `t5_${string}` | null;
  isNsfw: boolean | null;
  isQuarantined: boolean | null;
  name: string | null;
} {
  try {
    const parsed = JSON.parse(value ?? "") as unknown;
    if (!isRecord(parsed) || !isRecord(parsed.subreddit)) throw new Error();
    const subreddit = parsed.subreddit;
    return {
      id: isCommunityId(subreddit.id) ? subreddit.id : null,
      isNsfw: booleanOrNull(subreddit.nsfw),
      isQuarantined: booleanOrNull(subreddit.quarantined),
      name: stringOrNull(subreddit.name),
    };
  } catch {
    return { id: null, isNsfw: null, isQuarantined: null, name: null };
  }
}

function communityIdFromTitle(result: Cheerio<AnyNode>): string | undefined {
  return /^search-community-title-(t5_[a-z0-9]+)$/i.exec(
    result.find('[id^="search-community-title-"]').first().attr("id") ?? "",
  )?.[1];
}

function metric(result: Cheerio<AnyNode>, label: string): number | null {
  for (const element of result.find("faceplate-number[number]").toArray()) {
    const number = result.find(element).attr("number");
    const parentText = normalizeText(result.find(element).parent().text()).toLowerCase();
    if (parentText.includes(label)) return integerOrNull(number);
  }
  return null;
}

function communityContinuation(
  value: string | undefined,
  sourceUrl: URL,
): string | null {
  if (value === undefined) return null;
  const url = new URL(value, sourceUrl);
  return url.origin === sourceUrl.origin &&
      url.pathname === COMMUNITY_SEARCH_PARTIAL_PATH &&
      url.searchParams.get("type") === "communities" &&
      url.searchParams.has("q") &&
      url.searchParams.has("cursor")
    ? url.href
    : null;
}

function communityPermalink(
  value: string | undefined,
  sourceUrl: URL,
): string | null {
  if (value === undefined) return null;
  const url = new URL(value, sourceUrl);
  return url.origin === sourceUrl.origin && SUBREDDIT_PATH.test(url.pathname)
    ? url.href
    : null;
}

function communityName(permalink: string): string | null {
  const match = SUBREDDIT_PATH.exec(new URL(permalink).pathname);
  return match?.[1] === undefined ? null : decodeURIComponent(match[1]);
}

function resolvedUrlOrNull(value: string | undefined, sourceUrl: URL): string | null {
  if (value === undefined || value.length === 0) return null;
  try {
    return new URL(value, sourceUrl).href;
  } catch {
    return null;
  }
}

function normalizeQuery(query: string): string {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (normalized.length === 0) {
    throw new TypeError("Reddit search query cannot be empty");
  }
  return normalized;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function textOrNull(value: string): string | null {
  const normalized = normalizeText(value);
  return normalized.length === 0 ? null : normalized;
}

function integerOrNull(value: string | undefined): number | null {
  if (value === undefined || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function booleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function isCommunityId(value: unknown): value is `t5_${string}` {
  return typeof value === "string" && /^t5_[a-z0-9]+$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
