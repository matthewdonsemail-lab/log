import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../../browser/inspect/index.ts";
import type { InspectAction } from "../../../browser/inspect/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import { DEFAULT_TRAFFIC_BUDGET_MB, meterForProxy, readTrafficLedger, recordTraffic, trafficBudget } from "../../../proxyVendor/traffic/index.ts";
import type { TrafficMeter } from "../../../proxyVendor/traffic/index.ts";
import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../../subq/decisions/index.ts";
import { FEED, feedPersonaMachine, postReadRequest, readReelRead } from "../../../facebook/warmup/activities/index.ts";
import type { ActivityStep, FeedLabel, ReelRead, StepReply } from "../../../facebook/warmup/activities/index.ts";
import { datasetsDir } from "../../../warmup/persona/index.ts";
import type { BehaviourProfile, PersonaPack } from "../../../warmup/persona/index.ts";
import type { InterestEffect } from "../../../warmup/viewer/index.ts";
import type { CommandContext, CommandResult } from "../../runner/types.ts";
import { DWELL_OVERHEAD_MS, frameOf } from "./personaRun.ts";

/** How long each feed step waits for the page, by step (none for a dwell): what the inspect timings showed. */
const SETTLE: Record<string, { quietMs: number; settleMaxMs: number }> = {
  goto: { quietMs: 500, settleMaxMs: 4000 },
  click: { quietMs: 300, settleMaxMs: 1500 },
  nextPost: { quietMs: 0, settleMaxMs: 0 },
  scrollComments: { quietMs: 0, settleMaxMs: 0 },
  scrollMarketplace: { quietMs: 0, settleMaxMs: 0 },
  openListings: { quietMs: 300, settleMaxMs: 1500 },
};

/** The session so far, for SubQ: the last 12 posts, whether theirs, the time and a like. Pure. */
export function feedSoFar(labels: FeedLabel[]): string {
  const read = labels.filter((l) => l.plan);
  if (!read.length) return "The first post of the session.";
  return `${read.length} post(s) so far: ${read.slice(-12).map((l) => `post ${l.index} ${l.read?.label ?? "unread"}${l.plan!.match ? " (theirs)" : ""}: ${(l.plan!.dwellMs / 1000).toFixed(1)} s${l.plan!.like ? ", liked" : ""}`).join("; ")}.`;
}

/**
 * `log facebook warmup feed run --persona` (rule 50): the account's home feed
 * read as its persona would, in its open browser (`feedPersonaMachine`). Each
 * post comes into view by the wheel, SubQ reads it, and the orderer plans a
 * glance or a read and a like; the time counts from when the post came into
 * view. Then Marketplace and a few listings. Every step is recorded (rules 22,
 * 29); each post's read and plan go to the run's `feedLabels.jsonl` and
 * `~/.logCli/datasets/feedLabels/<account>.jsonl`. The proxy's traffic is
 * metered by its provider (rule 51).
 */
export async function runFeedSession(
  context: CommandContext & { decisions?: DecisionsClient; trafficMeter?: TrafficMeter },
  account: string,
  persona: BehaviourProfile,
  pack: PersonaPack,
  effect: InterestEffect,
  options: { posts: number; seed: number; live: boolean; likes: boolean; trafficMb?: number; proxy?: string | null },
): Promise<CommandResult> {
  const current = readCurrentInspect(undefined, account);
  if (!current) return { code: 1, stderr: `log facebook warmup: no open browser for ${account}` };
  const meter = context.trafficMeter ?? meterForProxy(options.proxy);
  const budget = trafficBudget(readTrafficLedger(), account, context.now?.() ?? new Date(), options.trafficMb ?? DEFAULT_TRAFFIC_BUDGET_MB);
  if (meter && budget.leftMb <= 0) return { code: 1, stderr: `log facebook warmup: trafficBudgetSpent: ${account} used ${budget.usedMb} MB of its ${budget.budgetMb} MB proxy traffic in the last 24 hours (~/.logCli/proxyTraffic.jsonl).` };
  let startMb = 0;
  if (meter) {
    try {
      startMb = await meter();
    } catch (error) {
      return { code: 1, stderr: `log facebook warmup: trafficUnmeasured: ${(error as Error).message}` };
    }
    context.err(`Proxy traffic: ${budget.usedMb} MB used in the last 24 hours, ${budget.leftMb} MB left of ${budget.budgetMb} MB.`);
  } else context.err("Proxy traffic: a static IP (its traffic is in its price), not metered.");

  const steps: Record<string, ActivityStep> = {};
  for (const step of FEED.steps) steps[step.id] ??= step;
  const decisions = context.decisions ?? createDecisionsClient();
  const labelsPath = join(current.runDir, "feedLabels.jsonl");
  const curatedDir = join(datasetsDir(), "feedLabels");
  mkdirSync(curatedDir, { recursive: true });
  let tokens = 0;
  let calls = 0;
  let landedAt = Date.now();

  const machine = feedPersonaMachine.provide({
    actors: {
      act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
        const { step } = input;
        let args = step.args;
        if (step.id === "onPost") {
          // The time on a post counts from when it came into view: SubQ's read and the step's own cost come off it.
          const target = Number(step.args[0]) * 1000;
          const remaining = target - (Date.now() - landedAt) - DWELL_OVERHEAD_MS;
          if (remaining < 100) {
            context.err(`  → on the post ${(target / 1000).toFixed(1)} s: already up, on to the next`);
            return { ok: true };
          }
          args = [(remaining / 1000).toFixed(2)];
        }
        context.err(`  → ${step.id}: ${step.action} ${args.join(" ")}  (${step.why})`);
        // A post step doesn't wait for the network to go quiet (the feed's images and videos keep it busy, and
        // the wait made each post crawl, run 20261020T103516); rea still reads every step, without holding it up.
        // Settled on what each step needs, never on the network going quiet (Facebook's never does): measured by
        // hand on Reading (inspect 20261020T103913), a page open waited 18-20 s for quiet, a click 6-9 s, a
        // scroll 9 s, where the page itself was ready in seconds.
        const quick = SETTLE[step.id] ?? (step.action === "goto" ? SETTLE.goto : step.action === "dwell" ? undefined : SETTLE.click);
        const sent = Date.now();
        const reply = await context.sendInspect(current, step.action as InspectAction, args, 180_000, undefined, { reaLater: true, ...quick, ...(step.optional ? { findMs: 1500 } : {}) });
        if (!reply) return { ok: false, error: `no reply from the open browser in 180 s (${current.runDir})` };
        // Every step timed, live (matt: "time everything"): its own time in the browser, and the round trip.
        context.err(`    ${reply.ok === false ? "✗" : "✓"} ${step.id} ${reply.ms ?? "?"} ms in the browser, ${Date.now() - sent} ms round trip${reply.error ? `: ${reply.error}` : ""}`);
        const snapshotPath = reply.folder ? join(reply.folder, "snapshot.yml") : null;
        if (step.id === "nextPost") landedAt = Date.now();
        return { ok: reply.ok !== false, error: reply.error, url: reply.url, folder: reply.folder, post: reply.post, snapshot: snapshotPath && existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : undefined };
      }),
      read: fromPromise<ReelRead, { account: string; index: number; frame: string | null; post: NonNullable<StepReply["post"]>; labels: FeedLabel[] }>(async ({ input }) => {
        const frame = input.frame ? frameOf(input.frame) : null;
        if (!frame) throw new Error("no frame of this post to send");
        const asked = Date.now();
        const read = readReelRead(await decisions(postReadRequest(pack, persona.summary, frame, { heading: input.post.heading, text: input.post.text, images: input.post.images, sessionSoFar: feedSoFar(input.labels), allowLike: options.live && options.likes, allowComments: options.live })));
        tokens += read.inputTokens;
        calls++;
        context.err(`  ? post ${input.index} ("${input.post.heading.slice(0, 50)}", ${input.post.words} words): SubQ read ${read.label} (${read.labelConfidence.toFixed(2)}), theirs ${read.interest.toFixed(2)}, pick ${read.pick}  [${read.inputTokens} tokens, ${((Date.now() - asked) / 1000).toFixed(1)} s]`);
        return read;
      }),
    },
  });
  const run = createActor(machine, { input: { account, posts: options.posts, seed: options.seed, live: options.live, likes: options.likes, steps, pack, effect }, inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  let written = 0;
  run.subscribe((snapshot) => {
    // Each post's read and plan as it is made (rule 26).
    for (const label of snapshot.context.labels.slice(written)) {
      const line = `${JSON.stringify({ at: new Date().toISOString(), account, personaId: pack.personaId, ...label })}\n`;
      appendFileSync(labelsPath, line);
      appendFileSync(join(curatedDir, `${account}.jsonl`), line);
      const p = label.plan;
      context.err(p ? `  = post ${label.index}: ${p.match ? "THEIRS" : "not theirs"}${label.read ? "" : " (SubQ didn't answer)"}; ${(p.dwellMs / 1000).toFixed(1)} s (${p.from}); like ${p.likeScore}${p.like ? `: LIKE${p.closeCall ? " (close call, SubQ's pick)" : ""}` : ""}` : `  = post ${label.index}: none in view (scrolled for more)`);
    }
    written = snapshot.context.labels.length;
  });
  run.start();
  const output = await toPromise(run);
  let runMb = 0;
  if (meter) {
    try {
      runMb = Math.round(((await meter()) - startMb) * 100) / 100;
    } catch {
      context.err("  ⧗ proxy traffic: the counter couldn't be read at the end");
    }
    recordTraffic({ at: new Date().toISOString(), account, run: `warmup facebook feed ${current.runDir.split(/[\\/]/).pop()}`, mb: runMb });
  }
  const read = output.labels.filter((l) => l.plan);
  const theirs = read.filter((l) => l.plan!.match);
  const issues = output.outcomes.filter((o) => !o.ok);
  const lines = [
    `log facebook warmup feed run --persona: ${output.blocked ? `blocked: ${output.blocked.code}` : output.ok ? "the session ran to its end" : `stopped: ${output.problem}`}.`,
    `  ${read.length} posts read for ${pack.personaId} (into ${pack.interests.join(", ") || "nothing named"}); ${theirs.length} theirs, ${read.filter((l) => l.plan!.like).length} liked; SubQ read ${calls}, ${tokens} input tokens.`,
    `  Steps: ${output.outcomes.length}, ${issues.length} didn't do what they should${issues.length ? `: ${issues.map((o) => `${o.id} (${o.issue ?? o.error})`).join("; ")}` : ""}.`,
    meter ? `  Proxy traffic: ${runMb} MB this run.` : "  Proxy traffic: a static IP, not metered.",
    `  ${labelsPath}`,
  ];
  return { code: output.ok ? 0 : 1, stdout: lines.join("\n") };
}
