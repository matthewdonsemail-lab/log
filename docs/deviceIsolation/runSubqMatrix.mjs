import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const leaksDir = join(here, "..", "identityLeaks");
const url = "https://api.subq.ai/v1/systemone";
const key = process.env.SUBQ_API_KEY;
if (!key) throw new Error("SUBQ_API_KEY is not set");

const options = JSON.parse(readFileSync(join(here, "options.json"), "utf8"));
const criteria = JSON.parse(readFileSync(join(here, "criteria.json"), "utf8"));

const evidence = [
  ["deviceIsolation/vendorFacts.md", readFileSync(join(here, "vendorFacts.md"), "utf8")],
  ["deviceIsolation/deepResearch.md", readFileSync(join(here, "deepResearch.md"), "utf8")],
  ...readdirSync(leaksDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => [`identityLeaks/${f}`, readFileSync(join(leaksDir, f), "utf8")]),
];

const situation = `SITUATION
A handful of Facebook Marketplace seller accounts, each a persona living in Ireland, Canada, the US or Australia.
The operator sits in Vietnam. Today every account runs on one Windows 11 PC (AMD Radeon 780M + RTX 4060 Laptop)
in Camoufox 0.5.8 (Firefox 156) driven by Playwright through log-cli, exiting through a 2Captcha residential proxy
in the account's town. log-cli already pins one device profile per account in Twenty, locks locale and timezone,
runs a launch self-check, and enforces local working hours. The open problem: the real GPU's rendered pixels
(WebGL readPixels, and since Firefox 156 also 2D canvas) are identical for every account on this PC, so the
accounts share one rendering signature and the spoofed GPU name does not match the pixels.
Judge each option on the evidence below. Treat vendor marketing as unproven unless independently tested.

OPTIONS
${options.map((o) => `- ${o.id}: ${o.name}. ${o.description}`).join("\n")}

CRITERIA
${criteria.map((c) => `- ${c.id}: ${c.question}`).join("\n")}

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
    throw new Error(`${response.status} ${body}`);
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
        instructions: `Rate option ${option.id} (${option.name}) on this criterion only. ${c.question}`,
        criteria: c.levels,
      },
    ]),
  );

const results = { stateChars: state.length, passA: [], passB: {}, inputTokens: 0 };

for (let i = 0; i < 3; i++) {
  const r = await decide(choiceQuestions);
  results.inputTokens += r.usage.input_tokens;
  results.passA.push(r.answers);
  console.log(`pass A ${i + 1}/3 done, ${r.usage.input_tokens} input tokens`);
}

for (const option of options) {
  results.passB[option.id] = [];
  for (let i = 0; i < 2; i++) {
    const r = await decide(scoreQuestions(option));
    results.inputTokens += r.usage.input_tokens;
    results.passB[option.id].push(r.answers);
    console.log(`pass B ${option.id} ${i + 1}/2 done`);
  }
}

writeFileSync(join(here, "subqResults.json"), JSON.stringify(results, null, 2));
console.log(`total input tokens: ${results.inputTokens}`);
