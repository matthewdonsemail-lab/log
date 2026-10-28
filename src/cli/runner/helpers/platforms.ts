import type { Command } from "../types.ts";

export function toolBaseName(command: Pick<Command, "name" | "platform">): string {
  return isPlatform(command.platform) && command.platform !== PLATFORMS[0] ? `${command.platform}${command.name[0].toUpperCase()}${command.name.slice(1)}` : command.name;
}

export const commandKey = toolBaseName;

export function commandWordOfKey(key: string, platform: string): string {
  if (platform === PLATFORMS[0] || !key.startsWith(platform)) return key;
  const rest = key.slice(platform.length);
  return rest[0].toLowerCase() + rest.slice(1);
}

export const PLATFORMS = ["facebook", "twitter", "reddit", "discord"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Readonly<Record<Platform, string>> = {
  facebook: "Facebook",
  twitter: "X",
  reddit: "Reddit",
  discord: "Discord",
};

export interface PlatformSite {
  twenty: string;
  domain: string;
  hosts: readonly string[];
  home: string;
  proxy: "required" | "none";
  browser: boolean;
}

export const PLATFORM_SITES: Readonly<Record<Platform, PlatformSite>> = {
  facebook: { twenty: "FACEBOOK", domain: ".facebook.com", hosts: ["facebook.com"], home: "https://www.facebook.com/marketplace/", proxy: "required", browser: true },
  twitter: { twenty: "TWITTER", domain: ".x.com", hosts: ["x.com", "twitter.com"], home: "https://x.com/home", proxy: "none", browser: false },
  reddit: { twenty: "REDDIT", domain: ".reddit.com", hosts: ["reddit.com", "redd.it", "redditmedia.com"], home: "https://www.reddit.com/", proxy: "none", browser: true },
  discord: { twenty: "DISCORD", domain: ".discord.com", hosts: ["discord.com", "discord.gg"], home: "https://discord.com/login", proxy: "none", browser: true },
};

export function platformOfAccount(account: { platform?: string | null }): Platform {
  const twenty = String(account.platform ?? "FACEBOOK").toUpperCase();
  return PLATFORMS.find((p) => PLATFORM_SITES[p].twenty === twenty) ?? PLATFORMS[0];
}

export function siteOfAccount(account: { platform?: string | null }): PlatformSite {
  return PLATFORM_SITES[platformOfAccount(account)];
}

export function isKnownPlatformAccount(account: { platform?: string | null }): boolean {
  const twenty = String(account.platform ?? "").toUpperCase();
  return PLATFORMS.some((p) => PLATFORM_SITES[p].twenty === twenty);
}

export function hostOnPlatforms(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return new URL(url).protocol === "https:" && PLATFORMS.some((p) => PLATFORM_SITES[p].hosts.some((h) => host === h || host.endsWith(`.${h}`)));
}

export function platformLabel(command: Pick<Command, "platform">): string {
  return isPlatform(command.platform) ? PLATFORM_LABELS[command.platform] : PLATFORM_LABELS[PLATFORMS[0]];
}

export const isPlatform = (word: string | undefined): word is Platform => (PLATFORMS as readonly string[]).includes(word ?? "");

export function resolvePlatformForm(
  argv: string[],
  find: (name: string, platform?: Platform) => Command | undefined,
): { ok: true; command: Command; argv: string[] } | { ok: false; error: string } | { ok: true; command: null } {
  const [first, second, ...rest] = argv;
  if (isPlatform(first)) {
    const command = second === undefined ? undefined : find(second, first);
    if (!command) return { ok: false, error: `log ${first}: name a command after the platform: log ${first} <command> …` };
    if (command.platform === "any") return { ok: false, error: `log ${first} ${command.name}: ${command.name} works on any platform and takes none: log ${[command.name, ...rest].join(" ")}` };
    if (isPlatform(command.platform) && command.platform !== first) return { ok: false, error: `log ${first} ${command.name}: ${command.name} is ${command.platform}'s, not ${first}'s: log ${[command.platform, command.name, ...rest].join(" ")}` };
    return { ok: true, command, argv: command.platform === "byArgument" ? [first, ...rest] : rest };
  }
  const command = first === undefined ? undefined : find(first);
  if (!command) return { ok: true, command: null };
  if (command.platform === "any") return { ok: true, command, argv: [second, ...rest].filter((a): a is string => a !== undefined) };
  if (command.platform === "byArgument" && !isPlatform(second)) return { ok: true, command, argv: [second, ...rest].filter((a): a is string => a !== undefined) };
  const tail = isPlatform(second) ? rest : [second, ...rest].filter((a): a is string => a !== undefined);
  const platform = isPlatform(second) ? second : isPlatform(command.platform) ? command.platform : PLATFORMS[0];
  return { ok: false, error: `log ${command.name}: the platform comes first (rule 63): log ${[platform, command.name, ...tail].join(" ")}` };
}
