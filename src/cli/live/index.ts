/**
 * The live commands: `log doctor`, `log connect`, `log scan`, `log status`.
 *
 * Accounts come from Twenty (socialAccounts, platform FACEBOOK). Every one of
 * these that opens Camoufox first passes `prepareRun` (the account is
 * Facebook, usable, has a proxy and a home country) and then
 * python/proxyGate.py (the proxy's exit IP is in that country). There is no
 * way around either, signing in included (AGENTS.md rule 12).
 */
import { createActor, fromPromise, toPromise } from "xstate";
import { appendAttempt, countArkoseToday, readAttempts, solverAvailability } from "../../captcha/router/index.ts";
import type { ConnectSession, ConnectStep } from "../../camofox/session/index.ts";
import { fromCamofoxStatus } from "../../camofox/worker/index.ts";
import type { DoctorResult, ScanResult, StatusResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { prepareRun } from "../../camofox/run/index.ts";
import type { PreparedRun } from "../../camofox/run/index.ts";
import { ERROR_CATALOG } from "../../errors/catalog/index.ts";
import { syncDashboard } from "../../marketplace/agencyListing/index.ts";
import { classifySignal } from "../../marketplace/account/index.ts";
import { connectMachine } from "../../marketplace/connect/index.ts";
import type { ActOutput, ConnectActorInputs, ConnectOutput, ReadOutput, SaveOutput, SolveOutput } from "../../marketplace/connect/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { recordAccountIssue } from "../../marketplace/replacement/index.ts";
import { checkRunnable, findAccount, listFacebookAccounts, saveCookies, saveDeviceProfile, saveSession, setAccountStatus, toFacebookCookies } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount, RunPurpose } from "../../marketplace/socialAccount/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import { settleInBackground } from "../../rea/firefox/index.ts";
import type { LoginSecrets } from "../../twenty/graphql/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { renderConnect, renderDoctor, renderLoss, renderScan, summarizeConnect } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const DOCTOR_USAGE = "Usage: log doctor [--json]";
export const CONNECT_USAGE = "Usage: log connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]";

/** How long `connect` reads the window for a login, a person's part included. */
export const CONNECT_WAIT_SECONDS = 600;
export const SCAN_USAGE = "Usage: log scan --account <accountName> [--json] [--bypass]";
export const STATUS_USAGE = "Usage: log status <listingId> --account <accountName> [--json] [--bypass]";

/** `--account` → the Twenty account and its prepared run, or the refusal. Nothing opens on a refusal. */
export async function openAccount(
  context: CommandContext,
  name: string,
  usage: string,
  value: string | true | undefined,
  purpose: RunPurpose,
  bypassHours = false,
  withLogin = false,
  skipLaunchGap = false,
): Promise<{ account: FacebookAccount; run: PreparedRun; login: LoginSecrets | null } | CommandResult> {
  if (typeof value !== "string") return { code: 1, stderr: `log ${name}: --account is required (log accounts lists them)\n${usage}` };
  let account: FacebookAccount;
  try {
    account = await findAccount(context.twenty, value);
  } catch (error) {
    return refuseError(name, error);
  }
  let login: LoginSecrets | null = null;
  if (withLogin) {
    try {
      login = await context.twenty.loginSecrets(account.id);
    } catch (error) {
      return refuseError(name, error);
    }
  }
  const prepared = prepareRun(account, purpose, { now: (context.now ?? (() => new Date()))(), bypassHours, login, action: name, skipLaunchGap });
  if (!prepared.ok) return refuse(name, prepared.code, prepared.detail);
  return { account, run: prepared.run, login };
}

/**
 * The device Python made on this account's first launch → Twenty, so every
 * later launch is the same computer (rule 15). Saved whether the run worked or
 * not, and only once. Returns a line for the output, never the device itself.
 */
export async function keepNewDevice(context: CommandContext, account: FacebookAccount, run: PreparedRun): Promise<string | null> {
  const profile = run.newDeviceProfile();
  if (!profile) return null;
  try {
    return (await saveDeviceProfile(context.twenty, account, profile)) ? `Pinned a new device for ${account.accountName} in Twenty.` : null;
  } catch (error) {
    return `Could not save ${account.accountName}'s new device to Twenty: ${refuseError("device", error).stderr}`;
  }
}

/**
 * The session as the browser left it (cookies and localStorage) → Twenty, so
 * the next run carries on from it. Only a jar that still holds a Facebook
 * session; never printed.
 */
export async function keepSession(context: CommandContext, account: FacebookAccount, run: PreparedRun): Promise<string | null> {
  const state = run.readStorageState();
  try {
    return (await saveSession(context.twenty, account.id, state))
      ? `Saved ${account.accountName}'s browser session (${state.cookies.length} cookies, ${state.origins.length} origin(s)) to Twenty.`
      : null;
  } catch (error) {
    return `Could not save ${account.accountName}'s browser session to Twenty: ${refuseError("session", error).stderr}`;
  }
}

/** Adds a line to a result's stderr, so --json stdout stays one JSON document. */
export function withNote(result: CommandResult, note: string | null): CommandResult {
  if (!note) return result;
  return { ...result, stderr: result.stderr ? `${result.stderr}
${note}` : note };
}

/**
 * Runs `body` with the account's prepared run, then keeps a newly made device
 * and always deletes the run's private files.
 */
export async function withRun(
  context: CommandContext,
  name: string,
  account: FacebookAccount,
  run: PreparedRun,
  body: () => Promise<CommandResult>,
): Promise<CommandResult> {
  let result: CommandResult;
  try {
    result = await body();
  } catch (error) {
    result = refuseError(name, error);
  }
  try {
    const device = await keepNewDevice(context, account, run);
    // Rule 22: every action's raw HAR, split per step and read by rea.
    const capture = run.captureDir ? settleInBackground(run.captureDir) : null;
    // connect saves its own cookies (it signed in); every other run continues the session.
    const session = name === "connect" ? null : await keepSession(context, account, run);
    // A save that failed must not lose the device or the session with the run's folder.
    const unsaved = [device, session].some((n) => n?.startsWith("Could not save")) || /twenty(RateLimited|AuthFailed|Unreachable|RequestFailed)/.test(result.stderr ?? "");
    const kept = unsaved ? `Twenty didn't take everything: kept this run's device and session (login removed) at ${run.keep()}. Save them later: log account resave --account ${account.accountName} --from <that folder>` : null;
    return withNote(withNote(withNote(withNote(result, device), session), capture), kept);
  } finally {
    run.cleanup();
  }
}

/**
 * A worker failure → Twenty and the terminal. An account code (a ban, a
 * checkpoint, a login wall) updates the account's status, which may replace
 * its campaign listings.
 */
export async function workerFailed(context: CommandContext, name: string, account: FacebookAccount, failure: WorkerFailure): Promise<CommandResult> {
  let code = failure.code;
  if (code === "loginWall") code = classifySignal({ url: String(failure.url ?? ""), text: String(failure.bodySample ?? "") }) ?? "sessionExpired";
  const notes: string[] = [];
  if (ERROR_CATALOG[code].layer === "account") {
    try {
      const loss = await recordAccountIssue(context.twenty, account, code, failure.detail ?? null);
      if (loss) notes.push(renderLoss(loss));
    } catch (error) {
      notes.push(`(could not update Twenty: ${refuseError(name, error).stderr})`);
    }
  }
  const result = refuse(name, code, failure.detail);
  return notes.length ? { ...result, stderr: `${result.stderr}\n${notes.join("\n")}` } : result;
}

export const doctorCommand: Command = {
  name: "doctor",
  summary: "Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run",
  args: "[--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok || parsed.positionals.length > 0) {
      return { code: 1, stderr: `log doctor: ${parsed.ok ? `unexpected argument "${parsed.positionals[0]}"` : parsed.error}\n${DOCTOR_USAGE}` };
    }
    const raw = await context.worker({ action: "doctor" });
    if (!("checks" in raw)) return refuse("doctor", (raw as WorkerFailure).code, (raw as WorkerFailure).detail);
    const result = raw as DoctorResult;
    let accounts: { accountName: string; ready: boolean; why: string | null; hasCookies: boolean }[] = [];
    let twentyError: string | null = null;
    try {
      accounts = (await listFacebookAccounts(context.twenty)).map((account) => {
        const check = checkRunnable(account, "run");
        return {
          accountName: account.accountName,
          ready: check.ok,
          why: check.ok ? null : `${check.code}: ${check.detail}`,
          hasCookies: toFacebookCookies(account.cookies).length > 0,
        };
      });
    } catch (error) {
      twentyError = refuseError("doctor", error).stderr ?? "Twenty failed";
    }
    const code = result.ok && !twentyError ? 0 : 1;
    if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ ok: code === 0, checks: result.checks, twentyError, accounts }, null, 2) };
    return { code, stdout: renderDoctor(result.checks, accounts, twentyError) };
  },
};

export const connectCommand: Command = {
  name: "connect",
  summary: "Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty",
  args: "--account <name> [--noPrompt] [--wait <seconds>] [--bypass] [--now]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["noPrompt", "bypass", "now"], valued: ["account", "wait"] });
    if (!parsed.ok) return { code: 1, stderr: `log connect: ${parsed.error}\n${CONNECT_USAGE}` };
    // --noPrompt (always over MCP): auto-login types Twenty's details (rule 21). Without it a
    // person signs in in the window. Either way the connect machine reads every page until signed in.
    const noPrompt = Boolean(parsed.flags["noPrompt"]);
    const waitSeconds = parsed.flags["wait"] === undefined ? CONNECT_WAIT_SECONDS : Number(parsed.flags["wait"]);
    if (!Number.isInteger(waitSeconds) || waitSeconds < 10 || waitSeconds > 1800) return { code: 1, stderr: `log connect: --wait must be 10 to 1800 seconds\n${CONNECT_USAGE}` };
    const opened = await openAccount(context, "connect", CONNECT_USAGE, parsed.flags["account"], "connect", Boolean(parsed.flags["bypass"]), noPrompt, Boolean(parsed.flags["now"]));
    if (!("run" in opened)) return opened;
    const { account, run, login } = opened;
    return withRun(context, "connect", account, run, async () => {
      let session: ConnectSession | null = null;
      const call = <T>(step: ConnectStep, params: Record<string, unknown> = {}) =>
        (session ??= context.connectSession({
          accountId: account.id,
          storageStatePath: run.statePath,
          proxyPath: run.proxyPath,
          devicePath: run.devicePath,
          captureDir: run.captureDir!,
          loginPath: run.loginPath,
        })).call<T>(step, params);
      const machine = connectMachine.provide({
        actors: {
          open: fromPromise<ActOutput, undefined>(() => call("open")),
          read: fromPromise<ReadOutput, undefined>(() => call("read")),
          submitCredentials: fromPromise<ActOutput, ConnectActorInputs["submitCredentials"]>(({ input }) => call("submitCredentials", input)),
          chooseAuthApp: fromPromise<ActOutput, undefined>(() => call("chooseAuthApp")),
          submitCode: fromPromise<ActOutput, ConnectActorInputs["submitCode"]>(({ input }) => call("submitCode", input)),
          dismiss: fromPromise<ActOutput, ConnectActorInputs["dismiss"]>(({ input }) => call("dismiss", input)),
          save: fromPromise<SaveOutput, undefined>(() => call("save")),
          solveCaptcha: fromPromise<SolveOutput, ConnectActorInputs["solveCaptcha"]>(({ input }) => call("solveCaptcha", input)),
        },
      });
      const actor = createActor(machine, {
        id: `connect:${account.accountName}`,
        input: {
          accountId: account.accountName,
          hasPassword: Boolean(login?.email && login?.password),
          hasTotp: Boolean(login?.totpSecret),
          availability: solverAvailability(),
          arkoseToday: countArkoseToday(readAttempts(), account.accountName),
          timing: { deadlineMs: waitSeconds * 1000, pollMs: 5000, codeWindowMs: 30_000, ...context.connectTiming },
        },
        inspect: createInspector((line) => context.err(formatTraceLine(line)), summarizeConnect),
      });
      let output: ConnectOutput;
      try {
        actor.start();
        output = (await toPromise(actor)) as ConnectOutput;
      } finally {
        if (session) await (session as ConnectSession).close();
      }
      // Every solve goes to the same ledger as publish, with whether the page accepted it.
      for (const attempt of output.captchaAttempts) appendAttempt(attempt);
      return await connectEnded(context, account, run, output);
    });
  },
};

/** The connect machine's end → Twenty (cookies, the account's status) and the terminal. */
async function connectEnded(context: CommandContext, account: FacebookAccount, run: PreparedRun, output: ConnectOutput): Promise<CommandResult> {
  const lines = [renderConnect(account.accountName, output)];
  if (output.result === "connected") {
    const cookies = run.readCookies();
    if (cookies.length === 0) return refuse("connect", "neverConnected", "the browser saved no cookies");
    await saveCookies(context.twenty, account.id, cookies);
    lines.push(`Saved ${cookies.length} Facebook cookies for ${account.accountName} to Twenty.`);
    // Listaro's post-login Marketplace check (facebook-auto-login.ts:717-823): signed in but
    // unable to buy or sell is an account issue, recorded with the cookies kept.
    const issue = classifySignal({ url: output.page?.path ?? "", text: output.bodySample ?? "" });
    if (issue && issue !== "loginWall" && issue !== "sessionExpired" && issue !== "readOnlyLimited") {
      const loss = await recordAccountIssue(context.twenty, account, issue, "seen on Marketplace right after signing in");
      lines.push(`Signed in, but Marketplace shows ${issue}.`);
      if (loss) lines.push(renderLoss(loss));
      return { code: 1, stdout: lines.join("\n"), stderr: refuse("connect", issue, "seen on Marketplace right after signing in").stderr };
    }
    if (account.status === "needsLogin" || account.status === "checkpoint") {
      await setAccountStatus(context.twenty, account.id, "active", "connected", "signed in through its proxy");
      lines.push(`${account.accountName} is ACTIVE again.`);
    }
    return { code: 0, stdout: lines.join("\n") };
  }
  const failure = output.failure!;
  if (ERROR_CATALOG[failure.code].layer === "account") {
    try {
      const loss = await recordAccountIssue(context.twenty, account, failure.code, failure.detail ?? null);
      if (loss) lines.push(renderLoss(loss));
    } catch (error) {
      lines.push(`(could not update Twenty: ${refuseError("connect", error).stderr})`);
    }
  }
  return { code: 1, stdout: lines.join("\n"), stderr: refuse("connect", failure.code, failure.detail).stderr };
}

export const scanCommand: Command = {
  name: "scan",
  summary: "Read Marketplace > Selling live for one account and update its listings in Twenty",
  args: "--account <name> [--json] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "bypass"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log scan: ${parsed.error}\n${SCAN_USAGE}` };
    const opened = await openAccount(context, "scan", SCAN_USAGE, parsed.flags["account"], "run", Boolean(parsed.flags["bypass"]));
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "scan", account, run, async () => {
      const raw = await context.worker({
        action: "marketplace.scan",
        account_id: account.id,
        storage_state_path: run.statePath,
        proxy_path: run.proxyPath,
        device_path: run.devicePath,
        capture_dir: run.captureDir,
      });
      if (!raw.ok) return await workerFailed(context, "scan", account, raw);
      const result = raw as ScanResult;
      const issue = classifySignal({ url: result.url, text: result.bodySample });
      const loss = issue && issue !== "loginWall" && issue !== "readOnlyLimited" ? await recordAccountIssue(context.twenty, account, issue, "seen on Marketplace > Selling") : null;
      const updated = await syncDashboard(context.twenty, account.id, result.listings);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountName: account.accountName, ...result, issue, updated }, null, 2) };
      return { code: 0, stdout: [renderScan(result), `Updated ${updated} listing(s) in Twenty.`, ...(loss ? [renderLoss(loss)] : [])].join("\n") };
    });
  },
};

export const statusCommand: Command = {
  name: "status",
  summary: "Open one Marketplace item page live and classify its status",
  args: "<listingId> --account <name> [--json] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "bypass"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log status: ${parsed.error}\n${STATUS_USAGE}` };
    const [listingId, extra] = parsed.positionals;
    if (listingId === undefined) return { code: 1, stderr: `log status: a listing id is required\n${STATUS_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log status: unexpected argument "${extra}"\n${STATUS_USAGE}` };
    const opened = await openAccount(context, "status", STATUS_USAGE, parsed.flags["account"], "run", Boolean(parsed.flags["bypass"]));
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "status", account, run, async () => {
      const raw = await context.worker({
        action: "marketplace.status",
        account_id: account.id,
        storage_state_path: run.statePath,
        proxy_path: run.proxyPath,
        device_path: run.devicePath,
        capture_dir: run.captureDir,
        params: { listing_id: listingId },
      });
      if (!raw.ok) return await workerFailed(context, "status", account, raw);
      const result = raw as StatusResult;
      const status = fromCamofoxStatus(result.status);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountName: account.accountName, ...result, status }, null, 2) };
      return {
        code: 0,
        stdout: [`${result.title ?? "(no title)"}`, `  Listing ID  ${result.listingId}`, `  Live status ${status}`, `  URL         ${result.listingUrl}`].join("\n"),
      };
    });
  },
};
