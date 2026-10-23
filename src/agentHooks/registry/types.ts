export type HookEvent = "SessionStart" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "Stop";

export interface AgentHook {
  event: HookEvent;
  matcher?: string;
  script: string;
  timeout: number;
  why: string;
}

export type HookHost = "claudeCode" | "codex";
