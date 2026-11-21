import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");

export const CACHE_OFF = "LOG_CHECK_CACHE";
export const CACHE_REFS = "refs/logCheckCache";
export const LOCAL_INPUTS = [".env.local"];

export interface Inputs {
  index: string;
  worktree: string[];
}

function git(args: string[], input?: string): string {
  const run = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 256 * 1024 * 1024, input });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(run.stderr ?? "").trim().slice(0, 300)}`);
  return run.stdout;
}

const lines = (text: string): string[] => text.split(/\r?\n/).filter(Boolean);

export function readInputs(): Inputs {
  const index = git(["ls-files", "--stage"]);
  const worktree = [...new Set([...lines(git(["ls-files", "--modified"])), ...lines(git(["ls-files", "--others", "--exclude-standard"])), ...LOCAL_INPUTS])].sort();
  return { index, worktree };
}

export function cacheKey(command: readonly string[], inputs: Inputs, read: (path: string) => Buffer | null, runtime: string = Bun.version): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ command, runtime }));
  hash.update(inputs.index);
  for (const path of inputs.worktree) {
    const body = read(path);
    hash.update(`\n${path}\n`);
    hash.update(body === null ? "<gone>" : createHash("sha256").update(body).digest("hex"));
  }
  return hash.digest("hex");
}

function readFile(path: string): Buffer | null {
  const full = join(root, path);
  try {
    return existsSync(full) ? readFileSync(full) : null;
  } catch {
    return null;
  }
}

export function cacheRef(command: readonly string[]): string {
  return `${CACHE_REFS}/${createHash("sha256").update(command.join("\u0000")).digest("hex").slice(0, 16)}`;
}

function remembered(ref: string): { key?: string; passedAt?: string } {
  const run = spawnSync("git", ["cat-file", "blob", ref], { cwd: root, encoding: "utf8", windowsHide: true });
  try {
    return run.status === 0 ? JSON.parse(run.stdout) : {};
  } catch {
    return {};
  }
}

function remember(ref: string, record: object): void {
  const blob = git(["hash-object", "-w", "--stdin"], `${JSON.stringify(record)}\n`).trim();
  git(["update-ref", ref, blob]);
}

export function main(argv: string[] = process.argv.slice(2), env: Record<string, string | undefined> = process.env): number {
  const [script, ...args] = argv;
  if (!script) {
    console.error("usage: bun scripts/checks/cachedCheck.ts <package script> [args]: runs `bun run <script>` unless it already passed on exactly these files");
    return 2;
  }
  const command = ["bun", "run", script, ...args];
  const off = env[CACHE_OFF] === "off";
  const ref = off ? null : cacheRef(command);
  const key = off ? null : cacheKey(command, readInputs(), readFile);
  const last = ref ? remembered(ref) : {};
  if (key && last.key === key) {
    console.log(`${script}: passed at ${last.passedAt} on exactly these files (cache ${key.slice(0, 12)}), so it isn't run again. ${CACHE_OFF}=off runs it anyway.`);
    return 0;
  }
  const run = spawnSync(command[0], command.slice(1), { cwd: root, stdio: "inherit", windowsHide: true });
  const status = run.status ?? 1;
  if (status === 0 && ref && key) remember(ref, { key, passedAt: new Date().toISOString(), command });
  return status;
}

if (import.meta.main) process.exit(main());
