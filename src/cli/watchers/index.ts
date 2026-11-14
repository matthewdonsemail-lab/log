import { join } from "node:path";
import { killTree, processAlive, releaseWatcher } from "../../inbox/watch/index.ts";
import { capabilityMissing, capabilityOf } from "../../platformKit/capability/index.ts";
import { holdWatcher, isWatcherPlatform, liftWatcherHold, recordWatcherEnd, signedInAccounts, superviseLocalWatchers, watcherHeld, watcherKey, watcherRows, WATCHER_PLATFORMS } from "../../platformKit/watcher/index.ts";
import type { WatcherPlatform, WatcherRow, WatcherSupervision } from "../../platformKit/watcher/index.ts";
import { isPlatform, JSON_FLAG, parseArgs, parserSpecOf, PLATFORM_LABELS, PLATFORMS, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";

export const WATCHERS_USAGE = [
  "Usage: log watchers status [--platform <p>] [--account <a>] [--json]",
  "       log watchers start [--platform <p>] [--account <a>] [--json]",
  "       log watchers stop [--platform <p>] [--account <a>] [--json]",
  "Each signed-in account on a platform with a push watcher has one watcher process, the one owner of its socket (rule 105). Its state is one machine: starting, catchingUp, live, reconnecting, and at its end stopped, signInNeeded, coolingDown or failed; a second watcher for the same account is refused as busy. status reads each watcher's state from log.db. start starts every signed-in account's watcher that isn't running, cooling down or held, the same start the inbox hook and the runtime make, and lifts the hold on the accounts it names. stop ends the named watchers and holds them, so nothing starts them again until start names them. A platform with no push watcher answers capabilityMissing. Messages a watcher hears are read with log inbox pending.",
].join("\n");

const PLATFORM_FLAG: FlagSpec = { name: "platform", kind: "enum", values: PLATFORMS, description: "Only this platform's watchers" };
const ACCOUNT_FLAG: FlagSpec = { name: "account", kind: "string", description: "Only this account's watchers, by its accountName" };

export const WATCHERS_INPUT: CommandInput = {
  forms: [
    { words: ["status"], effect: "read", summary: "Each account watcher's state, read from log.db: starting, catchingUp, live, reconnecting, or how it ended", positionals: [], flags: [PLATFORM_FLAG, ACCOUNT_FLAG, JSON_FLAG] },
    { words: ["start"], effect: "write", summary: "Start the watcher of every signed-in account that isn't running, cooling down or held, the same start every harness makes", positionals: [], flags: [PLATFORM_FLAG, ACCOUNT_FLAG, JSON_FLAG] },
    { words: ["stop"], effect: "write", summary: "Stop the named account watchers and hold them until start names them again", positionals: [], flags: [PLATFORM_FLAG, ACCOUNT_FLAG, JSON_FLAG], groups: [{ rule: "atLeastOne", names: ["platform", "account"] }] },
  ],
};

export const watchersDeps: {
  repo: () => string;
  supervise: (filter: { platform?: WatcherPlatform; account?: string }) => WatcherSupervision;
  rows: (filter: { platform?: string; account?: string }) => WatcherRow[];
  accounts: (platform: WatcherPlatform) => string[];
  alive: (pid: number) => boolean;
  kill: (pid: number) => void;
} = {
  repo: () => join(import.meta.dir, "..", "..", ".."),
  supervise: (filter) => superviseLocalWatchers(watchersDeps.repo(), filter),
  rows: (filter) => watcherRows(filter),
  accounts: signedInAccounts,
  alive: processAlive,
  kill: killTree,
};

const SUBS = ["status", "start", "stop"] as const;

function rowLine(row: WatcherRow & { held: boolean }): string {
  const running = row.pid ? `pid ${row.pid}, since ${row.startedAt}, ${row.subscribers} subscriber(s)` : `last heard ${row.heartbeat ?? "never"}${row.code ? `, ${row.code}` : ""}`;
  return `  ${PLATFORM_LABELS[row.platform as WatcherPlatform] ?? row.platform} ${row.account}: ${row.state} (${running})${row.held ? ", held by the owner" : ""}`;
}

function accountsIn(platforms: readonly WatcherPlatform[], account: string | undefined): { platform: WatcherPlatform; account: string }[] {
  return platforms.flatMap((platform) => watchersDeps.accounts(platform).filter((a) => !account || a.toLowerCase() === account.toLowerCase()).map((a) => ({ platform, account: a })));
}

function statusRows(platforms: readonly WatcherPlatform[], account: string | undefined): (WatcherRow & { held: boolean })[] {
  const rows = platforms.flatMap((platform) => watchersDeps.rows({ platform, ...(account ? { account } : {}) }));
  const known = new Set(rows.map((r) => watcherKey(r.platform, r.account)));
  const never = accountsIn(platforms, account).filter((a) => !known.has(watcherKey(a.platform, a.account))).map((a): WatcherRow => ({ platform: a.platform, account: a.account, state: "stopped", pid: null, startedAt: null, heartbeat: null, subscribers: 0, generation: null, code: "watcherNeverStarted" }));
  return [...rows, ...never].map((row) => ({ ...row, held: watcherHeld(row.platform, row.account) }));
}

export const watchersCommand: Command = {
  usage: WATCHERS_USAGE,
  platform: "any",
  name: "watchers",
  effect: "write",
  input: WATCHERS_INPUT,
  summary: "Each account's one watcher: its state, starting the ones that aren't running and stopping them, from any harness",
  args: "status|start|stop [--platform <p>] [--account <a>] [--json]",
  async run(context, argv): Promise<CommandResult> {
    const parsed = parseArgs(argv, parserSpecOf(WATCHERS_INPUT));
    if (!parsed.ok) return refuseInput("watchers", parsed.error, WATCHERS_USAGE);
    const [sub = "status", ...rest] = parsed.positionals;
    const verb = SUBS.find((s) => s === sub);
    if (!verb || rest.length) return { code: 1, error: "inputInvalid", stderr: `log watchers: say status, start or stop\n${WATCHERS_USAGE}` };
    const json = parsed.flags["json"] === true;
    const platform = typeof parsed.flags["platform"] === "string" ? parsed.flags["platform"] : undefined;
    const account = typeof parsed.flags["account"] === "string" ? parsed.flags["account"].trim().replace(/^@/, "") || undefined : undefined;
    if (platform !== undefined && !isPlatform(platform)) return { code: 1, error: "inputInvalid", stderr: `log watchers ${verb}: --platform is one of ${PLATFORMS.join(", ")}\n${WATCHERS_USAGE}` };
    if (platform !== undefined && !isWatcherPlatform(platform)) return refuse(`watchers ${verb}`, "capabilityMissing", capabilityMissing(capabilityOf("messagesWatch")!, platform).detail);
    const platforms = platform && isWatcherPlatform(platform) ? [platform] : [...WATCHER_PLATFORMS];
    if (verb === "status") {
      const rows = statusRows(platforms, account);
      if (json) return { code: 0, stdout: JSON.stringify({ watchers: rows }, null, 2) };
      return { code: 0, stdout: rows.length ? [`log watchers status: ${rows.length} account watcher(s):`, ...rows.map(rowLine)].join("\n") : "log watchers status: no signed-in account has a watcher." };
    }
    const named = accountsIn(platforms, account);
    if (account && !named.length) return refuse(`watchers ${verb}`, "accountNotFound", `no signed-in account ${account}${platform ? ` on ${PLATFORM_LABELS[platform as WatcherPlatform]}` : ""} with a push watcher`);
    if (verb === "start") {
      const lifted = named.filter((a) => liftWatcherHold(a.platform, a.account)).map((a) => watcherKey(a.platform, a.account));
      const done = platforms.map((p) => watchersDeps.supervise({ platform: p, ...(account ? { account } : {}) }));
      const started = done.flatMap((d) => d.started);
      const replaced = done.flatMap((d) => [...d.replaced, ...d.stale]);
      const running = statusRows(platforms, account).filter((r) => r.pid && !started.includes(watcherKey(r.platform, r.account))).map((r) => watcherKey(r.platform, r.account));
      if (json) return { code: 0, stdout: JSON.stringify({ started, running, replaced, lifted }, null, 2) };
      context.err(`watchers start: ${named.length} signed-in account(s) with a push watcher`);
      return { code: 0, stdout: [`log watchers start: started ${started.length ? started.join(", ") : "none"}; already running ${running.length ? running.join(", ") : "none"}${replaced.length ? `; replaced ${replaced.join(", ")}` : ""}${lifted.length ? `; hold lifted on ${lifted.join(", ")}` : ""}.`].join("\n") };
    }
    const stopped: string[] = [];
    const inProcess: string[] = [];
    for (const row of statusRows(platforms, account)) {
      if (!row.pid || !watchersDeps.alive(row.pid)) continue;
      if (row.pid === process.pid) {
        inProcess.push(watcherKey(row.platform, row.account));
        continue;
      }
      watchersDeps.kill(row.pid);
      releaseWatcher(row.platform, row.account, row.pid);
      recordWatcherEnd(row.platform, row.account, "stopped", "stoppedByOwner", row.pid);
      stopped.push(watcherKey(row.platform, row.account));
    }
    for (const a of named) holdWatcher(a.platform, a.account, "owner");
    const held = named.map((a) => watcherKey(a.platform, a.account));
    if (json) return { code: 0, stdout: JSON.stringify({ stopped, held, inProcess }, null, 2) };
    return { code: 0, stdout: `log watchers stop: stopped ${stopped.length ? stopped.join(", ") : "none"}; held ${held.length ? held.join(", ") : "none"} until log watchers start names them${inProcess.length ? `; ${inProcess.join(", ")} runs inside this process and ends after its seconds` : ""}.` };
  },
};
