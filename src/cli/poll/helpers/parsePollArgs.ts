import { parseArgs, parserSpecOf } from "../../runner/helpers/index.ts";
import type { CommandInput } from "../../runner/types.ts";

export const POLL_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Poll a Facebook group from one account in its open browser, once or for a time; or answer OpenMagpie's facebook_group worker with request",
      positionals: [
        { name: "group", kind: "string", description: "The group's url or id" },
        { name: "account", kind: "string", description: "The account whose open browser reads it (needed with group)" },
        { name: "howLong", kind: "string", description: "How long to poll, a number and s, m or h up to 24h (30m, 2h); left out, one poll" },
      ],
      flags: [
        { name: "request", kind: "string", format: "jsonObject", description: "OpenMagpie's whole facebook_group request, as JSON: its groups come from it, and it never skips the hours" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when the owner asked (rule 86)" },
      ],
      groups: [
        { rule: "atLeastOne", names: ["group", "request"] },
        { rule: "atMostOne", names: ["group", "request"] },
      ],
    },
  ],
};

export const POLL_TARGETS = ["group"] as const;

export const MAX_POLL_MS = 24 * 3_600_000;

export type ParsePollArgsResult =
  | { ok: true; mode: "group"; group: string; account: string; forMs: number | null; bypass: boolean }
  | { ok: true; mode: "request"; request: string }
  | { ok: false; error: string };

export function durationMs(text: string): number | null {
  const match = /^(\d+)(s|m|h)$/.exec(text.trim());
  if (!match) return null;
  const ms = Number(match[1]) * { s: 1_000, m: 60_000, h: 3_600_000 }[match[2] as "s" | "m" | "h"];
  return ms > 0 && ms <= MAX_POLL_MS ? ms : null;
}

export function parsePollArgs(argv: string[]): ParsePollArgsResult {
  const parsed = parseArgs(argv, parserSpecOf(POLL_INPUT));
  if (!parsed.ok) return parsed;
  if (typeof parsed.flags.request === "string") {
    if (parsed.positionals.length || parsed.flags.bypass) return { ok: false, error: "--request is OpenMagpie's whole call: its groups come from the request, and it never skips the hours" };
    return { ok: true, mode: "request", request: parsed.flags.request };
  }
  const [group, account, howLong, extra] = parsed.positionals;
  if (!group || !account) return { ok: false, error: "name the group and the account: log facebook poll <group> <account> [<how long to poll>]" };
  if (extra !== undefined) return { ok: false, error: `unexpected argument "${extra}"` };
  const forMs = howLong === undefined ? null : durationMs(howLong);
  if (howLong !== undefined && forMs === null) return { ok: false, error: `how long to poll is a number and s, m or h, up to 24h (30m, 2h), not "${howLong}"` };
  return { ok: true, mode: "group", group, account, forMs, bypass: parsed.flags.bypass === true };
}
