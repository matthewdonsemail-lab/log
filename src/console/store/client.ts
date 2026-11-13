import { existsSync } from "node:fs";
import type { Database } from "bun:sqlite";
import { db } from "../../inbox/store/index.ts";
import { defaultDbPath } from "../../storage/schema/index.ts";

export function consoleDbPath(env: Record<string, string | undefined> = process.env): string {
  return defaultDbPath(env);
}

export function consoleDbFound(env: Record<string, string | undefined> = process.env): boolean {
  return existsSync(consoleDbPath(env));
}

export function consoleDb(): Database | null {
  return consoleDbFound() ? db() : null;
}

export function processAlive(pid: unknown): boolean {
  if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as { code?: string }).code === "EPERM";
  }
}
