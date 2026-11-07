import {
  DEFAULT_REDDIT_BROWSER_OS,
  DEFAULT_REDDIT_BROWSER_PROFILE,
  type RedditSessionOptions,
} from "./session.js";

const SNAPSHOT_VERSION = 1 as const;
const DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/";
const COOKIE_NAME = /^[^\s=;,]+$/;
const COOKIE_CONTROL_CHARACTER = /[\0\r\n]/;

type BrowserProfile = NonNullable<RedditSessionOptions["browser"]>;
type BrowserOS = NonNullable<RedditSessionOptions["os"]>;

/** Normalized cookie shape accepted from common browser cookie exporters. */
export interface RedditSessionCookie {
  readonly domain?: string;
  readonly expiresAtMs?: number;
  readonly httpOnly?: boolean;
  readonly name: string;
  readonly path?: string;
  readonly sameSite?: "lax" | "strict" | "none";
  readonly secure?: boolean;
  readonly value: string;
}

/** Cookie input compatible with common Chromium/Playwright JSON exports. */
export interface RedditSessionCookieInput {
  readonly domain?: string;
  readonly expirationDate?: number;
  readonly expires?: number;
  readonly expiresAtMs?: number;
  readonly httpOnly?: boolean;
  readonly name: string;
  readonly path?: string;
  readonly sameSite?: string;
  readonly secure?: boolean;
  readonly value: string;
}

/** Cookie input emitted by Firefox Cookie Quick Manager JSON exports. */
export interface RedditRawSessionCookieInput {
  readonly "Content raw": string;
  readonly "Expires raw"?: string;
  readonly "Host raw"?: string;
  readonly "HTTP only raw"?: string;
  readonly "Name raw": string;
  readonly "Path raw"?: string;
  readonly "SameSite raw"?: string;
  readonly "Send for raw"?: string;
  readonly "This domain only raw"?: string;
}

export interface RedditSessionStateOptions {
  readonly browser?: BrowserProfile;
  readonly origin?: string | URL;
  readonly os?: BrowserOS;
  readonly username?: string;
}

export interface RedditSessionStateJSON {
  readonly browser: BrowserProfile;
  readonly cookies: readonly RedditSessionCookie[];
  readonly origin: string;
  readonly os: BrowserOS;
  readonly username: string;
  readonly version: typeof SNAPSHOT_VERSION;
}

export type RedditCookiesInput =
  | string
  | Readonly<Record<string, string>>
  | readonly (RedditSessionCookieInput | RedditRawSessionCookieInput)[];

/** Serializable, provider-neutral representation of an authenticated session. */
export class RedditSessionState {
  readonly browser: BrowserProfile;
  readonly cookies: readonly RedditSessionCookie[];
  readonly origin: string;
  readonly os: BrowserOS;
  readonly username: string;
  readonly version = SNAPSHOT_VERSION;

  private constructor(
    cookies: readonly RedditSessionCookie[],
    options: RedditSessionStateOptions,
  ) {
    this.username = requiredUsername(options.username);
    this.origin = normalizeRedditOrigin(
      options.origin ?? DEFAULT_REDDIT_ORIGIN,
    ).href;
    this.browser = options.browser ?? DEFAULT_REDDIT_BROWSER_PROFILE;
    this.os = options.os ?? DEFAULT_REDDIT_BROWSER_OS;
    this.cookies = Object.freeze(cookies.map((cookie) => Object.freeze(cookie)));
  }

  /** Detect our JSON snapshot, browser-export JSON, cookie map, or Cookie header. */
  static from(
    input: unknown,
    options: RedditSessionStateOptions = {},
  ): RedditSessionState {
    if (input instanceof RedditSessionState) return input;
    if (typeof input === "string" && /^[\s]*[\[{]/.test(input)) {
      return RedditSessionState.fromJSON(input, options);
    }
    if (isRecord(input) && "cookies" in input) {
      return RedditSessionState.fromJSON(input, options);
    }
    return RedditSessionState.fromCookies(input as RedditCookiesInput, options);
  }

  /** Normalize a Cookie header, name/value map, or browser cookie array. */
  static fromCookies(
    input: RedditCookiesInput,
    options: RedditSessionStateOptions,
  ): RedditSessionState {
    return new RedditSessionState(normalizeCookies(input), options);
  }

  /** Normalize our snapshot JSON or a browser-export JSON array/object. */
  static fromJSON(
    input: string | unknown,
    options: RedditSessionStateOptions = {},
  ): RedditSessionState {
    const value = typeof input === "string" ? parseJSON(input) : input;
    if (Array.isArray(value)) {
      return RedditSessionState.fromCookies(
        value as readonly RedditSessionCookieInput[],
        options,
      );
    }
    if (!isRecord(value)) {
      throw new TypeError("Reddit session JSON must contain an object or array");
    }

    if (value.version !== undefined && value.version !== SNAPSHOT_VERSION) {
      throw new TypeError(`Unsupported Reddit session version: ${value.version}`);
    }

    const cookies = "cookies" in value ? value.cookies : value;
    const username = options.username ?? stringOrUndefined(value.username);
    const origin = options.origin ?? stringOrUndefined(value.origin);
    const browser =
      options.browser ??
      (stringOrUndefined(value.browser) as BrowserProfile | undefined);
    const os =
      options.os ?? (stringOrUndefined(value.os) as BrowserOS | undefined);

    return RedditSessionState.fromCookies(cookies as RedditCookiesInput, {
      ...(username === undefined ? {} : { username }),
      ...(origin === undefined ? {} : { origin }),
      ...(browser === undefined ? {} : { browser }),
      ...(os === undefined ? {} : { os }),
    });
  }

  toCookieHeader(): string {
    return this.cookies
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
  }

  toJSON(): RedditSessionStateJSON {
    return {
      version: this.version,
      username: this.username,
      origin: this.origin,
      browser: this.browser,
      os: this.os,
      cookies: this.cookies,
    };
  }
}

export function normalizeRedditOrigin(value: string | URL): URL {
  const origin = new URL(value);
  if (origin.username.length > 0 || origin.password.length > 0) {
    throw new TypeError("Reddit origin cannot contain credentials");
  }

  origin.pathname = "/";
  origin.search = "";
  origin.hash = "";
  return origin;
}

function normalizeCookies(input: RedditCookiesInput): RedditSessionCookie[] {
  const rawCookies =
    typeof input === "string"
      ? cookieHeaderEntries(input)
      : Array.isArray(input)
        ? input
        : Object.entries(input).map(([name, value]) => ({ name, value }));
  const cookies = new Map<string, RedditSessionCookie>();

  for (const rawCookie of rawCookies) {
    if (!isRecord(rawCookie)) {
      throw new TypeError("Reddit session cookie entries must be objects");
    }

    const rawExport = "Name raw" in rawCookie || "Content raw" in rawCookie;
    const name = stringOrUndefined(
      rawExport ? rawCookie["Name raw"] : rawCookie.name,
    );
    const value = stringOrUndefined(
      rawExport ? rawCookie["Content raw"] : rawCookie.value,
    );
    if (name === undefined || !COOKIE_NAME.test(name)) {
      throw new TypeError("Reddit session contains an invalid cookie name");
    }
    if (value === undefined || COOKIE_CONTROL_CHARACTER.test(value)) {
      throw new TypeError(`Reddit session cookie ${name} has an invalid value`);
    }

    const expiresAtMs = rawExport
      ? rawExportExpiration(rawCookie)
      : expiration(rawCookie);
    if (expiresAtMs !== undefined && expiresAtMs <= Date.now()) continue;

    const domain = rawExport
      ? rawExportDomain(rawCookie)
      : stringOrUndefined(rawCookie.domain);
    const path = stringOrUndefined(
      rawExport ? rawCookie["Path raw"] : rawCookie.path,
    );
    const sameSite = normalizeSameSite(
      rawExport ? rawCookie["SameSite raw"] : rawCookie.sameSite,
    );
    const secure = rawExport
      ? rawBoolean(rawCookie["Send for raw"])
      : rawCookie.secure;
    const httpOnly = rawExport
      ? rawBoolean(rawCookie["HTTP only raw"])
      : rawCookie.httpOnly;
    const cookie: RedditSessionCookie = {
      name,
      value,
      ...(domain === undefined ? {} : { domain }),
      ...(path === undefined ? {} : { path }),
      ...(expiresAtMs === undefined ? {} : { expiresAtMs }),
      ...(typeof secure === "boolean" ? { secure } : {}),
      ...(typeof httpOnly === "boolean" ? { httpOnly } : {}),
      ...(sameSite === undefined ? {} : { sameSite }),
    };
    cookies.set(`${domain ?? ""}\0${path ?? ""}\0${name}`, cookie);
  }

  return [...cookies.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function cookieHeaderEntries(header: string): Array<Record<string, string>> {
  if (header.trim().length === 0) return [];

  return header.split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 1) {
      throw new TypeError("Reddit Cookie header contains an invalid pair");
    }
    return {
      name: part.slice(0, separator).trim(),
      value: part.slice(separator + 1).trim(),
    };
  });
}

function expiration(cookie: Readonly<Record<string, unknown>>): number | undefined {
  const milliseconds = finiteNumber(cookie.expiresAtMs);
  if (milliseconds !== undefined) return milliseconds;

  const seconds =
    finiteNumber(cookie.expirationDate) ?? finiteNumber(cookie.expires);
  return seconds === undefined || seconds < 0 ? undefined : seconds * 1_000;
}

function rawExportExpiration(
  cookie: Readonly<Record<string, unknown>>,
): number | undefined {
  const value = stringOrUndefined(cookie["Expires raw"]);
  if (value === undefined) return undefined;

  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1_000 : undefined;
}

function rawExportDomain(
  cookie: Readonly<Record<string, unknown>>,
): string | undefined {
  const value = stringOrUndefined(cookie["Host raw"]);
  if (value === undefined) return undefined;

  const domain = value
    .trim()
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, "")
    .split("/", 1)[0]
    ?.toLowerCase();
  if (domain === undefined || domain.length === 0) return undefined;

  return rawBoolean(cookie["This domain only raw"]) === false &&
    !domain.startsWith(".")
    ? `.${domain}`
    : domain;
}

function rawBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function normalizeSameSite(
  value: unknown,
): RedditSessionCookie["sameSite"] | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "no_restriction") return "none";
  return normalized === "lax" || normalized === "strict" || normalized === "none"
    ? normalized
    : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function requiredUsername(value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new TypeError("Reddit session username is required");
  }
  return value;
}

function parseJSON(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new TypeError("Reddit session JSON is invalid");
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
