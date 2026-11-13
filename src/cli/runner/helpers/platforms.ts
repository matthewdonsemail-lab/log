import type { Command } from "../types.ts";

export function toolBaseName(command: Pick<Command, "name" | "platform">): string {
  return isPlatform(command.platform) ? `${command.platform}${command.name[0].toUpperCase()}${command.name.slice(1)}` : command.name;
}

export const commandKey = toolBaseName;

export function commandWordOfKey(key: string, platform: string): string {
  if (!key.startsWith(platform)) return key;
  const rest = key.slice(platform.length);
  return rest[0].toLowerCase() + rest.slice(1);
}

export const PLATFORMS = ["facebook", "twitter", "reddit", "discord", "linkedin", "slack", "instagram"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Readonly<Record<Platform, string>> = {
  facebook: "Facebook",
  twitter: "X",
  reddit: "Reddit",
  discord: "Discord",
  linkedin: "LinkedIn",
  slack: "Slack",
  instagram: "Instagram",
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
  linkedin: { twenty: "LINKEDIN", domain: ".linkedin.com", hosts: ["linkedin.com", "www.linkedin.com"], home: "https://www.linkedin.com/feed/", proxy: "none", browser: true },
  slack: { twenty: "SLACK", domain: ".slack.com", hosts: ["slack.com", "app.slack.com"], home: "https://app.slack.com/", proxy: "none", browser: true },
  instagram: { twenty: "INSTAGRAM", domain: ".instagram.com", hosts: ["instagram.com", "www.instagram.com"], home: "https://www.instagram.com/", proxy: "none", browser: true },
};

export function knownPlatformOfAccount(account: { platform?: string | null }): Platform | null {
  const twenty = String(account.platform ?? "").toUpperCase();
  return PLATFORMS.find((p) => PLATFORM_SITES[p].twenty === twenty) ?? null;
}

export function platformOfAccount(account: { platform?: string | null }): Platform {
  const platform = knownPlatformOfAccount(account);
  if (!platform) throw new Error(`accountPlatformMissing: the account's platform is ${account.platform ? `${account.platform}, which log doesn't know` : "not set"}`);
  return platform;
}

export function siteOfAccount(account: { platform?: string | null }): PlatformSite {
  return PLATFORM_SITES[platformOfAccount(account)];
}

export function isKnownPlatformAccount(account: { platform?: string | null }): boolean {
  return knownPlatformOfAccount(account) !== null;
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
  return isPlatform(command.platform) ? PLATFORM_LABELS[command.platform] : ANY_PLATFORM_LABEL;
}

export const ANY_PLATFORM_LABEL = "the platform";

export const isPlatform = (word: string | undefined): word is Platform => (PLATFORMS as readonly string[]).includes(word ?? "");

export function resolvePlatformForm<C extends { name: string; platform: string } = Command>(
  argv: string[],
  find: (name: string, platform?: Platform) => C | undefined,
): { ok: true; command: C; argv: string[] } | { ok: false; error: string } | { ok: true; command: null } {
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
  const platform = isPlatform(second) ? second : isPlatform(command.platform) ? command.platform : "<platform>";
  return { ok: false, error: `log ${command.name}: the platform comes first (rule 63): log ${[platform, command.name, ...tail].join(" ")}` };
}
