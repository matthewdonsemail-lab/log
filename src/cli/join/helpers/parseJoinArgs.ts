import { JSON_FLAG, parseArgs, parserSpecOf } from "../../runner/helpers/index.ts";
import type { CommandInput } from "../../runner/types.ts";

export const JOIN_INPUT: CommandInput = {
  forms: [
    {
      words: ["group"],
      summary: "Join a Facebook group as one account, in its open browser: read its gate; live presses Join, or with fill and submit sends the answers",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The Facebook account that joins" },
        { name: "group", kind: "string", required: true, description: "The group's url, id or name" },
        { name: "show", kind: "boolean", description: "Only read the group's saved record; nothing opens" },
        { name: "answer", kind: "boolean", description: "Save answers to the group's questions to its record, never sent; give them with set" },
        { name: "set", kind: "pairs", description: "An answer per question number, as n=option label or text (with answer)" },
        { name: "agree", kind: "boolean", description: "Agree to the group's rules (with answer)" },
        { name: "fill", kind: "boolean", description: "Put the saved answers into the group's dialog, step by step" },
        { name: "submit", kind: "boolean", description: "Press Submit after a live fill" },
        { name: "live", kind: "boolean", live: true, description: "Press Join, or fill the dialog, on Facebook, only when the owner asked (rule 8)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when the owner asked (rule 86)" },
        JSON_FLAG,
      ],
      groups: [{ rule: "atMostOne", names: ["show", "answer", "fill"] }],
    },
  ],
};

export const JOIN_TARGETS = ["group"] as const;
export type JoinTarget = (typeof JOIN_TARGETS)[number];

export type ParseJoinArgsResult =
  | { ok: true; target: JoinTarget; account: string | null; group: string | null; live: boolean; show: boolean; answer: boolean; agree: boolean; fill: boolean; submit: boolean; bypass: boolean; json: boolean }
  | { ok: false; error: string };

export function parseJoinArgs(argv: string[]): ParseJoinArgsResult {
  const parsed = parseArgs(argv, parserSpecOf(JOIN_INPUT));
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
