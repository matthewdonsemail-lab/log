import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CancelVerdict, JobProgressLine, JobRecord, JobStatus, JobView } from "./types.ts";
import { MAX_WAIT_MS, PUBLISH_PASSED } from "./types.ts";

export function jobsDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MCP_JOBS_DIR || join(homedir(), ".logCli", "mcp", "jobs");
}

const recordPath = (id: string) => join(jobsDir(), `${id}.json`);
const progressPath = (id: string) => join(jobsDir(), `${id}.jsonl`);
const cancelPath = (id: string) => join(jobsDir(), `${id}.cancel`);

export function newJobId(now = new Date()): string {
  return `job${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}${randomBytes(3).toString("hex")}`;
}

export function writeJob(record: JobRecord): void {
  mkdirSync(jobsDir(), { recursive: true });
  writeFileSync(recordPath(record.id), JSON.stringify(record, null, 2));
}

export function readJob(id: string): JobRecord | null {
  if (!/^job\w+$/.test(id) || !existsSync(recordPath(id))) return null;
  try {
    return JSON.parse(readFileSync(recordPath(id), "utf8")) as JobRecord;
  } catch {
    return null;
  }
}

export function startJob(fields: Pick<JobRecord, "tool" | "argv" | "account" | "live">, now = new Date()): JobRecord {
  const record: JobRecord = { ...fields, id: newJobId(now), pid: process.pid, startedAt: now.toISOString(), endedAt: null, status: "running", cancelRequested: false, result: null, text: null };
  writeJob(record);
  return record;
}

export function appendProgress(id: string, line: JobProgressLine): void {
  appendFileSync(progressPath(id), `${JSON.stringify(line)}\n`);
}

export function readProgress(id: string): JobProgressLine[] {
  if (!existsSync(progressPath(id))) return [];
  return readFileSync(progressPath(id), "utf8")
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as JobProgressLine];
      } catch {
        return [];
      }
    });
}

export function finishJob(id: string, status: Exclude<JobStatus, "running" | "lost">, result: Record<string, unknown>, text: string, now = new Date()): void {
  const record = readJob(id);
  if (!record) return;
  writeJob({ ...record, status, result, text, endedAt: now.toISOString() });
}

export function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

export function statusOf(record: JobRecord, alive: (pid: number) => boolean = pidAlive): JobStatus {
  return record.status === "running" && !alive(record.pid) ? "lost" : record.status;
}

export function listJobs(): JobRecord[] {
  if (!existsSync(jobsDir())) return [];
  return readdirSync(jobsDir())
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      const record = readJob(f.slice(0, -5));
      return record ? [record] : [];
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function busyJob(account: string | null, alive: (pid: number) => boolean = pidAlive): JobRecord | null {
  if (!account) return null;
  return listJobs().find((r) => r.account === account && statusOf(r, alive) === "running") ?? null;
}

export function cancelRequested(id: string): boolean {
  return existsSync(cancelPath(id));
}

export function requestCancel(id: string, alive: (pid: number) => boolean = pidAlive): CancelVerdict {
  const record = readJob(id);
  if (!record) return { ok: false, message: `no job ${id}` };
  const status = statusOf(record, alive);
  if (status !== "running") return { ok: false, message: `job ${id} is ${status}: nothing to stop` };
  if (record.live && readProgress(id).some((p) => PUBLISH_PASSED.test(p.line))) return { ok: false, message: `job ${id} is past Publish: once Publish is clicked nothing is stopped or retried (rule 10). Follow it with jobStatus.` };
  writeFileSync(cancelPath(id), new Date().toISOString());
  const updated = { ...record, cancelRequested: true };
  writeJob(updated);
  return { ok: true, record: updated };
}

export function jobView(record: JobRecord, afterLine = 0, alive: (pid: number) => boolean = pidAlive): JobView {
  const progress = readProgress(record.id);
  return {
    id: record.id,
    tool: record.tool,
    account: record.account,
    status: statusOf(record, alive),
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    cancelRequested: record.cancelRequested,
    progress: progress.slice(Math.max(0, afterLine)),
    afterLine: progress.length,
    result: record.result,
    text: record.text,
  };
}

export async function waitForJob(id: string, afterLine: number, waitMs: number, alive: (pid: number) => boolean = pidAlive): Promise<JobView | null> {
  const until = Date.now() + Math.min(Math.max(0, waitMs), MAX_WAIT_MS);
  for (;;) {
    const record = readJob(id);
    if (!record) return null;
    const view = jobView(record, afterLine, alive);
    if (view.status !== "running" || view.progress.length || Date.now() >= until) return view;
    await new Promise((resolve) => setTimeout(resolve, Math.min(500, Math.max(10, until - Date.now()))));
  }
}

export function accountOfArgv(argv: string[]): string | null {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--account" && argv[i + 1]) return argv[i + 1];
    if (argv[i].startsWith("--account=")) return argv[i].slice(10) || null;
  }
  return null;
}
