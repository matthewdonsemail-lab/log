// Rule 58: no loose files. python/ and scripts/ hold domain folders only, as src/ holds {library}/{domain}/.
// Usage: bun scripts/checks/checkLayout.ts   (lefthook pre-commit and pre-push)
//
// Checked, over every tracked file and every new one git doesn't ignore:
//   python/<file>, scripts/<file>     refused: a file goes in its domain folder (python/browser/, scripts/checks/, ...)
//   python/<domain>/                  a Python domain is a package: it has its __init__.py
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
/** The folders whose files must sit in a domain folder, and what goes where, for the refusal. */
const DOMAIN_ROOTS: Record<string, string> = {
  python: "browser, human, session, login, device, errors, fixtures",
  scripts: "checks, commitLog, datasets, docs, hooks, twenty",
};

const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const files = [...new Set([...git("ls-files"), ...git("ls-files", "--others", "--exclude-standard")])].map((f) => f.replace(/\\/g, "/"));
// A file moved with git mv still lists its old path until staged: only what is on disk counts.
const onDisk = new Set(git("ls-files", "--deleted"));
const present = files.filter((f) => !onDisk.has(f));

const problems: string[] = [];
for (const [top, domains] of Object.entries(DOMAIN_ROOTS)) {
  for (const file of present.filter((f) => f.startsWith(`${top}/`))) {
    const parts = file.split("/");
    if (parts.length === 2) problems.push(`${file} is loose: put it in a domain folder of ${top}/ (${domains}), or a new one named for what it does`);
  }
}
const pyDomains = new Set(present.filter((f) => f.startsWith("python/") && f.split("/").length > 2 && f.endsWith(".py")).map((f) => f.split("/")[1]));
for (const domain of pyDomains) if (!present.includes(`python/${domain}/__init__.py`)) problems.push(`python/${domain}/ has no __init__.py: a Python domain is a package, so an installed package of the same name can't shadow it`);

if (problems.length) {
  console.error(`Loose files (rule 58):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`layout: python/ and scripts/ hold domain folders only (${pyDomains.size} Python packages).`);
