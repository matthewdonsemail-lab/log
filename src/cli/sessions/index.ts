import { inProcessToolCaller } from "../../console/accountCheck/index.ts";
import { readConnectionRows } from "../../console/connections/index.ts";
import { checkSessions, runSessionCheck, sessionsText } from "../../platformKit/sessionCheck/index.ts";
import type { SessionCheckAccount, SessionToolCaller } from "../../platformKit/sessionCheck/index.ts";
import { runSignIn, signInRouteFor, signInText } from "../../platformKit/signIn/index.ts";
import type { SignInActors, SignInRoute, SignInStore } from "../../platformKit/signIn/index.ts";
import { SIGN_IN_ROUTE_NAMES } from "../launch/helpers/start.ts";
import { PLATFORMS } from "../runner/helpers/platforms.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput } from "../runner/types.ts";
import { cookieSaveBy, liveWiring, signInActorsOf } from "./helpers/index.ts";

export const SESSIONS_USAGE = [
  "Usage: log sessions check [--platform <p>] [--account <accountName>] [--json]",
  "       log sessions signIn --account <accountName> [--platform <p>] [--route browser|cookies] [--done] [--wait <seconds>] [--json]",
  "check: checks every account's saved session through its platform's own check (X, Discord, Instagram, Slack, Reddit, LinkedIn), one account after another, and says for each: signed in, needs signing in (a 401, or no session saved), stopped (the platform refused: nothing retries, rule 94) or unknown. One gate decides which accounts may be checked: a deactivated account is skipped, and one held stopped (by its status, its session or its last check) is never checked again until the owner says so. A check holds the account while it runs, so a second check of it is refused as busy; a check whose process died is read back as unknown. An account that needs signing in comes with its next step, sessionsSignIn. Facebook is checked in its browser. Each result is also the console's last check for that account, so the console, the CLI and the MCP tool sessionsCheck say the same. Sends nothing.",
  "signIn: one sign-in, as a machine: it checks the account first (signed in: done; held stopped: nothing is opened), then opens the account's own browser on the platform's login screen for the owner to sign in themself (route browser, every platform with a browser), or takes the masked cookie prompt in a terminal (route cookies: X, LinkedIn and Slack; X has no browser yet). The session is saved from the browser when it closes, and only when the platform's own sign-in cookies are in it, so a signed-out browser never overwrites a stored session; then it is checked again. With no --wait it returns while the owner signs in; --done (or the owner closing the window) finishes it. Sends nothing.",
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
    {
      words: ["signIn"],
      effect: "browser",
      summary: "Sign an account in: its own browser opens on the platform's login screen for the owner (or X's cookie prompt), the session is saved from it only once signed in, then checked again",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account, by its accountName" },
        { name: "platform", kind: "enum", values: PLATFORMS, description: "The account's platform, when its name is on more than one" },
        { name: "route", kind: "enum", values: SIGN_IN_ROUTE_NAMES, description: "browser (the default where the platform has one) or cookies (the masked prompt, in a terminal)" },
        { name: "done", kind: "boolean", description: "The owner has finished signing in: close the browser, save its session and check again" },
        { name: "wait", kind: "integer", min: 0, max: 900, description: "Seconds to wait for the owner to finish and close the browser (default 0: return while they sign in)" },
        JSON_FLAG,
      ],
    },
  ],
};

export const sessionsDeps: {
  accounts: () => SessionCheckAccount[];
  callTool: () => Promise<SessionToolCaller>;
  actors: (context: CommandContext, callTool: SessionToolCaller, route: SignInRoute, waitMs: number) => SignInActors;
  signInStore: () => SignInStore | undefined;
} = {
  accounts: () => readConnectionRows().map((row) => ({ id: row.id, name: row.name, platform: row.platform, status: row.status, state: row.state, checkedAt: row.checkedAt, lastCheck: row.lastCheck })),
  callTool: () => inProcessToolCaller(),
  actors: (context, callTool, route, waitMs) => signInActorsOf(liveWiring(callTool, cookieSaveBy(async () => context), { waitMs, sleep: context.sleep, now: context.now }), route),
  signInStore: () => undefined,
};

function errorOf(error: unknown): { code: string; detail: string } {
  const text = error instanceof Error ? error.message : "sessionCheckFailed";
  const match = /^([a-z][A-Za-z]+)(?::\s*(.*))?$/.exec(text);
  return { code: match?.[1] ?? "sessionCheckFailed", detail: match?.[2] ?? "" };
}

async function check(context: CommandContext, flags: Record<string, unknown>, str: (name: string) => string | undefined) {
  const callTool = await sessionsDeps.callTool();
  let reports;
  try {
    reports = await checkSessions(sessionsDeps.accounts(), { platform: str("platform"), account: str("account") }, async (account) => (await runSessionCheck(account, { callTool })).report, (report) => {
      context.err(`${report.platform} ${report.account}: ${report.verdict}${report.code ? ` (${report.code})` : ""}`);
    });
  } catch (error) {
    const { code } = errorOf(error);
    return { code: 1, stderr: `log sessions check: ${code}${code === "accountNotFound" ? `: no account ${str("account")}${str("platform") ? ` on ${str("platform")}` : ""}` : ""}` };
  }
  const needs = reports.some((report) => report.verdict === "signInNeeded" || report.verdict === "stopped");
  return { code: needs ? 1 : 0, stdout: flags["json"] === true ? JSON.stringify({ accounts: reports }, null, 2) : sessionsText(reports) };
}

function pickAccount(accounts: SessionCheckAccount[], name: string, platform?: string): SessionCheckAccount {
  const wanted = platform?.toLowerCase().replace(/^x$/, "twitter");
  const key = name.replace(/^@/, "").toLowerCase();
  const found = accounts.filter((account) => account.name.toLowerCase() === key && (!wanted || account.platform === wanted));
  if (!found.length) throw new Error(`accountNotFound: no account ${name}${wanted ? ` on ${wanted}` : ""}`);
  if (found.length > 1) throw new Error(`platformAmbiguous: ${name} is on ${found.map((account) => account.platform).join(" and ")}: add --platform`);
  return found[0];
}

async function signIn(context: CommandContext, flags: Record<string, unknown>, str: (name: string) => string | undefined, waitSeconds: number) {
  try {
    const account = pickAccount(sessionsDeps.accounts(), str("account") ?? "", str("platform"));
    const route = signInRouteFor(account, str("route") as SignInRoute | undefined);
    const callTool = await sessionsDeps.callTool();
    const result = await runSignIn({ account, route, finish: flags["done"] === true }, {
      actors: sessionsDeps.actors(context, callTool, route, waitSeconds * 1000),
      store: sessionsDeps.signInStore(),
      now: context.now,
      onStage: (stage) => context.err(`${account.platform} ${account.name}: ${stage}`),
    });
    const code = result.state === "signedIn" || result.state === "waitingForOwner" ? 0 : 1;
    return { code, stdout: flags["json"] === true ? JSON.stringify({ ok: code === 0, signIn: result, next: result.next }, null, 2) : signInText(result) };
  } catch (error) {
    const { code, detail } = errorOf(error);
    return { code: 1, stderr: `log sessions signIn: ${code}${detail ? `: ${detail}` : ""}` };
  }
}

export const sessionsCommand: Command = {
  usage: SESSIONS_USAGE,
  platform: "any",
  name: "sessions",
  effect: "read",
  input: SESSIONS_INPUT,
  summary: "Check every account's saved session through its platform's own answer, and sign one in from its own browser",
  args: "check [--platform <p>] [--account <a>] [--json] | signIn --account <a> [--platform <p>] [--route browser|cookies] [--done] [--wait <s>]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SESSIONS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log sessions: ${parsed.error}\n${SESSIONS_USAGE}` };
    const [sub = "check", ...rest] = parsed.positionals;
    if ((sub !== "check" && sub !== "signIn") || rest.length) return { code: 1, stderr: `log sessions: pick check or signIn\n${SESSIONS_USAGE}` };
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : undefined);
    if (sub === "signIn") return signIn(context, parsed.flags, str, numberOf(parsed, "wait") ?? 0);
    return check(context, parsed.flags, str);
  },
};
