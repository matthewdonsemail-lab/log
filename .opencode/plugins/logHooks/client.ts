import { closeSync, mkdirSync, openSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { CommandVerdict, LogHookEvent, LogHookPayload, LogHookReply } from "./types";

export const HOOK_HOST = "127.0.0.1";
export const HOOK_PORT = Number(process.env.LOG_CONTEXT_PORT || 47317);
export const HOOK_TIMEOUT_MS = Number(process.env.LOG_OPENCODE_HOOK_MS || 25000);
export const COMMAND_HOOK_TIMEOUT_MS = Number(process.env.LOG_OPENCODE_COMMAND_HOOK_MS || 15000);

const origin = (): string => `http://${HOOK_HOST}:${HOOK_PORT}`;

export function serviceLogPath(): string {
  const root = process.env.LOG_CONTEXT_LAYER || join(homedir(), ".logCli", "contextLayer");
  return join(root, "service.log");
}

export function hookServiceUrl(): string {
  return `${origin()}/health`;
}

export async function hookServerUp(timeoutMs = 600): Promise<boolean> {
  try {
    const response = await fetch(hookServiceUrl(), { signal: AbortSignal.timeout(timeoutMs) });
    return response.ok;
  } catch {
    return false;
  }
}

export function startHookServer(repo: string): boolean {
  const log = serviceLogPath();
  try {
    mkdirSync(dirname(log), { recursive: true });
    const fd = openSync(log, "a");
    try {
      const child = spawn("bun", [join(repo, "scripts", "contextLayer", "service.ts")], {
        cwd: repo,
        detached: true,
        stdio: ["ignore", fd, fd],
        windowsHide: true,
        env: process.env,
      });
      child.unref();
      return true;
    } finally {
      closeSync(fd);
    }
  } catch {
    return false;
  }
}

export async function ensureHookServer(repo: string, attempts = 24): Promise<boolean> {
  if (await hookServerUp()) return true;
  if (!startHookServer(repo)) return false;
  for (let attempt = 0; attempt < attempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (await hookServerUp(400)) return true;
  }
  return false;
}

export async function postHook(event: LogHookEvent, payload: LogHookPayload, timeoutMs = HOOK_TIMEOUT_MS): Promise<LogHookReply> {
  try {
    const response = await fetch(`${origin()}/hooks/${event}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hook_event_name: event, ...payload }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return { failed: true };
    const text = await response.text();
    if (!text.trim()) return {};
    const body = JSON.parse(text) as {
      hookSpecificOutput?: { additionalContext?: string };
      decision?: unknown;
      reason?: unknown;
    };
    const context = body.hookSpecificOutput?.additionalContext;
    return {
      context: typeof context === "string" && context.trim() ? context : undefined,
      decision: typeof body.decision === "string" ? body.decision : undefined,
      reason: typeof body.reason === "string" ? body.reason : undefined,
    };
  } catch {
    return { failed: true };
  }
}

function contextOf(stdout: string): string | undefined {
  const text = stdout.trim();
  if (!text) return undefined;
  try {
    const body = JSON.parse(text) as { hookSpecificOutput?: { additionalContext?: string } };
    const context = body.hookSpecificOutput?.additionalContext;
    return typeof context === "string" && context.trim() ? context : undefined;
  } catch {
    return text;
  }
}

export async function runCommandHook(
  script: string,
  repo: string,
  payload: LogHookPayload,
  timeoutMs = COMMAND_HOOK_TIMEOUT_MS,
): Promise<CommandVerdict> {
  try {
    const path = join(repo, "scripts", "hooks", script);
    const child = Bun.spawn(["bun", path], {
      cwd: repo,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      windowsHide: true,
      env: process.env,
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
    const timer = setTimeout(() => child.kill(), timeoutMs);
    const [stdout, stderr] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()]);
    const code = await child.exited;
    clearTimeout(timer);
    if (code === 2) return { deny: stderr.trim() || stdout.trim() || `${script} refused this call` };
    if (code !== 0) return {};
    return { context: contextOf(stdout) };
  } catch {
    return {};
  }
}
