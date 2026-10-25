import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { answersIssue, answerWait, createFlowMachine, fillStep, overlayOf, pageProblem, PRESSING_ACTIONS } from "../../../browser/flow/index.ts";
import { stepExchangesAt } from "../../../subq/stepReading/helpers/stepExchanges.ts";
import { clearCurrentInspect, writeCurrentInspect } from "../../../browser/inspect/index.ts";
import type { AnswerAccount, FlowActInput, FlowDefinition, FlowRunOutput, FlowStep, FlowStepResult } from "../../../browser/flow/index.ts";
import type { CurrentInspect, InspectAction, InspectStepResult } from "../../../browser/inspect/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import type { CommandContext } from "../../runner/types.ts";
import { browserFor } from "../../../browser/driver/index.ts";

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
  session: Promise<number>;
}

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

export async function clearOverlays(context: CommandContext, current: CurrentInspect, account: AnswerAccount): Promise<string | null> {
  let last: string | null = null;
  for (let round = 0; round < 4; round++) {
    const page = (await context.sendInspect(current, "pageText", [], 60_000)) as (InspectStepResult & { text?: string }) | null;
    const overlay = page ? overlayOf(page.url ?? "", page.text ?? "") : null;
    if (!overlay) return null;
    if (overlay.id === last) return `${overlay.id} is still over the page after ${overlay.key}`;
    context.err(`flow: ${overlay.id} is over the page: pressing ${overlay.key}`);
    const pressed = await context.sendInspect(current, "press", [overlay.key], 60_000, answerWait(overlay.answers));
    if (!pressed?.folder) return `${overlay.id}: no reply to ${overlay.key}`;
    const wrong = overlay.answers.length ? answersIssue(overlay.answers, stepExchangesAt(pressed.folder), account) : null;
    if (wrong) return `${overlay.id}: ${wrong.text}`;
    last = overlay.id;
  }
  return "overlays kept coming back after 4 presses";
}

export async function runFlowInSession(
  context: CommandContext,
  current: CurrentInspect,
  flow: FlowDefinition,
  filled: Record<string, string>,
  options: { skip?: (step: FlowStep) => boolean; onStep?: (step: FlowStep, result: FlowStepResult) => void; account?: AnswerAccount } = {},
): Promise<FlowRunOutput> {
  const steps = options.skip ? flow.steps.filter((s) => !options.skip!(s)) : flow.steps;
  let overlaysChecked = false;
  const machine = createFlowMachine({ ...flow, steps }).provide({
    actors: {
      act: fromPromise<FlowStepResult, FlowActInput>(async ({ input }) => {
        const step = fillStep(input.step, filled);
        if (!overlaysChecked && PRESSING_ACTIONS.has(step.action)) {
          overlaysChecked = true;
          const blocked = await clearOverlays(context, current, options.account ?? { uid: filled.uid });
          if (blocked) {
            const result: FlowStepResult = { id: step.id, ok: false, issue: "overlayNotCleared", error: `overlayNotCleared: ${blocked}` };
            options.onStep?.(step, result);
            return result;
          }
        }
        const { action, args } = commandFor(step);
        const reply = await context.sendInspect(current, action, args, 240_000, step.expect ? { name: step.expect, ms: 45_000 } : answerWait(step.answers), step.within ? { within: step.within } : undefined);
        let result: FlowStepResult = reply
          ? { id: step.id, ok: reply.ok !== false, error: reply.error, expectSeen: reply.expect?.seen, ms: (reply as { ms?: number }).ms, folder: reply.folder }
          : { id: step.id, ok: false, error: "no reply from the session" };
        const problem = reply ? pageProblem(step, reply) : null;
        if (problem) result = { ...result, ok: false, issue: problem.code, error: `${problem.code}: ${problem.detail}` };
        const wrong = result.ok && step.answers?.length && reply?.folder ? answersIssue(step.answers, stepExchangesAt(reply.folder), options.account ?? { uid: filled.uid }) : null;
        if (wrong) result = { ...result, ok: false, issue: wrong.code, error: `${wrong.code}: ${wrong.text}` };
        options.onStep?.(step, result);
        return result;
      }),
    },
  });
  const actor = createActor(machine, { inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  actor.start();
  return (await toPromise(actor)) as FlowRunOutput;
}
