/**
 * `log flow` (rule 31): a recorded `log inspect` run → a flow definition →
 * its documentation → an XState machine that runs it on any account → an
 * MCP tool of its own.
 *
 *   log flow fromInspect <runDir> --name <n> [--summary <s>] [--rename text1=firstName]...
 *   log flow docs <name>          docs/platforms/facebook/flows/<name>.md from the definition
 *   log flow list | show <name>
 *   log flow run <name> --account <a> [--set firstName=…]... [--live] [--bypass] [--now]
 *
 * A run without --live prints the steps with their values and opens nothing.
 * With --live it opens one gated, headed Camoufox (the inspect session, so
 * every step is recorded with its snapshot, screenshot, HAR and rea reading),
 * runs the machine, and maps the new recording.
 */
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { createFlowMachine, fillStep, flowFromRecording, listFlows, loadFlow, readRecordedCommands, saveFlow, toolName, writeFlowDoc } from "../../browser/flow/index.ts";
import type { FlowActInput, FlowDefinition, FlowRunOutput, FlowStep, FlowStepResult } from "../../browser/flow/index.ts";
import type { InspectAction } from "../../browser/inspect/index.ts";
import { preparePhotos } from "../../media/photo/index.ts";
import { fetchProxyUrl } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { mapInspectRun } from "../../rea/inspectMap/index.ts";
import { openAccount, withRun } from "../live/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import { openInspectSession, runFlowInSession } from "./helpers/index.ts";

export * from "./helpers/index.ts";
import type { Command, CommandResult } from "../runner/types.ts";

export const FLOW_USAGE = [
  "Usage: log flow fromInspect <runDir> --name <name> [--summary <text>] [--rename text1=firstName]...",
  "       log flow docs <name> | list | show <name>",
  "       log flow run <name> --account <accountName> [--set <param>=<value>]... [--live] [--bypass] [--now] [--json]",
].join("\n");

/** `--set a=b --set c=d` and `--rename x=y`, repeated: taken out before parseArgs, which keeps one value per flag. */
export function takePairs(argv: string[], flag: string): { pairs: Record<string, string>; rest: string[] } {
  const pairs: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const value = token === `--${flag}` ? argv[++i] : token.startsWith(`--${flag}=`) ? token.slice(flag.length + 3) : null;
    if (value === null) {
      rest.push(token);
      continue;
    }
    const eq = value?.indexOf("=") ?? -1;
    if (eq > 0) pairs[value.slice(0, eq)] = value.slice(eq + 1);
  }
  return { pairs, rest };
}

function describe(step: FlowStep): string {
  if (step.action === "goto") return `goto ${step.url}`;
  if (step.args?.length) return `${step.action} ${step.args.join(" ")}`;
  if (step.role) return `${step.action} ${step.role} "${step.name}"${step.value ? ` = ${step.action === "upload" ? basename(step.value) : step.value}` : ""}`;
  return step.action;
}

function renderRun(flow: FlowDefinition, output: FlowRunOutput, runDir: string): string {
  const lines = [`Flow ${flow.name}: ${output.result}${output.failedAt ? ` at ${output.failedAt}` : ""}`];
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.id}${step.expectSeen === false ? " (confirming request not seen)" : ""}${step.ms ? ` ${step.ms} ms` : ""}${step.error ? `: ${step.error}` : ""}`);
  lines.push(`  Recording: ${runDir}/steps (each step's snapshot, screenshot, HAR, rea), flow.md and machine.json beside it`);
  return lines.join("\n");
}

async function runFlow(context: Parameters<Command["run"]>[0], flow: FlowDefinition, values: Record<string, string>, flags: Record<string, string | true>): Promise<CommandResult> {
  const missing = flow.params.filter((p) => !(p.name in values)).map((p) => p.name);
  if (missing.length) return { code: 1, stderr: `log flow: ${flow.name} needs ${missing.map((m) => `--set ${m}=…`).join(" ")}` };
  const uid = typeof flags["account"] === "string" ? flags["account"] : "";
  const filled: Record<string, string> = { ...values, uid };
  if (!flags["live"]) {
    const lines = [`Flow ${flow.name} (dry run: nothing opens). With --live it runs:`];
    flow.steps.forEach((step, i) => lines.push(`  ${i + 1}. ${describe(fillStep(step, filled))}${step.expect ? `  → waits for ${step.expect}` : ""}`));
    return { code: 0, stdout: lines.join("\n") };
  }
  const opened = await openAccount(context, "flow", FLOW_USAGE, flags["account"], "connect", Boolean(flags["bypass"]), true, Boolean(flags["now"]));
  if (!("run" in opened)) return opened;
  const { account, run } = opened;
  const runDir = dirname(run.captureDir!);
  return withRun(context, "flow", account, run, async () => {
    // File params are varied and fetched through the account's proxy, never from this machine (`media/photo`).
    const fileParams = flow.params.filter((p) => p.kind === "file");
    if (fileParams.length) {
      const prepared = await preparePhotos(fileParams.map((p) => values[p.name]), { dir: join(runDir, "photos"), proxy: fetchProxyUrl(account.proxy) });
      if (!prepared.ok) return { code: 1, stderr: `log flow: ${prepared.code} ${prepared.detail}` };
      fileParams.forEach((p, i) => (filled[p.name] = prepared.photos[i].path));
    }
    filled.uid = account.accountName;
    const opened = await openInspectSession(context, account, run);
    if ("error" in opened) return { code: 1, stderr: `log flow: ${opened.error}` };
    const { current, session } = opened;
    context.err(`Flow ${flow.name} on ${account.accountName}: ${flow.steps.length} steps, recorded in ${runDir}`);
    const output = await runFlowInSession(context, current, flow, filled);
    await context.sendInspect(current, "stop", [], 30_000);
    await session;
    try {
      mapInspectRun(runDir);
    } catch {
      // the map is a reading aid; the run's own result stands
    }
    if (flags["json"]) return { code: output.result === "done" ? 0 : 1, stdout: JSON.stringify(output, null, 2) };
    return { code: output.result === "done" ? 0 : 1, stdout: renderRun(flow, output, runDir) };
  });
}

export const flowCommand: Command = {
  usage: FLOW_USAGE,
  name: "flow",
  summary: "Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31)",
  args: "fromInspect <runDir> --name <n> | docs <n> | list | show <n> | run <n> --account <a> [--set k=v]... [--live]",
  async run(context, argv) {
    const sets = takePairs(argv, "set");
    const renames = takePairs(sets.rest, "rename");
    const parsed = parseArgs(renames.rest, { boolean: ["live", "bypass", "now", "json"], valued: ["name", "summary", "account"] });
    if (!parsed.ok) return { code: 1, stderr: `log flow: ${parsed.error}\n${FLOW_USAGE}` };
    const [sub, target] = parsed.positionals;

    if (sub === "list") {
      const names = listFlows();
      return { code: 0, stdout: names.length ? names.map((n) => `${n}  (MCP tool ${toolName(n)})`).join("\n") : "No flows yet: log flow fromInspect <runDir> --name <n>" };
    }
    if (sub === "fromInspect") {
      if (!target || !existsSync(join(target, "replies.jsonl"))) return { code: 1, stderr: `log flow: ${target ?? "(none)"} is not an inspect run folder\n${FLOW_USAGE}` };
      const name = parsed.flags["name"];
      if (typeof name !== "string" || !/^[a-z][A-Za-z0-9]*$/.test(name)) return { code: 1, stderr: "log flow: --name must be camelCase (rule 1)" };
      const summary = typeof parsed.flags["summary"] === "string" ? parsed.flags["summary"] : `Recorded from ${basename(target)}.`;
      const account = basename(target).split("_").pop() ?? "";
      let flow: FlowDefinition;
      try {
        flow = flowFromRecording(name, summary, readRecordedCommands(target), { runDir: target, account }, renames.pairs);
      } catch (error) {
        return { code: 1, stderr: `log flow: ${error instanceof Error ? error.message : String(error)}` };
      }
      const files = [saveFlow(flow), writeFlowDoc(flow)];
      const lines = [`Flow ${name}: ${flow.steps.length} steps, params ${flow.params.map((p) => p.name).join(", ") || "none"}`];
      flow.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${describe(s)}${s.expect ? `  → ${s.expect}` : ""}`));
      lines.push(...files.map((f) => `  wrote ${f}`), `  MCP tool: ${toolName(name)}`);
      return { code: 0, stdout: lines.join("\n") };
    }
    const flow = target ? loadFlow(target) : null;
    if (!flow) return { code: 1, stderr: `log flow: no flow "${target ?? ""}" (log flow list)\n${FLOW_USAGE}` };
    if (sub === "show") return { code: 0, stdout: JSON.stringify(flow, null, 2) };
    if (sub === "docs") return { code: 0, stdout: `wrote ${writeFlowDoc(flow)}` };
    if (sub === "run") return runFlow(context, flow, sets.pairs, parsed.flags);
    return { code: 1, stderr: `log flow: expected fromInspect, docs, list, show or run\n${FLOW_USAGE}` };
  },
};
