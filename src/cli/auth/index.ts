/**
 * `log login` / `log logout` / `log whoami` — operator sign-in, the same flow
 * as `blaster login` (blaster `packages/blaster-cli/src/cli/login.ts`).
 *
 * Identity is Twenty's: Twenty is the OAuth provider, and blaster's hosted web
 * app runs the sign-in page. `log login` generates a state nonce and a PKCE
 * challenge, starts a one-shot loopback server on 127.0.0.1, and opens
 * `<webUrl>/login?state=…&code_challenge=…&exchange=…`. Once the operator signs in to
 * Twenty, the web app POSTs the tokens back to the loopback. log-cli only
 * accepts them if state and challenge match this run, then checks them
 * through blaster's API (`/api/auth/me`) and stores them in
 * `~/.logCli/auth/`. `--token` is the paste path for headless terminals.
 */
import { execFileSync } from "node:child_process";
import { runExchangeServer } from "../../auth/exchange/index.ts";
import type { ExchangeServer } from "../../auth/exchange/index.ts";
import {
  buildAuthorizeUrl,
  buildBrowserCommand,
  codeChallengeForVerifier,
  generateCodeVerifier,
  generateState,
  HANDOFF_MARKER,
  liveSession,
  loadSessionHome,
  maskSecret,
  removeSessionRecord,
  resolveApiUrl,
  resolveWebUrl,
  saveSessionRecord,
  validateHttpUrl,
  validateSessionToken,
} from "../../auth/session/index.ts";
import type { SessionRecord } from "../../auth/session/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";

export const LOGIN_USAGE = "Usage: log login [--webUrl <url>] [--apiUrl <url>] [--token <accessToken>] [--json]";
export const LOGOUT_USAGE = "Usage: log logout [--apiUrl <url>] [--json]";
export const WHOAMI_USAGE = "Usage: log whoami [--apiUrl <url>] [--json]";

/** Seams for tests: no browser, no network, no real store. */
export const authDeps: {
  fetch: typeof fetch;
  openBrowser: (url: string) => boolean;
  startExchange: (options: { state: string; challenge: string }) => ExchangeServer;
  dir: string | undefined;
} = {
  fetch: ((...args: Parameters<typeof fetch>) => fetch(...args)) as typeof fetch,
  openBrowser(url) {
    if (url.includes("'")) return false;
    const { command, args } = buildBrowserCommand(url, process.platform);
    try {
      execFileSync(command, args, { stdio: "ignore", timeout: 15_000, windowsHide: true });
      return true;
    } catch {
      return false;
    }
  },
  startExchange: (options) => runExchangeServer(options),
  dir: undefined,
};

/** Confirm the web URL really serves blaster's sign-in page before sending anyone there. */
async function checkHandoff(webUrl: string): Promise<string | null> {
  try {
    const response = await authDeps.fetch(`${webUrl.replace(/\/+$/, "")}/login`, { redirect: "manual" });
    if (HANDOFF_MARKER.test(await response.text().catch(() => ""))) return null;
    return `${webUrl} is not serving blaster's web app, so signing in there won't reach this terminal. Check --webUrl.`;
  } catch (error) {
    return `nothing is serving blaster's web app at ${webUrl} (${error instanceof Error ? error.message : String(error)}). Pass --webUrl.`;
  }
}

async function browserSignIn(context: CommandContext, webUrl: string): Promise<SessionRecord | string> {
  // The verifier never leaves this process; the challenge commits to it.
  const challenge = await codeChallengeForVerifier(generateCodeVerifier());
  const state = generateState();
  const exchange = authDeps.startExchange({ state, challenge });
  try {
    const exchangeUrl = `${await exchange.url}/exchange`;
    const problem = await checkHandoff(webUrl);
    if (problem) return problem;
    const authorize = buildAuthorizeUrl(webUrl, state, challenge, exchangeUrl);
    context.err(`Opening browser: ${authorize}`);
    if (!authDeps.openBrowser(authorize)) context.err(`Couldn't open a browser. Open this URL yourself: ${authorize}`);
    context.err("Waiting for sign-in to finish…");
    const outcome = await exchange.result;
    if (!outcome.ok) {
      return outcome.error === "timedOut" ? "sign-in timed out before the browser finished." : "the browser couldn't complete the exchange.";
    }
    return { ...outcome.session, username: null, apiUrl: "", loggedInAt: "" };
  } catch (error) {
    return `could not start the local exchange server: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    exchange.close();
  }
}

export const loginCommand: Command = {
  usage: LOGIN_USAGE,
  name: "login",
  summary: "Sign in with Twenty through blaster's web app (OAuth), like `blaster login`",
  args: "[--webUrl <url>] [--apiUrl <url>] [--token <t>] [--json]",
  async run(context, argv): Promise<CommandResult> {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["webUrl", "apiUrl", "token"] });
    if (!parsed.ok) return { code: 1, stderr: `log login: ${parsed.error}\n${LOGIN_USAGE}` };
    for (const name of ["webUrl", "apiUrl"] as const) {
      const value = parsed.flags[name];
      const issue = typeof value === "string" ? validateHttpUrl(value) : undefined;
      if (issue) return { code: 1, stderr: `log login: --${name} ${issue.toLowerCase()}\n${LOGIN_USAGE}` };
    }
    const apiUrl = resolveApiUrl(parsed.flags["apiUrl"] as string | undefined, authDeps.dir);
    const pasted = parsed.flags["token"] as string | undefined;

    const partial = pasted
      ? ({ accessToken: pasted, refreshToken: null, expiresIn: null, obtainedAtMs: Date.now() } as SessionRecord)
      : await browserSignIn(context, resolveWebUrl(parsed.flags["webUrl"] as string | undefined, authDeps.dir));
    if (typeof partial === "string") return { code: 1, stderr: `log login: ${partial}` };

    const validation = await validateSessionToken(apiUrl, partial.accessToken, authDeps.fetch);
    if (!validation.ok) {
      return {
        code: 1,
        stderr: validation.kind === "auth" ? "log login: the API rejected the token. Sign in again." : `log login: ${validation.message}`,
      };
    }
    const record: SessionRecord = {
      ...partial,
      username: validation.identity.username,
      apiUrl,
      loggedInAt: new Date().toISOString(),
    };
    saveSessionRecord(record, { apiUrl }, authDeps.dir);
    const masked = maskSecret(record.accessToken);
    if (parsed.flags["json"]) {
      return { code: 0, stdout: JSON.stringify({ ok: true, source: pasted ? "paste" : "browser", apiUrl, username: record.username, masked }, null, 2) };
    }
    return { code: 0, stdout: `Signed in${record.username ? ` as ${record.username}` : ""}. Session for ${apiUrl} saved (${masked}).` };
  },
};

/** The session a command means: --apiUrl, or the only one stored. */
function pickSession(name: string, usage: string, apiUrl: string | undefined): SessionRecord | CommandResult {
  const home = loadSessionHome(authDeps.dir);
  const stored = Object.values(home.sessions);
  const record = apiUrl ? home.sessions[apiUrl] : stored.length === 1 ? stored[0] : undefined;
  if (record) return record;
  if (stored.length === 0) return { code: 1, stderr: `log ${name}: not signed in. Run \`log login\`.` };
  return { code: 1, stderr: `log ${name}: signed in to ${stored.map((s) => s.apiUrl).join(", ")}. Pass --apiUrl to pick one.\n${usage}` };
}

export const logoutCommand: Command = {
  usage: LOGOUT_USAGE,
  name: "logout",
  summary: "Forget the stored Twenty session",
  args: "[--apiUrl <url>] [--json]",
  run(_context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["apiUrl"] });
    if (!parsed.ok) return { code: 1, stderr: `log logout: ${parsed.error}\n${LOGOUT_USAGE}` };
    const record = pickSession("logout", LOGOUT_USAGE, parsed.flags["apiUrl"] as string | undefined);
    if (!("accessToken" in record)) return record;
    removeSessionRecord(record.apiUrl, authDeps.dir);
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ ok: true, apiUrl: record.apiUrl }, null, 2) };
    return { code: 0, stdout: `Signed out of ${record.apiUrl}.` };
  },
};

export const whoamiCommand: Command = {
  usage: WHOAMI_USAGE,
  name: "whoami",
  summary: "Show who is signed in, refreshing the session if it expired",
  args: "[--apiUrl <url>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["apiUrl"] });
    if (!parsed.ok) return { code: 1, stderr: `log whoami: ${parsed.error}\n${WHOAMI_USAGE}` };
    const record = pickSession("whoami", WHOAMI_USAGE, parsed.flags["apiUrl"] as string | undefined);
    if (!("accessToken" in record)) return record;
    const live = await liveSession(record, authDeps.fetch, authDeps.dir);
    if (!live.ok) return { code: 1, stderr: `log whoami: ${live.message}` };
    const masked = maskSecret(live.record.accessToken);
    if (parsed.flags["json"]) {
      return {
        code: 0,
        stdout: JSON.stringify({ ok: true, apiUrl: live.record.apiUrl, username: live.record.username, masked, loggedInAt: live.record.loggedInAt }, null, 2),
      };
    }
    return {
      code: 0,
      stdout: `Signed in to ${live.record.apiUrl}${live.record.username ? ` as ${live.record.username}` : ""} since ${live.record.loggedInAt} (${masked}). Session is valid.`,
    };
  },
};
