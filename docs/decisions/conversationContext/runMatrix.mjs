import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const url = "https://api.subq.ai/v1/systemone";
const model = "subq-snap-1.1";
const dryRun = process.argv.includes("--dry-run");
const key = process.env.SUBQ_API_KEY;
if (!key && !dryRun) throw new Error("SUBQ_API_KEY is not set");

const options = JSON.parse(readFileSync(join(here, "options.json"), "utf8"));
const criteria = JSON.parse(readFileSync(join(here, "criteria.json"), "utf8"));
const claims = JSON.parse(readFileSync(join(here, "claims.json"), "utf8"));

const read = (rel) => readFileSync(join(root, rel), "utf8");
const evidence = [
  "docs/decisions/conversationContext/issue.md",
  "docs/decisions/conversationContext/research.md",
  "docs/specs/voiceGate.md",
  "src/twitter/copy/voice/client.ts",
  "src/twitter/copy/voice/types.ts",
  "src/cli/twitter/helpers/voice.ts",
  "src/inbox/context/client.ts",
  "docs/useCases/inbox/scopeAJob.md",
].map((path) => [path, read(path)]);

const situation = `SITUATION
An agent drafts every message matt's accounts send on X, Discord, Slack and Instagram, and a voice gate (one SubQ call plus checks in code) decides whether the draft reads like matt and answers the conversation. matt says the context a draft and the gate start from is a pile from all over (his X writing guide, his replies in other conversations, the whole chat), built again at send time on every attempt, so drafts come out as walls of text or forms of questions, score low on the gate, and take seconds per attempt. He wants each message indexed in the background as it lands, and a send to read a short picture of that conversation only. Background work should run only when needed. Choose how the system should keep and hand over a conversation's context.
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
      body: JSON.stringify({ model, state, questions }),
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

const optionCriteria = Object.fromEntries(options.map((o) => [o.id, o.name]));
const choiceQuestions = Object.fromEntries(criteria.map((c) => [c.id, { type: "choice", instructions: `Which single option is best on this criterion? ${c.question}`, criteria: optionCriteria }]));
const overall = { overall: { type: "choice", instructions: "Taking every criterion together, which single option should be built?", criteria: optionCriteria } };
const scoreQuestions = (option) => Object.fromEntries(criteria.map((c) => [c.id, { type: "score", instructions: `Rate option ${option.id} (${option.name}) on this criterion only. ${c.question} Higher is better.`, criteria: c.levels }]));
const claimQuestions = Object.fromEntries(claims.map((c) => [c.id, { type: "noul", instructions: `Is this claim true on the evidence? ${c.statement}`, criteria: { true: "The evidence supports the claim", false: "The evidence contradicts the claim or does not contain it" } }]));

if (dryRun) {
  console.log(`state chars ${state.length}, ${criteria.length + 1} choice questions, ${options.length} score passes, ${claims.length} claims`);
  process.exit(0);
}

const results = { model, stateChars: state.length, choices: null, scores: {}, claims: null, inputTokens: 0 };
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
