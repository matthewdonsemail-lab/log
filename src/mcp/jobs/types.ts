export type JobStatus = "running" | "completed" | "failed" | "cancelled" | "lost";

export interface JobProgressLine {
  at: string;
  source: string;
  line: string;
}

export interface JobRecord {
  id: string;
  tool: string;
  argv: string[];
  account: string | null;
  live: boolean;
  pid: number;
  startedAt: string;
  endedAt: string | null;
  status: JobStatus;
  cancelRequested: boolean;
  result: Record<string, unknown> | null;
  text: string | null;
}

export interface JobView {
  id: string;
  tool: string;
  account: string | null;
  status: JobStatus;
  startedAt: string;
  endedAt: string | null;
  cancelRequested: boolean;
  progress: JobProgressLine[];
  afterLine: number;
  result: Record<string, unknown> | null;
  text: string | null;
}

export type CancelVerdict = { ok: true; record: JobRecord } | { ok: false; message: string };

export const DEFAULT_WAIT_MS = 20_000;
export const MAX_WAIT_MS = 50_000;
export const DEFAULT_STATUS_WAIT_MS = 10_000;
export const PUBLISH_PASSED = /\b(?:publishing|s\d+_clickPublish)\b/;
