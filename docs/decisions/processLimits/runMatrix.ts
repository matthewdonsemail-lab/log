import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { subqKey } from "../../../src/subq/decisions/index.ts";

const here = import.meta.dir;
const root = join(here, "..", "..", "..");
const url = "https://api.subq.ai/v1/systemone";
const model = "subq-snap-preview";
const dryRun = process.argv.includes("--dry-run");
const key = subqKey();
if (!key && !dryRun) throw new Error("no SubQ key found");

type Option = { id: string; name: string; description: string };
type Criterion = { id: string; question: string; levels: string[] };
type Decision = { id: string; question: string; options: Option[]; criteria: Criterion[] };

const decisions = JSON.parse(readFileSync(join(here, "decisions.json"), "utf8")) as Decision[];
const claims = JSON.parse(readFileSync(join(here, "claims.json"), "utf8")) as { id: string; statement: string }[];
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const evidence: [string, string][] = [
  ["docs/decisions/processLimits/issue.md", read("docs/decisions/processLimits/issue.md")],
  ["docs/decisions/processLimits/research.md", read("docs/decisions/processLimits/research.md")],
  ["docs/hookStartup.md", read("docs/hookStartup.md")],
  [".claude/settings.json", read(".claude/settings.json")],
  ["python/twitterApi/host.py", read("python/twitterApi/host.py")],
  ["src/mcp/reload/client.ts", read("src/mcp/reload/client.ts")],
  ["src/mcp/freshness/client.ts", read("src/mcp/freshness/client.ts")],
  ["docs/decisions/processLimits/tools.md", read("docs/decisions/processLimits/tools.md")],
  ["docs/decisions/processLimits/transcripts.md", existsSync(join(root, "docs/decisions/processLimits/transcripts.md")) ? read("docs/decisions/processLimits/transcripts.md") : "(not yet written)"],
  ["docs/storageAgainstTheBook.md", read("docs/storageAgainstTheBook.md")],
  ["docs/storageReadPath.md", read("docs/storageReadPath.md")],
  ["docs/toolCallSpeed.md", read("docs/toolCallSpeed.md")],
  ["docs/decisions/processLimits/results.md (the first run)", read("docs/decisions/processLimits/results.md")],
];

function stateFor(decision: Decision): string {
  const situation = `SITUATION
log is a Bun/TypeScript CLI and MCP server used by Claude Code 2.1.305 on Windows 11, with Python engine processes for each platform. Tool calls are slow because of processes, not data. Decide: ${decision.question}
Judge only from the evidence below: the classic sources' findings, the measurements on this machine, the tests on Claude Code 2.1.305, and log's code.

OPTIONS
${decision.options.map((o) => `- ${o.id}: ${o.name}. ${o.description}`).join("\n")}

CRITERIA
${decision.criteria.map((c) => `- ${c.id}: ${c.question}`).join("\n")}

CLAIMS
${claims.map((c) => `- ${c.id}: ${c.statement}`).join("\n")}

EVIDENCE`;
  return [situation, ...evidence.map(([name, body]) => `\n===== FILE: ${name} =====\n${body}`)].join("\n");
}

async function decide(state: string, questions: Record<string, unknown>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, state, questions }) });
    if (response.ok) return (await response.json()) as { answers: Record<string, unknown>; usage?: { input_tokens?: number } };
    const body = await response.text();
    if (response.status === 429 || response.status >= 500) {
      await Bun.sleep(2000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${response.status} ${body.slice(0, 300)}`);
  }
  throw new Error("SubQ kept failing after 4 attempts");
}

const results: Record<string, unknown> = { model, decisions: {}, claims: null, inputTokens: 0 };
let tokens = 0;
for (const decision of decisions) {
  const state = stateFor(decision);
  const optionsMap = Object.fromEntries(decision.options.map((o) => [o.id, o.name]));
  const choices = Object.fromEntries(decision.criteria.map((c) => [c.id, { type: "choice", instructions: `Which single option is best on this criterion? ${c.question}`, criteria: optionsMap }]));
  const overall = { overall: { type: "choice", instructions: `Taking every criterion together, which single option should log build? ${decision.question}`, criteria: optionsMap } };
  if (dryRun) {
    console.log(`${decision.id}: state chars ${state.length}, ${decision.criteria.length + 1} choice questions, ${decision.options.length} score passes`);
    continue;
  }
  const out: Record<string, unknown> = { stateChars: state.length, choices: null, scores: {} };
  const answered = await decide(state, { ...choices, ...overall });
  out.choices = answered.answers;
  tokens += answered.usage?.input_tokens ?? 0;
  console.log(`${decision.id} choices done`);
  for (const option of decision.options) {
    const scoreQuestions = Object.fromEntries(decision.criteria.map((c) => [c.id, { type: "score", instructions: `Rate option ${option.id} (${option.name}) on this criterion only. ${c.question} Higher is better.`, criteria: c.levels }]));
    const scored = await decide(state, scoreQuestions);
    (out.scores as Record<string, unknown>)[option.id] = scored.answers;
    tokens += scored.usage?.input_tokens ?? 0;
    console.log(`${decision.id} scores ${option.id} done`);
  }
  (results.decisions as Record<string, unknown>)[decision.id] = out;
}
if (dryRun) process.exit(0);
const claimQuestions = Object.fromEntries(claims.map((c) => [c.id, { type: "noul", instructions: `Is this claim true on the evidence? ${c.statement}`, criteria: { true: "The evidence supports the claim", false: "The evidence contradicts the claim or does not contain it" } }]));
const answeredClaims = await decide(stateFor(decisions[0]), claimQuestions);
results.claims = answeredClaims.answers;
tokens += answeredClaims.usage?.input_tokens ?? 0;
results.inputTokens = tokens;
writeFileSync(join(here, process.argv.includes("--second") ? "subqResults2.json" : "subqResults.json"), JSON.stringify(results, null, 2));
console.log(`total input tokens ${tokens}`);
