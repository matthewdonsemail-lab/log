import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../../camofox/inspect/index.ts";
import type { InspectAction } from "../../../camofox/inspect/index.ts";
import { homeOf, outsideActiveHours } from "../../../marketplace/home/index.ts";
import { checkRunnable, findAccount } from "../../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import { DEFAULT_SESSION, describeSession, FACEBOOK_ACTIVITIES, parseRange, planSession, WARMUP_PLATFORMS, warmupActivityMachine } from "../../../warmup/facebook/index.ts";
import type { ActivityStep, PlatformActivity, ReelSessionOptions, StepReply } from "../../../warmup/facebook/index.ts";
import { inspectCommand } from "../../inspect/index.ts";
import { refuse, refuseError } from "../../runner/helpers/index.ts";
import type { CommandContext, CommandResult } from "../../runner/types.ts";
import { describePack, describePersona, describeViewerLines, packFor, personaFor, personaPath, runPersonaSession } from "./personaRun.ts";
import { readInterestEffect, viewerFor } from "../../../warmup/viewer/index.ts";
import { seeded } from "../../../warmup/facebook/index.ts";

export const PLATFORM_USAGE = [
  "       log warmup <platform> <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)",
  "       log warmup <platform> <activity> plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>]",
  "       log warmup <platform> <activity> run --account <a> [plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)",
  "       log warmup <platform> <activity> run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer, rule 50)",
  "       log warmup <platform> persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)",
  `  Platforms: ${WARMUP_PLATFORMS.join(", ")}. Facebook activities: ${Object.keys(FACEBOOK_ACTIVITIES).join(", ")}.`,
].join("\n");

/** The plan flags → session options, or why not. Pure. */
export function sessionOptions(flags: Record<string, string | true>): { ok: true; options: ReelSessionOptions } | { ok: false; error: string } {
  const options: ReelSessionOptions = { ...DEFAULT_SESSION, likes: flags.likes === true };
  for (const [flag, key, top] of [["reels", "reels", 60], ["watch", "watchSeconds", 300]] as const) {
    if (typeof flags[flag] !== "string") continue;
    const range = parseRange(flags[flag] as string);
    if (!range || range.min < 1 || range.max > top) return { ok: false, error: `--${flag} takes a range like ${flag === "reels" ? "5-12 (1 to 60)" : "4-25 (seconds, 1 to 300)"}` };
    options[key] = range;
  }
  for (const flag of ["skip", "comments", "profile"] as const) {
    if (typeof flags[flag] !== "string") continue;
    const chance = Number(flags[flag]);
    if (!Number.isFinite(chance) || chance < 0 || chance > 1) return { ok: false, error: `--${flag} is a chance per reel, 0 to 1` };
    options[flag] = chance;
  }
  return { ok: true, options };
}

/** One step sent to the open session, with the snapshot its folder kept (the check reads it). */
function actor(context: CommandContext, current: NonNullable<ReturnType<typeof readCurrentInspect>>) {
  return fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
    const { step } = input;
    context.err(`  → ${step.id}: ${step.action} ${step.args.join(" ")}  (${step.why})`);
    const reply = await context.sendInspect(current, step.action as InspectAction, step.args, 180_000);
    if (!reply) return { ok: false, error: `no reply from the open browser in 180 s (${current.runDir})` };
    const snapshotPath = reply.folder ? join(reply.folder, "snapshot.yml") : null;
    return { ok: reply.ok !== false, error: reply.error, url: reply.url, folder: reply.folder, snapshot: snapshotPath && existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : undefined };
  });
}

/**
 * `log warmup <platform> <activity> [plan|record|run]` (rule 49): an activity
 * of the warm-up, defined for its platform, run in the account's browser
 * (opened primed with it when it isn't open, `inspect start --detach`), every
 * step checked against what it must do, the outline written beside the run.
 */
export async function runPlatformActivity(context: CommandContext, positionals: string[], flags: Record<string, string | true>): Promise<CommandResult> {
  const [platform, activityName, sub = "record"] = positionals;
  // The account's persona (rule 50): kept per account, drawn once from the datasets.
  if (activityName === "persona") {
    if (typeof flags.account !== "string") return { code: 1, stderr: `log warmup: --account is required\n${PLATFORM_USAGE}` };
    try {
      const account = await findAccount(context.twenty, flags.account);
      const seed = typeof flags.seed === "string" ? Number(flags.seed) : undefined;
      const { persona, drawn } = personaFor(account.accountName, account.homeCountry ?? "US", { fresh: flags.newPersona === true, seed });
      const { viewer } = viewerFor(personaPath(account.accountName), persona.seed, { fresh: flags.newPersona === true, scrollSpeed: persona.summary.scrollSpeed });
      const { pack } = packFor(account.accountName, persona, viewer, { fresh: flags.newPersona === true });
      return { code: 0, stdout: [`${account.accountName}: ${drawn ? "a persona drawn now and kept" : "its kept persona"}.`, ...describePersona(persona), ...describeViewerLines(viewer), ...describePack(pack)].join("\n") };
    } catch (error) {
      return refuseError("warmup", error);
    }
  }
  const activity: PlatformActivity | undefined = platform === "facebook" ? FACEBOOK_ACTIVITIES[activityName ?? ""] : undefined;
  if (!activity) return { code: 1, stderr: `log warmup: no ${platform} activity "${activityName ?? ""}"\n${PLATFORM_USAGE}` };

  const built = sessionOptions(flags);
  if (!built.ok) return { code: 1, stderr: `log warmup: ${built.error}` };
  // Reels has a drawn session (glances, streaks, watches); every other activity is its steps in order, each
  // step's ranges drawn as it runs.
  const drawnSession = activity.activity === "reel";
  if (sub === "plan" && !drawnSession) {
    if (flags.json) return { code: 0, stdout: JSON.stringify({ platform, activity: activity.activity, steps: activity.steps, knownIssues: activity.knownIssues }, null, 2) };
    return {
      code: 0,
      stdout: [
        `Warm-up ${platform} ${activity.activity}: ${activity.summary}`,
        ...activity.steps.map((st, i) => `${String(i + 1).padStart(2)}. ${st.id}: ${st.action} ${st.args.join(" ")}  (${st.why})${st.likes ? "  [--likes]" : st.clicks ? "  [--live]" : ""}`),
        ...(activity.knownIssues.length ? ["Known issues:", ...activity.knownIssues.map((i) => `  - ${i}`)] : []),
      ].join("\n"),
    };
  }
  if (sub === "plan") {
    const seed = typeof flags.seed === "string" ? Number(flags.seed) : Math.floor((context.now?.() ?? new Date()).getTime() % 2 ** 31);
    if (!Number.isInteger(seed)) return { code: 1, stderr: "log warmup: --seed is a whole number" };
    const steps = planSession(built.options, seed);
    if (flags.json) return { code: 0, stdout: JSON.stringify({ seed, options: built.options, steps }, null, 2) };
    const reels = Math.max(...steps.map((s) => s.reel));
    const glanced = steps.filter((s) => s.step.id === "glance").length;
    return { code: 0, stdout: [`Warm-up ${platform} ${activity.activity}, a session (seed ${seed}): ${reels} reels, ${glanced} skipped after a glance, ${reels - glanced} watched, ${steps.length} steps${built.options.likes ? "" : ", no likes (add --likes, rule 8)"}.`, ...describeSession(steps)].join("\n") };
  }
  if (sub !== "record" && sub !== "run") return { code: 1, stderr: `log warmup ${platform} ${activity.activity}: pick plan, record or run\n${PLATFORM_USAGE}` };
  if (typeof flags.account !== "string") return { code: 1, stderr: `log warmup: --account is required\n${PLATFORM_USAGE}` };

  try {
    const account = await findAccount(context.twenty, flags.account);
    const check = checkRunnable(account, "run");
    if (!check.ok) return refuse("warmup", check.code, check.detail);
    // Rule 18 for every step in the browser, also when it is already open; --bypass for one run (rule 20).
    const home = homeOf(account);
    if (!home.ok) return refuse("warmup", home.code, home.detail);
    const outside = flags.bypass ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
    if (outside) return refuse("warmup", "outsideActiveHours", outside);

    // The account's one browser (rule 35): the open one, else opened now as its own process, primed with this activity.
    let current = readCurrentInspect(undefined, account.accountName);
    if (!current) {
      context.err(`Opening ${account.accountName}'s browser for the warm-up (${platform} ${activity.activity}), as its own process…`);
      const opened = await inspectCommand.run(context, ["start", "--account", account.accountName, "--detach", ...(flags.bypass ? ["--bypass"] : []), ...(flags.now ? ["--now"] : [])]);
      if (opened.code !== 0) return opened;
      if (opened.stdout) context.err(opened.stdout);
      current = readCurrentInspect(undefined, account.accountName);
      if (!current) return { code: 1, stderr: "log warmup: the browser opened but its session isn't listed" };
    }

    if (sub === "run" && flags.persona && !drawnSession) return { code: 1, stderr: `log warmup ${platform} ${activity.activity}: --persona is built for reel only so far` };
    if (sub === "run" && flags.persona) {
      const { persona, drawn } = personaFor(account.accountName, account.homeCountry ?? "US", { fresh: flags.newPersona === true });
      const { viewer } = viewerFor(personaPath(account.accountName), persona.seed, { fresh: flags.newPersona === true, scrollSpeed: persona.summary.scrollSpeed });
      const { pack } = packFor(account.accountName, persona, viewer, { fresh: flags.newPersona === true });
      context.err([`${drawn ? "Drew" : "Using"} ${account.accountName}'s persona:`, ...describePersona(persona), ...describeViewerLines(viewer), ...describePack(pack)].join("\n"));
      const seed = Math.floor((context.now?.() ?? new Date()).getTime() % 2 ** 31);
      // The session's length is the pack's (doomscrolling and the real viewer's sessions), unless --reels says.
      const range = built.options.reels;
      const reels = typeof flags.reels === "string" ? range.min + Math.floor(seeded(seed)() * (range.max - range.min + 1)) : pack.traits.sessionReels;
      context.err(`Warm-up facebook reel, each reel read by SubQ and planned by the orderer for this pack: ${reels} reels, in ${account.accountName}'s open browser (${current.runDir}).`);
      return await runPersonaSession(context, account.accountName, persona, viewer, pack, readInterestEffect(), { reels, seed, live: flags.live === true, likes: flags.likes === true, trafficMb: typeof flags.trafficMb === "string" ? Number(flags.trafficMb) : undefined, proxy: account.proxy });
    }
    const steps = sub === "run" && drawnSession ? planSession(built.options, Math.floor((context.now?.() ?? new Date()).getTime() % 2 ** 31)).map((s) => s.step) : activity.steps;
    context.err(`Warm-up ${platform} ${activity.activity} (${sub}) in ${account.accountName}'s open browser (${current.runDir}): ${steps.length} steps, each checked.`);
    const machine = warmupActivityMachine.provide({ actors: { act: actor(context, current) } });
    const run = createActor(machine, {
      input: { account: account.accountName, steps, live: flags.live === true, likes: flags.likes === true, continueOnIssue: sub === "record" },
      inspect: createInspector((line) => context.err(formatTraceLine(line))),
    });
    run.subscribe((snapshot) => {
      const last = snapshot.context.outcomes.at(-1);
      if (last && snapshot.context.outcomes.length === snapshot.context.index) context.err(`  ${last.skipped ? "–" : last.ok ? "✓" : "✗"} ${last.id}${last.skipped ? `: skipped, ${last.skipped}` : last.issue ? `: ${last.issue}` : last.error ? `: ${last.error}` : ""}`);
    });
    run.start();
    const output = await toPromise(run);
    const outlinePath = join(current.runDir, `warmup_${platform}_${activity.activity}.json`);
    writeFileSync(outlinePath, `${JSON.stringify({ at: new Date().toISOString(), platform, activity: activity.activity, sub, ...output, knownIssues: activity.knownIssues }, null, 2)}\n`);
    const lines = [
      `log warmup ${platform} ${activity.activity} ${sub}: ${output.blocked ? `blocked: ${output.blocked.code}` : output.ok ? "every step did what it should" : `${output.issues.length} step(s) didn't do what they should`}.`,
      ...output.outcomes.map((o) => `  ${o.skipped ? "–" : o.ok ? "✓" : "✗"} ${o.id}${o.skipped ? `: skipped, ${o.skipped}` : o.issue ? `: ${o.issue}` : o.error ? `: ${o.error}` : ""}${o.folder ? `  (${o.folder})` : ""}`),
      `  Outline: ${outlinePath}`,
      ...(activity.knownIssues.length ? ["  Known from earlier recordings:", ...activity.knownIssues.map((i) => `    - ${i}`)] : []),
    ];
    return { code: output.ok ? 0 : 1, stdout: lines.join("\n") };
  } catch (error) {
    return refuseError("warmup", error);
  }
}
