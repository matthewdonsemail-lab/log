/**
 * What the page-state hook says (rules 54-55), decided here and pure, so it is
 * tested without a browser. `scripts/hooks/pageState.ts` reads each open
 * session's last step and prints this.
 *
 * - SessionStart, UserPromptSubmit: where every open browser is.
 * - PostToolUse: only what changed: a known state and its resolver, or a step
 *   that failed (an unconfirmed page: snapshot it, then resolve).
 * - Stop: blocks the turn's end while a browser sits on something log-cli
 *   resolves itself. A person's state (video selfie, ID, disabled) never
 *   blocks. When the agent was already sent back once and nothing has changed
 *   since, the turn may end, so a state nothing can move never loops.
 */
import { pageStateOf } from "../../browser/flow/helpers/pageState.ts";
import type { BrowserAt, Finding, HookEvent, HookMemory, HookReply } from "./types.ts";

export type { BrowserAt, Finding, HookMemory, HookReply } from "./types.ts";

const HEADER = "log-cli page state (rules 54-55, scripts/hooks/pageState.ts):";

/** One browser's finding. Pure. */
export function findingOf(at: BrowserAt): Finding {
  const state = pageStateOf(at.url, at.text, { messengerPin: at.messengerPin });
  const where = `step ${at.step}, ${at.url || "no url yet"}`;
  if (state) {
    const next = state.person ? "Only a person can clear it: stop this account and tell matt." : "Known state, resolve it, do not stop:";
    return { account: at.account, kind: "state", state, mark: `${at.step}:${state.id}`, line: `${at.account}: page state **${state.id}**: ${state.what} (${where}). ${next} ${state.resolve}.`, resolvable: !state.person };
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

/** The hook's reply for `event`, given every open browser and what it remembered. Pure. */
export function hookReply(event: HookEvent, browsers: BrowserAt[], memory: HookMemory, stopHookActive = false): HookReply {
  const findings = browsers.map(findingOf);
  const seen = { ...memory.seen };
  for (const f of findings) seen[f.account] = f.mark;

  if (event === "Stop") {
    const open = findings.filter((f) => f.resolvable);
    if (!open.length) return { output: null, memory: { seen, stopBlocked: null } };
    const marks = open.map((f) => `${f.account}=${f.mark}`).join(",");
    // Sent back once already and nothing moved: let the turn end rather than loop.
    if (stopHookActive && memory.stopBlocked === marks) return { output: null, memory: { seen, stopBlocked: marks } };
    const reason = [`${HEADER} a browser is on something log-cli resolves itself, so the turn is not over (matt: "you're not meant to stop").`, ...open.map((f) => `- ${f.line}`)].join("\n");
    return { output: { decision: "block", reason }, memory: { seen, stopBlocked: marks } };
  }

  const always = event === "SessionStart" || event === "UserPromptSubmit";
  const lines = findings.filter((f) => always || (f.kind !== "clear" && memory.seen[f.account] !== f.mark)).map((f) => f.line);
  return { output: lines.length ? context(event, lines) : null, memory: { seen, stopBlocked: memory.stopBlocked } };
}

/** Reads a saved memory, including the older shape (a bare account → mark map). Pure. */
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
