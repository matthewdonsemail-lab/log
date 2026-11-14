import { PLATFORM_LABELS, PLATFORM_SITES, PLATFORMS } from "../../runner/helpers/platforms.ts";
import type { Platform } from "../../runner/helpers/platforms.ts";

export const START_ACTIONS = ["setup", "add", "signIn", "check", "agent", "console"] as const;
export type StartAction = (typeof START_ACTIONS)[number];

export const START_PLATFORMS: readonly Platform[] = ["twitter", "linkedin", "slack", "reddit", "discord", "instagram", "facebook"];

export type SignInRoute = { kind: "cookies"; hint: string } | { kind: "connect" } | { kind: "browser" };

const COOKIE_HINTS: Partial<Record<Platform, string>> = {
  twitter: "paste its auth_token, ct0 and twid cookies from a browser signed in to x.com",
  linkedin: "paste its li_at and JSESSIONID cookies from a browser signed in to linkedin.com",
  slack: "paste its d cookie (xoxd-…) from a browser signed in to app.slack.com",
};

export function signInRouteOf(platform: Platform): SignInRoute {
  const hint = COOKIE_HINTS[platform];
  if (hint) return { kind: "cookies", hint };
  if (platform === "facebook") return { kind: "connect" };
  return { kind: "browser" };
}

export const SIGN_IN_ROUTE_NAMES = ["browser", "cookies"] as const;
export type SignInRouteName = (typeof SIGN_IN_ROUTE_NAMES)[number];

export const SIGN_IN_ROUTES: Readonly<Record<Platform, readonly SignInRouteName[]>> = Object.fromEntries(
  PLATFORMS.map((platform) => [platform, SIGN_IN_ROUTE_NAMES.filter((route) => (route === "browser" ? PLATFORM_SITES[platform].browser : Boolean(COOKIE_HINTS[platform])))]),
) as unknown as Record<Platform, readonly SignInRouteName[]>;

export function signInRoutesOf(platform: Platform): readonly SignInRouteName[] {
  return SIGN_IN_ROUTES[platform];
}

export function platformOfTwenty(value: unknown): Platform | null {
  const twenty = String(value ?? "").toUpperCase();
  return PLATFORMS.find((p) => PLATFORM_SITES[p].twenty === twenty) ?? null;
}

export function platformOption(platform: Platform): { value: string; label: string; hint: string } {
  const route = signInRouteOf(platform);
  const hint = route.kind === "cookies" ? "sign in by pasting its cookies" : route.kind === "connect" ? "signs in through its own browser and proxy" : "sign in once in its own browser";
  return { value: platform, label: PLATFORM_LABELS[platform], hint };
}

export function browserSignInSteps(platform: Platform, accountName: string, hasProfile: boolean): string {
  return [
    `${PLATFORM_LABELS[platform]} signs in once, in the account's own browser:`,
    ...(hasProfile ? [] : [`  0. Give it an AdsPower browser profile: log localAccount add --platform ${platform} --account ${accountName} --adsPower <profileId>`]),
    `  1. log inspect start --account ${accountName}`,
    "  2. Sign in by hand in the window that opens.",
    `  3. log inspect do stop --account ${accountName}   (the session is saved when it stops)`,
    `  4. log ${platform} session check --account ${accountName}`,
  ].join("\n");
}

export function agentSetupText(): string {
  return [
    "Connect your agent to log's tools (MCP):",
    "  Claude Code:  claude mcp add log -- logMcp",
    "  Codex:        codex mcp add log -- logMcp",
    "  Any other:    run `logMcp` as a stdio MCP server",
    "Then ask your agent to check an account. More: https://log.listeningkit.com/docs",
  ].join("\n");
}

export function twentyReady(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean((env.LOG_TWENTY_BASE_URL || env.TWENTY_BASE_URL)?.trim() && (env.LOG_TWENTY_API_KEY || env.TWENTY_API_KEY)?.trim());
}
