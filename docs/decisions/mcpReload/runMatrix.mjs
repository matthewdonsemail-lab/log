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

const read = (rel) => readFileSync(join(root, rel), "utf8");
const evidence = [
  ["docs/decisions/mcpReload/issue.md", read("docs/decisions/mcpReload/issue.md")],
  ["docs/decisions/mcpReload/research.md", read("docs/decisions/mcpReload/research.md")],
  ["reloaderoo README", read("docs/decisions/mcpReload/readme_reloaderoo.md")],
  ["mcpmon README", read("docs/decisions/mcpReload/readme_mcpmon.md")],
  ["mcp-reloader README", read("docs/decisions/mcpReload/readme_mcp-reloader.md")],
  ["bin/logMcp.ts", read("bin/logMcp.ts")],
  [".mcp.json", read(".mcp.json")],
  ["src/mcp/freshness/client.ts", read("src/mcp/freshness/client.ts")],
  ["src/mcp/jobs/client.ts", read("src/mcp/jobs/client.ts")],
];

const situation = `SITUATION
log is an MCP server (Bun, stdio) that Claude Code starts once per session from .mcp.json. When log's code changes, the running server keeps the old code until matt restarts Claude Code or T3, which costs him about 3 minutes, many times a day. He wants code changes to reach the next tool call without restarting the client. He runs Claude Code 2.1.305 on Windows inside T3 Code.
Judge only from the evidence below.

OPTIONS
${options.map((o) => `- ${o.id}: ${o.name}. ${o.description}`).join("\n")}

CRITERIA
${criteria.map((c) => `- ${c.id}: ${c.question}`).join("\n")}

CLAIMS
${claims.map((c) => `- ${c.id}: ${c.statement}`).join("\n")}

EVIDENCE`;

const state = [situation, ...evidence.map(([name, body]) => `\n===== FILE: ${name} =====\n${body}`)].join("\n");

async function decide(questions) {
  for (let attempt = 0; attempt < 4; attempt++) {
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
    throw new Error(`${response.status} ${body.slice(0, 300)}`);
  }
  throw new Error("SubQ kept failing after 4 attempts");
}

const choiceQuestions = Object.fromEntries(criteria.map((c) => [c.id, { type: "choice", instructions: `Which single option is best on this criterion? ${c.question}`, criteria: Object.fromEntries(options.map((o) => [o.id, o.name])) }]));
const overall = { overall: { type: "choice", instructions: "Taking every criterion together, which single option should log build or vendor?", criteria: Object.fromEntries(options.map((o) => [o.id, o.name])) } };
const scoreQuestions = (option) => Object.fromEntries(criteria.map((c) => [c.id, { type: "score", instructions: `Rate option ${option.id} (${option.name}) on this criterion only. ${c.question} Higher is better.`, criteria: c.levels }]));
const claimQuestions = Object.fromEntries(claims.map((c) => [c.id, { type: "noul", instructions: `Is this claim true on the evidence? ${c.statement}`, criteria: { true: "The evidence supports the claim", false: "The evidence contradicts the claim or does not contain it" } }]));

if (dryRun) {
  console.log(`state chars ${state.length}, ${Object.keys(choiceQuestions).length + 1} choice questions, ${options.length} score passes, ${claims.length} claims`);
  process.exit(0);
}

const results = { model: "subq-snap-preview", stateChars: state.length, choices: null, scores: {}, claims: null, inputTokens: 0 };
const answeredChoices = await decide({ ...choiceQuestions, ...overall });
results.choices = answeredChoices.answers;
results.inputTokens += answeredChoices.usage?.input_tokens ?? 0;
console.log("choices done");
for (const option of options) {
  const answered = await decide(scoreQuestions(option));
  results.scores[option.id] = answered.answers;
  results.inputTokens += answered.usage?.input_tokens ?? 0;
  console.log(`scores ${option.id} done`);
}
const answeredClaims = await decide(claimQuestions);
results.claims = answeredClaims.answers;
results.inputTokens += answeredClaims.usage?.input_tokens ?? 0;
writeFileSync(join(here, "subqResults.json"), JSON.stringify(results, null, 2));
console.log(`total input tokens ${results.inputTokens}`);
