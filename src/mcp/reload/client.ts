import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { appendLiveLine, liveLogDir } from "../../observability/liveLog/index.ts";
import { codeStampWatcher } from "../freshness/index.ts";
import { listJobs, statusOf } from "../jobs/index.ts";
import { idKey, initialized, isRequest, isResponse, parseMessage, replayedInitialize, restartedMidCall, toolsChanged } from "./helpers/index.ts";
import { CHECK_EVERY_MS, CRASH_WINDOW_MS, INIT_TIMEOUT_MS, MAX_CRASHES } from "./types.ts";
import type { ChildEvents, ReloadChild, ReloadDeps, ReloadState, RpcId, RpcMessage } from "./types.ts";

interface Slot {
  child: ReloadChild;
  generation: number;
  stamp: number;
}

interface Swap {
  slot: Slot;
  replayId: string;
  timer: ReturnType<typeof setTimeout> | null;
  reason: string;
}

export class ReloadProxy {
  private current: Slot | null = null;
  private swap: Swap | null = null;
  private generation = 0;
  private initialize: RpcMessage | null = null;
  private pending = new Map<string, RpcId>();
  private queue: string[] = [];
  private crashes: number[] = [];
  private killed = new Set<number>();
  private failedStamp = 0;
  private state: ReloadState;

  constructor(private deps: ReloadDeps) {
    this.state = { proxyPid: process.pid, childPid: 0, childStamp: 0, startedAt: new Date(deps.now()).toISOString(), reloads: 0, lastReloadAt: null, waitingOn: null, lastError: null };
  }

  start(): void {
    this.current = this.launch();
    this.save();
  }

  private launch(): Slot {
    const generation = ++this.generation;
    const stamp = this.deps.stamp();
    const child = this.deps.startChild(this.events(generation));
    return { child, generation, stamp };
  }

  private events(generation: number): ChildEvents {
    return { onLine: (line) => this.fromChild(generation, line), onExit: (code) => this.childExit(generation, code) };
  }

  private save(): void {
    this.state = { ...this.state, childPid: this.current?.child.pid ?? 0, childStamp: this.current?.stamp ?? 0 };
    this.deps.record(this.state);
  }

  fromClient(line: string): void {
    const message = parseMessage(line);
    if (message?.method === "initialize" && isRequest(message)) this.initialize = message;
    if (!this.swap && !this.current) {
      if (message && isRequest(message)) this.deps.toClient(restartedMidCall(message.id, this.state.lastError ?? "the server isn't running"));
      return;
    }
    if (this.swap || !this.current) {
      this.queue.push(line);
      return;
    }
    if (message && isRequest(message) && message.method !== "initialize" && this.reloadDue()) {
      this.queue.push(line);
      this.reload("the code changed");
      return;
    }
    if (message && isRequest(message)) this.pending.set(idKey(message.id), message.id);
    this.current.child.write(line);
  }

  private fromChild(generation: number, line: string): void {
    if (this.swap && generation === this.swap.slot.generation) {
      const message = parseMessage(line);
      if (message && isResponse(message) && message.id === this.swap.replayId) this.finishSwap(message);
      return;
    }
    if (!this.current || generation !== this.current.generation) return;
    const message = parseMessage(line);
    if (message && isResponse(message)) this.pending.delete(idKey(message.id));
    this.deps.toClient(line);
  }

  private childExit(generation: number, code: number | null): void {
    if (this.killed.delete(generation)) return;
    if (this.swap && generation === this.swap.slot.generation) {
      this.failSwap(`the new server exited with ${code} before it answered`);
      return;
    }
    if (!this.current || generation !== this.current.generation) return;
    const why = `it exited with ${code}`;
    for (const id of this.pending.values()) this.deps.toClient(restartedMidCall(id, why));
    this.pending.clear();
    const now = this.deps.now();
    this.crashes = [...this.crashes.filter((at) => now - at < CRASH_WINDOW_MS), now];
    this.current = null;
    if (this.crashes.length > MAX_CRASHES) {
      this.state.lastError = `the log MCP server crashed ${this.crashes.length} times in a minute (last: ${why}); the proxy stays up and starts it again on the next code change`;
      this.deps.log(this.state.lastError);
      this.failedStamp = this.deps.stamp();
      this.save();
      return;
    }
    this.deps.log(`log MCP server ${why}; starting it again`);
    this.reload(why);
  }

  reloadDue(): boolean {
    if (!this.current || this.swap || !this.initialize) return false;
    const stamp = this.deps.stamp();
    if (stamp <= this.current.stamp || stamp === this.failedStamp) return false;
    const busy = [...(this.pending.size ? [`${this.pending.size} call(s) in flight`] : []), ...this.deps.jobsRunning(this.current.child.pid)];
    this.state.waitingOn = busy.length ? busy.join(", ") : null;
    if (busy.length) this.save();
    return busy.length === 0;
  }

  tick(): void {
    if (!this.current && !this.swap && this.deps.stamp() !== this.failedStamp) {
      this.reload("a crash, now the code changed");
      return;
    }
    if (this.reloadDue()) this.reload("the code changed");
  }

  private reload(reason: string): void {
    const slot = this.launch();
    if (!this.initialize) {
      this.adopt(slot, reason);
      return;
    }
    const replayId = `logMcpReload-${slot.generation}`;
    const timer = setTimeout(() => this.failSwap(`the new server didn't answer initialize in ${INIT_TIMEOUT_MS / 1000} s`), INIT_TIMEOUT_MS);
    this.swap = { slot, replayId, timer, reason };
    slot.child.write(replayedInitialize(this.initialize, replayId));
  }

  private finishSwap(answer: RpcMessage): void {
    const swap = this.swap!;
    if (swap.timer) clearTimeout(swap.timer);
    if (answer.error) {
      this.failSwap(`the new server refused initialize: ${JSON.stringify(answer.error).slice(0, 200)}`);
      return;
    }
    swap.slot.child.write(initialized());
    this.swap = null;
    this.adopt(swap.slot, swap.reason);
  }

  private adopt(slot: Slot, reason: string): void {
    const old = this.current;
    if (old) {
      this.killed.add(old.generation);
      old.child.kill();
    }
    this.current = slot;
    const reloaded = old !== null || reason !== "start";
    if (reloaded) {
      this.state.reloads += 1;
      this.state.lastReloadAt = new Date(this.deps.now()).toISOString();
      this.state.waitingOn = null;
      this.state.lastError = null;
      this.deps.log(`log MCP server reloaded (${reason}): pid ${slot.child.pid} runs the code from ${new Date(slot.stamp).toISOString()}`);
      this.deps.toClient(toolsChanged());
    }
    this.save();
    this.flush();
  }

  private failSwap(why: string): void {
    const swap = this.swap;
    if (!swap) return;
    if (swap.timer) clearTimeout(swap.timer);
    this.swap = null;
    this.killed.add(swap.slot.generation);
    swap.slot.child.kill();
    this.failedStamp = swap.slot.stamp;
    this.state.lastError = `the new code didn't start (${why}), so the server stays on the code it had; it tries again on the next change`;
    this.deps.log(this.state.lastError);
    this.save();
    if (!this.current) {
      for (const line of this.queue.splice(0)) {
        const message = parseMessage(line);
        if (message && isRequest(message)) this.deps.toClient(restartedMidCall(message.id, why));
      }
      return;
    }
    this.flush();
  }

  private flush(): void {
    for (const line of this.queue.splice(0)) this.fromClient(line);
  }

  close(): void {
    for (const slot of [this.current, this.swap?.slot]) {
      if (!slot) continue;
      this.killed.add(slot.generation);
      slot.child.kill();
    }
  }
}

export function reloadStateFile(): string {
  return process.env.LOG_MCP_RELOAD_FILE || join(homedir(), ".logCli", "mcp", "reload.json");
}

export function readReloadState(file = reloadStateFile()): ReloadState | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as ReloadState;
  } catch {
    return null;
  }
}

function spawnServerChild(root: string, events: ChildEvents): ReloadChild {
  const child = spawn(process.execPath, [join(root, "bin", "logMcp.ts"), "--child"], { cwd: root, stdio: ["pipe", "pipe", "inherit"], windowsHide: true, env: process.env });
  createInterface({ input: child.stdout! }).on("line", events.onLine);
  child.on("exit", (code) => events.onExit(code));
  return {
    pid: child.pid ?? 0,
    write: (line) => {
      if (!child.stdin!.destroyed) child.stdin!.write(`${line}\n`);
    },
    kill: () => {
      try {
        child.kill();
      } catch {
      }
    },
  };
}

export function runReloadProxy(root: string): void {
  const dir = liveLogDir();
  const file = reloadStateFile();
  const stamps = codeStampWatcher(root);
  const proxy = new ReloadProxy({
    startChild: (events) => spawnServerChild(root, events),
    stamp: () => stamps.current(),
    jobsRunning: (pid) => listJobs().filter((job) => job.pid === pid && statusOf(job) === "running").map((job) => `job ${job.id} (${job.tool})`),
    toClient: (line) => process.stdout.write(`${line}\n`),
    log: (line) => {
      process.stderr.write(`${line}\n`);
      appendLiveLine(dir, "mcp", "err", line);
    },
    record: (state) => {
      try {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, JSON.stringify(state));
      } catch {
      }
    },
    now: () => Date.now(),
  });
  proxy.start();
  const timer = setInterval(() => {
    stamps.refresh();
    proxy.tick();
  }, CHECK_EVERY_MS);
  const input = createInterface({ input: process.stdin });
  input.on("line", (line) => proxy.fromClient(line));
  input.on("close", () => {
    clearInterval(timer);
    stamps.close();
    proxy.close();
    process.exit(0);
  });
}
