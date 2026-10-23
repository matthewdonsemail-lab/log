import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { toolName } from "../../../browser/flow/index.ts";
import type { LogTool } from "../types.ts";
import { TOOL_RESULT_SCHEMA } from "../types.ts";
import { rulesLine } from "./agentRules.ts";
import { annotationsOf, LIVE_SUFFIX, titleOf } from "./toolAnnotations.ts";
import { longRunLine, WAIT_MS } from "./toolsFromCommands.ts";
import type { ToolOptions } from "./toolsFromCommands.ts";

function flowTool(flow: FlowDefinition, live: boolean, options: ToolOptions): LogTool {
  const properties: Record<string, unknown> = {
    account: { type: "string", description: "The account (`log facebook accounts` lists them)" },
  };
  for (const p of flow.params) properties[p.name] = { type: "string", description: `${p.description}${p.kind === "file" ? " (a URL or a local path)" : ""}` };
  properties.bypass = { type: "boolean", description: "Skip the waking-hours gate only (rule 20), when matt asked" };
  properties.now = { type: "boolean", description: "Skip the 10-minute launch gap only (rule 30)" };
  properties.proxyMs = { type: "integer", description: "This run's proxy speed limit to Facebook, in ms (default 2500, rule 33)" };
  if (live) properties.confirmLive = { type: "boolean", description: "Set true only when matt asked for this live run" };
  properties.confirmBypass = { type: "boolean", description: "Set true with bypass, only when matt asked for a run outside the account's hours (rule 20)" };
  properties.waitMs = WAIT_MS;
  const title = titleOf(flow.summary, live);
  return {
    name: `${toolName(flow.name)}${live ? LIVE_SUFFIX : ""}`,
    title,
    description: [
      `log flow run ${flow.name} --account <a> ${flow.params.map((p) => `--set ${p.name}=…`).join(" ")}${live ? " --live" : ""}`,
      ...(live
        ? ["Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10)."]
        : [`A dry run: lists the steps and opens nothing. What runs them on Facebook is \`${toolName(flow.name)}${LIVE_SUFFIX}\`.`]),
      flow.summary,
      `Steps: ${flow.steps.map((s) => s.id.replace(/^s\d+_/, "")).join(" → ")}. Every step is recorded (snapshot, screenshot, HAR, rea).`,
      ...(live ? [longRunLine(options, "minutes in the account's browser")] : []),
      rulesLine("flow"),
    ].join("\n"),
    annotations: annotationsOf("read", live, title),
    inputSchema: { type: "object", properties, required: ["account", ...flow.params.map((p) => p.name), ...(live ? ["confirmLive"] : [])], additionalProperties: false },
    outputSchema: TOOL_RESULT_SCHEMA,
  };
}

export function toolsFromFlows(flows: FlowDefinition[], options: ToolOptions = {}): LogTool[] {
  return flows.flatMap((flow) => [flowTool(flow, false, options), flowTool(flow, true, options)]);
}

export function flowOfTool(flows: FlowDefinition[], name: string): { flow: FlowDefinition; live: boolean } | null {
  for (const flow of flows) {
    if (toolName(flow.name) === name) return { flow, live: false };
    if (`${toolName(flow.name)}${LIVE_SUFFIX}` === name) return { flow, live: true };
  }
  return null;
}

export function flowArgv(flow: FlowDefinition, input: Record<string, unknown> | undefined, live = false): { ok: true; argv: string[]; live: boolean } | { ok: false; message: string } {
  const name = `${toolName(flow.name)}${live ? LIVE_SUFFIX : ""}`;
  const account = input?.account;
  if (typeof account !== "string" || !account) return { ok: false, message: `${name} needs account` };
  if (!live && input?.live === true) return { ok: false, message: `${name} never acts on Facebook: running it there is \`${toolName(flow.name)}${LIVE_SUFFIX}\`, only when matt asked (rule 8)` };
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
