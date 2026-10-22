import { parseArgs } from "../../runner/helpers/index.ts";

export const JOIN_TARGETS = ["group"] as const;
export type JoinTarget = (typeof JOIN_TARGETS)[number];

export type ParseJoinArgsResult =
  | { ok: true; target: JoinTarget; account: string | null; group: string | null; live: boolean; show: boolean; answer: boolean; agree: boolean; fill: boolean; submit: boolean; bypass: boolean; json: boolean }
  | { ok: false; error: string };

export function parseJoinArgs(argv: string[]): ParseJoinArgsResult {
  const parsed = parseArgs(argv, { boolean: ["json", "live", "show", "answer", "agree", "fill", "submit", "bypass"], valued: ["account", "group"] });
  if (!parsed.ok) return parsed;
  if (parsed.flags.live && (parsed.flags.show || parsed.flags.answer)) return { ok: false, error: "--show and --answer only use Twenty: they take no --live" };
  if (parsed.flags.submit && !(parsed.flags.fill && parsed.flags.live)) return { ok: false, error: "--submit presses Submit after a fill: it needs --fill --live" };
  const [target, extra] = parsed.positionals;
  if (target === undefined) return { ok: false, error: `what to join? (${JOIN_TARGETS.join(", ")})` };
  if (!(JOIN_TARGETS as readonly string[]).includes(target)) return { ok: false, error: `unexpected argument "${target}" (pick ${JOIN_TARGETS.join(" or ")})` };
  if (extra !== undefined) return { ok: false, error: `unexpected argument "${extra}"` };
  const value = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : null);
  return { ok: true, target: target as JoinTarget, account: value("account"), group: value("group"), live: parsed.flags.live === true, show: parsed.flags.show === true, answer: parsed.flags.answer === true, agree: parsed.flags.agree === true, fill: parsed.flags.fill === true, submit: parsed.flags.submit === true, bypass: parsed.flags.bypass === true, json: parsed.flags.json === true };
}
