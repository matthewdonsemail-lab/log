import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { CopiedRequest, CopiedRequestProblem, LinkedinBrowser } from "./types.ts";

const HEADER_KEYS: Record<string, keyof LinkedinBrowser> = {
  "user-agent": "userAgent",
  "sec-ch-ua": "secChUa",
  "sec-ch-ua-mobile": "secChUaMobile",
  "sec-ch-ua-platform": "secChUaPlatform",
  "accept-language": "acceptLanguage",
  "x-li-track": "xLiTrack",
};

const VALUE_FLAGS = new Set(["--data-raw", "--data", "-d", "-X", "--request", "--data-binary", "-A", "--user-agent", "-e", "--referer"]);

export const LINKEDIN_WWW_COOKIES = ["li_at", "li_a", "JSESSIONID", "bscookie", "li_rm"] as const;

export function linkedinCookieDomain(name: string, domain: string): string {
  return domain === ".linkedin.com" && (LINKEDIN_WWW_COOKIES as readonly string[]).includes(name) ? ".www.linkedin.com" : domain;
}

export const SESSION_COOKIES = ["li_at", "JSESSIONID"] as const;
export const BROWSER_COOKIES = ["bcookie", "bscookie"] as const;

function unescapeCmd(text: string): string {
  return text.replace(/\^\r?\n/g, " ").replace(/\^(.)/g, "$1");
}

function argsOf(text: string): string[] {
  const out: string[] = [];
  const pattern = /'((?:[^']|'\\'')*)'|"((?:[^"\\]|\\.)*)"|(\S+)/g;
  const joined = text.replace(/\\\r?\n/g, " ");
  for (const m of joined.matchAll(pattern)) {
    if (m[1] !== undefined) out.push(m[1].replace(/'\\''/g, "'"));
    else if (m[2] !== undefined) out.push(m[2].replace(/\\(.)/g, "$1"));
    else out.push(m[3]!);
  }
  return out;
}

export function cookiesOf(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const at = part.indexOf("=");
    if (at <= 0) continue;
    const name = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    if (name && value) out[name] = value;
  }
  return out;
}

export function parseCopiedRequest(raw: string): CopiedRequest | null {
  const text = /\^\s*$/m.test(raw) || /\^"/.test(raw) ? unescapeCmd(raw) : raw;
  const args = argsOf(text.trim());
  if (args[0]?.toLowerCase() !== "curl") return null;
  let url: string | null = null;
  let cookieHeader = "";
  const browser: Partial<LinkedinBrowser> = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]!;
    if ((arg === "-H" || arg === "--header") && args[i + 1] !== undefined) {
      const header = args[++i]!;
      const at = header.indexOf(":");
      if (at <= 0) continue;
      const name = header.slice(0, at).trim().toLowerCase();
      const value = header.slice(at + 1).trim();
      if (name === "cookie") cookieHeader = value;
      else if (HEADER_KEYS[name]) browser[HEADER_KEYS[name]] = value;
    } else if ((arg === "-b" || arg === "--cookie") && args[i + 1] !== undefined) {
      cookieHeader = args[++i]!;
    } else if (/^https?:\/\//i.test(arg) && !url) {
      url = arg;
    } else if (VALUE_FLAGS.has(arg)) {
      i++;
    }
  }
  return { url, cookies: cookiesOf(cookieHeader), browser: browser.userAgent ? (browser as LinkedinBrowser) : null };
}

interface HarHeader {
  name?: string;
  value?: string;
}

interface HarEntry {
  request?: { url?: string; headers?: HarHeader[]; cookies?: HarHeader[] };
}

export function requestFromHar(text: string): CopiedRequest | null {
  let entries: HarEntry[];
  try {
    entries = ((JSON.parse(text) as { log?: { entries?: HarEntry[] } }).log?.entries ?? []) as HarEntry[];
  } catch {
    return null;
  }
  const candidates = entries
    .map((entry) => {
      const url = entry.request?.url ?? "";
      if (!/^https:\/\/www\.linkedin\.com\//i.test(url)) return null;
      const headers = entry.request?.headers ?? [];
      const header = headers.find((h) => h.name?.toLowerCase() === "cookie")?.value ?? "";
      const fromList = Object.fromEntries((entry.request?.cookies ?? []).filter((c) => c.name && c.value).map((c) => [c.name!, c.value!]));
      const cookies = { ...fromList, ...cookiesOf(header) };
      if (!cookies["li_at"]) return null;
      const browser: Partial<LinkedinBrowser> = {};
      for (const h of headers) {
        const key = HEADER_KEYS[h.name?.toLowerCase() ?? ""];
        if (key && h.value) browser[key] = h.value;
      }
      return { url, cookies, browser: browser.userAgent ? (browser as LinkedinBrowser) : null, voyager: url.includes("/voyager/api/") } as CopiedRequest & { voyager: boolean };
    })
    .filter((c) => c !== null);
  const pick = [...candidates].reverse().find((c) => c.voyager && c.browser) ?? [...candidates].reverse().find((c) => c.browser) ?? candidates.at(-1);
  if (!pick) return { url: "https://www.linkedin.com/", cookies: {}, browser: null };
  return { url: pick.url, cookies: pick.cookies, browser: pick.browser };
}

export function isMobileBrowser(browser: LinkedinBrowser): boolean {
  return browser.secChUaMobile?.trim() === "?1" || /iPhone|iPad|iPod|Android|Mobile/i.test(browser.userAgent) || /"(iOS|Android)"/i.test(browser.secChUaPlatform ?? "");
}

export function copiedRequestProblem(request: CopiedRequest | null): CopiedRequestProblem | null {
  if (!request) return "notCurl";
  if (!request.url || !/^https:\/\/([a-z0-9-]+\.)*linkedin\.com\//i.test(request.url)) return "notLinkedin";
  if (!Object.keys(request.cookies).length) return "noCookies";
  if (SESSION_COOKIES.some((c) => !request.cookies[c])) return "noSessionCookies";
  if (BROWSER_COOKIES.some((c) => !request.cookies[c])) return "noBrowserCookies";
  if (!request.browser?.userAgent) return "noUserAgent";
  if (isMobileBrowser(request.browser)) return "mobileBrowser";
  return null;
}

export const COPIED_REQUEST_PROBLEMS: Record<CopiedRequestProblem, string> = {
  notCurl: "the clipboard doesn't hold a request copied as cURL",
  notLinkedin: "the copied request isn't to linkedin.com",
  noCookies: "the copied request carries no cookies: copy one from a page where you're signed in",
  noSessionCookies: "the copied request has no li_at or JSESSIONID: you aren't signed in in that tab",
  noBrowserCookies: "the copied request has no bcookie or bscookie",
  noUserAgent: "the copied request has no user-agent header",
  mobileBrowser: "the copied request comes from a phone browser (Chrome's device toolbar is on): LinkedIn ends a session whose phone user agent arrives over desktop Chrome. Turn the device toolbar off and copy the request again",
};

export function browserFile(stateRoot: string, account: string): string {
  return join(stateRoot, account, "browser.json");
}

export function saveBrowser(stateRoot: string, account: string, browser: LinkedinBrowser): string {
  mkdirSync(join(stateRoot, account), { recursive: true });
  const path = browserFile(stateRoot, account);
  writeFileSync(path, JSON.stringify(browser, null, 2), { mode: 0o600 });
  return path;
}

export function readBrowser(stateRoot: string, account: string): LinkedinBrowser | null {
  try {
    const data = JSON.parse(readFileSync(browserFile(stateRoot, account), "utf8")) as LinkedinBrowser;
    return data.userAgent ? data : null;
  } catch {
    return null;
  }
}
