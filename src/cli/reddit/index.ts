import { findRedditAccount, recordRedditSession, redditGate } from "../../reddit/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const REDDIT_SESSION_USAGE = [
  "Usage: log reddit session check --account <accountName> [--json]",
  "Checks that Reddit still accepts the account's saved session, on the direct-API engine (vendor/rdvwr on one curl_cffi session, no browser). Sends nothing.",
  "Reddit's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const REDDIT_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Reddit still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The REDDIT socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log reddit session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (vendor/rdvwr on one curl_cffi session, no browser).`;
  return `log reddit session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const redditSessionCommand: Command = {
  usage: REDDIT_SESSION_USAGE,
  platform: "reddit",
  name: "session",
  effect: "read",
  input: REDDIT_SESSION_INPUT,
  summary: "Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(REDDIT_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log reddit session: ${parsed.error}\n${REDDIT_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log reddit session: give check\n${REDDIT_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log reddit session check: --account is needed\n${REDDIT_SESSION_USAGE}` };
    try {
      const account = await findRedditAccount(context.twenty, ref);
      const gate = redditGate(account);
      if (!gate.ok) return refuse("reddit session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directReddit) return { code: 1, stderr: "log reddit session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (vendor/rdvwr)`);
      const run = context.directReddit(account, { action: "ping" });
      for (const line of await recordRedditSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "reddit", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("reddit session check", error);
    }
  },
};
