import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";
import { db, immediate } from "../../inbox/store/index.ts";
import { cleanAttrs, fromRemote, otlpBody, ROOT_SPAN, traceparentOf, urlName } from "./helpers/index.ts";
import type { ActiveCall, EngineTrace, RemoteSpan, Span, SpanAttrs, TimingFilter } from "./types.ts";

interface Scope {
  call: ActiveCall;
  parentId: string;
}

export interface SpanHandle {
  spanId: string | null;
  attrs: SpanAttrs;
}

const scopes = new AsyncLocalStorage<Scope>();
const KEEP_DAYS = 90;
let fetchPatched = false;
let pruned = false;
let originalFetch: typeof fetch = globalThis.fetch;

function hex(bytes: number): string {
  return randomBytes(bytes).toString("hex");
}

export function currentCall(): ActiveCall | null {
  return scopes.getStore()?.call ?? null;
}

export function currentCallId(): string | null {
  return currentCall()?.callId ?? null;
}

function record(scope: Scope, span: Omit<Span, "callId" | "traceId" | "tool" | "source" | "pid">): void {
  scope.call.spans.push({ ...span, callId: scope.call.callId, traceId: scope.call.traceId, tool: scope.call.tool, source: "bun", pid: process.pid });
}

export async function timed<T>(name: string, run: (span: SpanHandle) => Promise<T> | T, attrs: Record<string, unknown> = {}): Promise<T> {
  const scope = scopes.getStore();
  const handle: SpanHandle = { spanId: null, attrs: cleanAttrs(attrs) };
  if (!scope) return run(handle);
  handle.spanId = hex(8);
  const startedAt = Date.now();
  const began = performance.now();
  let ok = true;
  try {
    return await scopes.run({ call: scope.call, parentId: handle.spanId }, () => run(handle));
  } catch (error) {
    ok = false;
    throw error;
  } finally {
    record(scope, { spanId: handle.spanId, parentId: scope.parentId, name, startedAt, ms: performance.now() - began, ok, attrs: cleanAttrs(handle.attrs) });
  }
}

export function timedSync<T>(name: string, run: (span: SpanHandle) => T, attrs: Record<string, unknown> = {}): T {
  const scope = scopes.getStore();
  const handle: SpanHandle = { spanId: null, attrs: cleanAttrs(attrs) };
  if (!scope) return run(handle);
  handle.spanId = hex(8);
  const startedAt = Date.now();
  const began = performance.now();
  let ok = true;
  try {
    return scopes.run({ call: scope.call, parentId: handle.spanId }, () => run(handle));
  } catch (error) {
    ok = false;
    throw error;
  } finally {
    record(scope, { spanId: handle.spanId, parentId: scope.parentId, name, startedAt, ms: performance.now() - began, ok, attrs: cleanAttrs(handle.attrs) });
  }
}

export function engineTrace(handle: SpanHandle): EngineTrace | null {
  const call = currentCall();
  if (!call || !handle.spanId) return null;
  return { callId: call.callId, traceId: call.traceId, parentId: handle.spanId, traceparent: traceparentOf(call.traceId, handle.spanId) };
}

export function harvestEngine(answer: unknown, handle: SpanHandle, spawnedAt: number): void {
  const scope = scopes.getStore();
  if (!answer || typeof answer !== "object") return;
  const body = answer as { spans?: unknown; bootAt?: unknown };
  const remote = Array.isArray(body.spans) ? (body.spans as RemoteSpan[]) : [];
  const bootAt = Number(body.bootAt);
  delete body.spans;
  delete body.bootAt;
  if (!scope || !handle.spanId) return;
  for (const row of remote) {
    const span = fromRemote(row, scope.call, handle.spanId);
    if (span) scope.call.spans.push(span);
  }
  if (Number.isFinite(bootAt) && bootAt > spawnedAt) {
    scope.call.spans.push({ callId: scope.call.callId, traceId: scope.call.traceId, tool: scope.call.tool, spanId: hex(8), parentId: handle.spanId, name: "python.start", source: "bun", pid: process.pid, startedAt: spawnedAt, ms: bootAt - spawnedAt, ok: true, attrs: {} });
  }
}

export function timedEngineSync<R>(name: string, attrs: Record<string, unknown>, run: (trace: EngineTrace | null) => R, answerOf: (result: R) => unknown): R {
  return timedSync(
    name,
    (handle) => {
      const spawnedAt = Date.now();
      const result = run(engineTrace(handle));
      harvestEngine(answerOf(result), handle, spawnedAt);
      return result;
    },
    attrs,
  );
}

export function timedEngine<R>(name: string, attrs: Record<string, unknown>, run: (trace: EngineTrace | null) => Promise<R>, answerOf: (result: R) => unknown): Promise<R> {
  return timed(
    name,
    async (handle) => {
      const spawnedAt = Date.now();
      const result = await run(engineTrace(handle));
      harvestEngine(answerOf(result), handle, spawnedAt);
      return result;
    },
    attrs,
  );
}

export function instrumentFetch(): void {
  if (fetchPatched) return;
  fetchPatched = true;
  originalFetch = globalThis.fetch;
  const wrapped = ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (!scopes.getStore()) return originalFetch(input, init);
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
    return timed(`fetch ${method} ${urlName(url)}`, async (handle) => {
      const response = await originalFetch(input, init);
      handle.attrs.status = response.status;
      return response;
    });
  }) as typeof fetch;
  globalThis.fetch = Object.assign(wrapped, originalFetch);
}

function storeSpans(spans: Span[]): void {
  if (spans.length === 0) return;
  try {
    immediate((handle) => {
      const insert = handle.prepare(`INSERT OR IGNORE INTO spans (spanId, traceId, callId, parentId, tool, name, source, pid, startedAt, ms, ok, attrs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const s of spans) insert.run(s.spanId, s.traceId, s.callId, s.parentId, s.tool, s.name, s.source, s.pid, s.startedAt, s.ms, s.ok ? 1 : 0, JSON.stringify(s.attrs));
      if (!pruned) {
        pruned = true;
        handle.prepare(`DELETE FROM spans WHERE startedAt < ?`).run(Date.now() - KEEP_DAYS * 86400000);
      }
    });
  } catch {
  }
}

function exportOtlp(spans: Span[]): void {
  const base = process.env.LOG_OTLP_URL;
  if (!base || spans.length === 0) return;
  originalFetch(`${base.replace(/\/+$/, "")}/v1/traces`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(otlpBody(spans)) }).catch(() => {});
}

export async function timeCall<T>(tool: string, run: (call: ActiveCall) => Promise<T>, attrs: Record<string, unknown> = {}): Promise<T> {
  const outer = scopes.getStore();
  if (outer) return run(outer.call);
  instrumentFetch();
  const traceId = hex(16);
  const call: ActiveCall = { callId: traceId.slice(0, 12), traceId, tool, spanId: hex(8), spans: [], attrs: cleanAttrs(attrs) };
  const startedAt = Date.now();
  const began = performance.now();
  let ok = true;
  try {
    return await scopes.run({ call, parentId: call.spanId }, () => run(call));
  } catch (error) {
    ok = false;
    throw error;
  } finally {
    call.spans.push({ callId: call.callId, traceId, spanId: call.spanId, parentId: null, tool, name: ROOT_SPAN, source: "bun", pid: process.pid, startedAt, ms: performance.now() - began, ok: ok && call.attrs.exit !== undefined ? call.attrs.exit === 0 : ok, attrs: cleanAttrs(call.attrs) });
    storeSpans(call.spans);
    exportOtlp(call.spans);
  }
}

export function readSpans(filter: TimingFilter = {}): Span[] {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filter.callId) {
    where.push("(callId = ? OR traceId = ?)");
    args.push(filter.callId, filter.callId);
  }
  if (filter.tool) {
    where.push("tool = ?");
    args.push(filter.tool);
  }
  if (filter.sinceMs !== undefined) {
    where.push("startedAt >= ?");
    args.push(filter.sinceMs);
  }
  const rows = db()
    .prepare(`SELECT * FROM spans ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY startedAt`)
    .all(...args) as (Omit<Span, "ok" | "attrs"> & { ok: number; attrs: string })[];
  return rows.map((row) => {
    let attrs: SpanAttrs = {};
    try {
      attrs = JSON.parse(row.attrs) as SpanAttrs;
    } catch {
    }
    return { ...row, ok: row.ok === 1, attrs };
  });
}
