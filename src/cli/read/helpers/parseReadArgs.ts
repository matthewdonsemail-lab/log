import { DEFAULT_SECONDS_PER_SCROLL } from "../../../facebook/group/members/index.ts";
import { numberOf, parseArgs, parserSpecOf } from "../../runner/helpers/index.ts";
import { READ_INPUT } from "./readInput.ts";

export const READ_TARGETS = ["group", "members"] as const;
export type ReadTarget = (typeof READ_TARGETS)[number];

export const DEFAULT_SCROLLS = 6;
export const DEFAULT_COMMENT_POSTS = 5;

const GROUP_ONLY = ["scrolls", "commentPosts", "live", "show"] as const;
const MEMBERS_ONLY = ["count", "secondsPerScroll", "maxScrolls", "owners"] as const;

export interface ReadGroupArgs {
  ok: true;
  target: "group";
  account: string | null;
  group: string | null;
  scrolls: number;
  commentPosts: number;
  live: boolean;
  show: boolean;
  bypass: boolean;
  json: boolean;
}

export interface ReadMembersArgs {
  ok: true;
  target: "members";
  account: string | null;
  group: string | null;
  count: number | null;
  secondsPerScroll: number;
  maxScrolls: number | null;
  owners: boolean;
  bypass: boolean;
  json: boolean;
}

export type ParseReadArgsResult = ReadGroupArgs | ReadMembersArgs | { ok: false; error: string };

export function parseReadArgs(argv: string[]): ParseReadArgsResult {
  if (argv.some((a) => a === "--worker" || a.startsWith("--worker="))) return { ok: false, error: "--worker became its own command: log facebook poll --request <request json>" };
  const parsed = parseArgs(argv, parserSpecOf(READ_INPUT));
  if (!parsed.ok) return parsed;
  const [target, extra] = parsed.positionals;
  if (target === undefined) return { ok: false, error: `what to read? (${READ_TARGETS.join(", ")})` };
  if (!(READ_TARGETS as readonly string[]).includes(target)) return { ok: false, error: `unexpected argument "${target}" (pick ${READ_TARGETS.join(" or ")})` };
  if (extra !== undefined) return { ok: false, error: `unexpected argument "${extra}"` };
  const other = target === "group" ? MEMBERS_ONLY.find((f) => parsed.flags[f] !== undefined) : GROUP_ONLY.find((f) => parsed.flags[f] !== undefined);
  if (other) return { ok: false, error: `--${other} is for read ${target === "group" ? "members" : "group"}, not read ${target}` };
  const value = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : null);
  const base = { account: value("account"), group: value("group"), bypass: parsed.flags.bypass === true, json: parsed.flags.json === true };
  if (target === "members") {
    const wanted = numberOf(parsed, "count") ?? null;
    const secondsPerScroll = numberOf(parsed, "secondsPerScroll") ?? DEFAULT_SECONDS_PER_SCROLL;
    const maxScrolls = numberOf(parsed, "maxScrolls") ?? null;
    return { ok: true, target: "members", ...base, count: wanted, secondsPerScroll, maxScrolls, owners: parsed.flags.owners === true };
  }
  if (parsed.flags.live && parsed.flags.show) return { ok: false, error: "--show only reads Twenty: it takes no --live" };
  const scrolls = numberOf(parsed, "scrolls") ?? DEFAULT_SCROLLS;
  const commentPosts = numberOf(parsed, "commentPosts") ?? DEFAULT_COMMENT_POSTS;
  return { ok: true, target: "group", ...base, scrolls, commentPosts, live: parsed.flags.live === true, show: parsed.flags.show === true };
}
