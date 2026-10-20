/**
 * Every agent hook log-cli registers, in one list (rule 55). Claude Code reads
 * them from `.claude/settings.json`, Codex from `.codex/hooks.json`; both
 * files are written from this list (`bun run check:agentHooks --write`) and the
 * pre-commit check refuses a commit where either file, the CLI's commands, the
 * MCP tools or the hook scripts have drifted from it.
 */
import type { AgentHook, HookHost } from "./types.ts";

export type { AgentHook, HookEvent, HookHost } from "./types.ts";

/** The MCP server's name in `.mcp.json`: its tools reach the agent as `mcp__log__<tool>`. */
export const MCP_SERVER_NAME = "log";

/**
 * The tools that run log-cli: the terminal (Bash, PowerShell), a Monitor on
 * the live log, and every MCP tool. After any of them the browser may be on a
 * new page.
 */
export const TOOL_MATCHER = `Bash|PowerShell|Monitor|mcp__${MCP_SERVER_NAME}__.*`;

/** The tools that run a shell command: where a log-cli run is started. */
export const SHELL_MATCHER = "Bash|PowerShell|Monitor";

const PAGE_STATE = "scripts/hooks/pageState.ts";
const LIVE_LOGS = "scripts/hooks/liveLogs.ts";

export const AGENT_HOOKS: readonly AgentHook[] = [
  { event: "SessionStart", matcher: "startup|resume|clear|compact", script: PAGE_STATE, timeout: 20, why: "where every open browser is, the moment a session starts or comes back from compaction" },
  { event: "UserPromptSubmit", script: PAGE_STATE, timeout: 20, why: "where every open browser is, with each of matt's prompts" },
  { event: "PreToolUse", matcher: SHELL_MATCHER, script: LIVE_LOGS, timeout: 10, why: "a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26)" },
  { event: "PostToolUse", matcher: TOOL_MATCHER, script: PAGE_STATE, timeout: 20, why: "a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once" },
  { event: "Stop", script: PAGE_STATE, timeout: 20, why: "the turn does not end while a browser sits on a state log-cli can resolve (rule 54)" },
];

/** The shell command a host runs for `script`: Claude Code gives the project dir, Codex runs in the repo. Pure. */
export function hookCommand(host: HookHost, script: string): string {
  return host === "claudeCode" ? `bun "$CLAUDE_PROJECT_DIR/${script}"` : `bun "$(git rev-parse --show-toplevel)/${script}"`;
}

/** The `hooks` object both hosts read (event → matcher groups → handlers), in registry order. Pure. */
export function hooksFor(host: HookHost, hooks: readonly AgentHook[] = AGENT_HOOKS): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  for (const hook of hooks) {
    const group = { ...(hook.matcher ? { matcher: hook.matcher } : {}), hooks: [{ type: "command", command: hookCommand(host, hook.script), timeout: hook.timeout }] };
    (out[hook.event] ??= []).push(group);
  }
  return out;
}

/** True when `mcp__log__<tool>` is matched by the PostToolUse hooks. Pure. */
export function toolIsHooked(tool: string, hooks: readonly AgentHook[] = AGENT_HOOKS): boolean {
  return hooks.some((h) => h.event === "PostToolUse" && h.matcher !== undefined && new RegExp(`^(?:${h.matcher})$`).test(`mcp__${MCP_SERVER_NAME}__${tool}`));
}
