// Ranks ways to point REA at the Camoufox session.
// Usage: SUBQ_API_KEY=... node docs/rea/matrix/runMatrix.mjs [--dry-run]
// State: docs/rea/spec.md, the three Parallel reports, visibleBrowser.py,
// and the identity-leak status table. Decisions API as documented at
// https://docs.subq.ai/markdown/endpoints/decisions-api.md
// (1-16 questions, model subq-snap-preview, 384K-token state).
//   pass A: one choice question per criterion, 2 repeats
//   pass B: one score pass per option, 1 run
//   pass C: the true/false claims, 2 repeats
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const url = "https://api.subq.ai/v1/systemone";
const dryRun = process.argv.includes("--dry-run");
const key = process.env.SUBQ_API_KEY;
if (!key && !dryRun) throw new Error("SUBQ_API_KEY is not set");

const options = JSON.parse(readFileSync(join(here, "options.json"), "utf8"));
const criteria = JSON.parse(readFileSync(join(here, "criteria.json"), "utf8"));
const claims = JSON.parse(readFileSync(join(here, "claims.json"), "utf8"));
if (criteria.length > 16) throw new Error(`criteria: ${criteria.length}, Decisions API allows 16`);
if (claims.length > 16) throw new Error(`claims: ${claims.length}, Decisions API allows 16`);

const read = (rel) => readFileSync(join(root, rel), "utf8");
const evidence = [
  ["docs/rea/spec.md", read("docs/rea/spec.md")],
  ["docs/rea/parallel/meta.md", read("docs/rea/parallel/meta.md")],
  ["docs/rea/parallel/playwright.md", read("docs/rea/parallel/playwright.md")],
  ["docs/rea/parallel/humanize.md", read("docs/rea/parallel/humanize.md")],
  ["docs/rea/facebookClient.md", read("docs/rea/facebookClient.md")],
  ["docs/rea/comparison.md", read("docs/rea/comparison.md")],
  ["docs/identityLeaks/README.md", read("docs/identityLeaks/README.md")],
  ["python/browser/visibleBrowser.py", read("python/browser/visibleBrowser.py")],
];

const situation = `SITUATION
log-cli publishes Facebook Marketplace listings through Playwright driving Camoufox.
python/browser/visibleBrowser.py is the only launch: headed, humanize 1.5 (a float; a boolean hangs mouse.move), cursor shown.
The proxy gate, one device per account, pinned locale, launch self-check and local hours run before Facebook loads.
REA (morluto/rea, rea-agents 6.7.0) is installed globally. Its page tools speak Chrome CDP. Camoufox is Firefox.
The goal is to observe the create page's scripts and the requests the page itself makes, then check that evidence
against the humanize launch and the 22 identity-leak vectors. REA must not post, must not attach a second debugger
to the live window, and must not replace Camoufox.
Judge only from the evidence below. If a Parallel report found no public REA-on-Meta implementation, do not invent one.
Vendor and blog claims that did not run REA are weaker than REA's own docs.

OPTIONS
${options.map((o) => `- ${o.id}: ${o.name}. ${o.description}`).join("\n")}

CRITERIA
${criteria.map((c) => `- ${c.id}: ${c.question}`).join("\n")}

CLAIMS
${claims.map((c) => `- ${c.id}: ${c.statement}`).join("\n")}

EVIDENCE`;

const state = [situation, ...evidence.map(([name, body]) => `\n===== FILE: ${name} =====\n${body}`)].join("\n");

async function decide(questions) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "subq-snap-preview", state, questions }),
    });
    if (response.ok) return response.json();
    const body = await response.text();
    if (response.status === 429 || response.status >= 500) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    throw new Error(`${response.status} ${body.slice(0, 500)}`);
  }
  throw new Error("SubQ kept failing after 5 attempts");
}

const choiceQuestions = Object.fromEntries(
  criteria.map((c) => [
    c.id,
    {
      type: "choice",
      instructions: `Which single option is best on this criterion? ${c.question}`,
      criteria: Object.fromEntries(options.map((o) => [o.id, o.name])),
    },
  ]),
);

const scoreQuestions = (option) =>
  Object.fromEntries(
    criteria.map((c) => [
      c.id,
      {
        type: "score",
        instructions: `Rate option ${option.id} (${option.name}) on this criterion only. ${c.question} Higher is better.`,
        criteria: c.levels,
      },
    ]),
  );

const claimQuestions = Object.fromEntries(
  claims.map((c) => [
    c.id,
    {
      type: "noul",
      instructions: `Is this claim true on the evidence? ${c.statement}`,
      criteria: { true: "The evidence supports the claim", false: "The evidence contradicts the claim or does not contain it" },
    },
  ]),
);

if (dryRun) {
  console.log(`state chars ${state.length}`);
  console.log(`choice questions ${Object.keys(choiceQuestions).length}`);
  console.log(`score passes ${options.length}`);
  console.log(`claims ${Object.keys(claimQuestions).length}`);
  process.exit(0);
}

const results = {
  model: "subq-snap-preview",
  endpoint: url,
  stateChars: state.length,
  passA: [],
  passB: {},
  passC: [],
  inputTokens: 0,
};

for (let i = 0; i < 2; i++) {
  const answered = await decide(choiceQuestions);
  results.inputTokens += answered.usage.input_tokens;
  results.passA.push(answered.answers);
  console.log(`pass A ${i + 1}/2, ${answered.usage.input_tokens} input tokens`);
}

for (const option of options) {
  const answered = await decide(scoreQuestions(option));
  results.inputTokens += answered.usage.input_tokens;
  results.passB[option.id] = answered.answers;
  console.log(`pass B ${option.id}, ${answered.usage.input_tokens} input tokens`);
}

for (let i = 0; i < 2; i++) {
  const answered = await decide(claimQuestions);
  results.inputTokens += answered.usage.input_tokens;
  results.passC.push(answered.answers);
  console.log(`pass C ${i + 1}/2, ${answered.usage.input_tokens} input tokens`);
}

writeFileSync(join(here, "subqResults.json"), JSON.stringify(results, null, 2));
console.log(`total input tokens: ${results.inputTokens}`);
