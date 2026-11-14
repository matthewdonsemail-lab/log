export type HookEvent = "SessionStart" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "Stop";

export interface AgentHook {
  event: HookEvent;
  matcher?: string;
  script: string;
  service?: string;
  timeout: number;
  why: string;
}

export type { HookHost } from "../harness/types.ts";

export interface HookFile {
  path: string;
  format: "json" | "text";
  wanted: (current: string | null) => string;
  same: (current: string | null) => boolean;
}
