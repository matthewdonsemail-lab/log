import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../../camofox/inspect/index.ts";
import type { InspectAction, InspectStepOptions } from "../../../camofox/inspect/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import type { DecisionImage, DecisionsClient } from "../../../subq/decisions/index.ts";
import { readReelRead, REEL, reelCaption, reelPersonaMachine, reelReadRequest } from "../../../warmup/facebook/index.ts";
import type { ActivityStep, AllowedActions, ReelLabel, ReelRead, StepReply } from "../../../warmup/facebook/index.ts";
import type { InterestEffect } from "../../../warmup/viewer/index.ts";
import { DEFAULT_TRAFFIC_BUDGET_MB, meterForProxy, readTrafficLedger, recordTraffic, trafficBudget } from "../../../proxyVendor/traffic/index.ts";
import type { TrafficMeter } from "../../../proxyVendor/traffic/index.ts";
import { buildPersonaPack, datasetsDir, drawPersona, readDatasets, readPackDatasets } from "../../../warmup/persona/index.ts";
import type { BehaviourProfile, PackDatasets, PersonaPack } from "../../../warmup/persona/index.ts";
import type { ReelViewer } from "../../../warmup/viewer/index.ts";
import type { CommandContext, CommandResult } from "../../runner/types.ts";

/** `~/.logCli/personas/<account>.json`: one persona per account, kept from session to session. */
export function personaPath(account: string, env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_PERSONAS_DIR || join(homedir(), ".logCli", "personas"), `${account}.json`);
}

/** A seed from the account's name, so the first draw for an account is the same wherever it runs. Pure. */
export function seedOf(account: string): number {
  let h = 2166136261;
  for (const c of account) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** The account's persona: the one kept, else drawn now (and kept). `fresh` draws a new one (with `seed`, that one). */
export function personaFor(account: string, country: string, options: { fresh?: boolean; seed?: number } = {}): { persona: BehaviourProfile; drawn: boolean } {
  const path = personaPath(account);
  if (!options.fresh && existsSync(path)) return { persona: JSON.parse(readFileSync(path, "utf8")) as BehaviourProfile, drawn: false };
  const seed = options.seed ?? (options.fresh ? Math.floor(Math.random() * 2 ** 31) : seedOf(account));
  const persona = drawPersona(readDatasets(datasetsDir()), country, seed);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(persona, null, 2)}\n`);
  return { persona, drawn: true };
}

/** The persona in plain words, one line per field, with the rows it came from. Pure. */
export function describePersona(persona: BehaviourProfile): string[] {
  return [`Persona (seed ${persona.seed}, ${persona.country}): from ${persona.rows.map((r) => r.source).join(", ")}`, ...Object.entries(persona.summary).map(([k, v]) => `  ${k}: ${v}`)];
}

/** The real viewer in plain words: where from, and how they scroll. Pure. */
export function describeViewerLines(viewer: ReelViewer): string[] {
  const t = viewer.stats;
  const s = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
  return [
    `Real viewer: ${viewer.source} (${t.swipes} swipes, ${t.sessions} sessions, a median ${t.sessionSwipes} swipes each)`,
    `  plays: 10% by ${s(t.playMs[0])}, 25% by ${s(t.playMs[1])}, half by ${s(t.playMs[2])}, 75% by ${s(t.playMs[3])}, 90% by ${s(t.playMs[4])}; ${Math.round(t.under1s * 100)}% under 1 s, ${Math.round(t.under2s * 100)}% under 2 s`,
    `  comments ${Math.round(t.commentRate * 100)}% (median ${s(t.commentMs)}), profile ${Math.round(t.profileRate * 100)}%, likes ${Math.round(t.likeRate * 100)}%`,
  ];
}


/** The account's persona pack (`<account>.pack.json` beside the persona): built from the persona, its viewer and the datasets, and kept. */
export function packFor(account: string, persona: BehaviourProfile, viewer: ReelViewer, options: { fresh?: boolean; data?: PackDatasets } = {}): { pack: PersonaPack; built: boolean } {
  const path = personaPath(account).replace(/\.json$/, ".pack.json");
  if (!options.fresh && existsSync(path)) {
    const kept = JSON.parse(readFileSync(path, "utf8")) as PersonaPack;
    if (kept.personaId === `${viewer.source.replace(" ", "_")}_${persona.seed}`) return { pack: kept, built: false };
  }
  const pack = buildPersonaPack(persona, viewer, options.data ?? readPackDatasets());
  writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
  return { pack, built: true };
}

/** The pack in plain words: segment, traits, and the dataset behind each. Pure. */
export function describePack(pack: PersonaPack): string[] {
  const t = pack.traits;
  return [
    `Persona pack ${pack.personaId}: ${pack.segment}; ${t.ageBand} ${t.gender} ${t.occupation}; into ${pack.interests.join(", ") || "nothing the datasets name"}`,
    `  attention cap ${t.attentionCapS} s, completion ${t.completionP}, skip ${t.skipP}; per reel: like ${t.likeP}, comments ${t.commentP}, profile ${t.profileP}; ${t.sessionReels} reels a session; sponsored skipped ${t.adSkipP}`,
    ...pack.provenance.map((p) => `  · ${p}`),
  ];
}

/** The session so far, for SubQ: the last 12 reels, what each was, whether theirs, the watch and what was done. Pure. */
export function sessionSoFar(labels: ReelLabel[]): string {
  if (!labels.length) return "The first reel of the session.";
  const last = labels.slice(-12).map((l) => `reel ${l.reel} ${l.read?.label ?? "unread"}${l.plan.match ? " (theirs)" : ""}: ${(l.plan.watchMs / 1000).toFixed(1)} s${l.plan.action ? `, ${l.plan.action}` : ""}`);
  return `${labels.length} reel(s) so far this session: ${last.join("; ")}.`;
}

/** A step folder's screenshot as a SubQ image (PNG, at most 4 MiB decoded), or null. */
function frameOf(folder: string): DecisionImage | null {
  const path = join(folder, "screenshot.png");
  if (!existsSync(path) || statSync(path).size > 4 * 1024 * 1024) return null;
  return { mediaType: "image/png", base64: readFileSync(path).toString("base64") };
}

/** About what a dwell step costs beyond its sleep (its screenshot, snapshot and HAR): taken off the sleep. */
const DWELL_OVERHEAD_MS = 400;
/** Steps after which a new reel is on screen. */
const LANDS = new Set(["openReels", "unmute", "swipe"]);

/**
 * `log warmup facebook reel run --persona` (rule 50): a Reels session run by
 * the action orderer for the account's persona pack and its real viewer
 * (KuaiRand-1K), in its open browser: its For you feed built by engaging
 * with what it would. Each reel is read by SubQ from its frame the moment it
 * lands, then planned by the orderer; its watch is the viewer's next real
 * play, scaled by the measured interest effect, and counts from the landing.
 * Each reel's read and plan go to the run's `reelLabels.jsonl` and to
 * `~/.logCli/datasets/reelLabels/<account>.jsonl`; each reel's time on
 * screen is logged next to its planned watch.
 */
export async function runPersonaSession(
  context: CommandContext & { decisions?: DecisionsClient; trafficMeter?: TrafficMeter },
  account: string,
  persona: BehaviourProfile,
  viewer: ReelViewer,
  pack: PersonaPack,
  effect: InterestEffect,
  options: { reels: number; seed: number; live: boolean; likes: boolean; trafficMb?: number; proxy?: string | null },
): Promise<CommandResult> {
  const current = readCurrentInspect(undefined, account);
  if (!current) return { code: 1, stderr: `log warmup: no open browser for ${account}` };
  // Proxy traffic (matt, 2026-10-20): the account's budget for 24 hours, measured on its provider's counter before and
  // after (rule 51). A static IP's traffic is in its price, so it has no meter and no budget.
  const meter = context.trafficMeter ?? meterForProxy(options.proxy);
  const budget = trafficBudget(readTrafficLedger(), account, context.now?.() ?? new Date(), options.trafficMb ?? DEFAULT_TRAFFIC_BUDGET_MB);
  if (meter && budget.leftMb <= 0) return { code: 1, stderr: `log warmup: trafficBudgetSpent: ${account} used ${budget.usedMb} MB of its ${budget.budgetMb} MB proxy traffic in the last 24 hours (~/.logCli/proxyTraffic.jsonl).` };
  let startMb = 0;
  if (meter) {
    try {
      startMb = await meter();
    } catch (error) {
      return { code: 1, stderr: `log warmup: trafficUnmeasured: ${(error as Error).message}` };
    }
    context.err(`Proxy traffic: ${budget.usedMb} MB used in the last 24 hours, ${budget.leftMb} MB left of ${budget.budgetMb} MB; checked every 5 reels.`);
  } else context.err("Proxy traffic: a static IP (its traffic is in its price), not metered.");
  let runMb = 0;
  let swipes = 0;
  // The first definition of each id (REEL lists swipe and glance more than once).
  const steps: Record<string, ActivityStep> = {};
  for (const step of REEL.steps) steps[step.id] ??= step;
  const decisions = context.decisions ?? createDecisionsClient();
  const labelsPath = join(current.runDir, "reelLabels.jsonl");
  const curatedDir = join(datasetsDir(), "reelLabels");
  mkdirSync(curatedDir, { recursive: true });
  let tokens = 0;
  let calls = 0;
  let landedAt = Date.now();
  let lastReply: StepReply = { ok: true };
  let lastSwipeAt: number | null = null;
  // The creator's profile opened in its own tab: back to the reel closes it.
  let profileTab = false;
  const onScreen: number[] = [];

  const machine = reelPersonaMachine.provide({
    actors: {
      act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
        const { step } = input;
        let args = step.args;
        if (step.id === "watch") {
          // The watch counts from when the reel landed: a SubQ close call and the step's own cost come off it.
          const target = Number(step.args[0]) * 1000;
          const remaining = target - (Date.now() - landedAt) - DWELL_OVERHEAD_MS;
          if (remaining < 100) {
            context.err(`  → watch ${(target / 1000).toFixed(1)} s: already up, straight on`);
            return { ...lastReply, ok: true };
          }
          args = [(remaining / 1000).toFixed(2)];
        }
        if (meter && step.id === "swipe" && ++swipes % 5 === 0) {
          // Every 5 reels: what this run used so far; stop at the budget, before the next reel streams.
          try {
            runMb = Math.round(((await meter()) - startMb) * 100) / 100;
          } catch {
            // The counter couldn't be read this time: the next check, or the end, measures it.
          }
          context.err(`  ⧗ proxy traffic: ${runMb} MB this run, ${Math.round((budget.usedMb + runMb) * 100) / 100} of ${budget.budgetMb} MB in 24 hours`);
          if (budget.usedMb + runMb >= budget.budgetMb) return { ok: false, error: `trafficBudgetSpent: ${account} reached its ${budget.budgetMb} MB of proxy traffic for 24 hours (${runMb} MB this run)` };
        }
        if (step.id === "swipe") {
          const now = Date.now();
          if (lastSwipeAt !== null) onScreen.push(now - lastSwipeAt);
          lastSwipeAt = now;
        }
        // Back from a profile that opened in its own tab: close it and bring the reel's tab back, not a reload.
        let action = step.action as InspectAction;
        if (step.id === "backToReel" && profileTab) {
          action = "closeTab";
          args = [];
          profileTab = false;
        }
        context.err(`  → ${step.id}: ${action} ${args.join(" ")}  (${step.why})`);
        // rea reads each step at once, without holding up the next (its reading lands in the step's rea.json);
        // a swipe's recording waits only for the next reel's URL: a reel streams video and is never quiet.
        // The cursor rests on Next card through a reel's watch and swipe, as a hand that keeps pressing it.
        const stepOptions: InspectStepOptions = { reaLater: true, ...(step.id === "swipe" ? { urlChange: true, settleMaxMs: 3000, rest: true } : step.id === "watch" ? { rest: true } : step.id === "openProfile" ? { urlChange: true, settleMaxMs: 8000 } : step.id === "unmute" ? { already: ["button", "Mute"] } : {}) };
        const sentAt = Date.now();
        const reply = await context.sendInspect(current, action, args, 180_000, undefined, stepOptions);
        if (!reply) return { ok: false, error: `no reply from the open browser in 180 s (${current.runDir})` };
        const snapshotPath = reply.folder ? join(reply.folder, "snapshot.yml") : null;
        const out: StepReply = { ok: reply.ok !== false, error: reply.error, url: reply.url, folder: reply.folder, openedTab: reply.openedTab, snapshot: snapshotPath && existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : undefined };
        if (step.id === "openProfile" && reply.openedTab) profileTab = true;
        // The reel landed when its URL changed, not when the step's recording finished.
        if (LANDS.has(step.id)) landedAt = reply.landedMs !== undefined ? sentAt + reply.landedMs : Date.now();
        lastReply = out;
        return out;
      }),
      read: fromPromise<ReelRead, { account: string; reel: number; frame: string | null; labels: ReelLabel[]; allowed: AllowedActions }>(async ({ input }) => {
        const frame = input.frame ? frameOf(input.frame) : null;
        if (!frame) throw new Error("no frame of this reel to send");
        const snapshotPath = join(input.frame!, "snapshot.yml");
        const { creator, caption } = reelCaption(existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : "");
        const asked = Date.now();
        const read = readReelRead(await decisions(reelReadRequest(pack, persona.summary, frame, { caption, creator, sessionSoFar: sessionSoFar(input.labels), allowed: input.allowed })));
        tokens += read.inputTokens;
        calls++;
        context.err(`  ? reel ${input.reel}${creator ? ` (${creator}${caption ? `: ${caption.slice(0, 60)}` : ""})` : ""}: SubQ read ${read.label} (${read.labelConfidence.toFixed(2)}), theirs ${read.interest.toFixed(2)}, pick ${read.pick}  [${read.inputTokens} tokens, ${((Date.now() - asked) / 1000).toFixed(1)} s]`);
        return read;
      }),
    },
  });
  const run = createActor(machine, { input: { account, reels: options.reels, seed: options.seed, live: options.live, likes: options.likes, steps, viewer, pack, effect }, inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  let written = 0;
  run.subscribe((snapshot) => {
    // Each reel's plan as it is made (rule 26): the run's file and the account's curated feed.
    for (const label of snapshot.context.labels.slice(written)) {
      const line = `${JSON.stringify({ at: new Date().toISOString(), account, personaId: pack.personaId, segment: pack.segment, ...label })}\n`;
      appendFileSync(labelsPath, line);
      appendFileSync(join(curatedDir, `${account}.jsonl`), line);
      const p = label.plan;
      const scores = p.order.map((a) => `${a} ${p.scores[a]}`).join(", ");
      context.err(`  = reel ${label.reel}: ${p.match ? "THEIRS" : "not theirs"}${label.read ? "" : " (SubQ didn't answer)"}; watch ${(p.watchMs / 1000).toFixed(1)} s (${p.watchFrom}${p.capped ? ", capped" : ""}${p.adSkip ? ", sponsored: skipped" : ""}); scores ${scores}; eps ${p.eps}; ${p.action ? `do ${p.action}${p.closeCall ? ` (close call, by the ${p.closeCall.by})` : ""}, runner-up ${p.runnerUp}` : "no action"}`);
      if (onScreen.length) context.err(`    reel ${label.reel - 1} was on screen ${(onScreen.at(-1)! / 1000).toFixed(1)} s`);
    }
    written = snapshot.context.labels.length;
  });
  run.start();
  const output = await toPromise(run);
  if (meter) {
    try {
      runMb = Math.round(((await meter()) - startMb) * 100) / 100;
    } catch {
      context.err("  ⧗ proxy traffic: the counter couldn't be read at the end; the last check stands");
    }
    recordTraffic({ at: new Date().toISOString(), account, run: `warmup facebook reel ${current.runDir.split(/[\\/]/).pop()}`, mb: runMb });
  }
  const planned = output.labels.map((l) => l.plan.watchMs).sort((a, b) => a - b);
  const shown = [...onScreen].sort((a, b) => a - b);
  const med = (xs: number[]) => (xs.length ? (xs[Math.floor(xs.length / 2)] / 1000).toFixed(1) : "-");
  const actions = new Map<string, number>();
  for (const l of output.labels) if (l.plan.action) actions.set(l.plan.action, (actions.get(l.plan.action) ?? 0) + 1);
  const theirs = output.labels.filter((l) => l.plan.match);
  const medOf = (ls: ReelLabel[]) => med(ls.map((l) => l.plan.watchMs).sort((a, b) => a - b));
  const lines = [
    `log warmup facebook reel run --persona: ${output.blocked ? `blocked: ${output.blocked.code}` : output.ok ? "the session ran to its end" : `stopped: ${output.problem}`}.`,
    `  ${output.labels.length} reels for ${pack.personaId} (${pack.segment}, into ${pack.interests.join(", ") || "nothing named"}); SubQ read ${calls}, ${tokens} input tokens.`,
    `  Theirs: ${theirs.length} (watch median ${medOf(theirs)} s); not theirs: ${output.labels.length - theirs.length} (median ${medOf(output.labels.filter((l) => !l.plan.match))} s).`,
    `  Watch planned: median ${med(planned)} s; on screen (swipe to swipe): median ${med(shown)} s over ${shown.length} reel(s).`,
    `  Proxy traffic: ${runMb} MB this run (${output.labels.length ? Math.round((runMb / output.labels.length) * 100) / 100 : 0} MB a reel); ${Math.round((budget.usedMb + runMb) * 100) / 100} of ${budget.budgetMb} MB in 24 hours.`,
    `  Actions: ${[...actions.entries()].map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`,
    `  ${labelsPath}`,
    `  The account's curated feed: ${join(curatedDir, `${account}.jsonl`)}`,
  ];
  return { code: output.ok ? 0 : 1, stdout: lines.join("\n") };
}
