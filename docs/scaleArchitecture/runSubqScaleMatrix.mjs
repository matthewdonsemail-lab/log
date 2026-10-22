import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, "..");
const repos = join(here, "..", "..", "..");
const listaro = join(repos, "Listaro_backup");
const url = "https://api.subq.ai/v1/systemone";
const dryRun = process.argv.includes("--dry-run");
const key = process.env.SUBQ_API_KEY;
if (!key && !dryRun) throw new Error("SUBQ_API_KEY is not set");

const options = JSON.parse(readFileSync(join(here, "options.json"), "utf8"));
const criteria = JSON.parse(readFileSync(join(here, "criteria.json"), "utf8"));
const claims = JSON.parse(readFileSync(join(here, "claims.json"), "utf8"));

const read = (base, rel) => [rel, readFileSync(join(base, rel), "utf8")];
const dirMd = (base, rel) =>
  readdirSync(join(base, rel))
    .filter((f) => f.endsWith(".md") || f.endsWith(".jsonl"))
    .map((f) => read(base, `${rel}/${f}`));

const evidence = [
  ["brief.md", readFileSync(join(here, "brief.md"), "utf8")],
  read(docs, "deviceIsolation/README.md"),
  read(docs, "deviceIsolation/vendorFacts.md"),
  read(docs, "deviceIsolation/deepResearch.md"),
  ...dirMd(docs, "identityLeaks"),
  ...dirMd(docs, "vendors"),
  read(docs, "accountsAndListings.md"),
  read(docs, "proxies.md"),
  read(docs, "errorCatalog.md"),
  read(join(docs, ".."), "README.md"),
  ...[
    "CLAUDE.md",
    "STATUS-REPORT.md",
    "docs/ARCHITECTURE.md",
    "docs/LISTARO_OPERATIONS.md",
    "docs/plans/2026-03-09-fix-posting-engine.md",
    "docs/plans/2026-03-11-captcha-proof-onboarding.md",
    "docs/superpowers/specs/2026-03-17-desktop-agent-design.md",
    "docs/superpowers/specs/2026-03-18-account-validation-design.md",
    "docs/superpowers/specs/2026-03-25-cloud-posting-design.md",
    "docs/superpowers/specs/2026-04-09-listaro-v2-platform-overhaul.md",
    "docs/superpowers/plans/2026-04-08-adspower-server-architecture.md",
    "docs/superpowers/plans/2026-04-08-auto-login-system.md",
    "content/blog/how-to-post-without-getting-banned.md",
  ].map((rel) => [`Listaro_backup/${rel}`, readFileSync(join(listaro, rel), "utf8")]),
].map(([name, body]) => [name.startsWith("Listaro") || name === "brief.md" ? name : `log-cli/${name}`, body]);

const situation = `SITUATION
matt runs ListeningKit from Vietnam. The business (see Listaro_backup docs) is automated selling and lead generation
through Facebook Marketplace seller accounts, starting with a rubbish removal company advertising in 4 cities, and
growing to hundreds of thousands of accounts across many platforms beyond Facebook. Accounts are bought from vendors
(log-cli/vendors) and each is a persona in Ireland, Canada, the US or Australia.
log-cli works today on one Windows 11 PC: Camoufox driven by Playwright, one 2Captcha residential proxy per account
in its home city, a pinned device profile per account in Twenty, locale and timezone locked, a launch self-check, local
working hours. 22 identity leaks were found and fixed except shared GPU rendering.
Hard constraints from matt: no physical hardware (he is in Vietnam and cannot obtain or place devices). Cost and
reliability matter most, then scalability. Environments must be isolated and viewable, use 2Captcha residential
proxies instead of the host's datacenter IP, carry per-environment configuration, let providers be swapped, and be
testable against platform detection before going live. matt leans towards boat.dev because it is the cheapest.
Judge each option on the evidence below. Treat vendor marketing as unproven unless independently tested.

OPTIONS
${options.map((o) => `- ${o.id}: ${o.name}. ${o.description}`).join("\n")}

CRITERIA
${criteria.map((c) => `- ${c.id}: ${c.question}`).join("\n")}

EVIDENCE`;

const state = [situation, ...evidence.map(([name, body]) => `\n===== FILE: ${name} =====\n${body}`)].join("\n");

const secretPatterns = [/sk-[A-Za-z0-9]{20,}/, /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/, /nsec1[a-z0-9]{50,}/, /-----BEGIN [A-Z ]*PRIVATE KEY/];
for (const p of secretPatterns) if (p.test(state)) throw new Error(`state matches secret pattern ${p}; refusing to send`);

console.log(`files: ${evidence.length}, state chars: ${state.length}, est tokens: ${Math.round(state.length / 3.48)}`);
if (dryRun) {
  for (const [name, body] of evidence) console.log(`  ${body.length}\t${name}`);
  process.exit(0);
}

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

const claimQuestions = Object.fromEntries(
  claims.map((c) => [
    c.id,
    {
      type: "noul",
      instructions: `Based on the evidence, is this claim true? ${c.claim}`,
      criteria: { true: "The evidence supports the claim", false: "The evidence contradicts it or does not support it" },
    },
  ]),
);

if (process.argv.includes("--prior")) {
  const prior = JSON.parse(readFileSync(join(here, "priorClaims.json"), "utf8"));
  const questions = Object.fromEntries(
    prior.map((c) => [
      c.id,
      {
        type: "noul",
        instructions: `Based on the evidence and matt's constraints, is this claim true? ${c.claim}`,
        criteria: { true: "The evidence supports the claim", false: "The evidence contradicts it or does not support it" },
      },
    ]),
  );
  const out = { stateChars: state.length, runs: [], inputTokens: 0 };
  for (let i = 0; i < 2; i++) {
    const r = await decide(questions);
    out.inputTokens += r.usage?.input_tokens ?? 0;
    out.runs.push(r.answers);
    console.log(`prior check ${i + 1}/2 done`);
  }
  writeFileSync(join(here, "priorCheck.json"), JSON.stringify(out, null, 2));
  for (const c of prior) console.log(`${out.runs[0][c.id].noul.toFixed(2)}\t${out.runs[1][c.id].noul.toFixed(2)}\t${c.id}`);
  console.log(`total input tokens: ${out.inputTokens}`);
  process.exit(0);
}

const results = { stateChars: state.length, files: evidence.map(([n]) => n), passA: [], passB: {}, passC: [], inputTokens: 0 };
const track = (r) => (results.inputTokens += r.usage?.input_tokens ?? 0);

for (let i = 0; i < 2; i++) {
  const r = await decide(choiceQuestions);
  track(r);
  results.passA.push(r.answers);
  console.log(`pass A ${i + 1}/2 done, ${r.usage?.input_tokens} input tokens`);
}

for (let i = 0; i < 2; i++) {
  const r = await decide(claimQuestions);
  track(r);
  results.passC.push(r.answers);
  console.log(`pass C ${i + 1}/2 done`);
}

for (const option of options) {
  const r = await decide(scoreQuestions(option));
  track(r);
  results.passB[option.id] = [r.answers];
  console.log(`pass B ${option.id} done`);
}

writeFileSync(join(here, "subqResults.json"), JSON.stringify(results, null, 2));
console.log(`total input tokens: ${results.inputTokens}`);
