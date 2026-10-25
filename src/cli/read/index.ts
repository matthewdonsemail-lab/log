import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import type { CurrentInspect } from "../../browser/inspect/index.ts";
import { ensureGroup, parseGroupRef } from "../../facebook/group/join/index.ts";
import type { Group, GroupRef } from "../../facebook/group/join/index.ts";
import { membersReadMachine, membersUrlOf, ownersOf, planLine, planMembers, saveMembers, summaryOf } from "../../facebook/group/members/index.ts";
import type { GroupMember, MembersPlan, MembersReadOutput, MembersStepInput, MembersStepReply, SavedMembers } from "../../facebook/group/members/index.ts";
import { cursorOf, groupReadMachine, readStateOf, saveRead } from "../../facebook/group/read/index.ts";
import type { GroupReadOutput, ReadStepInput, ReadStepReply, SavedRead } from "../../facebook/group/read/index.ts";
import type { ErrorCode } from "../../errors/catalog/index.ts";
import { homeOf, outsideActiveHours } from "../../marketplace/home/index.ts";
import { checkRunnable, findAccount } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import { refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { accountHasSession, parseReadArgs, READ_INPUT, renderDirectRead } from "./helpers/index.ts";
import type { ReadMembersArgs } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const READ_USAGE = [
  "Usage: log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]",
  "       log facebook read group --account <accountName> --group <g> --show [--json]",
  "Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some, in the account's open browser. Only the cursor is saved to Twenty (rule 65); --show prints it.",
  "--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).",
  "--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).",
  "--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.",
  "Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).",
  "The account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).",
  "log facebook read members --account <accountName> --group <group url or id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]",
  "Reads the group's newest members from its People tab (/groups/<g>/members) in the account's open browser: the page's first 10, then a scroll at a time, each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answers (about 10 members each, 2 a scroll). Nothing is clicked (rule 8).",
  "--count: members to read (1-5000). --secondsPerScroll: the wait before each scroll (default 15; matt: the time 40 scrolls take is a variable). --maxScrolls: scrolls at most (default twice the plan's, plus 2). It says up front: count N → ~S scrolls, ~M min at Xs per scroll.",
  "It stops at --count members, when the list ends (has_next_page false) or at --maxScrolls. --owners keeps only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set).",
  "The members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty; it prints how many, how many with a bio, owners and pages, and the files. --json gives them.",
].join("\n");

async function renderSaved(twenty: TwentyClient, groupRowId: string, name: string): Promise<{ text: string; json: unknown }> {
  const row = await twenty.get("agencyGroups", groupRowId);
  const cursor = cursorOf(row?.readCursor);
  const lines = [
    `Group ${name}: ${row?.lastReadAt ? `last read ${row.lastReadAt.slice(0, 16)}Z` : "never read"}.`,
    cursor.watermark === null && !cursor.seenIds?.length
      ? "  No cursor yet: the first read keeps every post it sees."
      : `  Cursor: newest post ${cursor.lastPostId ?? "?"} at ${cursor.watermark === null ? "?" : new Date(cursor.watermark * 1000).toISOString().slice(0, 16)}Z, ${cursor.seenIds?.length ?? 0} post id(s) already seen.`,
    ...(row?.lastReadReason ? [`  Last read: ${row.lastReadReason}`] : []),
    "  The posts themselves go to OpenMagpie (log facebook poll); only its matches reach Twenty, in socialListening (rule 65).",
  ];
  return { text: lines.join("\n"), json: { lastReadAt: row?.lastReadAt ?? null, lastReadReason: row?.lastReadReason ?? null, cursor } };
}

export function readReason(output: GroupReadOutput, runDir: string): string {
  const head = output.problem ? `stopped, ${output.problem.code}: ${output.problem.detail}` : "read";
  const comments = output.commentReads.length ? `, comments of ${output.commentReads.length} post(s): ${output.comments.length}` : "";
  return `${head}; ${output.posts.length} new of ${output.seen.length} seen${comments}${output.gap ? ", scrolls ran out before the last read" : ""}; ${runDir}`;
}

function renderRun(output: GroupReadOutput, saved: SavedRead, live: boolean): string {
  const head = output.problem ? `stopped: ${output.problem.code}: ${output.problem.detail}` : `${output.posts.length} new post(s) of ${output.seen.length} the feed showed`;
  const lines = [`log facebook read group: ${head}.`];
  for (const post of output.posts) lines.push(`  ${post.createdAt.slice(0, 16)} ${post.author.name || "anonymous"}: ${post.text.replace(/\s+/g, " ").slice(0, 100) || "(no text)"}${post.commentCount ? `  [${post.commentCount} comment(s)]` : ""}`);
  for (const read of output.commentReads) lines.push(`  comments on ${read.postId}: ${read.comments}${read.commentCount !== null ? ` of ${read.commentCount}` : ""}${read.problem ? ` (stopped short: ${read.problem})` : ""}`);
  if (output.commentReads.length && !live) lines.push("  (the page's Most relevant comments: --live switches them to Newest, which shows every one)");
  if (output.gap) lines.push("  The scrolls ran out before the last read's posts showed: posts between may be missing (raise --scrolls).");
  const rejected = Object.entries(output.rejected).map(([why, n]) => `${why} ${n}`);
  if (rejected.length) lines.push(`  rejected (never patched): ${rejected.join(", ")}`);
  lines.push(`  Twenty: the cursor ${saved.cursorMoved ? "moved" : "stayed"}; no post or comment is saved there (rule 65).`);
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? `: ${step.detail}` : ""}${step.folder ? `  (${step.folder})` : ""}`);
  return lines.join("\n");
}

export type ReadInBrowser = { ok: true; output: GroupReadOutput; saved: SavedRead } | { ok: false; code: ErrorCode; detail: string };

export interface ReadOptions {
  scrolls: number;
  commentPosts: number;
  live: boolean;
}

export async function readGroupOnce(context: CommandContext, current: CurrentInspect, account: FacebookAccount, group: Group, ref: GroupRef, options: ReadOptions): Promise<{ output: GroupReadOutput; saved: SavedRead }> {
  const state = await readStateOf(context.twenty, group.id);
  context.err(
    `Reading ${group.name ?? ref.key} in ${account.accountName}'s open browser (${current.runDir}): ${state.cursor.watermark === null ? "a first read" : `new since ${new Date(state.cursor.watermark * 1000).toISOString().slice(0, 16)}`}, up to ${options.scrolls} scroll(s), comments of up to ${options.commentPosts} post(s)${options.live ? ", --live: comments switched to Newest" : ", nothing clicked"}.`,
  );

  const machine = groupReadMachine.provide({
    actors: {
      step: fromPromise<ReadStepReply, ReadStepInput>(async ({ input }) => {
        context.err(`  → ${input.action} ${input.args.join(" ")}`);
        const reply = await context.sendInspect(current, input.action, input.args, 120_000);
        if (!reply) return { ok: false, error: `no reply from the open browser in 120 s (${current.runDir})` };
        const harPath = reply.folder ? join(reply.folder, "network.har") : null;
        let har: ReadStepReply["har"];
        try {
          har = harPath && existsSync(harPath) ? JSON.parse(readFileSync(harPath, "utf8")) : undefined;
        } catch {
          har = undefined;
        }
        return { ok: reply.ok, error: reply.error, url: reply.url, title: reply.title, folder: reply.folder, har };
      }),
    },
  });
  const actor = createActor(machine, {
    input: {
      account: account.accountName,
      group: { key: ref.key, url: group.groupUrl ?? ref.url, facebookGroupId: group.facebookGroupId },
      cursor: state.cursor,
      commentsRead: state.commentsRead,
      maxScrolls: options.scrolls,
      maxCommentPosts: options.commentPosts,
      live: options.live,
    },
    inspect: createInspector((line) => context.err(formatTraceLine(line))),
  });
  let shown = 0;
  actor.subscribe((snapshot) => {
    const steps = snapshot.context.steps;
    while (shown < steps.length) {
      const step = steps[shown++]!;
      context.err(`  ${step.ok ? "✓" : "✗"} ${step.step}: ${step.detail ?? ""}`);
    }
  });
  actor.start();
  const output = await toPromise(actor);

  const saved = await saveRead(context.twenty, group.id, output, readReason(output, current.runDir), context.now?.() ?? new Date());
  context.err(`Twenty: the group's cursor ${saved.cursorMoved ? "moved" : "stayed"} (rule 65: only the cursor is kept there).`);
  return { output, saved };
}

export async function readInBrowser(context: CommandContext, account: FacebookAccount, group: Group, ref: GroupRef, options: ReadOptions & { bypass: boolean }): Promise<ReadInBrowser> {
  const home = homeOf(account);
  if (!home.ok) return { ok: false, code: home.code, detail: home.detail };
  const outside = options.bypass ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
  if (outside) return { ok: false, code: "outsideActiveHours", detail: outside };
  if (options.bypass) context.err("--bypass: the waking-hours gate is skipped for this run only (rule 20).");
  const current = readCurrentInspect(undefined, account.accountName);
  if (!current) return { ok: false, code: "groupBrowserNotOpen", detail: `no open browser for ${account.accountName}` };
  return { ok: true, ...(await readGroupOnce(context, current, account, group, ref, options)) };
}

export interface MembersRead {
  output: MembersReadOutput;
  kept: GroupMember[];
  saved: SavedMembers;
  plan: MembersPlan;
  seconds: number;
}

export async function readMembersOnce(context: CommandContext, current: CurrentInspect, account: FacebookAccount, ref: GroupRef, options: { plan: MembersPlan; owners: boolean }): Promise<MembersRead> {
  const { plan } = options;
  const started = Date.now();
  context.err(`Reading ${ref.key}'s members in ${account.accountName}'s open browser (${current.runDir}), nothing clicked: ${planLine(plan)}, ${plan.maxScrolls} at most.`);
  let lastScrollAt: number | null = null;
  const machine = membersReadMachine.provide({
    actors: {
      step: fromPromise<MembersStepReply, MembersStepInput>(async ({ input }) => {
        if (input.action === "scroll") {
          const since = lastScrollAt === null ? "" : ` (${Math.round((Date.now() - lastScrollAt) / 1000)}s since the last one began)`;
          context.err(`  → scroll${since}`);
          lastScrollAt = Date.now();
        } else context.err(`  → ${input.action} ${input.args.join(" ")}`);
        const reply = await context.sendInspect(current, input.action, input.args, 120_000);
        if (!reply) return { ok: false, error: `no reply from the open browser in 120 s (${current.runDir})` };
        const harPath = reply.folder ? join(reply.folder, "network.har") : null;
        let har: MembersStepReply["har"];
        try {
          har = harPath && existsSync(harPath) ? JSON.parse(readFileSync(harPath, "utf8")) : undefined;
        } catch {
          har = undefined;
        }
        return { ok: reply.ok, error: reply.error, url: reply.url, title: reply.title, folder: reply.folder, har };
      }),
    },
  });
  const actor = createActor(machine, {
    input: { account: account.accountName, group: { key: ref.key, membersUrl: membersUrlOf(ref.key) }, plan },
    inspect: createInspector((line) => context.err(formatTraceLine(line))),
  });
  let shown = 0;
  let waitingFor = -1;
  actor.subscribe((snapshot) => {
    const steps = snapshot.context.steps;
    while (shown < steps.length) {
      const step = steps[shown++]!;
      context.err(`  ${step.ok ? "✓" : "✗"} ${step.step}: ${step.detail ?? ""}`);
    }
    if (snapshot.value === "waiting" && plan.secondsPerScroll > 0 && waitingFor !== snapshot.context.scrolls) {
      waitingFor = snapshot.context.scrolls;
      context.err(`  … ${plan.secondsPerScroll}s before scroll ${snapshot.context.scrolls + 1}`);
    }
  });
  actor.start();
  const output = await toPromise(actor);
  const kept = options.owners ? ownersOf(output.members) : output.members;
  const saved = saveMembers(output, kept, plan, { owners: options.owners, now: context.now?.() ?? new Date() });
  const seconds = Math.round((Date.now() - started) / 1000);
  context.err(`Saved ${kept.length} member(s) to ${saved.tsv} (and .json): ${output.scrolls} scroll(s) in ${seconds}s.`);
  return { output, kept, saved, plan, seconds };
}

const STOP_WORDS = { count: "reached --count", end: "the list ended", maxScrolls: "--maxScrolls reached" } as const;

export function renderMembers(read: MembersRead, owners: boolean): string {
  const { output, kept, saved, plan, seconds } = read;
  const summary = summaryOf(output.members);
  const head = output.problem ? `stopped: ${output.problem.code}: ${output.problem.detail}` : `${summary.members} member(s) of ${plan.count} asked, ${STOP_WORDS[output.stop ?? "count"]}`;
  const lines = [
    `log facebook read members: ${head}.`,
    `  ${planLine(plan)}; it took ${output.scrolls} scroll(s) in ${Math.round(seconds / 6) / 10} min.`,
    `  members ${summary.members}, with a bio ${summary.withBio}, owners ${summary.owners} (${summary.ownersByBio} by bio, ${summary.owners - summary.ownersByBio} as a page only), pages ${summary.pages}.`,
    `  ${owners ? `--owners: kept the ${kept.length} owner(s)` : `kept all ${kept.length}`}: ${saved.tsv}`,
    `  json: ${saved.json}`,
  ];
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? `: ${step.detail}` : ""}${step.folder ? `  (${step.folder})` : ""}`);
  return lines.join("\n");
}

async function runReadMembers(context: CommandContext, parsed: ReadMembersArgs): Promise<CommandResult> {
  if (parsed.count === null) return { code: 1, stderr: `log facebook read members: --count is needed\n${READ_USAGE}` };
  const ref = parseGroupRef(parsed.group ?? "");
  if (!ref.ok) return refuse("read", "groupRefInvalid", ref.error);
  const account = await findAccount(context.twenty, parsed.account ?? "");
  const check = checkRunnable(account, "run");
  if (!check.ok) return refuse("read", check.code, check.detail);
  const home = homeOf(account);
  if (!home.ok) return refuse("read", home.code, home.detail);
  const outside = parsed.bypass ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
  if (outside) return refuse("read", "outsideActiveHours", outside);
  if (parsed.bypass) context.err("--bypass: the waking-hours gate is skipped for this run only (rule 20).");
  const current = readCurrentInspect(undefined, account.accountName);
  if (!current) return refuse("read", "groupBrowserNotOpen", `no open browser for ${account.accountName}`);
  const plan = planMembers(parsed.count, parsed.secondsPerScroll, parsed.maxScrolls);
  const read = await readMembersOnce(context, current, account, ref.group, { plan, owners: parsed.owners });
  const code = read.output.result === "stopped" ? 1 : 0;
  if (parsed.json) return { code, stdout: JSON.stringify({ ...read.output, members: read.kept, owners: parsed.owners, summary: summaryOf(read.output.members), plan, seconds: read.seconds, saved: read.saved }, null, 2) };
  return { code, stdout: renderMembers(read, parsed.owners) };
}

export async function runRead(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseReadArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `log facebook read: ${parsed.error}\n${READ_USAGE}` };
  if (!parsed.account || !parsed.group) return { code: 1, stderr: `log facebook read: --account and --group are both needed\n${READ_USAGE}` };
  if (parsed.target === "members") {
    try {
      return await runReadMembers(context, parsed);
    } catch (error) {
      return refuseError("read", error);
    }
  }

  try {
    const ref = parseGroupRef(parsed.group);
    if (!ref.ok) return refuse("read", "groupRefInvalid", ref.error);
    const account = await findAccount(context.twenty, parsed.account);
    const check = checkRunnable(account, "run");
    if (!check.ok) return refuse("read", check.code, check.detail);
    const group = await ensureGroup(context.twenty, account.id, ref.group);

    if (parsed.show) {
      const shown = await renderSaved(context.twenty, group.id, group.name ?? ref.group.key);
      return { code: 0, stdout: parsed.json ? JSON.stringify(shown.json, null, 2) : shown.text };
    }

    if (!parsed.live && ref.group.numeric && context.directRead && accountHasSession(account) && account.proxy) {
      const direct = context.directRead(account, ref.group.key);
      if (direct.ok) {
        await context.twenty.update("agencyGroups", group.id, { lastReadAt: new Date().toISOString(), lastReadReason: `directApi groups.feed_read: ${direct.rows.length} post(s)` } as never);
        return { code: 0, stdout: parsed.json ? JSON.stringify({ engine: "directApi", posts: direct.rows }, null, 2) : renderDirectRead(direct.rows) };
      }
      context.err(`direct-API read unavailable (${direct.detail}); falling back to the browser`);
    }

    const read = await readInBrowser(context, account, group, ref.group, { scrolls: parsed.scrolls, commentPosts: parsed.commentPosts, live: parsed.live, bypass: parsed.bypass });
    if (!read.ok) return refuse("read", read.code, read.detail);
    const code = read.output.result === "stopped" ? 1 : 0;
    if (parsed.json) return { code, stdout: JSON.stringify({ ...read.output, saved: read.saved }, null, 2) };
    return { code, stdout: renderRun(read.output, read.saved, parsed.live) };
  } catch (error) {
    return refuseError("read", error);
  }
}

export const readCommand: Command = {
  usage: READ_USAGE,
  platform: "facebook",
  name: "read",
  effect: "browser",
  summary: "Read a Facebook group's new posts and their comments, or its newest members, as one account, in its open browser, by hand; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file",
  args: "group --account <a> --group <g> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json] | --show | members --account <a> --group <g> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]",
  input: READ_INPUT,
  run: runRead,
};
