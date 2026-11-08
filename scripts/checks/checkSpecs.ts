import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { anchorLines, checkAnchors, specAnchors, unpairedSpecs } from "../../src/specs/index.ts";
import { subqKey } from "../../src/subq/decisions/index.ts";

const root = join(import.meta.dir, "..", "..");
const say = (line: string) => console.log(`specs: ${line}`);
const heal = process.argv.includes("--heal");
const askSubq = process.argv.includes("--subq");
const args = process.argv.slice(2).filter((a) => a !== "--heal" && a !== "--subq");

const unpaired = unpairedSpecs(root);
if (unpaired.length) {
  for (const line of unpaired) say(line);
  process.exit(1);
}

let anchorProblems = 0;
for (const [domain, anchors] of Object.entries(await specAnchors(root))) {
  const report = checkAnchors(root, domain, anchors, heal);
  for (const line of anchorLines(report)) say(line);
  anchorProblems += report.findings.length;
  say(`${domain}: ${report.checked} anchors proved by the syntax tree, ${report.findings.length} broken${report.healed.length ? `, ${report.healed.length} healed` : ""}`);
}
if (anchorProblems) {
  say(`${anchorProblems} anchor(s) broken: the code no longer has what its rule names, so SubQ isn't asked until they're fixed`);
  process.exit(1);
}

const live = askSubq && Boolean(subqKey());
if (!askSubq) say("anchors proved; SubQ isn't asked in commits, pushes or CI (rule 170): run `bun run check:specs --subq` to ask it");
else if (!live) say("--subq asked for SubQ, but there is no SUBQ_API_KEY on this machine, so only the wiring is checked (a dry run)");
const run = spawnSync(process.execPath, ["node_modules/jev-spec/bin/jev-spec.js", "check", "-c", "jevSpec.config.ts", ...args, ...(live ? [] : ["--dry-run"])], { windowsHide: true, cwd: root, stdio: "inherit" });
process.exit(run.status ?? 2);
