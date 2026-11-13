import { checkStateOfVerdict, inProcessToolCaller, recordCheck } from "../../console/accountCheck/index.ts";
import { readConnectionRows } from "../../console/connections/index.ts";
import { checkSessions, sessionsText } from "../../platformKit/sessionCheck/index.ts";
import type { SessionCheckAccount, SessionToolCaller } from "../../platformKit/sessionCheck/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { PLATFORMS } from "../runner/helpers/platforms.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const SESSIONS_USAGE = [
  "Usage: log sessions check [--platform <p>] [--account <accountName>] [--json]",
  "Checks every account's saved session through its platform's own check (X, Discord, Instagram, Slack, Reddit, LinkedIn), one account after another, and says for each: signed in, needs signing in (a 401, or no session saved), stopped (the platform refused: nothing retries, rule 94) or unknown. An account that needs signing in comes with its next step: its own browser opened on the platform's sign-in page for the owner (log inspect start; closing it saves the new session), or X's cookie prompt. Facebook is checked in its browser, and a deactivated account is skipped. Each result is also the console's last check for that account, so the console, the CLI and the MCP tool sessionsCheck say the same. Sends nothing.",
].join("\n");

export const SESSIONS_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      effect: "read",
      summary: "Check every account's saved session through its platform's own answer (a 401 means sign in again), with the next step to sign each one back in",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", values: PLATFORMS, description: "Only this platform's accounts" },
        { name: "account", kind: "string", description: "Only this account, by its accountName" },
        JSON_FLAG,
      ],
    },
  ],
};

export const sessionsDeps: { accounts: () => SessionCheckAccount[]; callTool: () => Promise<SessionToolCaller>; record: (accountId: string, state: ReturnType<typeof checkStateOfVerdict>) => void } = {
  accounts: () => readConnectionRows().map((row) => ({ id: row.id, name: row.name, platform: row.platform, status: row.status })),
  callTool: () => inProcessToolCaller(),
  record: (accountId, state) => recordCheck(accountId, state),
};

export const sessionsCommand: Command = {
  usage: SESSIONS_USAGE,
  platform: "any",
  name: "sessions",
  effect: "read",
  input: SESSIONS_INPUT,
  summary: "Check every account's saved session through its platform's own answer, with the next step to sign each one back in",
  args: "check [--platform <p>] [--account <a>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SESSIONS_INPUT));
    if (!parsed.ok) return refuseInput("sessions", parsed.error, SESSIONS_USAGE);
    const [sub = "check", ...rest] = parsed.positionals;
    if (sub !== "check" || rest.length) return { code: 1, error: "inputInvalid", stderr: `log sessions: pick check\n${SESSIONS_USAGE}` };
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : undefined);
    const json = parsed.flags["json"] === true;
    const callTool = await sessionsDeps.callTool();
    let reports;
    try {
      reports = await checkSessions(sessionsDeps.accounts(), { platform: str("platform"), account: str("account") }, callTool, (report) => {
        if (report.verdict !== "browserCheck" && report.verdict !== "skipped") sessionsDeps.record(report.id, checkStateOfVerdict(report.verdict));
        context.err(`${report.platform} ${report.account}: ${report.verdict}${report.code ? ` (${report.code})` : ""}`);
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : "sessionCheckFailed";
      return { code: 1, error: isErrorCode(code) ? code : "commandFailed", stderr: `log sessions check: ${code}${code === "accountNotFound" ? `: no account ${str("account")}${str("platform") ? ` on ${str("platform")}` : ""}` : ""}` };
    }
    return { code: 0, stdout: json ? JSON.stringify({ accounts: reports }, null, 2) : sessionsText(reports) };
  },
};
