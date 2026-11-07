export type RpcId = string | number;

export interface RpcMessage {
  jsonrpc?: string;
  id?: RpcId | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
}

export interface ReloadChild {
  pid: number;
  write: (line: string) => void;
  kill: () => void;
}

export interface ChildEvents {
  onLine: (line: string) => void;
  onExit: (code: number | null) => void;
}

export interface ReloadDeps {
  startChild: (events: ChildEvents) => ReloadChild;
  stamp: () => number;
  jobsRunning: (pid: number) => string[];
  toClient: (line: string) => void;
  log: (line: string) => void;
  record: (state: ReloadState) => void;
  now: () => number;
}

export interface ReloadState {
  proxyPid: number;
  childPid: number;
  childStamp: number;
  startedAt: string;
  reloads: number;
  lastReloadAt: string | null;
  waitingOn: string | null;
  lastError: string | null;
}

export const INIT_TIMEOUT_MS = 30_000;
export const CHECK_EVERY_MS = 3_000;
export const CRASH_WINDOW_MS = 60_000;
export const MAX_CRASHES = 5;
export const RESTARTED_MID_CALL = -32603;
