import { pageStateOf } from "../../browser/flow/helpers/pageState.ts";
import { goalLine, goalMark } from "../../browser/inspect/helpers/goal.ts";
import type { BrowserAt, Finding, HookEvent, HookMemory, HookReply } from "./types.ts";

export type { BrowserAt, Finding, HookMemory, HookReply } from "./types.ts";

const HEADER = "log-cli page state (rules 54-55, scripts/hooks/pageState.ts):";

export function findingOf(at: BrowserAt): Finding {
  const state = pageStateOf(at.url, at.text, { messengerPin: at.messengerPin, exchanges: at.exchanges });
  const where = `step ${at.step}, ${at.url || "no url yet"}`;
  if (state) {
    const next = state.person ? "Only a person can clear it: stop this account and tell matt." : "Known state, resolve it, do not stop:";
    return { account: at.account, kind: "state", state, mark: `${at.step}:${state.id}`, line: `${at.account}: page state **${state.id}**: ${state.what} (${where}). ${next} ${state.resolve}.`, resolvable: !state.person };
  }
  if (at.reading && !at.reading.decided) {
    return { account: at.account, kind: "reading", state: null, mark: `${at.step}:reading`, line: `${at.account}: ${at.reading.text.replace(/\n/g, " ")}`, resolvable: false };
  }
  if (at.failed) {
    return {
      account: at.account,
      kind: "failed",
      state: null,
      mark: `${at.step}:failed`,
      line: `${at.account}: step failed, the page is unconfirmed (${where}): ${at.failed.slice(0, 240)}. Resolve it: \`log inspect do snapshot --account ${at.account}\`, read where the page is, then its resolver; a blocking page not in pageStateOf is added there (rule 54).`,
      resolvable: true,
    };
  }
  return { account: at.account, kind: "clear", state: null, mark: `${at.step}:none`, line: `${at.account}: open browser on ${at.url || "a page"} (step ${at.step}), no known blocking state.`, resolvable: false };
}

function context(event: HookEvent, lines: string[]): Record<string, unknown> {
  return { hookSpecificOutput: { hookEventName: event, additionalContext: [HEADER, ...lines.map((l) => `- ${l}`)].join("\n") } };
}

export interface GoalNote {
  account: string;
  mark: string;
  line: string;
  blocks: boolean;
}

export function goalNotesOf(browsers: BrowserAt[]): GoalNote[] {
  const notes: GoalNote[] = [];
  for (const at of browsers) {
    if (!at.goal) continue;
    const note = goalLine(at.account, at.goal);
    if (note) notes.push({ account: at.account, mark: goalMark(at.account, at.goal), ...note });
  }
  return notes;
}

export function hookReply(event: HookEvent, browsers: BrowserAt[], memory: HookMemory, stopHookActive = false): HookReply {
  const findings = browsers.map(findingOf);
  const goals = goalNotesOf(browsers);
  const seen = { ...memory.seen };
  for (const f of findings) seen[f.account] = f.mark;
  for (const g of goals) seen[`${g.account}#goal`] = g.mark;

  if (event === "Stop") {
    const open = findings.filter((f) => f.resolvable);
    const goalsOpen = goals.filter((g) => g.blocks);
    if (!open.length && !goalsOpen.length) return { output: null, memory: { seen, stopBlocked: null } };
    const marks = [...open.map((f) => `${f.account}=${f.mark}`), ...goalsOpen.map((g) => g.mark)].join(",");
    if (stopHookActive && memory.stopBlocked === marks) return { output: null, memory: { seen, stopBlocked: marks } };
    const reason = [
      `${HEADER} the turn is not over (matt: "you're not meant to stop").`,
      ...open.map((f) => `- ${f.line}`),
      ...goalsOpen.map((g) => `- ${g.line}`),
    ].join("\n");
    return { output: { decision: "block", reason }, memory: { seen, stopBlocked: marks } };
  }

  const always = event === "SessionStart" || event === "UserPromptSubmit";
  const lines = findings.filter((f) => always || (f.kind !== "clear" && memory.seen[f.account] !== f.mark)).map((f) => f.line);
  const goalLines = goals.filter((g) => always || memory.seen[`${g.account}#goal`] !== g.mark).map((g) => g.line);
  const all = [...lines, ...goalLines];
  return { output: all.length ? context(event, all) : null, memory: { seen, stopBlocked: memory.stopBlocked } };
}

export function parseMemory(text: string): HookMemory {
  try {
    const value = JSON.parse(text) as Record<string, unknown>;
    const seen = value.seen;
    if (seen && typeof seen === "object") return { seen: seen as Record<string, string>, stopBlocked: typeof value.stopBlocked === "string" ? value.stopBlocked : null };
    const legacy = Object.fromEntries(Object.entries(value).filter((e): e is [string, string] => typeof e[1] === "string"));
    return { seen: legacy, stopBlocked: null };
  } catch {
    return { seen: {}, stopBlocked: null };
  }
}
