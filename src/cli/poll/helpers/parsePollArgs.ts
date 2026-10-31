import { parseArgs } from "../../runner/helpers/index.ts";

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
  const parsed = parseArgs(argv, { boolean: ["bypass"], valued: ["request"] });
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
