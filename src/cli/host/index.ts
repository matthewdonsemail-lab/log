/**
 * `log host` (rule 35): the runner above the lifecycle machine. One process per
 * account opens ONE browser for the account's day and runs every lifecycle step
 * in it (sign-in, account check, profile, location, the warm-up, watching),
 * saving its progress on every change so a restart carries on where it left.
 *
 *   log host start --account <a> [--live] [--bypass] [--gapMinutes <n>] [--watchMinutes <n>] [--groupMinutes <n>]
 *       every watch check also reads each group the account is in that is due (the firehose, #27)
 *   log host send --account <a> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
 *   log host status [--account <a>]
 */
import { readdirSync } from "node:fs";
import { dirname } from "node:path";
import { hostDir, readProgress, runHost, sendControl } from "../../marketplace/host/index.ts";
import type { HostControl, MilestoneField } from "../../marketplace/host/index.ts";
import { standingOf } from "../../marketplace/lifecycle/index.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { dayOf, DEFAULT_GROUP_MINUTES, hostActors } from "./helpers/index.ts";
import type { HostBrowser } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const HOST_USAGE = [
  "Usage: log host start --account <accountName> [--live] [--likes] [--bypass] [--gapMinutes <n>] [--watchMinutes <n>] [--groupMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)",
  "       --groupMinutes: each group the account is in is read at most this often, in its open browser, and its new posts and comments go to Twenty (default 60; 0 reads none)",
  "       log host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>",
  "       log host status [--account <accountName>]",
].join("\n");

const EVENTS: HostControl["type"][] = ["PERSON_DONE", "PAUSE", "RESUME", "SHUTDOWN", "LOST"];

export const hostCommand: Command = {
  usage: HOST_USAGE,
  platform: "facebook",
  name: "host",
  summary: "Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress",
  args: "<start|send|status> --account <name> [--live] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["live", "likes", "bypass"], valued: ["account", "gapMinutes", "watchMinutes", "groupMinutes"] });
    if (!parsed.ok) return { code: 1, stderr: `log host: ${parsed.error}\n${HOST_USAGE}` };
    const [sub, event] = parsed.positionals;
    const flags = parsed.flags;

    if (sub === "status") {
      const names = typeof flags["account"] === "string" ? [flags["account"]] : safeList(dirname(hostDir("x")));
      const lines: string[] = [];
      for (const name of names) {
        const p = readProgress(name);
        if (!p) continue;
        const closes = p.closes.map((c) => `${c.reason} ${c.at.slice(11, 16)}`).join(", ") || "none";
        lines.push(`${name}  ${p.state}  saved ${p.savedAt.slice(0, 16)}  warm-up ${p.resume.warmupDone.length}/5  opens today ${p.resume.opensToday}  closes: ${closes}${p.lastError ? `  last error: ${p.lastError.code}` : ""}${p.issue ? `  issue: ${p.issue.code}` : ""}`);
      }
      return { code: 0, stdout: lines.join("\n") || "No host has run yet." };
    }

    if (typeof flags["account"] !== "string") return { code: 1, stderr: `log host: --account is required\n${HOST_USAGE}` };
    let account;
    try {
      account = await findAccount(context.twenty, flags["account"]);
    } catch (error) {
      return refuseError("host", error);
    }

    if (sub === "send") {
      if (!EVENTS.includes(event as HostControl["type"])) return { code: 1, stderr: `log host send: one of ${EVENTS.join(", ")}\n${HOST_USAGE}` };
      sendControl(account.accountName, { type: event } as HostControl);
      return { code: 0, stdout: `Sent ${event} to ${account.accountName}'s host.` };
    }

    if (sub !== "start") return { code: 1, stderr: `log host: pick start, send or status\n${HOST_USAGE}` };
    const minutes = (flag: string, fallback: number) => (flags[flag] === undefined ? fallback : Number(flags[flag]));
    const gap = minutes("gapMinutes", 150);
    const watch = minutes("watchMinutes", 12);
    const groupMinutes = minutes("groupMinutes", DEFAULT_GROUP_MINUTES);
    if (![gap, watch, groupMinutes].every((n) => Number.isFinite(n) && n >= 0 && n <= 600)) return { code: 1, stderr: "log host: --gapMinutes, --watchMinutes and --groupMinutes are 0 to 600" };

    const browser: HostBrowser = { run: null, session: null };
    const log = (line: string) => context.err(line);
    const host = runHost({
      account: account.accountName,
      standing: standingOf(account),
      liveActions: Boolean(flags["live"]),
      actors: hostActors(context, account, browser, { bypassHours: Boolean(flags["bypass"]), likes: Boolean(flags["likes"]), groupMinutes, log }) as never,
      saveFields: async (fields: Partial<Record<MilestoneField, string>>) => void (await context.twenty.update("socialAccounts", account.id, fields)),
      today: dayOf(account).today,
      timing: { activityGapMs: gap * 60_000, watchIntervalMs: watch * 60_000 },
      onLine: log,
      inspect: createInspector((line) => context.err(formatTraceLine(line))),
    });
    // Ctrl+C is a shutdown with its reason, so the browser closes and the session is saved (rule 35).
    const onSignal = () => host.send({ type: "SHUTDOWN" });
    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);
    const result = await host.done;
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    const closes = result.context.browser.closes.map((c) => c.reason).join(", ") || "none";
    const lines = [
      `Host for ${account.accountName} ended in ${result.state}.`,
      `  opens today: ${result.context.browser.opensToday}; closes: ${closes}; warm-up done: ${result.context.warmup.done.join(", ") || "none"}`,
    ];
    if (result.context.issue) lines.push(`  account issue: ${result.context.issue.code}${result.context.issue.detail ? ` (${result.context.issue.detail})` : ""}`);
    if (result.context.lastError) lines.push(`  last error: ${result.context.lastError.code}${result.context.lastError.detail ? ` (${result.context.lastError.detail})` : ""}`);
    lines.push(`  progress: ${hostDir(account.accountName)}/progress.json (log host status); restart carries on from it.`);
    return { code: ["stopped", "host.overnight.rest"].includes(result.state) ? 0 : 1, stdout: lines.join("\n") };
  },
};

function safeList(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}
