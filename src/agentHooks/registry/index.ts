import type { AgentHook, HookHost } from "./types.ts";

export type { AgentHook, HookEvent, HookHost } from "./types.ts";

export const MCP_SERVER_NAME = "log";

export const TOOL_MATCHER = `Bash|PowerShell|Monitor|mcp__${MCP_SERVER_NAME}__.*`;

export const SHELL_MATCHER = "Bash|PowerShell|Monitor";

const PAGE_STATE = "scripts/hooks/pageState.ts";
const LIVE_LOGS = "scripts/hooks/liveLogs.ts";
const STORAGE = "scripts/hooks/storage.ts";
const ENGINES = "scripts/hooks/engines.ts";
const INBOX = "scripts/hooks/inbox.ts";
const KNOWLEDGE = "scripts/hooks/knowledge.ts";

export const AGENT_HOOKS: readonly AgentHook[] = [
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: PAGE_STATE, timeout: 20, why: "where every open browser is, the moment a session starts or comes back from compaction" },
  { event: "UserPromptSubmit", script: PAGE_STATE, timeout: 20, why: "where every open browser is, with each of matt's prompts" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: STORAGE, timeout: 30, why: "~/.logCli/runs over 2 GB or the disk nearly full: said with `log runs prune` before AdsPower refuses to start" },
  { event: "UserPromptSubmit", script: STORAGE, timeout: 30, why: "the same storage check with each of matt's prompts (measured at most every 15 minutes)" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: ENGINES, timeout: 10, why: "which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines; and, loudly, when the log MCP server runs older code than the checkout" },
  { event: "UserPromptSubmit", script: ENGINES, timeout: 10, why: "the same engine line with matt's prompt, only when an account's session state, its governor use or the MCP server's freshness changed" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: KNOWLEDGE, timeout: 10, why: "the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses (rule 90)" },
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: INBOX, timeout: 15, why: "anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes), said loudly so a reply is never missed" },
  { event: "UserPromptSubmit", script: INBOX, timeout: 15, why: "the same inbox check with each of matt's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: INBOX, timeout: 15, why: "the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once" },
  { event: "PreToolUse", matcher: SHELL_MATCHER, script: LIVE_LOGS, timeout: 10, why: "a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26)" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: PAGE_STATE, timeout: 20, why: "a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once" },
  { event: "Stop", script: PAGE_STATE, timeout: 20, why: "the turn does not end while a browser sits on a state log-cli can resolve (rule 54)" },
];

export function hookCommand(host: HookHost, script: string): string {
  return host === "claudeCode" ? `bun "$CLAUDE_PROJECT_DIR/${script}"` : `bun "$(git rev-parse --show-toplevel)/${script}"`;
}

export function hooksFor(host: HookHost, hooks: readonly AgentHook[] = AGENT_HOOKS): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  for (const hook of hooks) {
    const group = { ...(hook.matcher ? { matcher: hook.matcher } : {}), hooks: [{ type: "command", command: hookCommand(host, hook.script), timeout: hook.timeout }] };
    (out[hook.event] ??= []).push(group);
  }
  return out;
}

export function toolIsHooked(tool: string, hooks: readonly AgentHook[] = AGENT_HOOKS): boolean {
  return hooks.some((h) => h.event === "PostToolUse" && h.matcher !== undefined && new RegExp(`^(?:${h.matcher})$`).test(`mcp__${MCP_SERVER_NAME}__${tool}`));
}
