import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { flowToolName } from "../../../browser/flow/index.ts";
import type { LogTool } from "../types.ts";
import { TOOL_RESULT_SCHEMA } from "../types.ts";
import { ANY_PLATFORM_LABEL, isPlatform, PLATFORM_LABELS } from "../../../cli/runner/helpers/platforms.ts";
import { FLOWS_GUIDE, guideLine } from "./guides.ts";
import { cite, rulesLine } from "./agentRules.ts";
import { annotationsOf, LIVE_SUFFIX, titleOf } from "./toolAnnotations.ts";
import { longRunLine, OWNER_EFFECTS, PLAY_HANDLE, WAIT_MS } from "./toolsFromCommands.ts";
import type { ToolOptions } from "./toolsFromCommands.ts";

export function flowActsAsOwner(flow: FlowDefinition, live: boolean): boolean {
  return live && flow.effect !== undefined && OWNER_EFFECTS.has(flow.effect);
}

export function flowPlatformLabel(flow: Pick<FlowDefinition, "platform">): string {
  return isPlatform(flow.platform) ? PLATFORM_LABELS[flow.platform] : ANY_PLATFORM_LABEL;
}

export function flowTool(flow: FlowDefinition, live = false): string {
  return `${flowToolName(flow)}${live ? LIVE_SUFFIX : ""}`;
}

function flowToolOf(flow: FlowDefinition, live: boolean, options: ToolOptions): LogTool {
  const place = flowPlatformLabel(flow);
  const properties: Record<string, unknown> = {
    account: { type: "string", description: "The account (`logSearch` finds the tool that lists the platform's accounts)" },
  };
  for (const p of flow.params) properties[p.name] = { type: "string", description: `${p.description}${p.kind === "file" ? " (a URL or a local path)" : ""}` };
  properties.bypass = { type: "boolean", description: `Skip the waking-hours gate only (${cite(35)}), when the owner asked` };
  properties.now = { type: "boolean", description: `Skip the 10-minute launch gap only (${cite(35)})` };
  properties.proxyMs = { type: "integer", description: `This run's proxy speed limit to ${place}, in ms (default 2500, ${cite(35)})` };
  if (live) properties.confirmLive = { type: "boolean", description: "Set true only when the owner asked for this live run" };
  properties.confirmBypass = { type: "boolean", description: `Set true with bypass, only when the owner asked for a run outside the account's hours (${cite(35)})` };
  properties.waitMs = WAIT_MS;
  if (flowActsAsOwner(flow, live)) properties.playHandle = PLAY_HANDLE;
  const title = titleOf(flow.summary, live, place);
  return {
    name: flowTool(flow, live),
    title,
    description: [
      `log flow run ${flow.name} --account <a> ${flow.params.map((p) => `--set ${p.name}=…`).join(" ")}${live ? " --live" : ""}`,
      ...(live
        ? [`Live on ${place}: runs every step in the account's browser. Call it only when the owner asked for this live run, with confirmLive: true (${cite(8)}).`]
        : [`A dry run: lists the steps and opens nothing. What runs them on ${place} is \`${flowTool(flow, true)}\`.`]),
      flow.summary,
      `Steps: ${flow.steps.map((s) => s.id.replace(/^s\d+_/, "")).join(" → ")}. Every step is recorded (snapshot, screenshot, HAR, rea).`,
      ...(live ? [longRunLine(options, "minutes in the account's browser")] : []),
      guideLine(FLOWS_GUIDE),
      rulesLine("flow"),
    ].join("\n"),
    annotations: annotationsOf("read", live, title),
    inputSchema: { type: "object", properties, required: ["account", ...flow.params.map((p) => p.name), ...(live ? ["confirmLive"] : [])], additionalProperties: false },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

export function toolsFromFlows(flows: FlowDefinition[], options: ToolOptions = {}): LogTool[] {
  return flows.flatMap((flow) => [flowToolOf(flow, false, options), flowToolOf(flow, true, options)]);
}

export function flowOfTool(flows: FlowDefinition[], name: string): { flow: FlowDefinition; live: boolean } | null {
  for (const flow of flows) {
    if (flowTool(flow) === name) return { flow, live: false };
    if (flowTool(flow, true) === name) return { flow, live: true };
  }
  return null;
}

export const FLOW_RUN_TOOL = "flowRun";

export function flowRunInput(flow: FlowDefinition, input: Record<string, unknown> | undefined, live = false): { ok: true; input: Record<string, unknown> } | { ok: false; message: string } {
  const built = flowArgv(flow, input, live);
  if (!built.ok) return built;
  const set = Object.fromEntries(flow.params.map((p) => [p.name, String(input?.[p.name])]));
  return {
    ok: true,
    input: {
      name: flow.name,
      account: input?.account,
      ...(flow.params.length ? { set } : {}),
      ...(input?.bypass === true ? { bypass: true } : {}),
      ...(input?.now === true ? { now: true } : {}),
      ...(typeof input?.proxyMs === "number" ? { proxyMs: input.proxyMs } : {}),
    },
  };
}

export function flowArgv(flow: FlowDefinition, input: Record<string, unknown> | undefined, live = false): { ok: true; argv: string[]; live: boolean } | { ok: false; message: string } {
  const name = flowTool(flow, live);
  const account = input?.account;
  if (typeof account !== "string" || !account) return { ok: false, message: `${name} needs account` };
  if (!live && input?.live === true) return { ok: false, message: `${name} never acts on ${flowPlatformLabel(flow)}: running it there is \`${flowTool(flow, true)}\`, only when the owner asked (${cite(8)})` };
  const argv = ["flow", "run", flow.name, "--account", account];
  for (const p of flow.params) {
    const value = input?.[p.name];
    if (typeof value !== "string" || !value) return { ok: false, message: `${name} needs ${p.name}` };
    argv.push("--set", `${p.name}=${value}`);
  }
  for (const flag of ["bypass", "now"]) if (input?.[flag] === true) argv.push(`--${flag}`);
  if (live) argv.push("--live");
  if (typeof input?.proxyMs === "number") argv.push("--proxyMs", String(input.proxyMs));
  return { ok: true, argv, live };
}
