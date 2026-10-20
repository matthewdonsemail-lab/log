/** The agent lifecycle events log-cli hooks into, named as Claude Code and Codex both name them. */
export type HookEvent = "SessionStart" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "Stop";

/** One hook: the event, which tools or sources it matches, the script it runs and why. */
export interface AgentHook {
  event: HookEvent;
  /** A regex over the tool name (PostToolUse) or the start source (SessionStart); none for events that take no matcher. */
  matcher?: string;
  /** Repo-relative path of the bun script. */
  script: string;
  /** Seconds before the agent gives up on the hook. */
  timeout: number;
  why: string;
}

/** Which agent's settings file a hook list is written for. */
export type HookHost = "claudeCode" | "codex";
