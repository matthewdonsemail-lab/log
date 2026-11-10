export type LogHookEvent = "SessionStart" | "UserPromptSubmit" | "PostToolUse" | "Stop";

export interface LogHookPayload {
  hook_event_name?: LogHookEvent | "PreToolUse";
  session_id?: string;
  prompt?: string;
  source?: string;
  tool_name?: string;
  tool_input?: unknown;
  tool_response?: unknown;
  stop_hook_active?: boolean;
  transcript_path?: string;
  cwd?: string;
}

export interface LogHookReply {
  context?: string;
  decision?: string;
  reason?: string;
  failed?: boolean;
}

export interface CommandVerdict {
  deny?: string;
  context?: string;
}

export interface OpenCodeEvent {
  type: string;
  data?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  sessionID?: string;
  [key: string]: unknown;
}

export interface SessionHookEvent {
  sessionID: string;
  prompt?: { text?: string; files?: unknown[]; agents?: unknown[]; skills?: unknown[] };
}

export interface ToolHookEvent {
  tool: string;
  sessionID: string;
  callID?: string;
  input?: Record<string, unknown>;
  status?: "completed" | "error";
  result?: unknown;
  error?: { message?: string };
}

export interface PluginContext {
  location: { directory: string; project?: { directory?: string; canonical?: string } };
  options: Record<string, unknown>;
  session: {
    hook(
      name: "prompt",
      callback: (event: SessionHookEvent) => void | Promise<void>,
    ): Promise<{ dispose(): Promise<void> }>;
    get?(input: { sessionID: string }): Promise<{ parentID?: string } | undefined>;
    context?(input: { sessionID: string }): Promise<readonly Record<string, unknown>[]>;
    synthetic?(input: { sessionID: string; text: string }): Promise<unknown>;
    instructions?: {
      entry: {
        put(input: { sessionID: string; key: string; value: unknown }): Promise<void>;
        remove(input: { sessionID: string; key: string }): Promise<void>;
      };
    };
  };
  tool: {
    hook(
      name: "execute.before" | "execute.after",
      callback: (event: ToolHookEvent) => void | Promise<void>,
    ): Promise<{ dispose(): Promise<void> }>;
  };
  event: {
    subscribe(options?: { signal?: AbortSignal }): AsyncIterable<OpenCodeEvent>;
  };
}
