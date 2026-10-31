import type { HookEvent } from "../../agentHooks/registry/index.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export interface Flag {
  name: string;
  value: string | null;
}

export interface CommandEntry {
  name: string;
  key: string;
  summary: string;
  usage: string[];
  flags: Flag[];
  tool: string | null;
  typed: boolean;
  terminalOnly: string | null;
  longRunning: boolean;
  rules: number[];
  platform: Platform | "any" | "byArgument";
  words: string;
  browser: "accountBrowser" | "camoufoxOnly" | "none";
  engine: "directApiFirst" | "directApiOnly" | "browser" | "none";
  hooks: { cli: HookEvent[]; mcp: HookEvent[] };
}

export interface FlowEntry {
  name: string;
  tool: string;
  summary: string;
  params: string[];
  steps: string[];
}
