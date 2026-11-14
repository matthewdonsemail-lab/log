import type { Platform } from "../../../cli/runner/helpers/platforms.ts";
import { PLATFORM_LABELS } from "../../../cli/runner/helpers/platforms.ts";
import { DISCORD_PLATFORM } from "../../../discord/account/session/client.ts";
import { INSTAGRAM_PLATFORM } from "../../../instagram/account/session/client.ts";
import { LINKEDIN_PLATFORM } from "../../../linkedin/account/session/client.ts";
import { hasFacebookSession } from "../../../marketplace/socialAccount/index.ts";
import type { PlaywrightCookie } from "../../../marketplace/socialAccount/index.ts";
import { REDDIT_PLATFORM } from "../../../reddit/account/session/client.ts";
import { SLACK_PLATFORM } from "../../../slack/account/session/client.ts";
import { sessionCookiesOf, sessionStorageOf } from "../../session/index.ts";
import type { PlatformShape } from "../../session/index.ts";

export type BrowserSession = { cookies: PlaywrightCookie[]; origins: unknown[] };

export type BrowserSessionGate = { ok: true } | { ok: false; code: "noPlatformSession" | "accountPlatformMissing"; detail: string };

type SessionNeeds = Pick<PlatformShape, "sessionCookies" | "sessionStorage">;

export const BROWSER_SESSION_NEEDS: Readonly<Record<Exclude<Platform, "facebook">, SessionNeeds>> = {
  twitter: { sessionCookies: ["auth_token", "ct0"] },
  reddit: REDDIT_PLATFORM,
  discord: DISCORD_PLATFORM,
  linkedin: LINKEDIN_PLATFORM,
  slack: SLACK_PLATFORM,
  instagram: INSTAGRAM_PLATFORM,
};

export function browserSessionGate(platform: Platform | null, state: BrowserSession): BrowserSessionGate {
  if (!platform) return { ok: false, code: "accountPlatformMissing", detail: "the account's platform is not set, so its sign-in cookies are unknown" };
  if (platform === "facebook") return hasFacebookSession(state.cookies) ? { ok: true } : { ok: false, code: "noPlatformSession", detail: "the browser has no Facebook c_user and xs cookies" };
  const needs = BROWSER_SESSION_NEEDS[platform];
  const cookies = sessionCookiesOf(state.cookies);
  const missing = needs.sessionCookies.filter((name) => !cookies[name]);
  const stored = needs.sessionStorage ? sessionStorageOf(state.origins, needs.sessionStorage) : {};
  const absent = needs.sessionStorage ? needs.sessionStorage.keys.filter((key) => !stored[key]).map((key) => `${needs.sessionStorage!.origin} localStorage ${key}`) : [];
  if (missing.length || absent.length) return { ok: false, code: "noPlatformSession", detail: `the browser has no ${PLATFORM_LABELS[platform]} ${[...missing, ...absent].join(" + ")}` };
  return { ok: true };
}
