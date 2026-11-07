import { PLATFORM_SITES } from "../../runner/helpers/platforms.ts";
import type { Platform } from "../../runner/helpers/platforms.ts";

export type ExtensionId = "treg" | "memelord" | "inworld" | "fishAudio";

export type ExtensionAccess = { kind: "signIn"; command: string; args: readonly string[] } | { kind: "apiKey"; keyName: string; keyUrl: string; keyHint: string };

export interface SetupExtension {
  id: ExtensionId;
  label: string;
  adds: string;
  signUpUrl: string;
  signUpNote?: string;
  access: ExtensionAccess;
}

export const SETUP_EXTENSIONS: readonly SetupExtension[] = [
  {
    id: "treg",
    label: "treg",
    adds: "the tool catalog: web search, X and TikTok data, SEO, enrichment, with the keys held by treg",
    signUpUrl: "https://treg.to/?ref=matthewdonse-aebsh",
    access: { kind: "signIn", command: "treg", args: ["login"] },
  },
  {
    id: "memelord",
    label: "Memelord",
    adds: "memes, clips and stickers found for the moment in a chat",
    signUpUrl: "https://www.memelord.com/sign-up?ref=kfwut9wc",
    access: { kind: "apiKey", keyName: "MEMELORD_API_KEY", keyUrl: "https://www.memelord.com/settings/developer", keyHint: "Settings, Developer, create an API key" },
  },
  {
    id: "inworld",
    label: "Inworld",
    adds: "voice notes in your own cloned voice (the default voice provider)",
    signUpUrl: "https://inworld.ai/signup?ref=FSNLMJ2H",
    signUpNote: "Subscribe through this link and you get $10 in credits.",
    access: { kind: "apiKey", keyName: "INWORLD_API_KEY", keyUrl: "https://platform.inworld.ai", keyHint: "Settings, API Keys, copy the Basic (Base64) key" },
  },
  {
    id: "fishAudio",
    label: "Fish Audio",
    adds: "voice notes in your own cloned voice, as a second voice provider",
    signUpUrl: "https://fish.audio/?aff=Q6W4DNSLJCSXG",
    access: { kind: "apiKey", keyName: "FISH_API_KEY", keyUrl: "https://fish.audio/app/api-keys", keyHint: "API Keys, create a key" },
  },
];

export const ADSPOWER_SETUP = {
  label: "AdsPower",
  adds: "the browser every browser platform's account signs in and acts through, one profile per account",
  signUpUrl: "https://www.adspower.com/share/pD25Iu",
  keyName: "ADSPOWER_API_KEY",
  keyHint: "AdsPower, API, the Local API key (leave empty if the Local API has no key)",
} as const;

export function needsBrowser(platforms: readonly Platform[]): boolean {
  return platforms.some((platform) => PLATFORM_SITES[platform].browser);
}

export function setEnvValue(text: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((raw) => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(raw));
  if (at >= 0) {
    lines[at] = line;
    return lines.join("\n");
  }
  const body = text.replace(/\s+$/, "");
  return `${body ? `${body}\n` : ""}${line}\n`;
}

export interface SetupOutcome {
  label: string;
  ok: boolean;
  detail: string;
}

export function setupSummary(outcomes: readonly SetupOutcome[], envFile: string): string {
  const lines = ["Setup summary:"];
  for (const outcome of outcomes) lines.push(`  ${outcome.ok ? "✓" : "·"} ${outcome.label}: ${outcome.detail}`);
  if (!outcomes.length) lines.push("  nothing was set up this time");
  lines.push(
    "",
    `Your keys are in ${envFile}.`,
    "Run it again any time: log launch --setup",
    "Check an account: log <platform> session check --account <name>",
    "See every provider's balance: log balance",
    "Connect your agent: claude mcp add log -- logMcp",
  );
  return lines.join("\n");
}
