import type { TwitterFollower, TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const FOLLOWERS_USAGE = [
  "Usage: log twitter followers --account <accountName> [--limit <n>] [--json]",
  "Reads the account's own followers on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80), newest first: handle, name, bio, location, follower and post counts, whether they take DMs. Sends nothing.",
  "X's own answer decides: the session check first, then X's followers list, 100 a page, 1.5 s apart. --limit is how many to read, default 200, at most 4000.",
].join("\n");

export const FOLLOWERS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Read an X account's own followers, newest first, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "limit", kind: "string", description: "How many followers to read (default 200, at most 4000)" },
        JSON_FLAG,
      ],
    },
  ],
};

const flat = (text: string, max: number) => {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
};

function line(f: TwitterFollower, i: number): string {
  return `  ${i + 1}. @${f.handle ?? f.userId} · ${f.followers} followers${f.location ? ` · ${flat(f.location, 40)}` : ""}${f.canDm ? "" : " · no dms"}${f.bio ? `\n     ${flat(f.bio, 140)}` : ""}`;
}

function render(account: string, answer: TwitterSessionAnswer): string {
  if (!answer.ok) return `log twitter followers: ${account}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
  const list = answer.followers ?? [];
  return [`log twitter followers: @${account}, ${list.length} followers read${answer.complete ? " (all of them)" : ""}, newest first, via the direct-API engine (no browser):`, ...list.map(line)].join("\n");
}

export const followersCommand: Command = {
  usage: FOLLOWERS_USAGE,
  platform: "twitter",
  name: "followers",
  effect: "read",
  input: FOLLOWERS_INPUT,
  summary: "Read an X account's own followers on the direct-API engine, sending nothing",
  args: "--account <a> [--limit <n>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(FOLLOWERS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log twitter followers: ${parsed.error}\n${FOLLOWERS_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log twitter followers: --account is needed\n${FOLLOWERS_USAGE}` };
    const raw = parsed.flags["limit"];
    const limit = raw === undefined ? 200 : Number(raw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 4000) return refuse("twitter followers", "limitInvalid", "--limit is a whole number from 1 to 4000");
    try {
      const opened = await openTwitterAccount(context, "twitter followers", ref);
      if (!opened.ok) return opened.result;
      context.err(`${opened.account.accountName}: followers read (up to ${limit}) on the direct-API engine, X called directly`);
      const run = await opened.engine({ action: "followers", limit });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: opened.account.accountName, ...run.answer }, null, 2) };
      const governor = governorLine(run);
      return { code, stdout: [render(opened.account.accountName, run.answer), ...(governor ? [governor] : [])].join("\n") };
    } catch (error) {
      return refuseError("twitter followers", error);
    }
  },
};
