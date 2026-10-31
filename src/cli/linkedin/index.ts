import { findLinkedinAccount, recordLinkedinSession, linkedinGate } from "../../linkedin/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const LINKEDIN_SESSION_USAGE = [
  "Usage: log linkedin session check --account <accountName> [--json]",
  "Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.",
  "LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const LINKEDIN_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that LinkedIn still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The LINKEDIN socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log linkedin session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (openLinkedinApi, no browser).`;
  return `log linkedin session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const linkedinSessionCommand: Command = {
  usage: LINKEDIN_SESSION_USAGE,
  platform: "linkedin",
  name: "session",
  effect: "read",
  input: LINKEDIN_SESSION_INPUT,
  summary: "Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin session: ${parsed.error}\n${LINKEDIN_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log linkedin session: give check\n${LINKEDIN_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log linkedin session check: --account is needed\n${LINKEDIN_SESSION_USAGE}` };
    try {
      const account = await findLinkedinAccount(context.twenty, ref);
      const gate = linkedinGate(account);
      if (!gate.ok) return refuse("linkedin session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directLinkedin) return { code: 1, stderr: "log linkedin session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (openLinkedinApi)`);
      const run = context.directLinkedin(account, { action: "ping" });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "linkedin", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("linkedin session check", error);
    }
  },
};

export { linkedinCookiesCommand, linkedinCookiesDeps } from "./helpers/index.ts";
