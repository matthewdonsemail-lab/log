import { findTwitterAccount, recordTwitterSession, twitterGate } from "../../twitter/account/session/index.ts";
import type { TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const SESSION_USAGE = [
  "Usage: log twitter session check --account <accountName> [--json]",
  "Checks that X still accepts the account's saved session, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.",
  "X's own answer decides: the session check's HTTP status (401 or 403 loggedOut, 200 or 404 loggedIn), then the account's profile read (suspended or locked: restricted). The result goes to socialAccounts.sessionState, and X's refreshed cookies are merged back into the row.",
].join("\n");

export const SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that X still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: TwitterSessionAnswer, lines: string[]): string {
  const head = answer.ok
    ? `log twitter session check: ${accountName} is loggedIn as @${answer.screenName ?? "?"} (${answer.userId}), via the direct-API engine (no browser).`
    : `log twitter session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
  const g = answer.governor;
  const governor = g ? `  governor: ${g.day_count}/${g.daily_cap} requests today${g.cooldown_active ? `, paused ${Math.ceil(g.cooldown_remaining_s / 60)} min` : ""}` : null;
  return [head, ...(governor ? [governor] : []), ...lines.map((l) => `  ${l}`)].join("\n");
}

export const sessionCommand: Command = {
  usage: SESSION_USAGE,
  platform: "twitter",
  name: "session",
  effect: "read",
  input: SESSION_INPUT,
  summary: "Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log twitter session: ${parsed.error}\n${SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log twitter session: give check\n${SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log twitter session check: --account is needed\n${SESSION_USAGE}` };
    try {
      const account = await findTwitterAccount(context.twenty, ref);
      const gate = twitterGate(account);
      if (!gate.ok) return refuse("twitter session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directTwitter) return { code: 1, stderr: "log twitter session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine, X called directly`);
      const run = context.directTwitter(account, { action: "ping" });
      const lines = await recordTwitterSession(context.twenty, account, run, context.now?.() ?? new Date());
      for (const line of lines) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer, []) };
    } catch (error) {
      return refuseError("twitter session check", error);
    }
  },
};

export { chatCommand, cookiesCommand, dmCommand, dmsCommand, followersCommand, followCommand, followsCommand, likeCommand, queueCommand, quoteCommand, replyCommand, voiceCommand } from "./helpers/index.ts";
