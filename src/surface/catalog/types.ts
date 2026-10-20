import type { HookEvent } from "../../agentHooks/registry/index.ts";

/** One flag a command takes, from its usage: `--account <accountName>` → { name: "account", value: "accountName" }. */
export interface Flag {
  name: string;
  /** The value's placeholder; null for a switch (`--json`). */
  value: string | null;
}

/** Everything about one command, in one place: the CLI, its MCP tool, the hooks that cover it, its live log and rules. */
export interface CommandEntry {
  name: string;
  summary: string;
  /** Each usage line, without the leading `Usage:`. */
  usage: string[];
  flags: Flag[];
  /** Its MCP tool's name, or null when it is terminal-only. */
  tool: string | null;
  /** Why it has no MCP tool (`TERMINAL_ONLY`). */
  terminalOnly: string | null;
  /** It runs for seconds to minutes: watched live on `~/.logCli/mcp/<day>.log` (rule 26). */
  longRunning: boolean;
  /** The AGENTS.md rules it falls under, its own first. */
  rules: number[];
  /** Which platform it acts on (`Command.platform`, rule 60). */
  platform: "facebook" | "any" | "byArgument";
  /** Which browser it runs on (`commandBrowser`, src/browser/run): the account's through the driver, Camoufox only (not on the driver yet), or none. */
  browser: "accountBrowser" | "camoufoxOnly" | "none";
  /** The tool-call hooks that fire on it: run from a shell (Bash, PowerShell, Monitor), or as its MCP tool. */
  hooks: { cli: HookEvent[]; mcp: HookEvent[] };
}

/** A saved flow: an MCP tool of its own (rule 31), run as `log flow run <name>`. */
export interface FlowEntry {
  name: string;
  tool: string;
  summary: string;
  params: string[];
  steps: string[];
}
