import { PLATFORM_LABELS, PLATFORMS } from "../../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../../cli/runner/helpers/platforms.ts";

const WORDS: Readonly<Record<Platform, readonly RegExp[]>> = {
  facebook: [/\bfacebook\b/i, /\bmarketplace\b/i, /\bmessenger\b/i],
  twitter: [/\btwitter\b/i, /\btweets?\b/i, /\bX\b/],
  reddit: [/\breddit\b/i, /\bsubreddits?\b/i],
  discord: [/\bdiscord\b/i],
  linkedin: [/\blinkedin\b/i],
  slack: [/\bslack\b/i],
  instagram: [/\binstagram\b/i],
};

export function platformsNamed(text: string): Platform[] {
  return PLATFORMS.filter((platform) => WORDS[platform].some((word) => word.test(text)));
}

export function platformOfTopic(topic: string): Platform | null {
  for (const platform of PLATFORMS) {
    for (const name of [platform, PLATFORM_LABELS[platform].toLowerCase()]) {
      if (topic === name) return platform;
      if (topic.startsWith(name) && /[A-Z0-9]/.test(topic[name.length] ?? "")) return platform;
    }
  }
  return null;
}

export function platformOfToolName(name: string): Platform | null {
  const lower = name.toLowerCase();
  return PLATFORMS.find((platform) => lower.includes(platform)) ?? null;
}

export const isShared = (platform: string): boolean => platform === "any" || platform === "byArgument";
