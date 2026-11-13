import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { toolName } from "../../../browser/flow/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import { LIVE_SUFFIX } from "./toolAnnotations.ts";
import { actsAsOwner, commandTools } from "./toolsFromCommands.ts";
import { flowActsAsOwner } from "./toolsFromFlows.ts";

export const FLOW_LIVE_TOOL = "flowLive";

export function playRequiredTools(commands: readonly Command[], flows: readonly FlowDefinition[]): Set<string> {
  return new Set([...commandTools(commands).filter(actsAsOwner).map((t) => t.tool), ...flows.filter((f) => flowActsAsOwner(f, true)).map((f) => `${toolName(f.name)}${LIVE_SUFFIX}`)]);
}

export function gatedToolOf(name: string, input: Record<string, unknown> | undefined, flows: readonly FlowDefinition[]): string {
  if (name !== FLOW_LIVE_TOOL) return name;
  const args = Array.isArray(input?.args) ? (input.args as unknown[]) : [];
  if (args[0] !== "run" || typeof args[1] !== "string") return name;
  const flow = flows.find((f) => f.name === args[1]);
  return flow && flowActsAsOwner(flow, true) ? `${toolName(flow.name)}${LIVE_SUFFIX}` : name;
}
