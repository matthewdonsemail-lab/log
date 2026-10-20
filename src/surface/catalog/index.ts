/**
 * The catalog of log-cli's surface (rule 56): every command with its usage
 * and flags, its MCP tool (or why it is terminal-only), the hooks that fire on
 * it, whether it is watched on the live log, and its rules. The README's
 * command table, the `.mmd` diagrams and the parity check all read this, so
 * the docs are generated from the code and never written by hand.
 */
import { AGENT_HOOKS, MCP_SERVER_NAME } from "../../agentHooks/registry/index.ts";
import type { AgentHook, HookEvent } from "../../agentHooks/registry/index.ts";
import { toolName } from "../../browser/flow/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import type { Command } from "../../cli/runner/types.ts";
import { COMMAND_RULES, EVERY_TOOL_RULES } from "../../mcp/server/helpers/agentRules.ts";
import { LONG_RUNNING } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { TERMINAL_ONLY } from "../../mcp/server/types.ts";
import type { CommandEntry, Flag, FlowEntry } from "./types.ts";

export type { CommandEntry, Flag, FlowEntry } from "./types.ts";

/** The flags every command takes, from the runner (`takeProxyMs`, rule 33). */
export const GLOBAL_FLAGS: readonly Flag[] = [{ name: "proxyMs", value: "ms" }];

/** A usage's lines, without `Usage:` and the indent under it. Pure. */
export function usageLines(usage: string): string[] {
  return usage
    .split("\n")
    .map((line) => line.replace(/^\s*Usage:\s*/, "").trim())
    .filter(Boolean);
}

/** Every flag a usage names, once each, in order: `--name <value>` or `--name`. Pure. */
export function flagsOf(usage: string): Flag[] {
  const flags = new Map<string, Flag>();
  for (const m of usage.matchAll(/--([A-Za-z][A-Za-z0-9]*)(?:[ =]<([^>]+)>)?/g)) {
    const known = flags.get(m[1]);
    if (!known) flags.set(m[1], { name: m[1], value: m[2] ?? null });
    else if (!known.value && m[2]) known.value = m[2];
  }
  return [...flags.values()];
}

const TOOL_EVENTS: HookEvent[] = ["PreToolUse", "PostToolUse"];

/** The tool-call hooks whose matcher takes `tool`. Pure. */
export function hooksOn(tool: string, hooks: readonly AgentHook[] = AGENT_HOOKS): HookEvent[] {
  return hooks.filter((h) => TOOL_EVENTS.includes(h.event) && h.matcher !== undefined && new RegExp(`^(?:${h.matcher})$`).test(tool)).map((h) => h.event);
}

/** The hooks that run around every turn, whatever tool is called. Pure. */
export function sessionHooks(hooks: readonly AgentHook[] = AGENT_HOOKS): AgentHook[] {
  return hooks.filter((h) => !TOOL_EVENTS.includes(h.event));
}

/** One command's entry. Pure. */
export function commandEntry(command: Command): CommandEntry {
  const terminalOnly = TERMINAL_ONLY[command.name] ?? null;
  return {
    name: command.name,
    summary: command.summary,
    usage: usageLines(command.usage),
    flags: flagsOf(command.usage),
    tool: terminalOnly ? null : command.name,
    terminalOnly,
    longRunning: LONG_RUNNING.has(command.name),
    rules: [...(COMMAND_RULES[command.name] ?? []), ...EVERY_TOOL_RULES],
    hooks: { cli: hooksOn("Bash"), mcp: terminalOnly ? [] : hooksOn(`mcp__${MCP_SERVER_NAME}__${command.name}`) },
  };
}

/** Every command, in the registry's order. Pure. */
export function catalog(commands: readonly Command[]): CommandEntry[] {
  return commands.map(commandEntry);
}

/** Every saved flow as the MCP tool it is. Pure. */
export function flowEntries(flows: readonly FlowDefinition[]): FlowEntry[] {
  return flows.map((flow) => ({
    name: flow.name,
    tool: toolName(flow.name),
    summary: flow.summary,
    params: flow.params.map((p) => p.name),
    steps: flow.steps.map((s) => s.id.replace(/^s\d+_/, "")),
  }));
}
