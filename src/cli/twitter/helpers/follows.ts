import type { TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const FOLLOWS_USAGE = [
  "Usage: log twitter follows --account <accountName> --handles <handle,handle…> [--json]",
  "Reads, for each handle, whether it follows the account and whether the account follows it, on the direct-API engine (twikit, no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.",
  "X's own answer decides: one friendships/show read per handle, 1.5 s apart, after the session check. Handles come from treg research or matt, never a guess (rule 53).",
].join("\n");

export const FOLLOWS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Read whether each handle follows the account and the account follows it, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "handles", kind: "string", required: true, description: "The handles to check, comma-separated (an @ is dropped)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(account: string, answer: TwitterSessionAnswer): string {
  if (!answer.ok) return `log twitter follows: ${account}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
  const rows = (answer.checked ?? []).map((c) => (c.error ? `  @${c.handle}: ${c.event ?? "failed"}: ${c.error}` : `  @${c.handle}: ${c.followsYou ? "follows you" : "doesn't follow you"}, ${c.youFollow ? "you follow them" : "you don't follow them"}`));
  return [`log twitter follows: @${answer.screenName ?? account}, ${rows.length} handle${rows.length === 1 ? "" : "s"} checked, via the direct-API engine (twikit, no browser):`, ...rows].join("\n");
}

export const followsCommand: Command = {
  usage: FOLLOWS_USAGE,
  platform: "twitter",
  name: "follows",
  effect: "read",
  input: FOLLOWS_INPUT,
  summary: "Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing",
  args: "--account <a> --handles <h,…> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(FOLLOWS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log twitter follows: ${parsed.error}\n${FOLLOWS_USAGE}` };
    const ref = parsed.flags["account"];
    const raw = parsed.flags["handles"];
    if (typeof ref !== "string" || typeof raw !== "string") return { code: 1, stderr: `log twitter follows: --account and --handles are needed\n${FOLLOWS_USAGE}` };
    const handles = [...new Set(raw.split(",").map((h) => h.trim().replace(/^@/, "")).filter(Boolean))];
    if (!handles.length) return refuse("twitter follows", "targetMissing", "--handles names no handle");
    try {
      const opened = await openTwitterAccount(context, "twitter follows", ref);
      if (!opened.ok) return opened.result;
      context.err(`${opened.account.accountName}: follows read for ${handles.length} handle${handles.length === 1 ? "" : "s"} on the direct-API engine (twikit), X called directly`);
      const run = await opened.engine({ action: "follows", handles });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: opened.account.accountName, ...run.answer }, null, 2) };
      const governor = governorLine(run);
      return { code, stdout: [render(opened.account.accountName, run.answer), ...(governor ? [governor] : [])].join("\n") };
    } catch (error) {
      return refuseError("twitter follows", error);
    }
  },
};
