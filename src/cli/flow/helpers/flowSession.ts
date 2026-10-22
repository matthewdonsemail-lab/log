import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { createFlowMachine, fillStep, pageProblem } from "../../../browser/flow/index.ts";
import { clearCurrentInspect, writeCurrentInspect } from "../../../browser/inspect/index.ts";
import type { FlowActInput, FlowDefinition, FlowRunOutput, FlowStep, FlowStepResult } from "../../../browser/flow/index.ts";
import type { CurrentInspect, InspectAction } from "../../../browser/inspect/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import type { CommandContext } from "../../runner/types.ts";
import { browserFor } from "../../../browser/driver/index.ts";

/** A filled flow step → the inspect session's command. */
export function commandFor(step: FlowStep): { action: InspectAction; args: string[] } {
  switch (step.action) {
    case "goto":
      return { action: "goto", args: [step.url!] };
    case "click":
      return { action: "clickRole", args: [step.role!, step.name!] };
    case "fill":
      return { action: "fillRole", args: [step.role!, step.name!, step.value!] };
    case "upload":
      return { action: "uploadRole", args: [step.role!, step.name!, step.value!] };
    case "setLocation":
      return { action: "setLocation", args: [step.value!] };
    case "scroll":
    case "openAny":
    case "clickAny":
    case "dwell":
    case "press":
    case "scrollIn":
      return { action: step.action, args: step.args ?? [] };
    default:
      return { action: step.action, args: [] };
  }
}

export interface OpenSession {
  current: CurrentInspect;
  /** Resolves with the session's exit code when the browser closes. */
  session: Promise<number>;
}

/**
 * One gated, headed inspect session for the account's prepared run (the same
 * launch every run gets), waited on until the browser is ready. Every step sent
 * to it is recorded: snapshot, screenshot, its own HAR, rea's reading.
 */
export async function openInspectSession(
  context: CommandContext,
  account: { id: string; accountName: string; browserDriver?: string | null; adsPowerProfileId?: string | null },
  run: { statePath: string; proxyPath: string; devicePath: string | null; captureDir: string | null; loginPath: string | null },
): Promise<OpenSession | { error: string }> {
  const runDir = dirname(run.captureDir!);
  const current = { account: account.accountName, runDir, commandsPath: join(runDir, "commands.jsonl"), repliesPath: join(runDir, "replies.jsonl"), startedAt: new Date().toISOString() };
  const session = context.inspectSession({
    accountId: account.id,
    storageStatePath: run.statePath,
    proxyPath: run.proxyPath,
    devicePath: run.devicePath,
    captureDir: run.captureDir!,
    commandsPath: current.commandsPath,
    repliesPath: current.repliesPath,
    loginPath: run.loginPath,
    startUrl: null,
    browser: browserFor(account),
  });
  // Listed with the other open sessions, so `log inspect do --account` and `inspect sessions` see it.
  writeCurrentInspect(current);
  let ended = false;
  void session.then(() => {
    ended = true;
    clearCurrentInspect(undefined, account.accountName);
  });
  const deadline = Date.now() + 180_000;
  while (!(existsSync(current.repliesPath) && readFileSync(current.repliesPath, "utf8").includes('"id": "ready"'))) {
    if (ended || Date.now() > deadline) return { error: `the browser never became ready (${runDir})` };
    await new Promise((r) => setTimeout(r, 300));
  }
  return { current, session };
}

/**
 * Runs one flow's machine in an open session: each step goes to the session
 * and waits for its reply (and its confirming request). `skip` drops steps,
 * e.g. the warm-up's likes without --likes. `onStep` sees every result.
 */
export async function runFlowInSession(
  context: CommandContext,
  current: CurrentInspect,
  flow: FlowDefinition,
  filled: Record<string, string>,
  options: { skip?: (step: FlowStep) => boolean; onStep?: (step: FlowStep, result: FlowStepResult) => void } = {},
): Promise<FlowRunOutput> {
  const steps = options.skip ? flow.steps.filter((s) => !options.skip!(s)) : flow.steps;
  const machine = createFlowMachine({ ...flow, steps }).provide({
    actors: {
      act: fromPromise<FlowStepResult, FlowActInput>(async ({ input }) => {
        const step = fillStep(input.step, filled);
        const { action, args } = commandFor(step);
        const reply = await context.sendInspect(current, action, args, 240_000, step.expect ? { name: step.expect, ms: 45_000 } : undefined);
        let result: FlowStepResult = reply
          ? { id: step.id, ok: reply.ok !== false, error: reply.error, expectSeen: reply.expect?.seen, ms: (reply as { ms?: number }).ms, folder: reply.folder }
          : { id: step.id, ok: false, error: "no reply from the session" };
        // Where the page really is: a checkpoint, a login or the wrong page stops the flow here (pageProblem).
        const problem = reply ? pageProblem(step, reply) : null;
        if (problem) result = { ...result, ok: false, issue: problem.code, error: `${problem.code}: ${problem.detail}` };
        options.onStep?.(step, result);
        return result;
      }),
    },
  });
  const actor = createActor(machine, { inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  actor.start();
  return (await toPromise(actor)) as FlowRunOutput;
}
