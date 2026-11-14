import type { Database } from "bun:sqlite";
import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { createActor, toPromise } from "xstate";
import { db } from "../../inbox/store/index.ts";
import { inboxRoot, processAlive } from "../../inbox/watch/index.ts";
import { deleteState, getState, putState } from "../../storage/state/index.ts";
import { accountWatcherMachine } from "./machine.ts";
import { COOLING_CODES, LEGACY_WATCHER_STATES, SIGN_IN_CODES, WATCH_COMMANDS, WATCHER_PLATFORMS, WATCHER_STATES } from "./types.ts";
import type { SuperviseDeps, WatcherActors, WatcherEnd, WatcherHandle, WatcherOptions, WatcherPlatform, WatcherRow, WatcherRun, WatcherState, WatcherSupervision } from "./types.ts";

const END_SCOPE = "watcherEnd" as const;
const HOLD_SCOPE = "watcherHold" as const;

type Alive = (pid: number) => boolean;

export const watcherKey = (platform: string, account: string): string => `${platform}/${account}`;

export function isWatcherPlatform(platform: string): platform is WatcherPlatform {
  return (WATCHER_PLATFORMS as readonly string[]).includes(platform);
}

export function startAccountWatcher<Result>(actors: WatcherActors<Result>, options: WatcherOptions = {}): WatcherHandle<Result> {
  const actor = createActor(accountWatcherMachine(actors, options));
  const done = toPromise(actor) as Promise<WatcherRun<Result>>;
  actor.start();
  return { send: (event) => actor.send(event), state: () => actor.getSnapshot().context.state, done };
}

export function watchEndOf(result: unknown): { end: WatcherEnd; code: string | null } {
  const answer = (result as { answer?: { ok?: boolean; code?: string } } | null)?.answer;
  if (!answer || answer.ok) return { end: "stopped", code: null };
  const code = typeof answer.code === "string" ? answer.code : null;
  if (code && SIGN_IN_CODES.includes(code)) return { end: "signInNeeded", code };
  if (code && COOLING_CODES.includes(code)) return { end: "coolingDown", code };
  return { end: "failed", code: code ?? "watcherFailed" };
}

export function watcherStateOf(stored: unknown): WatcherState | null {
  if ((WATCHER_STATES as readonly unknown[]).includes(stored)) return stored as WatcherState;
  return typeof stored === "string" ? (LEGACY_WATCHER_STATES[stored] ?? null) : null;
}

export function recordWatcherEnd(platform: string, account: string, end: WatcherEnd, code: string | null, pid: number = process.pid, now: Date = new Date(), handle: Database = db()): void {
  putState(END_SCOPE, watcherKey(platform, account), { state: end, code, pid }, now.getTime(), handle);
}

export function holdWatcher(platform: string, account: string, by: string, now: Date = new Date(), handle: Database = db()): void {
  putState(HOLD_SCOPE, watcherKey(platform, account), { by }, now.getTime(), handle);
}

export function liftWatcherHold(platform: string, account: string, handle: Database = db()): boolean {
  const held = watcherHeld(platform, account, handle);
  if (held) deleteState(HOLD_SCOPE, watcherKey(platform, account), handle);
  return held;
}

export function watcherHeld(platform: string, account: string, handle: Database = db()): boolean {
  return getState(HOLD_SCOPE, watcherKey(platform, account), {}, handle) !== null;
}

interface OwnerRow {
  platform: string;
  account: string;
  pid: number;
  startedAt: string;
  heartbeat: string;
  status: string;
  subscribers: number;
  generation: number;
}

export function reconcileWatchers(alive: Alive = processAlive, now: Date = new Date(), handle: Database = db()): string[] {
  const fixed: string[] = [];
  const rows = handle.prepare(`SELECT platform, account, pid FROM owners WHERE status != 'stopped' AND platform IN (${WATCHER_PLATFORMS.map(() => "?").join(", ")})`).all(...WATCHER_PLATFORMS) as { platform: string; account: string; pid: number }[];
  for (const row of rows) {
    if (alive(row.pid)) continue;
    const changed = handle.prepare("UPDATE owners SET status = 'stopped', port = 0, token = '', subscribers = 0 WHERE platform = ? AND account = ? AND pid = ? AND status != 'stopped'").run(row.platform, row.account, row.pid);
    if (!changed.changes) continue;
    recordWatcherEnd(row.platform, row.account, "stopped", "watcherGone", row.pid, now, handle);
    fixed.push(watcherKey(row.platform, row.account));
  }
  return fixed;
}

export function watcherRows(filter: { platform?: string; account?: string } = {}, alive: Alive = processAlive, handle: Database = db()): WatcherRow[] {
  reconcileWatchers(alive, new Date(), handle);
  const platforms = WATCHER_PLATFORMS.filter((p) => !filter.platform || p === filter.platform);
  if (!platforms.length) return [];
  const owners = handle.prepare(`SELECT platform, account, pid, startedAt, heartbeat, status, subscribers, generation FROM owners WHERE platform IN (${platforms.map(() => "?").join(", ")}) ORDER BY platform, account`).all(...platforms) as OwnerRow[];
  return owners
    .filter((row) => !filter.account || row.account.toLowerCase() === filter.account.toLowerCase())
    .map((row): WatcherRow => {
      const running = row.status !== "stopped" && alive(row.pid);
      const ended = getState<{ state?: unknown; code?: unknown }>(END_SCOPE, watcherKey(row.platform, row.account), {}, handle)?.body;
      const endState = watcherStateOf(ended?.state) ?? "stopped";
      return {
        platform: row.platform,
        account: row.account,
        state: running ? (watcherStateOf(row.status) ?? "starting") : endState,
        pid: running ? row.pid : null,
        startedAt: row.startedAt,
        heartbeat: row.heartbeat,
        subscribers: running ? row.subscribers : 0,
        generation: row.generation,
        code: running ? null : typeof ended?.code === "string" ? ended.code : null,
      };
    });
}

export function watchArgvOf(platform: WatcherPlatform, account: string): string[] {
  return [...WATCH_COMMANDS[platform], "--account", account, "--inbox"];
}

export function startWatcher(platform: WatcherPlatform, account: string, repo: string): number | null {
  const dir = join(inboxRoot(), platform, account);
  mkdirSync(dir, { recursive: true });
  const log = openSync(join(dir, "watch.log"), "a");
  try {
    const child = spawn("bun", [join(repo, "bin", "log.ts"), ...watchArgvOf(platform, account)], { cwd: repo, detached: true, stdio: ["ignore", log, log], windowsHide: true, env: process.env });
    child.unref();
    return child.pid ?? null;
  } finally {
    closeSync(log);
  }
}

export function superviseWatchers(deps: SuperviseDeps, filter: { platform?: WatcherPlatform; account?: string } = {}): WatcherSupervision {
  const done: WatcherSupervision = { replaced: [], stale: [], started: [], held: [] };
  const named = (account: string) => !filter.account || account.toLowerCase() === filter.account.toLowerCase();
  for (const platform of WATCHER_PLATFORMS.filter((p) => !filter.platform || p === filter.platform)) {
    const accounts = deps.accounts(platform).filter(named);
    if (!accounts.length) continue;
    done.replaced.push(...deps.replaceHung(platform, accounts).map((a) => watcherKey(platform, a)));
    done.stale.push(...deps.stopStale(platform, accounts).map((a) => watcherKey(platform, a)));
    const held = accounts.filter((a) => deps.held(platform, a));
    done.held.push(...held.map((a) => watcherKey(platform, a)));
    const wanted = accounts.filter((a) => !held.includes(a) && !deps.coolingDown(platform, a));
    done.started.push(...deps.ensure(platform, wanted, (account) => deps.start(platform, account)).map((a) => watcherKey(platform, a)));
  }
  return done;
}
