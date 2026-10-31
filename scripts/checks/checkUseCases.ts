import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listUseCases } from "../../src/mcp/server/helpers/guides.ts";
import { createDecisionsClient } from "../../src/subq/decisions/index.ts";
import { latestSession, projectSessionsDir, readReview, REVIEW_MODEL, reviewLines, reviewQuestions, sessionDigest } from "../../src/useCases/review/index.ts";
import type { DecisionAnswer } from "../../src/subq/decisions/index.ts";

const root = join(import.meta.dir, "..", "..");
const say = (line: string) => console.log(`useCases: ${line}`);
const git = (args: string) => execSync(`git ${args}`, { cwd: root }).toString().split(/\r?\n/).filter(Boolean);

const session = process.env.LOG_SESSION_FILE || latestSession(projectSessionsDir(root));
if (!session || !existsSync(session)) {
  say("no Claude Code session for this repo, nothing to compare the use cases with");
  process.exit(0);
}
const digest = sessionDigest(readFileSync(session, "utf8").split("\n"));
if (!digest.asks.length) {
  say("the session has no asks from the owner yet, nothing to compare");
  process.exit(0);
}
const useCases = listUseCases();
const ids = useCases.map((u) => u.id);
const staged = new Set(git("diff --cached --name-only"));
const added = git("diff --cached --name-only --diff-filter=A");
const newPageStaged = added.some((f) => /^docs\/useCases\/\w+\/\w+\.md$/.test(f) && !f.endsWith("README.md"));
const key = createHash("sha256").update(JSON.stringify([digest.asks, useCases.map((u) => [u.id, u.text]), [...staged].filter((f) => f.startsWith("docs/useCases/")).sort()])).digest("hex");
const cachePath = join(root, ".git", "useCaseReview.json");
let answers: Record<string, DecisionAnswer> | null = null;
try {
  const cached = JSON.parse(readFileSync(cachePath, "utf8")) as { key: string; answers: Record<string, DecisionAnswer> };
  if (cached.key === key) answers = cached.answers;
} catch {}
if (answers) say(`the session and the pages haven't changed since the last review, reusing SubQ's answers`);
else {
  say(`asking SubQ: ${ids.length} use case pages against this session (${digest.asks.length} asks from the owner, ${digest.work.length} tool calls)`);
  try {
    const response = await createDecisionsClient()({ model: REVIEW_MODEL, state: { session: digest.text, useCases: Object.fromEntries(useCases.map((u) => [u.id, u.text])) }, questions: reviewQuestions(ids) });
    answers = response.answers;
    writeFileSync(cachePath, JSON.stringify({ key, answers, at: new Date().toISOString() }));
  } catch (error) {
    say(`SubQ didn't answer (${(error as Error).message.slice(0, 160)}): the use cases weren't checked against this session`);
    process.exit(0);
  }
}
const review = readReview(ids, answers, staged, undefined, newPageStaged);
for (const line of reviewLines(review)) console.log(line);
if (!review.blocked) {
  say("every use case page still fits what this session did");
  process.exit(0);
}
for (const page of review.pages.filter((p) => p.blocks)) say(`docs/useCases/${page.id}.md ${page.verdict === "move" ? "belongs somewhere else, or split or merged with another page" : "is stale for what this session did"}: ${page.verdict === "move" ? "move it" : "update it with what changed (steps, tools, order, rules, lessons)"}, stage it, and commit again`);
if (review.uncoveredBlocks) say("the owner asked for repeatable work in this session that no page covers: write it as a page of its own, docs/useCases/<platform>/<page>.md, its steps tool by tool, stage it, and commit again");
process.exit(1);
