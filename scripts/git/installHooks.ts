import { spawnSync } from "node:child_process";

const git = (...args: string[]) => spawnSync("git", args, { windowsHide: true, encoding: "utf8" });

if (git("rev-parse", "--git-dir").status !== 0) process.exit(0);
git("config", "--unset", "core.hooksPath");
const installed = spawnSync("lefthook", ["install"], { windowsHide: true, stdio: "inherit", shell: process.platform === "win32" });
if (installed.status !== 0) {
  process.stderr.write("installHooks: lefthook install failed, so this checkout's git hooks aren't running. Run `bunx lefthook install` and fix what it says.\n");
  process.exit(installed.status ?? 1);
}
