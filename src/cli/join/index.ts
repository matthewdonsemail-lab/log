/**
 * `log join group --account <a> --group <g>` — join a Facebook group as one
 * account (rule 45), through the group join machine (`group/join`).
 *
 *   log join group --account <a> --group <url|id|name> [--live] [--json]
 *       in the account's OPEN browser (rule 35: `log inspect start` or
 *       `log host start` opened it; a join never launches its own): opens the
 *       group, reads the gate, and stops there. With --live it presses Join
 *       (rule 8) and reads what Facebook shows: Joined, entry questions, or a
 *       request sent. Questions are kept, never answered here.
 *   log join group --account <a> --group <g> --show
 *       the account's row for the group from Twenty, with its join submission,
 *       and nothing opened.
 *   log join group --account <a> --group <g> --answer
 *       the Clack stepper over the group's join options (the schema a --live
 *       run kept in joinSubmission.options): one step per question, its prompt
 *       from Facebook's type (PARAGRAPH → text, CHECKBOXES → multiselect), then
 *       the rules and the agreement. The answers go to joinSubmission.draft in
 *       Twenty. Nothing opens and nothing is sent to Facebook.
 *   log join group --account <a> --group <g> --fill [--live [--submit]]
 *       the draft into the group's own dialog, in the account's open browser
 *       (group/answer): each Clack step becomes its fill step on the dialog's
 *       element (tick a box, click into a box and type), every step recorded.
 *       A dry run finds the way in ("Answer questions") and stops. --live
 *       opens the dialog and fills it, and stops before Submit; --submit also
 *       presses it (rule 8). joinSubmission.application follows each step.
 *
 * Every step patches `agencyGroups.joinSubmission` as it happens, and prints a
 * line (rule 26). Clack asks for --account and --group when either is missing,
 * in an interactive terminal.
 */
import { cancel, confirm, intro, isCancel, multiselect, note, outro, select, text } from "@clack/prompts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import { draftComplete, draftFrom, ensureGroup, findGroup, groupJoinMachine, parseGroupRef, patchGroupStep, readJoinOptions, recordGroupRead, saveDraft, stepsFor } from "../../group/join/index.ts";
import type { Group, GroupJoinOutput, GroupRef, GroupStepInput, GroupStepReply, JoinAnswer, JoinOptions } from "../../group/join/index.ts";
import { describePlan, groupAnswerMachine, patchApplication } from "../../group/answer/index.ts";
import type { AnswerStepInput, GroupAnswerOutput } from "../../group/answer/index.ts";
import { homeOf, outsideActiveHours } from "../../marketplace/home/index.ts";
import { checkRunnable, findAccount, listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { shouldPrompt } from "../launch/helpers/index.ts";
import type { LaunchTTY } from "../launch/helpers/index.ts";
import { refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { takePairs } from "../flow/index.ts";
import { parseJoinArgs } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const JOIN_USAGE = [
  "Usage: log join group --account <accountName> --group <group url, id or name> [--live] [--json]",
  "       log join group --account <accountName> --group <g> --show",
  "       log join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)",
  "       log join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)",
  "Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).",
  "The account's browser must be open (log inspect start --account <a>, or log host start): a join is a step in it (rule 35).",
].join("\n");

interface JoinPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: Parameters<typeof select>[0]): Promise<unknown>;
  text(option: Parameters<typeof text>[0]): Promise<unknown>;
  multiselect(option: Parameters<typeof multiselect>[0]): Promise<unknown>;
  confirm(option: Parameters<typeof confirm>[0]): Promise<unknown>;
  note(message: string, title?: string): void;
}

/** Transport seam for tests. Production uses Clack and the real terminal. */
export const joinDeps: { prompts: JoinPrompts; tty: () => LaunchTTY } = {
  prompts: {
    intro,
    outro,
    cancel,
    select: select as JoinPrompts["select"],
    text: text as JoinPrompts["text"],
    multiselect: multiselect as JoinPrompts["multiselect"],
    confirm: confirm as JoinPrompts["confirm"],
    note: (message, title) => note(message, title),
  },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

/** The answer, or null when the person cancelled. */
function answered(value: unknown): string | null {
  if (isCancel(value) || typeof value !== "string" || !value.trim()) {
    joinDeps.prompts.cancel("Join cancelled.");
    return null;
  }
  return value.trim();
}

/**
 * The Clack stepper: the steps `stepsFor` builds from the group's join options,
 * one prompt each, starting from the saved draft. Returns the answers, or null
 * when the person cancelled (nothing is saved then).
 */
async function runStepper(options: JoinOptions, saved: Group["joinSubmission"]["draft"]): Promise<{ answers: Record<string, JoinAnswer>; rulesAgreed: boolean } | null> {
  const prompts = joinDeps.prompts;
  const answers: Record<string, JoinAnswer> = {};
  let rulesAgreed = false;
  for (const step of stepsFor(options, saved)) {
    if (step.kind === "intro") prompts.note(step.message, "What the group asks");
    else if (step.kind === "rules") prompts.note(step.rules.join("\n"), step.message);
    else if (step.kind === "skipped") prompts.note(step.message, "Skipped");
    else if (step.kind === "text") {
      const value = await prompts.text({ message: step.message, initialValue: step.initial, validate: (v) => (v && v.trim() ? undefined : "An answer is needed") });
      if (isCancel(value)) return null;
      answers[step.questionId] = String(value).trim();
    } else if (step.kind === "multiselect") {
      const value = await prompts.multiselect({ message: step.message, options: step.options, initialValues: step.initial, required: true });
      if (isCancel(value)) return null;
      answers[step.questionId] = (value as string[]).map(String);
    } else if (step.kind === "agree") {
      const value = await prompts.confirm({ message: step.message, initialValue: step.initial });
      if (isCancel(value)) return null;
      rulesAgreed = value === true;
    }
  }
  return { answers, rulesAgreed };
}

/** `--answer`: the stepper over the saved join options, its answers to Twenty. Never opens a browser. */
/**
 * The same answers without a terminal (`--set <n>=<value>` per question, `--agree`): the same
 * steps, the same draft. A checkboxes question takes its option labels (`--set 1=Yes`, several
 * comma-separated); a paragraph its text. `<n>` is the question's number in the stepper, or its id.
 */
export function answersFromSets(options: JoinOptions, sets: Record<string, string>): { answers: Record<string, JoinAnswer>; errors: string[] } {
  const answers: Record<string, JoinAnswer> = {};
  const errors: string[] = [];
  for (const [key, value] of Object.entries(sets)) {
    const question = options.questions.find((q, i) => q.id === key || String(i + 1) === key);
    if (!question) {
      errors.push(`no question ${key} (1-${options.questions.length}, or its id)`);
      continue;
    }
    if (question.type === "checkboxes") {
      const ids = value.split(",").map((label) => question.options.find((o) => o.label.toLowerCase() === label.trim().toLowerCase())?.id);
      if (ids.some((id) => !id)) errors.push(`question ${key} offers ${question.options.map((o) => o.label).join(" / ")}, not "${value}"`);
      else answers[question.id] = ids as string[];
    } else if (question.type === "paragraph") answers[question.id] = value.trim();
    else errors.push(`question ${key} is ${question.rawType}: not recorded yet`);
  }
  return { answers, errors };
}

async function answerGroup(context: CommandContext, accountId: string, accountName: string, key: string, json: boolean, sets: Record<string, string> = {}, agree = false): Promise<CommandResult> {
  const group = await findGroup(context.twenty, accountId, [key]);
  const options = group?.joinSubmission.options ?? null;
  if (!group || !options) return { code: 1, stderr: `log join: ${accountName} has no join options for group ${key} yet: they come from a --live join (log join group --account ${accountName} --group ${key} --live)` };
  if (!options.questions.length && !options.rulesAgreementRequired) return { code: 0, stdout: `Group ${group.name}: it asks nothing (${options.path}). Nothing to answer.` };
  if (Object.keys(sets).length || agree) {
    const { answers, errors } = answersFromSets(options, sets);
    if (errors.length) return { code: 1, stderr: `log join: ${errors.join("; ")}` };
    const now = context.now?.() ?? new Date();
    const draft = draftFrom(options, answers, agree, now);
    const complete = draftComplete(options, draft);
    const saved = await saveDraft(context.twenty, group, draft, complete, now);
    return { code: 0, stdout: `${complete.complete ? "Every answer given, the rules agreed: saved to Twenty, not sent." : `Saved to Twenty, still missing: ${complete.missing.join("; ")}`}\n${renderGroup(saved)}` };
  }
  if (!shouldPrompt(json, joinDeps.tty())) return { code: 1, stderr: "log join: --answer is a Clack stepper: it needs an interactive terminal (or give the answers: --set 1=Yes --set 2=\"…\" --agree)" };
  joinDeps.prompts.intro(`log join group --answer — ${group.name}`);
  const given = await runStepper(options, group.joinSubmission.draft);
  if (!given) {
    joinDeps.prompts.cancel("Nothing saved.");
    return { code: 1 };
  }
  const now = context.now?.() ?? new Date();
  const draft = draftFrom(options, given.answers, given.rulesAgreed, now);
  const complete = draftComplete(options, draft);
  const saved = await saveDraft(context.twenty, group, draft, complete, now);
  joinDeps.prompts.outro(complete.complete ? "Saved to Twenty. Not sent to Facebook." : `Saved to Twenty, still missing: ${complete.missing.join("; ")}`);
  return { code: 0, stdout: renderGroup(saved) };
}

/** The open browser's step, with its whole snapshot and the answers Facebook gave in it (the click's HAR). */
function stepWith(context: CommandContext, current: NonNullable<ReturnType<typeof readCurrentInspect>>) {
  return async (input: { action: string; args: string[] }): Promise<GroupStepReply> => {
    context.err(`  → ${input.action} ${input.action === "type" ? `${input.args[0]} (${(input.args[1] ?? "").length} characters)` : input.args.join(" ")}`);
    const reply = await context.sendInspect(current, input.action as never, input.args, 120_000);
    if (!reply) return { ok: false, error: `no reply from the open browser in 120 s (${current.runDir})` };
    const snapshotPath = reply.folder ? join(reply.folder, "snapshot.yml") : null;
    const harPath = reply.folder ? join(reply.folder, "network.har") : null;
    let options: JoinOptions | undefined;
    try {
      options = harPath && existsSync(harPath) ? readJoinOptions(JSON.parse(readFileSync(harPath, "utf8"))) : undefined;
    } catch {
      options = undefined;
    }
    return { ...reply, snapshot: snapshotPath && existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : undefined, options };
  };
}

/**
 * `--fill`: the draft into the group's dialog, through the answer machine in
 * the account's open browser. Each fill step names the Clack step it does,
 * and joinSubmission.application is patched after every one.
 */
async function fillGroup(context: CommandContext, accountId: string, accountName: string, ref: GroupRef, live: boolean, submit: boolean, json: boolean): Promise<CommandResult> {
  let group = await findGroup(context.twenty, accountId, [ref.key]);
  const options = group?.joinSubmission.options ?? null;
  const draft = group?.joinSubmission.draft ?? null;
  if (!group || !options) return { code: 1, stderr: `log join: ${accountName} has no join options for group ${ref.key} yet: they come from a --live join` };
  const complete = draftComplete(options, draft);
  if (!draft || !complete.complete) return { code: 1, stderr: `log join: the draft isn't complete (${complete.missing.join("; ") || "no draft"}): answer it first with --answer` };
  const current = readCurrentInspect(undefined, accountName);
  if (!current) return refuse("join", "groupBrowserNotOpen", `no open browser for ${accountName}`);
  const groupRef = { ...ref, url: group.groupUrl ?? ref.url };
  context.err(`Filling ${group.name} in ${accountName}'s open browser (${current.runDir})${live ? (submit ? ", --live --submit: filled, then Submit pressed" : ", --live: filled, Submit not pressed") : ", dry run: nothing clicked or typed"}.`);
  context.err(stepsFor(options, draft).filter((s) => s.kind !== "intro" && s.kind !== "rules").map((s, i) => `  Clack step ${i + 1}: ${s.kind === "agree" ? "agree to the rules" : s.message}`).join("\n"));

  const machine = groupAnswerMachine.provide({ actors: { step: fromPromise<GroupStepReply, AnswerStepInput>(({ input }) => stepWith(context, current)(input)) } });
  const actor = createActor(machine, { input: { account: accountName, group: groupRef, options, draft, live, submit }, inspect: createInspector((line) => context.err(formatTraceLine(line))) });
  let seen = 0;
  let writes: Promise<void> = Promise.resolve();
  actor.subscribe((snapshot) => {
    const steps = snapshot.context.steps;
    while (seen < steps.length) {
      const step = steps[seen++];
      const at = context.now?.() ?? new Date();
      const next = { status: snapshot.context.application, filled: snapshot.context.filled, detail: `${step.step}: ${step.detail ?? (step.ok ? "ok" : "failed")}` };
      writes = writes.then(async () => {
        group = await patchApplication(context.twenty, group!, next, { step: step.step, folder: step.folder ?? null }, at);
        context.err(`  ${step.ok ? "✓" : "✗"} ${step.step}: ${step.detail ?? ""} (application ${group.joinSubmission.application?.status})`);
      });
    }
  });
  actor.start();
  const output = await toPromise(actor);
  await writes;
  // The machine's last word on the application, written once more so the row ends where the run did.
  group = await patchApplication(context.twenty, group, { status: output.application, filled: output.filled, answerState: output.answerState, detail: output.problem ? `${output.problem.code}: ${output.problem.detail}` : output.answerState ? `${output.result}: Facebook says ${output.answerState}` : output.result }, { step: "fill", folder: null }, context.now?.() ?? new Date());
  if (json) return { code: output.result === "stopped" ? 1 : 0, stdout: JSON.stringify({ ...output, group }, null, 2) };
  const head: Record<GroupAnswerOutput["result"], string> = {
    planned: "dry run: the way in is there; nothing clicked or typed (add --live to fill it)",
    filled: "every step filled in the dialog; Submit not pressed (add --submit to press it)",
    submitted: "filled and submitted: the dialog closed",
    stopped: `stopped: ${output.problem?.code}: ${output.problem?.detail}`,
  };
  const lines = [`log join group --fill: ${head[output.result]}.`];
  if (output.plan) lines.push(...describePlan(output.plan).map((l) => `  ${l}`));
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? `: ${step.detail}` : ""}${step.folder ? `  (${step.folder})` : ""}`);
  return { code: output.result === "stopped" ? 1 : 0, stdout: `${lines.join("\n")}\n${renderGroup(group)}` };
}

/** The row and its submission, as `--show` and the start of every run print it. */
export function renderGroup(group: Group): string {
  const s = group.joinSubmission;
  const lines = [
    `Group ${group.name ?? group.facebookGroupId} (${group.groupUrl ?? "?"}): ${group.joinStatus ?? "never read"}${group.membersLabel ? `, ${group.membersLabel}` : ""}${group.lastCheckedAt ? `, checked ${group.lastCheckedAt.slice(0, 16)}` : ""}`,
    `  join submission: ${s.formPhase}${s.questions.length ? `, ${s.questions.length} question(s) (hash ${s.questionsHash})` : ""}${s.submittedAt ? `, sent ${s.submittedAt.slice(0, 16)}` : ""}${s.questions.length ? `, answers ${s.answersComplete ? "complete" : `${s.answers.length}/${s.questions.length}`}` : ""}`,
  ];
  if (s.application) lines.push(`    application: ${s.application.status}${s.application.answerState ? ` (Facebook: ${s.application.answerState})` : ""}${s.application.filled.length ? `, filled ${s.application.filled.length} step(s)` : ""}${s.application.submittedAt ? `, submitted ${s.application.submittedAt.slice(0, 16)}` : ""} (${s.application.detail})`);
  if (s.inference) lines.push(`    inferred: ${s.inference.status}${s.inference.ambiguous ? " (ambiguous)" : ""}, path ${s.inference.path}, posting ${s.inference.posting}, from ${s.inference.inferredFrom.join(", ") || "nothing"}`);
  if (s.options) {
    for (const q of s.options.questions) {
      const a = s.draft?.answers[q.id];
      const shown = Array.isArray(a) ? a.map((id) => q.options.find((o) => o.id === id)?.label ?? id).join(", ") : a;
      lines.push(`    ${q.stage} ${q.type}${q.options.length ? ` [${q.options.map((o) => o.label).join(" / ")}]` : ""}: ${q.prompt}${shown ? `  → ${shown}` : ""}`);
    }
    if (s.options.rulesAgreementRequired) lines.push(`    rules: ${s.options.rules.length}, agreed in the draft: ${s.draft?.rulesAgreed ? "yes" : "no"}`);
  }
  if (s.dialogTitle) lines.push(`    dialog "${s.dialogTitle}": ${s.dialogNotes.join(" / ")}`);
  s.questions.forEach((q, i) => lines.push(`    question ${i + 1}. ${q}${s.draftAnswers[i] ? `  → draft: ${s.draftAnswers[i]}` : ""}`));
  for (const a of s.agreements) lines.push(`    to agree: ${a}`);
  for (const r of s.rules) lines.push(`    rule ${r}`);
  if (s.submitEnabled !== null && s.application?.status !== "submitted") lines.push(`    Submit ${s.submitEnabled ? "enabled" : "disabled"} (nothing ticked, typed or submitted by log-cli)`);
  for (const entry of s.history.slice(-5)) lines.push(`    ${entry.at.slice(11, 19)} ${entry.step} [${entry.formPhase}] ${entry.detail}`);
  if (group.joinStatusReason) lines.push(`  last run: ${group.joinStatusReason}`);
  return lines.join("\n");
}

function renderRun(output: GroupJoinOutput, live: boolean): string {
  const head: Record<GroupJoinOutput["result"], string> = {
    read: `the group shows Join${live ? "" : "; dry run, nothing clicked (add --live to press it, rule 8)"}`,
    alreadyIn: "the account is already a member",
    alreadyRequested:
      output.options?.answerState === "QUESTIONNAIRE_COMPLETED"
        ? "the request is sent and its answers are in (Facebook: QUESTIONNAIRE_COMPLETED): waiting on the group's admins; viewer_join_state turns MEMBER when they accept"
        : `the account's request is already sent (Cancel Request)${output.options?.answerState ? `, answers ${output.options.answerState}` : ""}: answer its questions with --answer, then --fill`,
    joined: `Join pressed: the account is a member (${output.inference?.inferredFrom[0] ?? "the page"}), posting ${output.inference?.posting ?? "unknown"}${output.dialog ? `; the group then asked "${output.dialog.title}" (kept in joinSubmission, not submitted)` : ""}`,
    clicked: "Join pressed: the request went (the page shows something not recorded yet; read the checking step)",
    questions: `Join pressed: the group shows "${output.dialog?.title ?? "a dialog"}" before the request goes; kept in joinSubmission, not answered`,
    stopped: `stopped: ${output.problem?.code}: ${output.problem?.detail}`,
  };
  const lines = [`log join group: ${head[output.result]}.`];
  output.questions.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`));
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? `: ${step.detail}` : ""}${step.folder ? `  (${step.folder})` : ""}`);
  return lines.join("\n");
}

export async function runJoin(context: CommandContext, argv: string[]): Promise<CommandResult> {
  // `--set n=value`, repeated: taken out before the flag parser, which keeps one value per flag.
  const sets = takePairs(argv, "set");
  const parsed = parseJoinArgs(sets.rest);
  if (!parsed.ok) return { code: 1, stderr: `log join: ${parsed.error}\n${JOIN_USAGE}` };
  let { account: accountRef, group: groupRef } = parsed;

  try {
    const prompting = (!accountRef || !groupRef) && shouldPrompt(parsed.json, joinDeps.tty());
    if (!accountRef || !groupRef) {
      if (!prompting) return { code: 1, stderr: `log join: --account and --group are both needed (Clack asks for them only in an interactive terminal)\n${JOIN_USAGE}` };
      joinDeps.prompts.intro("log join group — Facebook");
    }
    if (!accountRef) {
      // Only accounts that pass the account check (FACEBOOK, usable, proxy, home country) are offered.
      const accounts = (await listFacebookAccounts(context.twenty)).filter((account) => checkRunnable(account, "run").ok);
      if (accounts.length === 0) return { code: 1, stderr: "log join: no FACEBOOK account may run: each needs a usable status, a proxy and a home country in Twenty. See `log accounts`." };
      accountRef = answered(
        await joinDeps.prompts.select({
          message: "Which account joins?",
          options: accounts.map((account) => ({ value: account.accountName, label: account.accountName, hint: `${account.homeCity ?? "?"}, ${account.homeCountry}` })),
        }),
      );
      if (accountRef === null) return { code: 1 };
    }
    if (!groupRef) {
      groupRef = answered(await joinDeps.prompts.text({ message: "Which group? (its URL or id)", placeholder: "https://www.facebook.com/groups/…" }));
      if (groupRef === null) return { code: 1 };
    }

    const ref = parseGroupRef(groupRef);
    if (!ref.ok) return refuse("join", "groupRefInvalid", ref.error);
    const account = await findAccount(context.twenty, accountRef);
    const check = checkRunnable(account, "run");
    if (!check.ok) return refuse("join", check.code, check.detail);

    if (parsed.answer) return await answerGroup(context, account.id, account.accountName, ref.group.key, parsed.json, sets.pairs, parsed.agree);

    // Rule 18: a step in the browser runs only inside the account's local hours, even when its browser
    // stayed open past them (an inspect session closes only after 30 idle minutes). --bypass skips it
    // for this run only (rule 20). --show and --answer only read and write Twenty: not gated.
    if (!parsed.show) {
      const home = homeOf(account);
      if (!home.ok) return refuse("join", home.code, home.detail);
      const outside = parsed.bypass ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
      if (outside) return refuse("join", "outsideActiveHours", outside);
      if (parsed.bypass) context.err(`--bypass: the waking-hours gate is skipped for this run only (rule 20).`);
    }
    if (parsed.fill) return await fillGroup(context, account.id, account.accountName, ref.group, parsed.live, parsed.submit, parsed.json);

    if (parsed.show) {
      const saved = await findGroup(context.twenty, account.id, [ref.group.key]);
      if (!saved) return { code: 0, stdout: parsed.json ? JSON.stringify(null) : `${account.accountName} has no row for group ${ref.group.key} yet: nothing was read.` };
      return { code: 0, stdout: parsed.json ? JSON.stringify(saved, null, 2) : renderGroup(saved) };
    }

    const current = readCurrentInspect(undefined, account.accountName);
    if (!current) return refuse("join", "groupBrowserNotOpen", `no open browser for ${account.accountName}`);

    let group = await ensureGroup(context.twenty, account.id, ref.group);
    context.err(renderGroup(group));
    context.err(`Joining in ${account.accountName}'s open browser (${current.runDir})${parsed.live ? ", --live: Join will be pressed" : ", dry run: Join is not pressed"}.`);

    const machine = groupJoinMachine.provide({
      actors: {
        step: fromPromise<GroupStepReply, GroupStepInput>(async ({ input }) => {
          context.err(`  → ${input.action} ${input.args.join(" ")}`);
          const reply = await context.sendInspect(current, input.action, input.args, 120_000);
          if (!reply) return { ok: false, error: `no reply from the open browser in 120 s (${current.runDir})` };
          // The whole snapshot, not only its interactive lines: a button's text sits below it (AdsPower's Chromium).
          const snapshotPath = reply.folder ? join(reply.folder, "snapshot.yml") : null;
          // And what Facebook answered in the step, from its own HAR (rule 25): the join's state is inferred from it.
          const harPath = reply.folder ? join(reply.folder, "network.har") : null;
          let options: JoinOptions | undefined;
          try {
            options = harPath && existsSync(harPath) ? readJoinOptions(JSON.parse(readFileSync(harPath, "utf8"))) : undefined;
          } catch {
            options = undefined;
          }
          return { ...reply, snapshot: snapshotPath && existsSync(snapshotPath) ? readFileSync(snapshotPath, "utf8") : undefined, options };
        }),
      },
    });
    const actor = createActor(machine, { input: { account: account.accountName, group: ref.group, live: parsed.live }, inspect: createInspector((line) => context.err(formatTraceLine(line))) });
    // After every step, the join submission is patched with what the step saw (one write at a time, in order).
    let patched = 0;
    let writes: Promise<void> = Promise.resolve();
    actor.subscribe((snapshot) => {
      const steps = snapshot.context.steps;
      while (patched < steps.length) {
        const step = steps[patched++];
        const at = context.now?.() ?? new Date();
        writes = writes.then(async () => {
          group = await patchGroupStep(context.twenty, group, snapshot.context, { step: step.step, detail: step.detail ?? (step.ok ? "ok" : "failed"), folder: step.folder ?? null }, at);
          context.err(`  ${step.ok ? "✓" : "✗"} ${step.step}: ${step.detail ?? ""} (joinSubmission ${group.joinSubmission.formPhase})`);
        });
      }
    });
    actor.start();
    const output = await toPromise(actor);
    await writes;
    group = await recordGroupRead(context.twenty, group, output, current.runDir, context.now?.() ?? new Date());
    if (prompting) joinDeps.prompts.outro(output.result === "stopped" ? "Stopped." : "Done.");
    const code = output.result === "stopped" ? 1 : 0;
    if (parsed.json) return { code, stdout: JSON.stringify({ ...output, group }, null, 2) };
    return { code, stdout: `${renderRun(output, parsed.live)}\n${renderGroup(group)}` };
  } catch (error) {
    return refuseError("join", error);
  }
}

export const joinCommand: Command = {
  usage: JOIN_USAGE,
  name: "join",
  summary: "Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45)",
  args: "group --account <a> --group <g> [--live] | --show | --answer [--set n=v]... [--agree] | --fill [--live [--submit]] [--bypass] [--json]",
  run: runJoin,
};
