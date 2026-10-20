/**
 * `log warmup` (rule 35): Listaro's five warm-up activities, recorded once in a
 * headed inspect session, turned into flows, and run in one browser that stays
 * open, with every step in the activity feed.
 *
 *   log warmup plan                          each activity: its script, its flow, recorded or not
 *   log warmup record --account <a> [--only a,b] [--likes] [--bypass] [--now]
 *       one headed session: sends each activity's script (snapshot, screenshot,
 *       HAR and rea per step), then turns each activity's steps into its flow
 *   log warmup run --account <a> [--only a,b] [--likes] [--gapMinutes <n>] [--bypass] [--now]
 *       one headed session: the warm-up machine runs each recorded flow in turn
 *   log warmup feed [--account <a>] [--lines <n>] [--follow [--seconds <n>]]
 *
 * The likes (`clickAny button ^Like$`) act on Facebook: they are skipped unless
 * --likes (rule 8). Everything else only reads.
 */
import { createActor, fromPromise, toPromise } from "xstate";
import { flowFromRecording, loadFlow, pageProblem, readRecordedCommands, saveFlow, writeFlowDoc } from "../../camofox/flow/index.ts";
import type { ErrorCode } from "../../errors/catalog/index.ts";
import { recordAccountIssue } from "../../marketplace/replacement/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { ACTIVITY_SCRIPTS, appendFeed, feedPath, pickActivities, readFeed, renderFeedLine, SCRIPTS_IN_ORDER, warmupMachine } from "../../marketplace/warmup/index.ts";
import type { ActivityOutcome, FeedLine, WarmupActivity } from "../../marketplace/warmup/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { openInspectSession, runFlowInSession } from "../flow/helpers/index.ts";
import { openAccount, withRun } from "../live/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { WARMUP_PLATFORMS } from "../../warmup/facebook/index.ts";
import { PLATFORM_USAGE, runPlatformActivity } from "./helpers/index.ts";

export const WARMUP_USAGE = [
  "Usage: log warmup plan",
  "       log warmup record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]",
  "       log warmup run --account <accountName> [--only …] [--likes] [--gapMinutes <n>] [--bypass] [--now]",
  "       log warmup feed [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]",
  PLATFORM_USAGE,
].join("\n");

/** The run's own name in the feed: its folder. */
const runName = (dir: string) => dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;

function feed(context: CommandContext, line: Omit<FeedLine, "at">): void {
  const full = { at: new Date().toISOString(), ...line };
  appendFeed(full);
  context.err(`feed ${renderFeedLine(full)}`);
}

export const warmupCommand: Command = {
  name: "warmup",
  summary: "The warm-up, by platform and activity (`log warmup facebook reel`: the browser opened primed with it, each step checked, the outline written, rule 49), and Listaro's five activities (record, run, feed, rule 36)",
  args: "<platform> <activity> [plan|record|run] [--account <a>] [--live] [--likes] [--bypass] | <plan|record|run|feed> [--account <name>] [--only …] [--likes] [--gapMinutes n] [--follow]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["likes", "bypass", "now", "follow", "json", "live", "persona", "newPersona"], valued: ["account", "only", "gapMinutes", "lines", "seconds", "reels", "watch", "skip", "comments", "profile", "seed", "trafficMb"] });
    if (!parsed.ok) return { code: 1, stderr: `log warmup: ${parsed.error}\n${WARMUP_USAGE}` };
    const [sub] = parsed.positionals;
    // By platform (rule 49): `log warmup facebook reel [plan|record|run]`, one activity of the warm-up at a time.
    if ((WARMUP_PLATFORMS as readonly string[]).includes(sub ?? "")) return runPlatformActivity(context, parsed.positionals, parsed.flags);
    const flags = parsed.flags;

    if (sub === "plan") {
      const lines = ["The warm-up: Listaro's five activities, in its stage order (account-warmup.ts). Record once with `log warmup record`, run with `log warmup run`."];
      for (const script of SCRIPTS_IN_ORDER) {
        const flow = loadFlow(script.flow);
        lines.push(`\n${script.activity} → flow ${script.flow}: ${flow ? `recorded (${flow.steps.length} steps)` : "NOT RECORDED"}  [${script.source}]`);
        script.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s.action} ${s.args.join(" ")}${s.live ? "  (live: only with --likes)" : ""}  — ${s.why}`));
      }
      return { code: 0, stdout: lines.join("\n") };
    }

    if (sub === "feed") return showFeed(context, flags);

    if (sub !== "record" && sub !== "run") return { code: 1, stderr: `log warmup: pick plan, record, run or feed\n${WARMUP_USAGE}` };
    const picked = pickActivities(typeof flags["only"] === "string" ? flags["only"] : undefined);
    if (!picked.ok) return { code: 1, stderr: `log warmup: ${picked.error}` };
    if (sub === "run") {
      const missing = picked.activities.filter((a) => !loadFlow(ACTIVITY_SCRIPTS[a].flow));
      if (missing.length) {
        return { code: 1, stderr: `log warmup: flowNotRecorded: ${missing.map((a) => ACTIVITY_SCRIPTS[a].flow).join(", ")} not recorded yet. Record them first, headed: log warmup record --account <a> --only ${missing.join(",")}` };
      }
    }
    const gapMinutes = flags["gapMinutes"] === undefined ? 150 : Number(flags["gapMinutes"]);
    if (!Number.isFinite(gapMinutes) || gapMinutes < 0 || gapMinutes > 600) return { code: 1, stderr: "log warmup: --gapMinutes must be 0 to 600" };

    const opened = await openAccount(context, "warmup", WARMUP_USAGE, flags["account"], "run", Boolean(flags["bypass"]), true, Boolean(flags["now"]));
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    return withRun(context, "warmup", account, run, async () => {
      const session = await openInspectSession(context, account, run);
      if ("error" in session) return { code: 1, stderr: `log warmup: ${session.error}` };
      const name = runName(session.current.runDir);
      const base = { account: account.accountName, run: name };
      feed(context, { ...base, event: "start", detail: `${sub} ${picked.activities.join(", ")}${flags["likes"] ? " (likes on)" : " (no likes)"}` });
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
  },
};

/** Sends each activity's script to the open session, then turns each activity's recorded steps into its flow. */
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
    feed(context, { ...base, event: "activity", activity, detail: `recording (${script.source})` });
    const from = sent;
    for (const step of script.steps) {
      if (step.live && !likes) {
        feed(context, { ...base, event: "step", activity, step: `${step.action} ${step.args.join(" ")}`, detail: "skipped: a like acts on Facebook, record with --likes (rule 8)" });
        continue;
      }
      const reply = await context.sendInspect(current, step.action, step.args, 300_000);
      sent++;
      // Where the page really is, after every step: never record a lock page as the feed (Erie, 2026-10-19).
      const problem = reply ? pageProblem({ action: step.action, url: step.action === "goto" ? step.args[0] : undefined }, reply) : null;
      const ok = Boolean(reply && reply.ok !== false && !problem);
      feed(context, { ...base, event: "step", activity, step: `${step.action} ${step.args.join(" ")}`, ok, detail: ok ? step.why : problem ? `${problem.code}: ${problem.detail}` : (reply?.error ?? "no reply") });
      if (problem) {
        await accountIssue(context, account, problem.code, problem.detail, base, activity);
        return { code: 1, stderr: `log warmup record: ${problem.code}: ${problem.detail} (${current.runDir}). Nothing was turned into a flow.` };
      }
      if (!ok) {
        feed(context, { ...base, event: "stopped", activity, ok: false, detail: "a step failed: nothing is turned into a flow from a broken recording" });
        return { code: 1, stderr: `log warmup record: ${activity} failed at ${step.action} ${step.args.join(" ")}: ${reply?.error ?? "no reply"} (${current.runDir})` };
      }
    }
    spans.push({ activity, from, to: sent });
  }
  const commands = readRecordedCommands(current.runDir);
  const lines = [`Recorded ${activities.length} activit${activities.length === 1 ? "y" : "ies"} in one browser (${current.runDir}):`];
  for (const span of spans) {
    const script = ACTIVITY_SCRIPTS[span.activity];
    const flow = flowFromRecording(script.flow, `Warm-up ${span.activity}: Listaro's ${script.source}, recorded on ${base.account} ${new Date().toISOString().slice(0, 10)} (rule 35).`, commands.slice(span.from, span.to), {
      runDir: current.runDir,
      account: base.account,
    });
    const files = [saveFlow(flow), writeFlowDoc(flow)];
    lines.push(`  ${span.activity} → ${flow.name}: ${flow.steps.length} steps (${files.join(", ")})`);
  }
  feed(context, { ...base, event: "done", detail: `recorded ${spans.map((s) => s.activity).join(", ")}` });
  lines.push("Run them: log warmup run --account <a> [--likes] [--gapMinutes <n>]");
  return { code: 0, stdout: lines.join("\n") };
}

/** The warm-up machine over the recorded flows, in the open session. */
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
        const flow = loadFlow(ACTIVITY_SCRIPTS[input.activity].flow)!;
        feed(context, { ...base, event: "activity", activity: input.activity, detail: `${flow.steps.length} steps` });
        const output = await runFlowInSession(context, current, flow, { uid: base.account }, {
          // The likes act on Facebook: only with --likes (rule 8).
          skip: (step) => step.action === "clickAny" && !likes,
          onStep: (step, result) => feed(context, { ...base, event: "step", activity: input.activity, step: step.id, ok: result.ok, detail: result.ok ? (step.args ?? [step.url ?? ""]).join(" ") : result.error }),
        });
        if (output.result === "done") {
          feed(context, { ...base, event: "gap", activity: input.activity, ok: true, detail: `done; next in ${Math.round(gapMs / 60_000)} min` });
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
  feed(context, { ...base, event: failure ? "stopped" : "done", ok: !failure, detail: failure ? `${failure.activity} at ${failure.failedAt ?? "?"}: ${failure.error ?? ""}` : `${output.done.length} activities` });
  const lines = [`Warm-up on ${base.account}: ${output.done.length}/${activities.length} activities done in one browser${failure ? `; stopped in ${failure.activity} at ${failure.failedAt}` : ""}.`, `Feed: log warmup feed --account ${base.account}   (${feedPath()})`];
  return { code: failure ? 1 : 0, stdout: lines.join("\n") };
}

/** The page showed an account problem: it goes to Twenty (the status `statusForIssue` gives) and to the feed. */
async function accountIssue(context: CommandContext, account: FacebookAccount, code: ErrorCode, detail: string, base: { account: string; run: string }, activity: WarmupActivity): Promise<void> {
  feed(context, { ...base, event: "stopped", activity, ok: false, detail: `${code}: ${detail}` });
  if (code === "pageNotReached") return;
  try {
    await recordAccountIssue(context.twenty, account, code, `seen in the warm-up (${activity}): ${detail}`);
  } catch (error) {
    context.err(`(could not update Twenty: ${error instanceof Error ? error.message : String(error)})`);
  }
}

async function showFeed(context: CommandContext, flags: Record<string, string | true>): Promise<CommandResult> {
  const account = typeof flags["account"] === "string" ? flags["account"] : undefined;
  const count = flags["lines"] === undefined ? 40 : Number(flags["lines"]);
  const lines = readFeed({ account, count });
  if (!flags["follow"]) return { code: 0, stdout: lines.length ? lines.map(renderFeedLine).join("\n") : "The warm-up feed is empty." };
  // --follow: the feed as it grows, line by line (rule 26), for --seconds or until stopped.
  for (const line of lines) context.out(renderFeedLine(line));
  let seen = readFeed({ account, count: 100_000 }).length;
  const until = flags["seconds"] === undefined ? Infinity : Date.now() + Number(flags["seconds"]) * 1000;
  while (Date.now() < until) {
    await new Promise((r) => setTimeout(r, 1000));
    const all = readFeed({ account, count: 100_000 });
    for (const line of all.slice(seen)) context.out(renderFeedLine(line));
    seen = all.length;
  }
  return { code: 0, stdout: "" };
}
