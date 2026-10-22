import type { FlowDefinition } from "../../../browser/flow/index.ts";
import { toolName } from "../../../browser/flow/index.ts";
import type { LogTool } from "../types.ts";
import { TOOL_RESULT_SCHEMA } from "../types.ts";
import { rulesLine } from "./agentRules.ts";

export function toolsFromFlows(flows: FlowDefinition[]): LogTool[] {
  return flows.map((flow) => {
    const properties: Record<string, unknown> = {
      account: { type: "string", description: "The account (`log facebook accounts` lists them)" },
    };
    for (const p of flow.params) properties[p.name] = { type: "string", description: `${p.description}${p.kind === "file" ? " (a URL or a local path)" : ""}` };
    properties.live = { type: "boolean", description: "Run it on Facebook. Without it the steps are listed and nothing opens." };
    properties.bypass = { type: "boolean", description: "Skip the waking-hours gate only (rule 20), when matt asked" };
    properties.now = { type: "boolean", description: "Skip the 10-minute launch gap only (rule 30)" };
    properties.proxyMs = { type: "integer", description: "This run's proxy speed limit to Facebook, in ms (default 2500, rule 33)" };
    properties.confirmLive = { type: "boolean", description: "Set true only when matt asked for this live run" };
    properties.confirmBypass = { type: "boolean", description: "Set true with bypass, only when matt asked for a run outside the account's hours (rule 20)" };
    return {
      name: toolName(flow.name),
      description: [
        `log flow run ${flow.name} --account <a> ${flow.params.map((p) => `--set ${p.name}=…`).join(" ")} [--live]`,
        flow.summary,
        `Steps: ${flow.steps.map((s) => s.id.replace(/^s\d+_/, "")).join(" → ")}. Every step is recorded (snapshot, screenshot, HAR, rea).`,
        "Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26).",
        rulesLine("flow"),
      ].join("\n"),
      inputSchema: { type: "object", properties, additionalProperties: false },
      outputSchema: TOOL_RESULT_SCHEMA,
    };
  });
}

export function flowArgv(flow: FlowDefinition, input: Record<string, unknown> | undefined): { ok: true; argv: string[]; live: boolean } | { ok: false; message: string } {
  const account = input?.account;
  if (typeof account !== "string" || !account) return { ok: false, message: `${toolName(flow.name)} needs account` };
  const argv = ["flow", "run", flow.name, "--account", account];
  for (const p of flow.params) {
    const value = input?.[p.name];
    if (typeof value !== "string" || !value) return { ok: false, message: `${toolName(flow.name)} needs ${p.name}` };
    argv.push("--set", `${p.name}=${value}`);
  }
  for (const flag of ["live", "bypass", "now"]) if (input?.[flag] === true) argv.push(`--${flag}`);
  if (typeof input?.proxyMs === "number") argv.push("--proxyMs", String(input.proxyMs));
  return { ok: true, argv, live: input?.live === true };
}
