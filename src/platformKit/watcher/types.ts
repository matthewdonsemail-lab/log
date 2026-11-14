export const WATCHER_STATES = ["starting", "catchingUp", "live", "reconnecting", "coolingDown", "signInNeeded", "stopped", "failed", "busy"] as const;
export type WatcherState = (typeof WATCHER_STATES)[number];

export const WATCHER_ENDS = ["stopped", "signInNeeded", "coolingDown", "failed"] as const;
export type WatcherEnd = (typeof WATCHER_ENDS)[number];

export const RUNNING_STATES: readonly WatcherState[] = ["starting", "catchingUp", "live", "reconnecting"];

export const LEGACY_WATCHER_STATES: Readonly<Record<string, WatcherState>> = { connecting: "starting", streaming: "live", error: "stopped" };

export const SIGN_IN_CODES: readonly string[] = ["sessionDead", "noPlatformSession", "noSession", "sessionMismatch"];
export const COOLING_CODES: readonly string[] = ["rateLimited", "governorBlocked"];

export type WatcherClaim = { ok: true; generation: number } | { ok: false; holder: number };

export type WatcherEvent = { type: "opened" } | { type: "dropped" } | { type: "heard" } | { type: "recheck" };

export interface WatcherActors<Result> {
  claim: () => WatcherClaim | Promise<WatcherClaim>;
  connect: () => Promise<Result>;
  catchUp: () => Promise<void>;
  release: (end: WatcherEnd, code: string | null) => Promise<void>;
  endOf: (result: Result) => { end: WatcherEnd; code: string | null };
  behind: () => boolean;
}

export interface WatcherOptions {
  onState?: (state: WatcherState) => void;
}

export interface WatcherRun<Result> {
  state: WatcherState;
  code: string | null;
  holder?: number;
  generation?: number;
  result?: Result;
  error?: unknown;
}

export interface WatcherHandle<Result> {
  send: (event: WatcherEvent) => void;
  state: () => WatcherState;
  done: Promise<WatcherRun<Result>>;
}

export const WATCHER_PLATFORMS = ["twitter", "discord", "slack", "instagram"] as const;
export type WatcherPlatform = (typeof WATCHER_PLATFORMS)[number];

export const WATCH_COMMANDS: Readonly<Record<WatcherPlatform, readonly string[]>> = {
  twitter: ["twitter", "chat", "watch"],
  discord: ["discord", "watch"],
  slack: ["slack", "watch"],
  instagram: ["instagram", "watch"],
};

export interface WatcherRow {
  platform: string;
  account: string;
  state: WatcherState;
  pid: number | null;
  startedAt: string | null;
  heartbeat: string | null;
  subscribers: number;
  generation: number | null;
  code: string | null;
}

export interface WatcherSupervision {
  replaced: string[];
  stale: string[];
  started: string[];
  held: string[];
}

export interface SuperviseDeps {
  accounts: (platform: WatcherPlatform) => string[];
  coolingDown: (platform: WatcherPlatform, account: string) => boolean;
  start: (platform: WatcherPlatform, account: string) => number | null;
  replaceHung: (platform: WatcherPlatform, accounts: readonly string[]) => string[];
  stopStale: (platform: WatcherPlatform, accounts: readonly string[]) => string[];
  ensure: (platform: WatcherPlatform, accounts: readonly string[], start: (account: string) => number | null) => string[];
  held: (platform: WatcherPlatform, account: string) => boolean;
}
