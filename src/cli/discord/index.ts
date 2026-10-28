import { findDiscordAccount, recordDiscordSession, discordGate } from "../../discord/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const DISCORD_SESSION_USAGE = [
  "Usage: log discord session check --account <accountName> [--json]",
  "Checks that Discord still accepts the account's saved session, on the direct-API engine (no client vendored yet, no browser). Sends nothing.",
  "Discord's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const DISCORD_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Discord still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The DISCORD socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log discord session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (no client vendored yet, no browser).`;
  return `log discord session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const discordSessionCommand: Command = {
  usage: DISCORD_SESSION_USAGE,
  platform: "discord",
  name: "session",
  effect: "read",
  input: DISCORD_SESSION_INPUT,
  summary: "Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord session: ${parsed.error}\n${DISCORD_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log discord session: give check\n${DISCORD_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log discord session check: --account is needed\n${DISCORD_SESSION_USAGE}` };
    try {
      const account = await findDiscordAccount(context.twenty, ref);
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directDiscord) return { code: 1, stderr: "log discord session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (no client vendored yet)`);
      const run = context.directDiscord(account, { action: "ping" });
      for (const line of await recordDiscordSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("discord session check", error);
    }
  },
};
