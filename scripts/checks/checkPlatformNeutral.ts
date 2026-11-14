import { measureRepo, platformNeutralProblems, PLATFORM_NEUTRAL_ZERO } from "../../src/surface/scorecard/index.ts";

const problems = platformNeutralProblems(measureRepo());

if (problems.length) {
  console.error(`platformNeutral: ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`platformNeutral: ${Object.keys(PLATFORM_NEUTRAL_ZERO).length} numbers at zero (shared guides and notes, flow platforms, guide sizes, rule citations, the owner's name).`);
