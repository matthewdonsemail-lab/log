import type { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { db } from "../../inbox/store/index.ts";
import type { CancelVerdict, JobProgressLine, JobRecord, JobStatus, JobView } from "./types.ts";
import { MAX_WAIT_MS, PUBLISH_PASSED } from "./types.ts";

export function jobsDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MCP_JOBS_DIR || join(homedir(), ".logCli", "mcp", "jobs");
}

type JobRow = { id: string; tool: string; argv: string; account: string | null; live: number; pid: number; startedAt: string; endedAt: string | null; status: string; cancelRequested: number; result: string | null; text: string | null };

function recordOf(row: JobRow): JobRecord {
  return { id: row.id, tool: row.tool, argv: JSON.parse(row.argv) as string[], account: row.account, live: row.live === 1, pid: row.pid, startedAt: row.startedAt, endedAt: row.endedAt, status: row.status as JobStatus, cancelRequested: row.cancelRequested === 1, result: row.result ? (JSON.parse(row.result) as Record<string, unknown>) : null, text: row.text };
}

function inWrite<T>(handle: Database, work: () => T): T {
  if (handle.inTransaction) return work();
  handle.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    handle.exec("COMMIT");
    return result;
  } catch (error) {
    handle.exec("ROLLBACK");
    throw error;
  }
}

const imported = new Set<string>();

export function importJobFiles(dir: string = jobsDir(), handle: Database = db()): number {
  const store = `jobFiles:${dir}`;
  if (imported.has(store)) return 0;
  imported.add(store);
  if (handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'").get(store) || !existsSync(dir)) return 0;
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  let count = 0;
  for (let offset = 0; offset < files.length; offset += 200) {
    inWrite(handle, () => {
      for (const file of files.slice(offset, offset + 200)) {
        const id = file.slice(0, -5);
        try {
          const record = JSON.parse(readFileSync(join(dir, file), "utf8")) as JobRecord;
          const cancelled = existsSync(join(dir, `${id}.cancel`));
          if (putJob(handle, { ...record, cancelRequested: record.cancelRequested || cancelled }, true)) count++;
          const progress = join(dir, `${id}.jsonl`);
          if (!existsSync(progress)) continue;
          const insert = handle.prepare("INSERT INTO jobLines (jobId, n, at, source, line) VALUES (?, ?, ?, ?, ?) ON CONFLICT(jobId, n) DO NOTHING");
          readFileSync(progress, "utf8").split("\n").filter(Boolean).forEach((text, n) => {
            try {
              const line = JSON.parse(text) as JobProgressLine;
              insert.run(id, n, line.at, line.source, line.line);
            } catch {}
          });
        } catch {}
      }
    });
  }
  handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, 'done', ?, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', files = excluded.files, rows = excluded.rows, endedAt = excluded.endedAt").run(store, files.length, count, dir, new Date().toISOString(), new Date().toISOString());
  return count;
}

function putJob(handle: Database, record: JobRecord, onlyNew = false): boolean {
  const sql = `INSERT INTO jobs (id, tool, argv, account, live, pid, startedAt, endedAt, status, cancelRequested, result, text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO ${onlyNew ? "NOTHING" : "UPDATE SET tool = excluded.tool, argv = excluded.argv, account = excluded.account, live = excluded.live, pid = excluded.pid, startedAt = excluded.startedAt, endedAt = excluded.endedAt, status = excluded.status, cancelRequested = excluded.cancelRequested, result = excluded.result, text = excluded.text"}`;
  return handle.prepare(sql).run(record.id, record.tool, JSON.stringify(record.argv), record.account, record.live ? 1 : 0, record.pid, record.startedAt, record.endedAt, record.status, record.cancelRequested ? 1 : 0, record.result ? JSON.stringify(record.result) : null, record.text).changes > 0;
}

export function newJobId(now = new Date()): string {
  return `job${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}${randomBytes(3).toString("hex")}`;
}

export function writeJob(record: JobRecord): void {
  const handle = db();
  inWrite(handle, () => putJob(handle, record));
}

export function readJob(id: string): JobRecord | null {
  if (!/^job\w+$/.test(id)) return null;
  importJobFiles();
  const row = db().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | null;
  return row ? recordOf(row) : null;
}

export function startJob(fields: Pick<JobRecord, "tool" | "argv" | "account" | "live">, now = new Date()): JobRecord {
  const record: JobRecord = { ...fields, id: newJobId(now), pid: process.pid, startedAt: now.toISOString(), endedAt: null, status: "running", cancelRequested: false, result: null, text: null };
  writeJob(record);
  return record;
}

export function appendProgress(id: string, line: JobProgressLine): void {
  const handle = db();
  inWrite(handle, () => handle.prepare("INSERT INTO jobLines (jobId, n, at, source, line) VALUES (?, (SELECT COALESCE(MAX(n), -1) + 1 FROM jobLines WHERE jobId = ?), ?, ?, ?)").run(id, id, line.at, line.source, line.line));
}

export function readProgress(id: string): JobProgressLine[] {
  importJobFiles();
  return db().prepare("SELECT at, source, line FROM jobLines WHERE jobId = ? ORDER BY n").all(id) as JobProgressLine[];
}

export function finishJob(id: string, status: Exclude<JobStatus, "running" | "lost">, result: Record<string, unknown>, text: string, now = new Date()): void {
  const handle = db();
  inWrite(handle, () => handle.prepare("UPDATE jobs SET status = ?, result = ?, text = ?, endedAt = ? WHERE id = ?").run(status, JSON.stringify(result), text, now.toISOString(), id));
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
  importJobFiles();
  return (db().prepare("SELECT * FROM jobs ORDER BY startedAt DESC").all() as JobRow[]).map(recordOf);
}

export function busyJob(account: string | null, alive: (pid: number) => boolean = pidAlive): JobRecord | null {
  if (!account) return null;
  importJobFiles();
  const running = (db().prepare("SELECT * FROM jobs WHERE account = ? AND status = 'running' ORDER BY startedAt DESC").all(account) as JobRow[]).map(recordOf);
  return running.find((r) => statusOf(r, alive) === "running") ?? null;
}

export function cancelRequested(id: string): boolean {
  const row = db().prepare("SELECT cancelRequested FROM jobs WHERE id = ?").get(id) as { cancelRequested: number } | null;
  return row?.cancelRequested === 1;
}

export function requestCancel(id: string, alive: (pid: number) => boolean = pidAlive): CancelVerdict {
  const record = readJob(id);
  if (!record) return { ok: false, message: `no job ${id}` };
  const status = statusOf(record, alive);
  if (status !== "running") return { ok: false, message: `job ${id} is ${status}: nothing to stop` };
  if (record.live && readProgress(id).some((p) => PUBLISH_PASSED.test(p.line))) return { ok: false, message: `job ${id} is past Publish: once Publish is clicked nothing is stopped or retried (rule 10). Follow it with jobStatus.` };
  const handle = db();
  inWrite(handle, () => handle.prepare("UPDATE jobs SET cancelRequested = 1 WHERE id = ?").run(id));
  return { ok: true, record: { ...record, cancelRequested: true } };
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
