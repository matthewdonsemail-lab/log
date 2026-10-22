import { parseArgs } from "../../runner/helpers/index.ts";

/** What `log read` can read. Only Facebook groups for now. */
export const READ_TARGETS = ["group"] as const;
export type ReadTarget = (typeof READ_TARGETS)[number];

/** Scrolls down the feed at most, and posts whose comments are read at most, when not given. */
export const DEFAULT_SCROLLS = 6;
export const DEFAULT_COMMENT_POSTS = 5;

export type ParseReadArgsResult =
  | { ok: true; target: ReadTarget; account: string | null; group: string | null; scrolls: number; commentPosts: number; live: boolean; show: boolean; bypass: boolean; json: boolean }
  | { ok: false; error: string };

/** `group [--account <a>] [--group <g>] [--scrolls <n>] [--commentPosts <n>] [--live] [--show] [--bypass] [--json]`. Pure. */
export function parseReadArgs(argv: string[]): ParseReadArgsResult {
  const parsed = parseArgs(argv, { boolean: ["json", "live", "show", "bypass"], valued: ["account", "group", "scrolls", "commentPosts"] });
  if (!parsed.ok) return parsed;
  if (parsed.flags.live && parsed.flags.show) return { ok: false, error: "--show only reads Twenty: it takes no --live" };
  const [target, extra] = parsed.positionals;
  if (target === undefined) return { ok: false, error: `what to read? (${READ_TARGETS.join(", ")})` };
  if (!(READ_TARGETS as readonly string[]).includes(target)) return { ok: false, error: `unexpected argument "${target}" (pick ${READ_TARGETS.join(" or ")})` };
  if (extra !== undefined) return { ok: false, error: `unexpected argument "${extra}"` };
  const value = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : null);
  const count = (name: string, fallback: number, max: number): number | string => {
    const raw = value(name);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= max ? n : `--${name} takes a whole number from 0 to ${max}, not "${raw}"`;
  };
  const scrolls = count("scrolls", DEFAULT_SCROLLS, 50);
  if (typeof scrolls === "string") return { ok: false, error: scrolls };
  const commentPosts = count("commentPosts", DEFAULT_COMMENT_POSTS, 50);
  if (typeof commentPosts === "string") return { ok: false, error: commentPosts };
  return { ok: true, target: target as ReadTarget, account: value("account"), group: value("group"), scrolls, commentPosts, live: parsed.flags.live === true, show: parsed.flags.show === true, bypass: parsed.flags.bypass === true, json: parsed.flags.json === true };
}
