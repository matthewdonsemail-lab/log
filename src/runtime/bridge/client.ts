import { createHash, createPublicKey, randomBytes, randomUUID, verify } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Database } from "bun:sqlite";
import type { Authority, Binding, Envelope, OperationState, PendingPairing, Refusal, ResultPayload, RunTool } from "./types.ts";
import { PROTOCOL_VERSION, RECONNECT_MS } from "./types.ts";

export function runtimeDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_RUNTIME_DIR || join(homedir(), ".logCli", "runtime");
}

const bindingPath = (dir: string) => join(dir, "binding.json");
const pendingPath = (dir: string) => join(dir, "pairing.json");

function writePrivate(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2), { mode: 0o600 });
  chmodSync(path, 0o600);
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readBinding(dir = runtimeDir()): Binding | null {
  return readJson<Binding>(bindingPath(dir));
}

export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map((item) => canonical(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
}

export function requestHash(tool: string, args: unknown): string {
  return createHash("sha256").update(canonical({ tool, args })).digest("hex");
}

export function normalOrigin(origin: string): string {
  const url = new URL(origin);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("the origin must be https (http only for localhost)");
  return url.origin;
}

export function startPairing(origin: string, dir = runtimeDir()): { challengeHash: string; installationId: string } {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const installationId = readBinding(dir)?.installationId ?? readJson<PendingPairing>(pendingPath(dir))?.installationId ?? randomUUID();
  const pending: PendingPairing = { origin: normalOrigin(origin), installationId, challengeProof: randomBytes(32).toString("base64url"), createdAt: new Date().toISOString() };
  writePrivate(pendingPath(dir), pending);
  return { challengeHash: createHash("sha256").update(pending.challengeProof).digest("hex"), installationId };
}

export async function finishPairing(pairingToken: string, dir = runtimeDir(), fetcher: typeof fetch = fetch): Promise<Binding | Refusal> {
  const pending = readJson<PendingPairing>(pendingPath(dir));
  if (!pending) return { ok: false, code: "pairingNotStarted", message: "run log runtime init --origin <url> first" };
  const answer = await fetcher(`${pending.origin}/api/v1/runtime/pair`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pairingToken, challengeProof: pending.challengeProof, installationId: pending.installationId }) });
  const body = (await answer.json().catch(() => ({}))) as Record<string, unknown>;
  if (!answer.ok) return { ok: false, code: String(body.code ?? `http${answer.status}`), message: String(body.safeMessage ?? "pairing refused") };
  const key = (await (await fetcher(`${pending.origin}/api/v1/runtime/dispatchKey`)).json()) as { publicKey: string; bridgeUrl: string; protocolVersion: number };
  if (key.protocolVersion !== PROTOCOL_VERSION) return { ok: false, code: "workspaceIncompatible", message: `the service speaks protocol ${key.protocolVersion}, this runtime ${PROTOCOL_VERSION}` };
  const binding: Binding = {
    origin: pending.origin,
    workspaceId: String(body.workspaceId),
    installationId: pending.installationId,
    credential: String(body.credential),
    generation: Number(body.generation),
    expiresAt: String(body.expiresAt),
    dispatchPublicKey: key.publicKey,
    bridgeUrl: key.bridgeUrl,
    pairedAt: new Date().toISOString(),
  };
  writePrivate(bindingPath(dir), binding);
  rmSync(pendingPath(dir), { force: true });
  return binding;
}

export function checkAuthority(binding: Binding, envelope: Envelope, generation: number, now = new Date()): Refusal | { ok: true; authority: Authority; tool: string; args: Record<string, unknown> } {
  const authority = envelope.authority;
  const payload = (envelope.payload ?? {}) as { tool?: unknown; args?: unknown };
  if (!authority || typeof payload.tool !== "string") return { ok: false, code: "invalidInput", message: "dispatch without authority or tool" };
  const { signature, ...signed } = authority;
  const publicKey = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(binding.dispatchPublicKey, "base64").toString("base64url") }, format: "jwk" });
  if (!verify(null, Buffer.from(canonical(signed)), publicKey, Buffer.from(signature, "base64"))) return { ok: false, code: "forbidden", message: "the dispatch signature does not verify" };
  if (authority.workspaceId !== binding.workspaceId || envelope.workspaceId !== binding.workspaceId) return { ok: false, code: "forbidden", message: "dispatch for another workspace" };
  if (authority.routeGeneration !== generation || envelope.routeGeneration !== generation) return { ok: false, code: "leaseStale", message: "dispatch for another route generation" };
  if (Date.parse(authority.expiresAt) <= now.getTime()) return { ok: false, code: "approvalExpired", message: "the dispatch authority expired" };
  if (authority.tool !== payload.tool) return { ok: false, code: "forbidden", message: "the authority names another tool" };
  const args = (payload.args ?? {}) as Record<string, unknown>;
  if (authority.requestHash !== requestHash(payload.tool, args)) return { ok: false, code: "forbidden", message: "the request changed after it was authorized" };
  return { ok: true, authority, tool: payload.tool, args };
}

interface OperationRow {
  operationId: string;
  requestHash: string;
  state: OperationState;
  result: string | null;
  error: string | null;
}

export function journalAccept(db: Database, authority: Authority, operationId: string, args: Record<string, unknown>, live: boolean, now = Date.now()): { fresh: boolean; row: OperationRow } | Refusal {
  const existing = db.query("SELECT operationId, requestHash, state, result, error FROM operations WHERE operationId = ?").get(operationId) as OperationRow | null;
  if (existing) {
    if (existing.requestHash !== authority.requestHash) return { ok: false, code: "idempotencyConflict", message: "this operation id was used for another request" };
    return { fresh: false, row: existing };
  }
  db.query("INSERT INTO operations (id, createdAt, updatedAt, operationId, requesterUserId, grantId, teamId, workspaceId, idempotencyKey, requestHash, tool, args, state, generation, live, startedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'accepted', ?, ?, ?)").run(
    randomUUID(), now, now, operationId, authority.actorUserId, authority.grantId, authority.teamId, authority.workspaceId, operationId, authority.requestHash, authority.tool, canonical(args), authority.routeGeneration, live ? 1 : 0, now,
  );
  return { fresh: true, row: { operationId, requestHash: authority.requestHash, state: "accepted", result: null, error: null } };
}

export function journalState(db: Database, operationId: string, state: OperationState, outcome: Partial<ResultPayload> = {}, now = Date.now()): void {
  const ended = ["succeeded", "failed", "cancelled", "unknown"].includes(state) ? now : null;
  db.query("UPDATE operations SET state = ?, result = ?, error = ?, updatedAt = ?, endedAt = COALESCE(?, endedAt) WHERE operationId = ?").run(state, outcome.result === undefined ? null : JSON.stringify(outcome.result), outcome.error ? JSON.stringify(outcome.error) : null, now, ended, operationId);
}

export function journalRead(db: Database, operationId: string): ResultPayload | null {
  const row = db.query("SELECT state, result, error FROM operations WHERE operationId = ?").get(operationId) as { state: OperationState; result: string | null; error: string | null } | null;
  if (!row) return null;
  return { state: row.state, ...(row.result ? { result: JSON.parse(row.result) } : {}), ...(row.error ? { error: JSON.parse(row.error) } : {}) };
}

export function settleInterrupted(db: Database, now = Date.now()): number {
  const reads = db.query("UPDATE operations SET state = 'failed', error = ?, updatedAt = ?, endedAt = ? WHERE state IN ('accepted', 'running') AND live = 0").run(JSON.stringify({ code: "interrupted", message: "the runtime stopped before this read finished" }), now, now);
  const writes = db.query("UPDATE operations SET state = 'unknown', error = ?, updatedAt = ?, endedAt = ? WHERE state IN ('accepted', 'running') AND live = 1").run(JSON.stringify({ code: "operationUnknown", message: "the runtime stopped during this write: check the platform before trying again" }), now, now);
  return Number(reads.changes) + Number(writes.changes);
}

export interface ConnectOptions {
  binding: Binding;
  db: Database;
  runTool: RunTool;
  isLive: (tool: string) => boolean;
  hello: () => { runtimeVersion: string; schemaVersion: number; capabilities: Record<string, unknown> };
  onLine: (line: string) => void;
  signal?: AbortSignal;
  socket?: (url: string, headers: Record<string, string>) => WebSocket;
  redact?: (tool: string, args: Record<string, unknown>) => Record<string, unknown>;
  redactResult?: (tool: string, result: unknown) => unknown;
}

const openSocket = (url: string, headers: Record<string, string>) => new (WebSocket as unknown as new (url: string, options: { headers: Record<string, string> }) => WebSocket)(url, { headers });

export function connectOnce(options: ConnectOptions): Promise<{ code: number; reason: string }> {
  const { binding, db, onLine } = options;
  return new Promise((resolve) => {
    const socket = (options.socket ?? openSocket)(binding.bridgeUrl, { authorization: `Bearer ${binding.credential}` });
    let generation = 0;
    let beat: ReturnType<typeof setInterval> | undefined;
    const send = (envelope: Omit<Envelope, "protocolVersion" | "workspaceId" | "routeGeneration">) => {
      if (socket.readyState === 1) socket.send(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, workspaceId: binding.workspaceId, routeGeneration: generation, ...envelope }));
    };
    const stop = () => socket.close(1000, "stopped");
    options.signal?.addEventListener("abort", stop, { once: true });
    socket.addEventListener("open", () => {
      onLine(`bridge: connected to ${binding.bridgeUrl}, saying hello as workspace ${binding.workspaceId}`);
      socket.send(JSON.stringify({ workspaceId: binding.workspaceId, installationId: binding.installationId, protocolVersion: PROTOCOL_VERSION, ...options.hello() }));
    });
    socket.addEventListener("message", async (event) => {
      let envelope: Envelope;
      try {
        envelope = JSON.parse(String(event.data)) as Envelope;
      } catch {
        return;
      }
      if (!generation && envelope.kind === "heartbeat") {
        generation = envelope.routeGeneration;
        const seconds = Number((envelope.payload as { heartbeatSeconds?: number } | null)?.heartbeatSeconds ?? 20);
        beat = setInterval(() => send({ kind: "heartbeat", payload: null }), seconds * 1000);
        onLine(`bridge: lease held, route generation ${generation}, heartbeat every ${seconds} s`);
        return;
      }
      const operationId = envelope.operationId ?? "";
      if (envelope.kind === "reconcile" || envelope.kind === "cancel") {
        const known = journalRead(db, operationId);
        send({ kind: "result", operationId, payload: known ?? { state: "unknown", error: { code: "operationUnknown", message: "this workspace has no record of that operation" } } });
        return;
      }
      if (envelope.kind !== "dispatch") return;
      const checked = checkAuthority(binding, envelope, generation);
      if ("code" in checked) {
        onLine(`bridge: refused ${operationId}: ${checked.code} (${checked.message})`);
        send({ kind: "result", operationId, payload: { state: "failed", error: { code: checked.code, message: checked.message } } });
        return;
      }
      const accepted = journalAccept(db, checked.authority, operationId, options.redact ? options.redact(checked.tool, checked.args) : checked.args, options.isLive(checked.tool));
      if ("code" in accepted) {
        send({ kind: "result", operationId, payload: { state: "failed", error: { code: accepted.code, message: accepted.message } } });
        return;
      }
      if (!accepted.fresh) {
        send({ kind: "result", operationId, payload: journalRead(db, operationId) });
        return;
      }
      send({ kind: "accepted", operationId, payload: null });
      journalState(db, operationId, "running");
      onLine(`bridge: running ${checked.tool} for operation ${operationId}`);
      let outcome: ResultPayload;
      try {
        outcome = await options.runTool(checked.tool, checked.args);
      } catch (error) {
        outcome = { state: options.isLive(checked.tool) ? "unknown" : "failed", error: { code: "runtimeError", message: error instanceof Error ? error.message : String(error) } };
      }
      journalState(db, operationId, outcome.state, options.redactResult && outcome.result !== undefined ? { ...outcome, result: options.redactResult(checked.tool, outcome.result) } : outcome);
      onLine(`bridge: ${checked.tool} ${outcome.state} (operation ${operationId})`);
      send({ kind: "result", operationId, payload: outcome });
    });
    socket.addEventListener("close", (event) => {
      if (beat) clearInterval(beat);
      options.signal?.removeEventListener("abort", stop);
      resolve({ code: event.code, reason: event.reason });
    });
    socket.addEventListener("error", () => onLine("bridge: connection error"));
  });
}

const FINAL_CLOSES: Readonly<Record<number, string>> = {
  4401: "the runtime credential is missing, revoked or expired: pair again",
  4403: "this workspace was revoked or the pairing does not match",
  4426: "the service needs another protocol version: update log",
};

export async function keepConnected(options: ConnectOptions): Promise<{ code: number; reason: string }> {
  const settled = settleInterrupted(options.db);
  if (settled) options.onLine(`bridge: ${settled} operation(s) left unfinished by an earlier run marked failed (reads) or unknown (writes)`);
  let attempt = 0;
  while (!options.signal?.aborted) {
    const closed = await connectOnce(options);
    if (options.signal?.aborted) return closed;
    if (FINAL_CLOSES[closed.code]) {
      options.onLine(`bridge: closed ${closed.code}: ${FINAL_CLOSES[closed.code]}`);
      return closed;
    }
    const wait = RECONNECT_MS[Math.min(attempt, RECONNECT_MS.length - 1)];
    attempt = closed.code === 1000 ? 0 : attempt + 1;
    options.onLine(`bridge: closed ${closed.code}${closed.reason ? ` (${closed.reason})` : ""}, reconnecting in ${wait / 1000} s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return { code: 1000, reason: "stopped" };
}
