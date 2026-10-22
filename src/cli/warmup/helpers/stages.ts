import { createActor, fromPromise, toPromise } from "xstate";
import { FLOWS_DIR, flowFromRecording, loadFlow, pageProblem, readRecordedCommands, saveFlow, writeFlowDoc } from "../../../browser/flow/index.ts";
import type { ErrorCode } from "../../../errors/catalog/index.ts";
import { recordAccountIssue } from "../../../marketplace/replacement/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import { ACTIVITY_SCRIPTS, appendStageLog, pickActivities, readStageLog, renderStageLogLine, SCRIPTS_IN_ORDER, stageLogPath, warmupMachine } from "../../../facebook/warmup/stages/index.ts";
import type { ActivityOutcome, StageLogLine, WarmupActivity } from "../../../facebook/warmup/stages/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import { openInspectSession, runFlowInSession } from "../../flow/helpers/index.ts";
import { openAccount, withRun } from "../../live/index.ts";
import type { CommandContext, CommandResult } from "../../runner/types.ts";

export const stagesDeps = { flowsDir: FLOWS_DIR };

export const STAGES_USAGE = [
  "       log facebook warmup stages plan",
  "       log facebook warmup stages record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]",
  "       log facebook warmup stages run --account <accountName> [--only …] [--likes] [--gapMinutes <n>] [--bypass] [--now]",
  "       log facebook warmup stages log [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]",
].join("\n");

const runName = (dir: string) => dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;

function stage(context: CommandContext, line: Omit<StageLogLine, "at">): void {
  const full = { at: new Date().toISOString(), ...line };
  appendStageLog(full);
  context.err(`stage ${renderStageLogLine(full)}`);
}

export async function runStages(context: CommandContext, sub: string | undefined, flags: Record<string, string | true>): Promise<CommandResult> {
  if (sub === "plan") {
    const lines = ["The warm-up: Listaro's five activities, in its stage order (account-warmup.ts). Record once with `log facebook warmup stages record`, run with `log facebook warmup stages run`."];
    for (const script of SCRIPTS_IN_ORDER) {
      const flow = loadFlow(script.flow, stagesDeps.flowsDir);
      lines.push(`\n${script.activity} → flow ${script.flow}: ${flow ? `recorded (${flow.steps.length} steps)` : "NOT RECORDED"}  [${script.source}]`);
      script.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s.action} ${s.args.join(" ")}${s.live ? "  (live: only with --likes)" : ""}  — ${s.why}`));
    }
    return { code: 0, stdout: lines.join("\n") };
  }

  if (sub === "log") return showStageLog(context, flags);

  if (sub !== "record" && sub !== "run") return { code: 1, stderr: `log facebook warmup stages: pick plan, record, run or log\n${STAGES_USAGE}` };
  const picked = pickActivities(typeof flags["only"] === "string" ? flags["only"] : undefined);
  if (!picked.ok) return { code: 1, stderr: `log facebook warmup: ${picked.error}` };
  if (sub === "run") {
    const missing = picked.activities.filter((a) => !loadFlow(ACTIVITY_SCRIPTS[a].flow, stagesDeps.flowsDir));
    if (missing.length) {
      return { code: 1, stderr: `log facebook warmup: flowNotRecorded: ${missing.map((a) => ACTIVITY_SCRIPTS[a].flow).join(", ")} not recorded yet. Record them first, headed: log facebook warmup stages record --account <a> --only ${missing.join(",")}` };
    }
  }
  const gapMinutes = flags["gapMinutes"] === undefined ? 150 : Number(flags["gapMinutes"]);
  if (!Number.isFinite(gapMinutes) || gapMinutes < 0 || gapMinutes > 600) return { code: 1, stderr: "log facebook warmup: --gapMinutes must be 0 to 600" };

  const opened = await openAccount(context, "warmup", STAGES_USAGE, flags["account"], "run", Boolean(flags["bypass"]), true, Boolean(flags["now"]));
  if (!("run" in opened)) return opened;
  const { account, run } = opened;
  return withRun(context, "warmup", account, run, async () => {
    const session = await openInspectSession(context, account, run);
    if ("error" in session) return { code: 1, stderr: `log facebook warmup: ${session.error}` };
    const name = runName(session.current.runDir);
    const base = { account: account.accountName, run: name };
    stage(context, { ...base, event: "start", detail: `${sub} ${picked.activities.join(", ")}${flags["likes"] ? " (likes on)" : " (no likes)"}` });
    let result: CommandResult;
    try {
      result = sub === "record"
        ? await record(context, session.current, picked.activities, Boolean(flags["likes"]), base, account)
        : await runWarmup(context, session.current, picked.activities, Boolean(flags["likes"]), gapMinutes * 60_000, base, account);
    } finally {
      await context.sendInspect(session.current, "stop", [], 30_000);
      await session.session;
    }
    return result;
  });
}

async function record(
  context: CommandContext,
  current: Parameters<CommandContext["sendInspect"]>[0],
  activities: WarmupActivity[],
  likes: boolean,
  base: { account: string; run: string },
  account: FacebookAccount,
): Promise<CommandResult> {
  const spans: { activity: WarmupActivity; from: number; to: number }[] = [];
  let sent = 0;
  for (const activity of activities) {
    const script = ACTIVITY_SCRIPTS[activity];
    stage(context, { ...base, event: "activity", activity, detail: `recording (${script.source})` });
    const from = sent;
    for (const step of script.steps) {
      if (step.live && !likes) {
        stage(context, { ...base, event: "step", activity, step: `${step.action} ${step.args.join(" ")}`, detail: "skipped: a like acts on Facebook, record with --likes (rule 8)" });
        continue;
      }
      const reply = await context.sendInspect(current, step.action, step.args, 300_000);
      sent++;
      const problem = reply ? pageProblem({ action: step.action, url: step.action === "goto" ? step.args[0] : undefined }, reply) : null;
      const ok = Boolean(reply && reply.ok !== false && !problem);
      stage(context, { ...base, event: "step", activity, step: `${step.action} ${step.args.join(" ")}`, ok, detail: ok ? step.why : problem ? `${problem.code}: ${problem.detail}` : (reply?.error ?? "no reply") });
      if (problem) {
        await accountIssue(context, account, problem.code, problem.detail, base, activity);
        const kept = saveFlows(current, spans, base);
        return { code: 1, stderr: `log facebook warmup record: ${problem.code}: ${problem.detail} (${current.runDir}). ${activity} isn't a flow${kept.length ? `; the activities before it are: ${kept.join("; ")}` : "; nothing before it was."}` };
      }
      if (!ok) {
        stage(context, { ...base, event: "stopped", activity, ok: false, detail: "a step failed: this activity isn't turned into a flow from a broken recording" });
        const kept = saveFlows(current, spans, base);
        return { code: 1, stderr: `log facebook warmup record: ${activity} failed at ${step.action} ${step.args.join(" ")}: ${reply?.error ?? "no reply"} (${current.runDir})${kept.length ? `. The activities before it are flows: ${kept.join("; ")}` : ""}` };
      }
    }
    spans.push({ activity, from, to: sent });
  }
  const lines = [`Recorded ${activities.length} activit${activities.length === 1 ? "y" : "ies"} in one browser (${current.runDir}):`, ...saveFlows(current, spans, base).map((l) => `  ${l}`)];
  stage(context, { ...base, event: "done", detail: `recorded ${spans.map((s) => s.activity).join(", ")}` });
  lines.push("Run them: log facebook warmup stages run --account <a> [--likes] [--gapMinutes <n>]");
  return { code: 0, stdout: lines.join("\n") };
}

function saveFlows(current: Parameters<CommandContext["sendInspect"]>[0], spans: { activity: WarmupActivity; from: number; to: number }[], base: { account: string; run: string }): string[] {
  const commands = readRecordedCommands(current.runDir);
  return spans.map((span) => {
    const script = ACTIVITY_SCRIPTS[span.activity];
    const flow = flowFromRecording(script.flow, `Warm-up ${span.activity}: Listaro's ${script.source}, recorded on ${base.account} ${new Date().toISOString().slice(0, 10)} (rule 35).`, commands.slice(span.from, span.to), {
      runDir: current.runDir,
      account: base.account,
    });
    const files = [saveFlow(flow, stagesDeps.flowsDir), writeFlowDoc(flow)];
    return `${span.activity} → ${flow.name}: ${flow.steps.length} steps (${files.join(", ")})`;
  });
}

async function runWarmup(
  context: CommandContext,
  current: Parameters<CommandContext["sendInspect"]>[0],
  activities: WarmupActivity[],
  likes: boolean,
  gapMs: number,
  base: { account: string; run: string },
  account: FacebookAccount,
): Promise<CommandResult> {
  const accountId = account.id;
  const machine = warmupMachine.provide({
    actors: {
      runActivity: fromPromise<ActivityOutcome, { accountId: string; activity: WarmupActivity }>(async ({ input }) => {
        const flow = loadFlow(ACTIVITY_SCRIPTS[input.activity].flow, stagesDeps.flowsDir)!;
        stage(context, { ...base, event: "activity", activity: input.activity, detail: `${flow.steps.length} steps` });
        const output = await runFlowInSession(context, current, flow, { uid: base.account }, {
          skip: (step) => step.action === "clickAny" && !likes,
          onStep: (step, result) => stage(context, { ...base, event: "step", activity: input.activity, step: step.id, ok: result.ok, detail: result.ok ? (step.args ?? [step.url ?? ""]).join(" ") : result.error }),
        });
        if (output.result === "done") {
          stage(context, { ...base, event: "gap", activity: input.activity, ok: true, detail: `done; next in ${Math.round(gapMs / 60_000)} min` });
          return { ok: true, steps: output.steps.length };
        }
        const last = output.steps.at(-1);
        return { ok: false, failedAt: output.failedAt, error: last?.error, issue: last?.issue };
      }),
    },
  });
  const actor = createActor(machine, { input: { accountId, activities, gapMs }, inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  actor.start();
  const output = await toPromise(actor);
  const failure = output.failure;
  if (output.blocked && failure?.issue) await accountIssue(context, account, failure.issue as ErrorCode, failure.error ?? "", base, failure.activity);
  stage(context, { ...base, event: failure ? "stopped" : "done", ok: !failure, detail: failure ? `${failure.activity} at ${failure.failedAt ?? "?"}: ${failure.error ?? ""}` : `${output.done.length} activities` });
  const lines = [`Warm-up on ${base.account}: ${output.done.length}/${activities.length} activities done in one browser${failure ? `; stopped in ${failure.activity} at ${failure.failedAt}` : ""}.`, `Stage log: log facebook warmup stages log --account ${base.account}   (${stageLogPath()})`];
  return { code: failure ? 1 : 0, stdout: lines.join("\n") };
}

async function accountIssue(context: CommandContext, account: FacebookAccount, code: ErrorCode, detail: string, base: { account: string; run: string }, activity: WarmupActivity): Promise<void> {
  stage(context, { ...base, event: "stopped", activity, ok: false, detail: `${code}: ${detail}` });
  if (code === "pageNotReached") return;
  try {
    await recordAccountIssue(context.twenty, account, code, `seen in the warm-up (${activity}): ${detail}`);
  } catch (error) {
    context.err(`(could not update Twenty: ${error instanceof Error ? error.message : String(error)})`);
  }
}

async function showStageLog(context: CommandContext, flags: Record<string, string | true>): Promise<CommandResult> {
  const account = typeof flags["account"] === "string" ? flags["account"] : undefined;
  const count = flags["lines"] === undefined ? 40 : Number(flags["lines"]);
  const lines = readStageLog({ account, count });
  if (!flags["follow"]) return { code: 0, stdout: lines.length ? lines.map(renderStageLogLine).join("\n") : "The stage log is empty." };
  for (const line of lines) context.out(renderStageLogLine(line));
  let seen = readStageLog({ account, count: 100_000 }).length;
  const until = flags["seconds"] === undefined ? Infinity : Date.now() + Number(flags["seconds"]) * 1000;
  while (Date.now() < until) {
    await new Promise((r) => setTimeout(r, 1000));
    const all = readStageLog({ account, count: 100_000 });
    for (const line of all.slice(seen)) context.out(renderStageLogLine(line));
    seen = all.length;
  }
  return { code: 0, stdout: "" };
}
