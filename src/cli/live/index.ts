/**
 * The live commands: `log doctor`, `log connect`, `log scan`, `log status`.
 *
 * Accounts come from Twenty (socialAccounts, platform FACEBOOK). Every one of
 * these that opens Camoufox first passes `prepareRun` (the account is
 * Facebook, usable, has a proxy and a home country) and then
 * python/proxyGate.py (the proxy's exit IP is in that country). There is no
 * way around either, signing in included (AGENTS.md rule 12).
 */
import { fromCamofoxStatus } from "../../camofox/worker/index.ts";
import type { DoctorResult, ScanResult, StatusResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { prepareRun } from "../../camofox/run/index.ts";
import type { PreparedRun } from "../../camofox/run/index.ts";
import { ERROR_CATALOG } from "../../errors/catalog/index.ts";
import { syncDashboard } from "../../marketplace/agencyListing/index.ts";
import { classifySignal } from "../../marketplace/account/index.ts";
import { recordAccountIssue } from "../../marketplace/replacement/index.ts";
import { checkRunnable, findAccount, listFacebookAccounts, saveCookies, saveDeviceProfile, saveSession, setAccountStatus, toFacebookCookies } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount, RunPurpose } from "../../marketplace/socialAccount/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { renderDoctor, renderLoss, renderScan } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const DOCTOR_USAGE = "Usage: log doctor [--json]";
export const CONNECT_USAGE = "Usage: log connect --account <accountName>";
export const SCAN_USAGE = "Usage: log scan --account <accountName> [--json]";
export const STATUS_USAGE = "Usage: log status <listingId> --account <accountName> [--json]";

/** `--account` → the Twenty account and its prepared run, or the refusal. Nothing opens on a refusal. */
export async function openAccount(
  context: CommandContext,
  name: string,
  usage: string,
  value: string | true | undefined,
  purpose: RunPurpose,
): Promise<{ account: FacebookAccount; run: PreparedRun } | CommandResult> {
  if (typeof value !== "string") return { code: 1, stderr: `log ${name}: --account is required (log accounts lists them)\n${usage}` };
  let account: FacebookAccount;
  try {
    account = await findAccount(context.twenty, value);
  } catch (error) {
    return refuseError(name, error);
  }
  const prepared = prepareRun(account, purpose, { now: (context.now ?? (() => new Date()))() });
  if (!prepared.ok) return refuse(name, prepared.code, prepared.detail);
  return { account, run: prepared.run };
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
    // connect saves its own cookies (it signed in); every other run continues the session.
    return withNote(withNote(result, device), name === "connect" ? null : await keepSession(context, account, run));
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
  summary: "Sign a Facebook account in by hand through its proxy, save its cookies to Twenty",
  args: "--account <name>",
  async run(context, argv) {
    const parsed = parseArgs(argv, { valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log connect: ${parsed.error}\n${CONNECT_USAGE}` };
    const opened = await openAccount(context, "connect", CONNECT_USAGE, parsed.flags["account"], "connect");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "connect", account, run, async () => {
      const result = await context.worker(
        { action: "login", account_id: account.id, storage_state_path: run.statePath, proxy_path: run.proxyPath, device_path: run.devicePath },
        { interactive: true },
      );
      if (!result.ok) return await workerFailed(context, "connect", account, result);
      const cookies = run.readCookies();
      if (cookies.length === 0) return refuse("connect", "neverConnected", "the browser saved no cookies");
      await saveCookies(context.twenty, account.id, cookies);
      const lines = [`Saved ${cookies.length} Facebook cookies for ${account.accountName} to Twenty.`];
      if (result.loggedIn && (account.status === "needsLogin" || account.status === "checkpoint")) {
        await setAccountStatus(context.twenty, account.id, "active", "connected", "signed in by hand through its proxy");
        lines.push(`${account.accountName} is ACTIVE again.`);
      } else if (!result.loggedIn) {
        lines.push("Facebook still showed login markers. If the page looked logged in, try `log scan` anyway.");
      }
      return { code: 0, stdout: lines.join("\n") };
    });
  },
};

export const scanCommand: Command = {
  name: "scan",
  summary: "Read Marketplace > Selling live for one account and update its listings in Twenty",
  args: "--account <name> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log scan: ${parsed.error}\n${SCAN_USAGE}` };
    const opened = await openAccount(context, "scan", SCAN_USAGE, parsed.flags["account"], "run");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "scan", account, run, async () => {
      const raw = await context.worker({
        action: "marketplace.scan",
        account_id: account.id,
        storage_state_path: run.statePath,
        proxy_path: run.proxyPath,
        device_path: run.devicePath,
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
  args: "<listingId> --account <name> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log status: ${parsed.error}\n${STATUS_USAGE}` };
    const [listingId, extra] = parsed.positionals;
    if (listingId === undefined) return { code: 1, stderr: `log status: a listing id is required\n${STATUS_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log status: unexpected argument "${extra}"\n${STATUS_USAGE}` };
    const opened = await openAccount(context, "status", STATUS_USAGE, parsed.flags["account"], "run");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "status", account, run, async () => {
      const raw = await context.worker({
        action: "marketplace.status",
        account_id: account.id,
        storage_state_path: run.statePath,
        proxy_path: run.proxyPath,
        device_path: run.devicePath,
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
