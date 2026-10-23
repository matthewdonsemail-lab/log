import { AGENT_HOOKS, MCP_SERVER_NAME } from "../../agentHooks/registry/index.ts";
import type { AgentHook, HookEvent } from "../../agentHooks/registry/index.ts";
import { toolName } from "../../browser/flow/index.ts";
import { commandBrowser } from "../../browser/run/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import type { Command } from "../../cli/runner/types.ts";
import { COMMAND_RULES, EVERY_TOOL_RULES } from "../../mcp/server/helpers/agentRules.ts";
import { commandTools, commandWords, LONG_RUNNING } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { TERMINAL_ONLY } from "../../mcp/server/types.ts";
import type { CommandEntry, Flag, FlowEntry } from "./types.ts";

export type { CommandEntry, Flag, FlowEntry } from "./types.ts";

export const GLOBAL_FLAGS: readonly Flag[] = [{ name: "proxyMs", value: "ms" }];

export function usageLines(usage: string): string[] {
  return usage
    .split("\n")
    .map((line) => line.replace(/^\s*Usage:\s*/, "").trim())
    .filter(Boolean);
}

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

export function hooksOn(tool: string, hooks: readonly AgentHook[] = AGENT_HOOKS): HookEvent[] {
  return hooks.filter((h) => TOOL_EVENTS.includes(h.event) && h.matcher !== undefined && new RegExp(`^(?:${h.matcher})$`).test(tool)).map((h) => h.event);
}

export function sessionHooks(hooks: readonly AgentHook[] = AGENT_HOOKS): AgentHook[] {
  return hooks.filter((h) => !TOOL_EVENTS.includes(h.event));
}

export function commandEntry(command: Command): CommandEntry {
  const terminalOnly = TERMINAL_ONLY[command.name] ?? null;
  const tools = commandTools([command]).map((t) => t.tool);
  return {
    name: command.name,
    summary: command.summary,
    usage: usageLines(command.usage),
    flags: flagsOf(command.usage),
    tool: terminalOnly ? null : tools.join(", "),
    typed: command.input !== undefined,
    terminalOnly,
    longRunning: LONG_RUNNING.has(command.name),
    browser: commandBrowser(command.name),
    platform: command.platform,
    words: commandWords(command),
    rules: [...(COMMAND_RULES[command.name] ?? []), ...EVERY_TOOL_RULES],
    hooks: { cli: hooksOn("Bash"), mcp: terminalOnly ? [] : hooksOn(`mcp__${MCP_SERVER_NAME}__${tools[0]}`) },
  };
}

export function catalog(commands: readonly Command[]): CommandEntry[] {
  return commands.map(commandEntry);
}

export function flowEntries(flows: readonly FlowDefinition[]): FlowEntry[] {
  return flows.map((flow) => ({
    name: flow.name,
    tool: toolName(flow.name),
    summary: flow.summary,
    params: flow.params.map((p) => p.name),
    steps: flow.steps.map((s) => s.id.replace(/^s\d+_/, "")),
  }));
}
