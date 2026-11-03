import { findInstagramAccount, recordInstagramSession, instagramGate } from "../../instagram/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const INSTAGRAM_SESSION_USAGE = [
  "Usage: log instagram session check --account <accountName> [--json]",
  "Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.",
  "Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const INSTAGRAM_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Instagram still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The INSTAGRAM socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log instagram session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (instagrapi, no browser).`;
  return `log instagram session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const instagramSessionCommand: Command = {
  usage: INSTAGRAM_SESSION_USAGE,
  platform: "instagram",
  name: "session",
  effect: "read",
  input: INSTAGRAM_SESSION_INPUT,
  summary: "Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSTAGRAM_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log instagram session: ${parsed.error}\n${INSTAGRAM_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log instagram session: give check\n${INSTAGRAM_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log instagram session check: --account is needed\n${INSTAGRAM_SESSION_USAGE}` };
    try {
      const account = await findInstagramAccount(context.twenty, ref);
      const gate = instagramGate(account);
      if (!gate.ok) return refuse("instagram session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directInstagram) return { code: 1, stderr: "log instagram session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (instagrapi)`);
      const run = context.directInstagram(account, { action: "ping" });
      for (const line of await recordInstagramSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("instagram session check", error);
    }
  },
};
