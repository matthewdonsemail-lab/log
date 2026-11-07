import {
  createSession,
  type BrowserProfile,
  type EmulationOS,
} from "wreq-js";

import type {
  RedditFetchInit,
  RedditFetchResponse,
  RedditFetchTransport,
} from "./feed.js";

/** Browser identity observed during protocol discovery and used for Reddit. */
export const DEFAULT_REDDIT_BROWSER_PROFILE = "chrome_140" as const;
export const DEFAULT_REDDIT_BROWSER_OS = "windows" as const;

/** Proxy URL accepted by Reddit's persistent HTTP session. */
export type RedditProxy = string | URL;

export interface RedditSessionOptions {
  readonly browser?: BrowserProfile;
  readonly os?: EmulationOS;
  /**
   * Session-wide HTTP(S) or SOCKS proxy. Curl-style values without a scheme
   * are interpreted as HTTP proxies.
   */
  readonly proxy?: RedditProxy;
  readonly timeoutMs?: number;
}

export interface RedditSessionRequestInit extends RedditFetchInit {
}

export interface RedditSessionResponse extends RedditFetchResponse {
  readonly headers: {
    get(name: string): string | null;
  };
}

/** Persistent browser-grade HTTP session used by all Reddit clients. */
export interface RedditSession extends RedditFetchTransport {
  readonly closed: boolean;
  fetch(
    input: string | URL,
    init?: RedditSessionRequestInit,
  ): Promise<RedditSessionResponse>;
  getCookies(url: string | URL): Record<string, string>;
  setCookie(name: string, value: string, url: string | URL): void;
  close(): Promise<void>;
}

/** Create one browser identity and cookie jar for a complete Reddit session. */
export function createRedditSession(
  options: RedditSessionOptions = {},
): Promise<RedditSession> {
  const timeout = options.timeoutMs ?? 30_000;
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new TypeError("Reddit session timeout must be a positive finite number");
  }

  const proxy = options.proxy === undefined
    ? undefined
    : normalizeRedditProxy(options.proxy);
  return createSession({
    browser: options.browser ?? DEFAULT_REDDIT_BROWSER_PROFILE,
    os: options.os ?? DEFAULT_REDDIT_BROWSER_OS,
    timeout,
    ...(proxy === undefined ? {} : { proxy }),
  });
}

/** Normalize proxy URLs without ever including credentials in validation errors. */
export function normalizeRedditProxy(proxy: RedditProxy): string {
  const value = (proxy instanceof URL ? proxy.href : proxy).trim();
  if (value.length === 0) {
    throw new TypeError("Reddit proxy cannot be empty");
  }

  let parsed: URL;
  try {
    parsed = new URL(hasScheme(value) ? value : `http://${value}`);
  } catch {
    throw new TypeError("Reddit proxy must be a valid proxy URL");
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:" &&
    parsed.protocol !== "socks5:" &&
    parsed.protocol !== "socks5h:"
  ) {
    throw new TypeError(
      "Reddit proxy must use HTTP, HTTPS, SOCKS5, or SOCKS5H",
    );
  }
  if (parsed.hostname.length === 0) {
    throw new TypeError("Reddit proxy must contain a hostname");
  }
  if (
    (parsed.pathname !== "" && parsed.pathname !== "/") ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0
  ) {
    throw new TypeError("Reddit proxy cannot contain a path, query, or fragment");
  }

  return parsed.href;
}

function hasScheme(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}
