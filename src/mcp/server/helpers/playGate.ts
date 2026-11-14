import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { flowPlatform } from "../../../browser/flow/index.ts";
import { commandKey, isPlatform } from "../../../cli/runner/helpers/platforms.ts";
import { CAPABILITIES } from "../../../platformKit/capability/helpers/table.ts";
import type { Command } from "../../../cli/runner/types.ts";
import { stepsOf } from "./activePlay.ts";
import { LIVE_SUFFIX } from "./toolAnnotations.ts";
import { actsAsOwner, commandTools } from "./toolsFromCommands.ts";
import { flowActsAsOwner, flowTool } from "./toolsFromFlows.ts";

export const FLOW_LIVE_TOOL = "flowRunLive";

export const LEGACY_FLOW_LIVE_TOOL = "flowLive";

export const PLAY_GATED_ON_MAIN: ReadonlySet<string> = new Set(["twitterDmLive", "twitterReplyLive", "twitterQuoteLive", "twitterQueueRunLive", "twitterVoiceLive", "discordSendLive", "slackSendLive", "instagramSendLive", "linkedinMessageLive"]);

export type PlayGateMode = "required" | "anyPlay" | "ifPlay" | "none";

export interface PlayPage {
  id?: string;
  text: string;
}

export interface ActingTool {
  tool: string;
  platform: string;
}

export function actingToolsOf(commands: readonly Command[], flows: readonly FlowDefinition[]): ActingTool[] {
  return [
    ...commandTools(commands).filter(actsAsOwner).flatMap((t) => (isPlatform(t.command.platform) ? [{ tool: t.tool, platform: t.command.platform as string }] : [])),
    ...flows.filter((f) => flowActsAsOwner(f, true)).map((f) => ({ tool: flowTool(f, true), platform: flowPlatform(f) ?? "unknown" })),
  ];
}

export function actingAsOwnerTools(commands: readonly Command[], flows: readonly FlowDefinition[]): Set<string> {
  return new Set(actingToolsOf(commands, flows).map((t) => t.tool));
}

export function platformOfTool(tool: string, commands: readonly Command[], flows: readonly FlowDefinition[]): string | null {
  return actingToolsOf(commands, flows).find((t) => t.tool === tool)?.platform ?? null;
}

const twins = (tool: string): string[] => (tool.endsWith(LIVE_SUFFIX) ? [tool, tool.slice(0, -LIVE_SUFFIX.length)] : [tool, `${tool}${LIVE_SUFFIX}`]);

export function stepToolsOf(pages: readonly PlayPage[]): Set<string> {
  return new Set(pages.flatMap((p) => stepsOf(p.text).flatMap((s) => s.tools)));
}

export function namedByPlay(tool: string, stepTools: ReadonlySet<string>): boolean {
  return twins(tool).some((name) => stepTools.has(name));
}

export function folderOfPlay(id: string): string {
  return id.split("/")[0] ?? "";
}

export function playGateMode(tool: string, acting: ReadonlySet<string>, pages: readonly PlayPage[], platform: string | null): PlayGateMode {
  if (PLAY_GATED_ON_MAIN.has(tool)) {
    const coverable = namedByPlay(tool, stepToolsOf(pages)) || (platform !== null && pages.some((p) => p.id !== undefined && folderOfPlay(p.id) === platform));
    return coverable ? "required" : "anyPlay";
  }
  return acting.has(tool) ? "ifPlay" : "none";
}

export const CAPABILITY_PLAY_MODE: PlayGateMode = "required";

export function capabilityPlayGateMode(capability: string | null, tool: string, acting: ReadonlySet<string>, pages: readonly PlayPage[], platform: string | null): PlayGateMode {
  return capability?.endsWith(LIVE_SUFFIX) ? CAPABILITY_PLAY_MODE : playGateMode(tool, acting, pages, platform);
}

export function playRequiredTools(commands: readonly Command[], flows: readonly FlowDefinition[], pages: readonly PlayPage[]): Set<string> {
  const acting = actingAsOwnerTools(commands, flows);
  const required = new Set([...PLAY_GATED_ON_MAIN].filter((tool) => ["required", "anyPlay"].includes(playGateMode(tool, acting, pages, platformOfTool(tool, commands, flows)))));
  for (const capability of capabilityLiveTools(commands)) required.add(capability.tool);
  return required;
}

export function capabilityLiveTools(commands: readonly Command[]): { tool: string; runs: string[] }[] {
  const tools = commandTools(commands);
  return CAPABILITIES.filter((definition) => definition.live).map((definition) => ({
    tool: `${definition.noun}${definition.verb[0].toUpperCase()}${definition.verb.slice(1)}${LIVE_SUFFIX}`,
    runs: Object.values(definition.platforms).flatMap((binding) => tools.filter((t) => t.live && binding !== undefined && commandKey(t.command) === binding.command && (t.form?.words ?? []).join(" ") === binding.words.join(" ")).map((t) => t.tool)),
  }));
}

export function unnamedActingTools(commands: readonly Command[], flows: readonly FlowDefinition[], pages: readonly PlayPage[]): string[] {
  const named = stepToolsOf(pages);
  return [...actingAsOwnerTools(commands, flows)].filter((tool) => !namedByPlay(tool, named)).sort();
}

export function gatedToolOf(name: string, input: Record<string, unknown> | undefined, flows: readonly FlowDefinition[]): string {
  const args = Array.isArray(input?.args) ? (input.args as unknown[]) : [];
  const flowName = name === FLOW_LIVE_TOOL && !args.length ? input?.name : name === FLOW_LIVE_TOOL || name === LEGACY_FLOW_LIVE_TOOL ? (args[0] === "run" ? args[1] : null) : null;
  if (typeof flowName !== "string") return name;
  const flow = flows.find((f) => f.name === flowName);
  return flow && flowActsAsOwner(flow, true) ? flowTool(flow, true) : name;
}
