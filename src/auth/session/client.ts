/**
 * The session boundary: the on-disk store and the blaster API that validates
 * and refreshes tokens. Ported from blaster
 * (`packages/core/src/platform/session/helpers/store.ts` and
 * `packages/blaster-cli/src/cli/login.ts`).
 *
 * The store lives in `~/.logCli/auth/` (`LOG_HOME` moves `~/.logCli`):
 * `config.json` and `sessions.json`. It holds live tokens: never print it.
 * The CLI never holds the OAuth client secret. blaster's API does, through
 * `GET /api/auth/me` and `POST /api/auth/refresh`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isTokenExpired } from "./helpers/index.ts";
import { DEFAULT_API_URL, DEFAULT_WEB_URL } from "./types.ts";
import type { SessionConfig, SessionHome, SessionRecord, ValidationResult } from "./types.ts";

export function authDir(env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_HOME || join(homedir(), ".logCli"), "auth");
}

function readJsonFile(path: string): Record<string, unknown> | null {
  try {
    return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>) : null;
  } catch {
    // A corrupt store reads as "not signed in": the fix is the same either way.
    return null;
  }
}

function isSessionRecord(value: unknown): value is SessionRecord {
  const candidate = value as Partial<SessionRecord> | null;
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof candidate.accessToken === "string" &&
    typeof candidate.apiUrl === "string" &&
    typeof candidate.obtainedAtMs === "number"
  );
}

export function loadSessionHome(dir = authDir()): SessionHome {
  const config = (readJsonFile(join(dir, "config.json")) ?? {}) as SessionConfig;
  const sessions: Record<string, SessionRecord> = {};
  for (const [apiUrl, record] of Object.entries(readJsonFile(join(dir, "sessions.json")) ?? {})) {
    if (isSessionRecord(record)) sessions[apiUrl] = record;
  }
  return { config, sessions };
}

function writeSessionHome(dir: string, home: SessionHome): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "config.json"), `${JSON.stringify(home.config, null, 2)}\n`);
  writeFileSync(join(dir, "sessions.json"), `${JSON.stringify(home.sessions, null, 2)}\n`, { mode: 0o600 });
}

export function saveSessionRecord(record: SessionRecord, config: SessionConfig = {}, dir = authDir()): void {
  const home = loadSessionHome(dir);
  home.sessions[record.apiUrl] = record;
  writeSessionHome(dir, { config: { ...home.config, ...config }, sessions: home.sessions });
}

export function removeSessionRecord(apiUrl: string, dir = authDir()): boolean {
  const home = loadSessionHome(dir);
  if (!home.sessions[apiUrl]) return false;
  delete home.sessions[apiUrl];
  writeSessionHome(dir, home);
  return true;
}

/** Flag, then env, then the stored config, then hosted blaster. */
export function resolveApiUrl(flag: string | undefined, dir = authDir()): string {
  return flag || process.env.LOG_API_URL || loadSessionHome(dir).config.apiUrl || DEFAULT_API_URL;
}

export function resolveWebUrl(flag: string | undefined, dir = authDir()): string {
  return flag || process.env.LOG_WEB_URL || loadSessionHome(dir).config.webUrl || DEFAULT_WEB_URL;
}

function unreachableApi(apiUrl: string, error: unknown): string {
  const code = (error as { cause?: { code?: string } } | undefined)?.cause?.code;
  if (code === "ECONNREFUSED") return `No blaster API is listening on ${apiUrl}. Start it, or pass --apiUrl.`;
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return `${apiUrl} could not be resolved. Check --apiUrl and your network.`;
  return `Could not reach the blaster API at ${apiUrl} (${error instanceof Error ? error.message : String(error)}).`;
}

/** Validate a token through blaster's API, which checks it against Twenty. The token never appears in a message. */
export async function validateSessionToken(apiUrl: string, accessToken: string, fetchFn: typeof fetch = fetch): Promise<ValidationResult> {
  if (accessToken.trim() === "") return { ok: false, kind: "config", message: "No session token." };
  let response: Response;
  try {
    response = await fetchFn(`${apiUrl.replace(/\/+$/, "")}/api/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  } catch (error) {
    return { ok: false, kind: "transport", message: unreachableApi(apiUrl, error) };
  }
  if (response.status === 401) return { ok: false, kind: "auth", message: "The API rejected the session token" };
  if (!response.ok) return { ok: false, kind: "transport", message: `API answered ${response.status}` };
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    ok: true,
    identity: {
      username: typeof body.username === "string" ? body.username : null,
      scope: typeof body.scope === "string" ? body.scope : null,
    },
  };
}

async function refreshSessionToken(
  apiUrl: string,
  refreshToken: string,
  fetchFn: typeof fetch,
): Promise<{ ok: true; record: Pick<SessionRecord, "accessToken" | "refreshToken" | "expiresIn" | "username"> } | { ok: false }> {
  let response: Response;
  try {
    response = await fetchFn(`${apiUrl.replace(/\/+$/, "")}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { ok: false };
  }
  if (!response.ok) return { ok: false };
  const body = (await response.json().catch(() => ({}))) as { tokens?: Record<string, unknown> };
  const tokens = body.tokens ?? {};
  const accessToken = tokens.accessToken ?? tokens.access_token;
  if (typeof accessToken !== "string") return { ok: false };
  // Validate the rotated token before trusting it.
  const validation = await validateSessionToken(apiUrl, accessToken, fetchFn);
  if (!validation.ok) return { ok: false };
  const nextRefresh = tokens.refreshToken ?? tokens.refresh_token;
  const expiresIn = tokens.expiresIn ?? tokens.expires_in;
  return {
    ok: true,
    record: {
      accessToken,
      refreshToken: typeof nextRefresh === "string" ? nextRefresh : refreshToken,
      expiresIn: typeof expiresIn === "number" ? expiresIn : null,
      username: validation.identity.username,
    },
  };
}

/**
 * A stored session as a live one: validated, or refreshed once when expired
 * or rejected. The message says what to do when it can't be.
 */
export async function liveSession(
  record: SessionRecord,
  fetchFn: typeof fetch = fetch,
  dir = authDir(),
): Promise<{ ok: true; record: SessionRecord } | { ok: false; message: string }> {
  if (!isTokenExpired(record.obtainedAtMs, record.expiresIn)) {
    const validation = await validateSessionToken(record.apiUrl, record.accessToken, fetchFn);
    if (validation.ok) return { ok: true, record };
    if (validation.kind !== "auth") return { ok: false, message: validation.message };
  }
  if (!record.refreshToken) return { ok: false, message: "The stored session expired and can't be refreshed. Run `log login` again." };
  const rotated = await refreshSessionToken(record.apiUrl, record.refreshToken, fetchFn);
  if (!rotated.ok) return { ok: false, message: "The stored session can't be refreshed. Run `log login` again." };
  const next: SessionRecord = { ...record, ...rotated.record, obtainedAtMs: Date.now() };
  saveSessionRecord(next, { apiUrl: record.apiUrl }, dir);
  return { ok: true, record: next };
}
