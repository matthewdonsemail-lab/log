import { findLinkedinAccount, recordLinkedinSession, linkedinGate } from "../../linkedin/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput } from "../runner/types.ts";
import type { PlatformAccount } from "../../platformKit/session/index.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const LINKEDIN_SESSION_USAGE = [
  "Usage: log linkedin session check --account <accountName> [--json]",
  "       log linkedin session scripts --account <accountName> [--json]",
  "Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.",
  "LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
  "scripts reads the signed-in /feed/ page once and saves the app's bundle URLs to ~/.logCli/linkedin/<account>/appScripts.json, for rea to read LinkedIn's own code. Sends nothing.",
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
    {
      words: ["scripts"],
      summary: "Read the signed-in feed page once and save the LinkedIn app's bundle URLs for rea, sending nothing",
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

async function scriptsOf(context: CommandContext, account: PlatformAccount, json: boolean) {
  context.err(`${account.accountName}: reading the signed-in feed page once for its bundle URLs (openLinkedinApi)`);
  const run = context.directLinkedin!(account, { action: "scripts" });
  const scripts = Array.isArray(run.answer["scripts"]) ? (run.answer["scripts"] as string[]) : [];
  if (!run.answer.ok) return { code: 1, error: isErrorCode(run.answer.code) ? run.answer.code : "commandFailed", stderr: render(account.accountName, run.answer) };
  const dir = join(process.env.LOG_CLI_HOME || join(homedir(), ".logCli"), "linkedin", account.accountName);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "appScripts.json");
  writeFileSync(file, JSON.stringify({ at: (context.now?.() ?? new Date()).toISOString(), scripts }, null, 2));
  if (json) return { code: 0, stdout: JSON.stringify({ account: account.accountName, file, scripts }, null, 2) };
  return { code: 0, stdout: `log linkedin session scripts: ${scripts.length} bundle URLs from the signed-in feed page, saved to ${file}` };
}

export const linkedinSessionCommand: Command = {
  usage: LINKEDIN_SESSION_USAGE,
  platform: "linkedin",
  name: "session",
  effect: "read",
  input: LINKEDIN_SESSION_INPUT,
  summary: "Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check|scripts --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_SESSION_INPUT));
    if (!parsed.ok) return refuseInput("linkedin session", `${parsed.error}`, LINKEDIN_SESSION_USAGE);
    const verb = parsed.positionals[0];
    if ((verb !== "check" && verb !== "scripts") || parsed.positionals.length > 1) return refuseInput("linkedin session", `give check or scripts`, LINKEDIN_SESSION_USAGE);
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, error: "inputInvalid", stderr: `log linkedin session check: --account is needed\n${LINKEDIN_SESSION_USAGE}` };
    try {
      const account = await findLinkedinAccount(context.twenty, ref);
      const gate = linkedinGate(account);
      if (!gate.ok) return refuse("linkedin session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directLinkedin) return refuse("linkedin session check", "engineNotBuilt", "the direct-API engine isn't wired in this context");
      if (verb === "scripts") return scriptsOf(context, account, Boolean(parsed.flags["json"]));
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

export { linkedinCookiesCommand, linkedinCookiesDeps, linkedinPostCommand, linkedinDeleteCommand, linkedinSuggestionsCommand, linkedinConnectCommand, linkedinLikeCommand, linkedinRepostCommand, linkedinInboxCommand, linkedinMessagesCommand, linkedinMessageCommand } from "./helpers/index.ts";
