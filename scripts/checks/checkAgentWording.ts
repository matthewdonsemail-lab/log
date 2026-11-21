import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

type Rule = { id: string; pattern: RegExp; instead: string; why: string };

const ROOT = join(import.meta.dir, "..", "..");
const BASELINE = join(import.meta.dir, "agentWordingBaseline.json");

export const RULES: Rule[] = [
  { id: "bypass", pattern: /\bbypass(es|ed|ing)?\b/gi, instead: "say what happens instead: \"skips the wait\", \"runs outside quiet hours\"", why: "risk words make agents refuse harmless tasks (AgentAbstain, OR-Bench)" },
  { id: "stealth", pattern: /\b(stealth|undetect(ed|able)|evad(e|es|ing)|evasion|anti-?detect)\w*\b/gi, instead: "\"works the way the platform's own app does\"", why: "reads as evading a platform's controls" },
  { id: "spoof", pattern: /\bspoof\w*\b/gi, instead: "\"the account's own browser identity\"", why: "reads as impersonation" },
  { id: "scrape", pattern: /\bscrap(e|es|ed|ing|er)\b/gi, instead: "\"reads the owner's own conversations\"", why: "reads as collecting other people's data" },
  { id: "captcha", pattern: /\bcaptchas?\b/gi, instead: "\"a check the platform shows\"; say the owner solves it", why: "next to automation it reads as defeating a human check" },
  { id: "fingerprint", pattern: /\bfingerprint\w*\b/gi, instead: "\"the account's own browser\"", why: "reads as disguising a client" },
  { id: "coldOutreach", pattern: /\b(cold|mass) (dm|dms|outreach|outbound)\b/gi, instead: "\"messaging people you met in <place>\"", why: "reads as spam; agents rate unsolicited messaging as harm" },
  { id: "astroturf", pattern: /\bastroturf\w*\b/gi, instead: "leave it out", why: "names deception directly" },
  { id: "burner", pattern: /\bburner\w*\b/gi, instead: "\"a second account the owner runs\"", why: "reads as ban evasion" },
];

const SURFACES = ["README.md", "AGENTS.md", "llms.txt", "docs/trust.md", "docs/accounts.md", "docs/guides", "docs/useCases", "hermesPlugin", ".claude/skills"];

export const SURFACE_FILE = /\.(md|txt|ya?ml)$/;

export function trackedSurfaceFiles(listed: string, surfaces: readonly string[] = SURFACES): string[] {
  const roots = surfaces.map((s) => s.replace(/\/$/, ""));
  return listed
    .split(/\r?\n/)
    .map((f) => f.trim().replaceAll("\\", "/"))
    .filter((f) => f && roots.some((r) => f === r || f.startsWith(`${r}/`)) && (roots.includes(f) || SURFACE_FILE.test(f)));
}

function filesOf(): string[] {
  const listed = spawnSync("git", ["ls-files", "--cached", "--", ...SURFACES], { cwd: ROOT, encoding: "utf8", windowsHide: true });
  if (listed.status !== 0) throw new Error(`agentWording: git ls-files failed: ${(listed.stderr ?? "").trim()}`);
  return trackedSurfaceFiles(listed.stdout).map((f) => join(ROOT, f)).filter((f) => existsSync(f));
}

export function prose(text: string): string {
  return text.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ").replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, " ");
}

export function countsOf(text: string): Record<string, number> {
  const body = prose(text);
  return Object.fromEntries(RULES.map((r) => [r.id, (body.match(r.pattern) ?? []).length]));
}

function measure(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const file of [...new Set(filesOf())].sort()) {
    const counts = Object.fromEntries(Object.entries(countsOf(readFileSync(file, "utf8"))).filter(([, n]) => n > 0));
    if (Object.keys(counts).length) out[relative(ROOT, file).replaceAll("\\", "/")] = counts;
  }
  return out;
}

if (import.meta.main) {
  const now = measure();
  const total = (m: Record<string, Record<string, number>>) => Object.values(m).reduce((s, c) => s + Object.values(c).reduce((a, b) => a + b, 0), 0);
  if (process.argv.includes("--write")) {
    writeFileSync(BASELINE, JSON.stringify(now, null, 2) + "\n");
    console.log(`agentWording: wrote ${relative(ROOT, BASELINE)} (${total(now)} risk words on agent-facing pages)`);
    process.exit(0);
  }
  const base: Record<string, Record<string, number>> = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
  const worse: string[] = [];
  for (const [file, counts] of Object.entries(now)) {
    for (const [id, n] of Object.entries(counts)) {
      const was = base[file]?.[id] ?? 0;
      if (n > was) {
        const rule = RULES.find((r) => r.id === id)!;
        worse.push(`  - ${file}: "${id}" ${was} -> ${n}. Instead: ${rule.instead} (${rule.why})`);
      }
    }
  }
  if (worse.length) {
    console.error(`Agent-facing pages gained wording that makes agents distrust log (#255):\n${worse.join("\n")}\nReword it; code in backticks is not counted.`);
    process.exit(1);
  }
  const fewer = total(base) - total(now);
  console.log(`agentWording: ${total(now)} risk words on agent-facing pages${fewer > 0 ? `, ${fewer} fewer than the baseline: run with --write to lock it in` : ""}`);
}
