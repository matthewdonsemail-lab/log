import { readdirSync } from "node:fs";
import { dirname } from "node:path";
import { hostDir, readProgress, runHost, sendControl } from "../../marketplace/host/index.ts";
import type { HostControl, MilestoneField } from "../../marketplace/host/index.ts";
import { standingOf } from "../../marketplace/lifecycle/index.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { parseArgs, parserSpecOf, PROXY_MS_FLAG, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { dayOf, hostActors } from "./helpers/index.ts";
import type { HostBrowser } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const HOST_USAGE = [
  "Usage: log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)",
  "       log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>",
  "       log facebook host status [--account <accountName>]",
].join("\n");

const EVENTS: HostControl["type"][] = ["PERSON_DONE", "PAUSE", "RESUME", "SHUTDOWN", "LOST"];

export const HOST_INPUT: CommandInput = {
  forms: [
    {
      words: ["start"],
      summary: "Run the account's lifecycle in one open browser through its active hours",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account" },
        { name: "live", kind: "boolean", live: true, description: "Profile, name and location on Facebook, only when matt asked (rule 8)" },
        { name: "likes", kind: "boolean", live: true, description: "The warm-up's likes, only when matt asked (rule 8)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when matt asked (rule 20)" },
        { name: "gapSeconds", kind: "integer", description: "Seconds between warm-up activities (default 10)" },
        { name: "watchMinutes", kind: "integer", description: "Minutes between watch checks" },
        PROXY_MS_FLAG,
      ],
    },
    {
      words: ["send"], effect: "write",
      summary: "Send an event to the account's running host",
      positionals: [{ name: "event", kind: "enum", required: true, values: EVENTS, description: "The event" }],
      flags: [{ name: "account", kind: "string", required: true, description: "The account" }],
    },
    { words: ["status"], effect: "read", summary: "Where each host is", positionals: [], flags: [{ name: "account", kind: "string", description: "Only this account's host" }] },
  ],
};

export const hostCommand: Command = {
  usage: HOST_USAGE,
  platform: "facebook",
  name: "host",
  effect: "browser",
  input: HOST_INPUT,
  summary: "Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress",
  args: "<start|send|status> --account <name> [--live] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(HOST_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log facebook host: ${parsed.error}\n${HOST_USAGE}` };
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

    if (typeof flags["account"] !== "string") return { code: 1, stderr: `log facebook host: --account is required\n${HOST_USAGE}` };
    let account;
    try {
      account = await findAccount(context.twenty, flags["account"]);
    } catch (error) {
      return refuseError("host", error);
    }

    if (sub === "send") {
      if (!EVENTS.includes(event as HostControl["type"])) return { code: 1, stderr: `log facebook host send: one of ${EVENTS.join(", ")}\n${HOST_USAGE}` };
      sendControl(account.accountName, { type: event } as HostControl);
      return { code: 0, stdout: `Sent ${event} to ${account.accountName}'s host.` };
    }

    if (sub !== "start") return { code: 1, stderr: `log facebook host: pick start, send or status\n${HOST_USAGE}` };
    const minutes = (flag: string, fallback: number) => (flags[flag] === undefined ? fallback : Number(flags[flag]));
    const gap = minutes("gapSeconds", 10);
    const watch = minutes("watchMinutes", 12);
    if (!Number.isFinite(gap) || gap < 0 || gap > 36_000) return { code: 1, stderr: "log facebook host: --gapSeconds is 0 to 36000" };
    if (!Number.isFinite(watch) || watch < 0 || watch > 600) return { code: 1, stderr: "log facebook host: --watchMinutes is 0 to 600" };

    const browser: HostBrowser = { run: null, session: null };
    const log = (line: string) => context.err(line);
    const host = runHost({
      account: account.accountName,
      standing: standingOf(account),
      liveActions: Boolean(flags["live"]),
      actors: hostActors(context, account, browser, { bypassHours: Boolean(flags["bypass"]), likes: Boolean(flags["likes"]), log }) as never,
      saveFields: async (fields: Partial<Record<MilestoneField, string>>) => void (await context.twenty.update("socialAccounts", account.id, fields)),
      today: dayOf(account).today,
      timing: { activityGapMs: gap * 1000, watchIntervalMs: watch * 60_000 },
      onLine: log,
      inspect: createInspector((line) => context.err(formatTraceLine(line))),
    });
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
    lines.push(`  progress: ${hostDir(account.accountName)}/progress.json (log facebook host status); restart carries on from it.`);
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
