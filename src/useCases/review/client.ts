import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { DecisionAnswer, DecisionQuestion } from "../../subq/decisions/index.ts";
import { DIGEST_MAX_CHARS, PAGE_CRITERIA, REVIEW_BLOCK_AT } from "./types.ts";
import type { PageReview, PageVerdict, SessionDigest, UseCaseReview } from "./types.ts";

export function projectSessionsDir(repoRoot: string, home = homedir()): string {
  return join(home, ".claude", "projects", repoRoot.replace(/[:\\/.]/g, "-"));
}

export function latestSession(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => join(dir, f));
  return files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0] ?? null;
}

const plain = (text: string): string => text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").replace(/\s+/g, " ").trim();

const isOwnerText = (text: string): boolean => Boolean(text) && !text.startsWith("<") && !text.startsWith("[Request interrupted") && !text.startsWith("Tool loaded");

const short = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

function toolLine(name: string, input: Record<string, unknown>): string {
  if (name === "Bash" || name === "PowerShell" || name === "Monitor") {
    const command = String(input.command ?? "");
    const log = /bin\/log\.ts ([^|;&>]+)/.exec(command)?.[1];
    return log ? `log ${short(log.trim(), 160)}` : `${name}: ${short(plain(String(input.description ?? command)), 140)}`;
  }
  if (name.startsWith("mcp__")) return `${name.replace(/^mcp__/, "")} ${short(JSON.stringify(input), 200)}`;
  if (name === "Edit" || name === "Write" || name === "Read") return `${name} ${String(input.file_path ?? "").replace(/^.*[\\/](REPOS|\.buzz)[\\/]/, "")}`;
  return name;
}

export function sessionDigest(lines: readonly string[], max = DIGEST_MAX_CHARS): SessionDigest {
  const asks: string[] = [];
  const work: string[] = [];
  const timeline: string[] = [];
  for (const line of lines) {
    let entry: { type?: string; operation?: string; content?: unknown; message?: { role?: string; content?: unknown } };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type === "queue-operation" && entry.operation === "enqueue" && typeof entry.content === "string") {
      const text = plain(entry.content);
      if (isOwnerText(text)) {
        asks.push(text);
        timeline.push(`OWNER (mid-turn): ${short(text, 1500)}`);
      }
      continue;
    }
    const content = entry.message?.content;
    if (entry.type === "user") {
      const texts = typeof content === "string" ? [content] : Array.isArray(content) ? content.filter((c) => c?.type === "text").map((c) => String(c.text ?? "")) : [];
      for (const raw of texts) {
        const text = plain(raw);
        if (!isOwnerText(text)) continue;
        asks.push(text);
        timeline.push(`OWNER: ${short(text, 1500)}`);
      }
    } else if (entry.type === "assistant" && Array.isArray(content)) {
      for (const item of content) {
        if (item?.type === "tool_use") {
          const step = toolLine(String(item.name ?? ""), (item.input ?? {}) as Record<string, unknown>);
          work.push(step);
          timeline.push(`  did: ${step}`);
        } else if (item?.type === "text" && String(item.text ?? "").trim()) {
          timeline.push(`  said: ${short(plain(String(item.text)), 400)}`);
        }
      }
    }
  }
  let text = timeline.join("\n");
  if (text.length > max) text = `…(earlier part of the session cut)\n${text.slice(text.length - max)}`;
  return { asks, work, text };
}

export function reviewQuestions(ids: readonly string[]): Record<string, DecisionQuestion> {
  const questions: Record<string, DecisionQuestion> = {};
  ids.forEach((id, i) => {
    questions[`page${i}`] = {
      type: "choice",
      instructions: `Use case page "${id}" is state.useCases["${id}"]: a workflow the owner asks for, step by step, each step naming its tool. Compare it with state.session (the owner's asks, OWNER lines, and what the agent did, the "did" lines). Is the page still the right way to do that work?`,
      criteria: { ...PAGE_CRITERIA },
    };
  });
  questions.uncovered = {
    type: "noul",
    instructions: "In state.session, did the owner ask for work they will want done again (a workflow, not a one-off fix to the code) that no page in state.useCases describes?",
    criteria: { true: "Yes: repeatable work for the owner that no use case page covers", false: "No: every repeatable piece of work in the session is on a page, or the session was only code work" },
  };
  return questions;
}

export function readReview(ids: readonly string[], answers: Record<string, DecisionAnswer>, staged: ReadonlySet<string>, blockAt = REVIEW_BLOCK_AT, newPageStaged = false): UseCaseReview {
  const pages: PageReview[] = ids.map((id, i) => {
    const answer = answers[`page${i}`];
    const verdict = (answer?.type === "choice" ? answer.choice : "current") as PageVerdict;
    const confidence = answer?.type === "choice" ? (answer.probabilities?.[verdict] ?? answer.confidence ?? 0) : 0;
    const isStaged = staged.has(`docs/useCases/${id}.md`);
    return { id, verdict, confidence, staged: isStaged, blocks: verdict !== "current" && confidence >= blockAt && !isStaged };
  });
  const uncoveredAnswer = answers.uncovered;
  const uncovered = uncoveredAnswer?.type === "noul" ? uncoveredAnswer.noul : 0;
  const uncoveredBlocks = uncovered >= blockAt && !newPageStaged;
  return { pages, uncovered, uncoveredBlocks, blocked: uncoveredBlocks || pages.some((p) => p.blocks) };
}

export function reviewLines(review: UseCaseReview): string[] {
  const lines = review.pages.map((p) => `  ${p.blocks ? "STALE" : p.verdict === "current" ? "ok   " : "note "} ${p.id}: ${p.verdict} (${Math.round(p.confidence * 100)}%)${p.staged ? ", updated in this commit" : ""}`);
  lines.push(`  ${review.uncoveredBlocks ? "NEW  " : "ok   "} repeatable work no page covers: ${Math.round(review.uncovered * 100)}%`);
  return lines;
}
