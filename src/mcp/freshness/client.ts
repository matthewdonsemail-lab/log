import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const WATCHED = ["src", "python", join("vendor", "fbk", "src")];
const CODE = /\.(ts|py)$/;

export function serverStampFile(): string {
  return process.env.LOG_MCP_STAMP_FILE || join(homedir(), ".logCli", "mcp", "server.json");
}

export function codeStamp(root: string): number {
  let newest = 0;
  const walk = (dir: string) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      if (name.name === "node_modules" || name.name === "__pycache__" || name.name.startsWith(".")) continue;
      const path = join(dir, name.name);
      if (name.isDirectory()) walk(path);
      else if (CODE.test(name.name) && !name.name.includes(".test.")) newest = Math.max(newest, statSync(path).mtimeMs);
    }
  };
  for (const sub of WATCHED) if (existsSync(join(root, sub))) walk(join(root, sub));
  return newest;
}

export function recordServerStart(root: string, file = serverStampFile()): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), stamp: codeStamp(root) }));
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function staleServerLine(root: string, file = serverStampFile()): string | null {
  if (!existsSync(file)) return null;
  let started: { pid: number; startedAt: string; stamp: number };
  try {
    started = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
  if (!alive(started.pid)) return null;
  const now = codeStamp(root);
  if (now <= started.stamp) return null;
  return `>>> The log MCP server (pid ${started.pid}, started ${started.startedAt.slice(0, 16)}Z) is running older code than the checkout: log-cli changed at ${new Date(now).toISOString().slice(0, 16)}Z. Its tools and their descriptions are stale until it restarts (reconnect the log server with /mcp, or restart Claude). The terminal CLI (bun bin/log.ts) runs the current code.`;
}
