import type { HookEvent } from "../../agentHooks/registry/index.ts";

export interface Flag {
  name: string;
  value: string | null;
}

export interface CommandEntry {
  name: string;
  summary: string;
  usage: string[];
  flags: Flag[];
  tool: string | null;
  typed: boolean;
  terminalOnly: string | null;
  longRunning: boolean;
  rules: number[];
  platform: "facebook" | "any" | "byArgument";
  words: string;
  browser: "accountBrowser" | "camoufoxOnly" | "none";
  engine: "directApiFirst" | "browser" | "none";
  hooks: { cli: HookEvent[]; mcp: HookEvent[] };
}

export interface FlowEntry {
  name: string;
  tool: string;
  summary: string;
  params: string[];
  steps: string[];
}
