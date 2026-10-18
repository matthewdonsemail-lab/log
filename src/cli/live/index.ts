/**
 * The live commands: `log doctor`, `log connect`, `log scan`, `log status`.
 *
 * These launch a real Camoufox browser through facebook-camofox-client
 * (`camofox/worker`), one saved Facebook session per account, the way the
 * Listaro agent kept one cookie file per account. Everything except `login`
 * only reads Facebook: nothing is posted, edited or deleted.
 */
import { existsSync } from "node:fs";
import { fromCamofoxStatus, storageStatePath } from "../../camofox/worker/index.ts";
import type { DoctorResult, WorkerFailure } from "../../camofox/worker/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { renderDoctor, renderScan } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const DOCTOR_USAGE = "Usage: log doctor [--json]";
export const CONNECT_USAGE = "Usage: log connect --account <accountId>";
export const SCAN_USAGE = "Usage: log scan --account <accountId> [--json]";
export const STATUS_USAGE = "Usage: log status <listingId> --account <accountId> [--json]";

function failure(name: string, result: WorkerFailure, accountId?: string): CommandResult {
  if (result.error === "noSession") {
    return { code: 1, stderr: `log ${name}: no Facebook session for ${accountId}. Run \`log connect --account ${accountId}\` first.` };
  }
  if (result.error === "loginWall") {
    return { code: 1, stderr: `log ${name}: Facebook asked ${accountId} to log in again. Run \`log connect --account ${accountId}\`.` };
  }
  return { code: 2, stderr: `log ${name}: ${result.error}` };
}

/** Validates `--account` against the known accounts; returns its id or an error result. */
function requireAccount(context: CommandContext, name: string, usage: string, value: string | true | undefined): string | CommandResult {
  const accounts = context.load().accounts;
  if (typeof value !== "string") {
    return { code: 1, stderr: `log ${name}: --account is required. Known: ${accounts.map((a) => a.id).join(", ")}\n${usage}` };
  }
  if (!accounts.some((account) => account.id === value)) {
    return { code: 1, stderr: `log ${name}: unknown account "${value}". Known: ${accounts.map((a) => a.id).join(", ")}` };
  }
  return value;
}

export const doctorCommand: Command = {
  name: "doctor",
  summary: "Check python, facebook-camofox-client, the Camoufox browser and saved sessions",
  args: "[--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok || parsed.positionals.length > 0) {
      return { code: 1, stderr: `log doctor: ${parsed.ok ? `unexpected argument "${parsed.positionals[0]}"` : parsed.error}\n${DOCTOR_USAGE}` };
    }
    const raw = await context.worker({ action: "doctor" });
    if (!("checks" in raw)) return failure("doctor", raw as WorkerFailure);
    const result = raw as DoctorResult;
    const sessions = context.load().accounts.map((account) => {
      const path = storageStatePath(account.id);
      return { accountId: account.id, path, exists: existsSync(path) };
    });
    const code = result.ok ? 0 : 1;
    if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ ok: result.ok, checks: result.checks, sessions }, null, 2) };
    return { code, stdout: renderDoctor(result.checks, sessions) };
  },
};

export const connectCommand: Command = {
  name: "connect",
  summary: "Open Camoufox, log a Facebook account in by hand, save its session",
  args: "--account <id>",
  async run(context, argv) {
    const parsed = parseArgs(argv, { valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log connect: ${parsed.error}\n${CONNECT_USAGE}` };
    const accountId = requireAccount(context, "connect", CONNECT_USAGE, parsed.flags["account"]);
    if (typeof accountId !== "string") return accountId;

    const path = storageStatePath(accountId);
    const result = await context.worker(
      { action: "login", account_id: accountId, storage_state_path: path },
      { interactive: true },
    );
    if (!result.ok) return failure("connect", result, accountId);
    const warning = result.loggedIn ? "" : "\nFacebook still showed login markers. If the page looked logged in, try `log scan` anyway.";
    return { code: 0, stdout: `Saved the ${accountId} session to ${result.storageStatePath}${warning}` };
  },
};

export const scanCommand: Command = {
  name: "scan",
  summary: "Read Marketplace > Selling live for one account and compare with log",
  args: "--account <id> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log scan: ${parsed.error}\n${SCAN_USAGE}` };
    const accountId = requireAccount(context, "scan", SCAN_USAGE, parsed.flags["account"]);
    if (typeof accountId !== "string") return accountId;

    const result = await context.worker({
      action: "marketplace.scan",
      account_id: accountId,
      storage_state_path: storageStatePath(accountId),
    });
    if (!result.ok) return failure("scan", result, accountId);
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountId, ...result }, null, 2) };
    const known = context.load().listings.filter((listing) => listing.accountId === accountId);
    return { code: 0, stdout: renderScan(result, known) };
  },
};

export const statusCommand: Command = {
  name: "status",
  summary: "Open one Marketplace item page live and classify its status",
  args: "<listingId> --account <id> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log status: ${parsed.error}\n${STATUS_USAGE}` };
    const [listingId, extra] = parsed.positionals;
    if (listingId === undefined) return { code: 1, stderr: `log status: a listing id is required\n${STATUS_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log status: unexpected argument "${extra}"\n${STATUS_USAGE}` };
    const accountId = requireAccount(context, "status", STATUS_USAGE, parsed.flags["account"]);
    if (typeof accountId !== "string") return accountId;

    const result = await context.worker({
      action: "marketplace.status",
      account_id: accountId,
      storage_state_path: storageStatePath(accountId),
      params: { listing_id: listingId },
    });
    if (!result.ok) return failure("status", result, accountId);
    const status = fromCamofoxStatus(result.status);
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountId, ...result, status }, null, 2) };
    return {
      code: 0,
      stdout: [`${result.title ?? "(no title)"}`, `  Listing ID  ${result.listingId}`, `  Live status ${status}`, `  URL         ${result.listingUrl}`].join("\n"),
    };
  },
};
