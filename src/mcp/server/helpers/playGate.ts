import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { toolName } from "../../../browser/flow/index.ts";
import type { Command } from "../../../cli/runner/types.ts";
import { stepsOf } from "./activePlay.ts";
import { LIVE_SUFFIX } from "./toolAnnotations.ts";
import { actsAsOwner, commandTools } from "./toolsFromCommands.ts";
import { flowActsAsOwner } from "./toolsFromFlows.ts";

export const FLOW_LIVE_TOOL = "flowLive";

export const PLAY_GATED_ON_MAIN: ReadonlySet<string> = new Set(["twitterDmLive", "twitterReplyLive", "twitterQuoteLive", "twitterQueueRunLive", "twitterVoiceLive", "discordSendLive", "slackSendLive", "instagramSendLive"]);

export type PlayGateMode = "covered" | "anyPlay" | "none";

export interface PlayPage {
  text: string;
}

export function actingAsOwnerTools(commands: readonly Command[], flows: readonly FlowDefinition[]): Set<string> {
  return new Set([...commandTools(commands).filter(actsAsOwner).map((t) => t.tool), ...flows.filter((f) => flowActsAsOwner(f, true)).map((f) => `${toolName(f.name)}${LIVE_SUFFIX}`)]);
}

const twins = (tool: string): string[] => (tool.endsWith(LIVE_SUFFIX) ? [tool, tool.slice(0, -LIVE_SUFFIX.length)] : [tool, `${tool}${LIVE_SUFFIX}`]);

export function stepToolsOf(pages: readonly PlayPage[]): Set<string> {
  return new Set(pages.flatMap((p) => stepsOf(p.text).flatMap((s) => s.tools)));
}

export function namedByPlay(tool: string, stepTools: ReadonlySet<string>): boolean {
  return twins(tool).some((name) => stepTools.has(name));
}

export function playGateMode(tool: string, acting: ReadonlySet<string>, stepTools: ReadonlySet<string>): PlayGateMode {
  if (acting.has(tool) && namedByPlay(tool, stepTools)) return "covered";
  if (PLAY_GATED_ON_MAIN.has(tool)) return "anyPlay";
  return "none";
}

export function playRequiredTools(commands: readonly Command[], flows: readonly FlowDefinition[], pages: readonly PlayPage[]): Set<string> {
  const acting = actingAsOwnerTools(commands, flows);
  const named = stepToolsOf(pages);
  return new Set([...acting, ...PLAY_GATED_ON_MAIN].filter((tool) => playGateMode(tool, acting, named) !== "none"));
}

export function unnamedActingTools(commands: readonly Command[], flows: readonly FlowDefinition[], pages: readonly PlayPage[]): string[] {
  const named = stepToolsOf(pages);
  return [...actingAsOwnerTools(commands, flows)].filter((tool) => !namedByPlay(tool, named)).sort();
}

export function gatedToolOf(name: string, input: Record<string, unknown> | undefined, flows: readonly FlowDefinition[]): string {
  if (name !== FLOW_LIVE_TOOL) return name;
  const args = Array.isArray(input?.args) ? (input.args as unknown[]) : [];
  if (args[0] !== "run" || typeof args[1] !== "string") return name;
  const flow = flows.find((f) => f.name === args[1]);
  return flow && flowActsAsOwner(flow, true) ? `${toolName(flow.name)}${LIVE_SUFFIX}` : name;
}
