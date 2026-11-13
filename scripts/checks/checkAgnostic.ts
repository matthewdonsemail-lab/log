import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BASELINE_PATH, compareScorecard, MACHINE_RULE, measureRepo, readBaseline, renderScorecard, REPO_ROOT, writeBaseline } from "../../src/surface/scorecard/index.ts";

const args = new Set(process.argv.slice(2));
const metrics = measureRepo();
const baseline = readBaseline();
const comparison = compareScorecard(metrics, baseline);

if (args.has("--write")) {
  const written = writeBaseline(metrics, baseline, args.has("--allowWorse"));
  if (!written.ok) {
    console.error(`agnostic: refused to raise the baseline without --allowWorse:\n${written.refused.map((r) => `  - ${r.key}: ${r.baseline} -> ${r.value}`).join("\n")}`);
    process.exit(1);
  }
  writeFileSync(join(REPO_ROOT, BASELINE_PATH), `${JSON.stringify({ metrics: written.metrics }, null, 2)}\n`);
  console.log(`agnostic: wrote ${BASELINE_PATH} (${Object.keys(written.metrics).length} numbers${written.raised.length ? `, raised with --allowWorse: ${written.raised.map((r) => r.key).join(", ")}` : ""}).`);
  process.exit(0);
}

if (args.has("--json")) console.log(JSON.stringify({ ok: comparison.ok, machineRule: MACHINE_RULE, rows: comparison.rows }, null, 2));
else console.log(renderScorecard(comparison, MACHINE_RULE));

if (!comparison.ok) {
  console.error(`agnostic: ${comparison.worse.length} number(s) worse than ${BASELINE_PATH}${comparison.missing.length ? `, ${comparison.missing.length} not in it` : ""}: ${[...comparison.worse, ...comparison.missing].map((r) => r.key).join(", ")}`);
  process.exit(1);
}
