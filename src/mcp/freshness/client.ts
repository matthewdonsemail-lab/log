import { execFileSync } from "node:child_process";
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
  return `>>> The log MCP server (pid ${started.pid}, started ${started.startedAt.slice(0, 16)}Z) is running older code than the checkout: log-cli changed at ${new Date(now).toISOString().slice(0, 16)}Z. Its tool descriptions and rules are stale until it restarts: tell matt to restart the Claude app or start a new chat (in a terminal claude, reconnect the log server with /mcp). Its calls still run the checkout's engine. Never work around it with a hand-run \`log …\` command (rule 106).`;
}

const LOCAL_PATHS = ["src", "python", "vendor", "bin", "scripts", "package.json"];

export function uncommittedFiles(root: string, run: (args: string[]) => string = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })): string[] {
  try {
    return run(["status", "--porcelain", "--", ...LOCAL_PATHS]).split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function localChangesLine(root: string, files: string[] = uncommittedFiles(root)): string | null {
  if (files.length === 0) return null;
  const shown = files.slice(0, 12).join(", ") + (files.length > 12 ? ` and ${files.length - 12} more` : "");
  return `>>> UNCOMMITTED LOCAL CHANGES in log-cli's code (${files.length}): ${shown}. They aren't committed, may be someone else's work in progress, and the running engine and MCP already run them. Before changing code, read what each one changed (git diff); never overwrite, revert, stage, publish or ship them as your own without matt (rule 106).`;
}
