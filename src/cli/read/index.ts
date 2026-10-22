/**
 * `log read group --account <a> --group <g>` — read a Facebook group's new posts and
 * their comments as one account (#27), through the group read machine (`group/read`).
 *
 *   log read group --account <a> --group <url|id> [--scrolls <n>] [--commentPosts <n>] [--live] [--json]
 *       in the account's OPEN browser (rule 35: `log inspect start` or `log host start`
 *       opened it; a read never launches its own): opens the group, scrolls its feed
 *       until the last read's posts show (or --scrolls, default 6), and keeps only the
 *       posts newer than the group's cursor. Then it opens each post whose comment count
 *       grew (at most --commentPosts, default 5) and reads its comments. Every post and
 *       comment comes from what the page loaded, read from each step's own HAR (rule 22).
 *       Nothing is clicked without --live; --live switches each post's comments to
 *       Newest (two clicks, rule 8), which shows every comment, where the page's own
 *       "Most relevant" shows some.
 *   log read group --account <a> --group <g> --show
 *       the group's saved posts and comments from Twenty, and nothing opened.
 *   log read group --worker <request json>
 *       OpenMagpie's `facebook_group` worker (obris-dev/openmagpie#178, #188): the group's newest
 *       posts in Twenty answer as one JSON object on stdout, at once, with no browser. Twenty is
 *       kept full by the host, which reads every group its account is in on its own clock
 *       (`log host start --groupMinutes <n>`, the firehose).
 *
 * The posts go to `agencyGroupPosts`, their comments to `agencyGroupComments`, and only
 * then does the group's `readCursor` move (`group/read/client.ts`). Every step prints a
 * line as it happens (rule 26).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createActor, fromPromise, toPromise } from "xstate";
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import type { CurrentInspect } from "../../browser/inspect/index.ts";
import { ensureGroup, parseGroupRef } from "../../group/join/index.ts";
import type { Group, GroupRef } from "../../group/join/index.ts";
import { AGENCY_GROUP_COMMENTS, AGENCY_GROUP_POSTS, groupReadMachine, parseWorkerRequest, readFreshness, readStateOf, recordsOf, saveRead, uniquePosts } from "../../group/read/index.ts";
import type { GroupReadOutput, ReadStepInput, ReadStepReply, SavedRead, WorkerAnswer, WorkerRecord } from "../../group/read/index.ts";
import type { ErrorCode } from "../../errors/catalog/index.ts";
import { homeOf, outsideActiveHours } from "../../marketplace/home/index.ts";
import { checkRunnable, findAccount } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { createInspector, formatTraceLine } from "../../observability/trace/index.ts";
import { TwentyError } from "../../twenty/graphql/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import { refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { parseReadArgs } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const READ_USAGE = [
  "Usage: log read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]",
  "       log read group --account <accountName> --group <g> --show [--json]",
  "       log read group --worker <request json>   (OpenMagpie's facebook_group worker: groups.search in, the posts Twenty holds out as one JSON line, no browser; python/openMagpie/facebookWorker.py calls it)",
  "Reads the group's new posts (since its cursor in Twenty) and the comments of the posts whose comments grew, in the account's open browser.",
  "--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).",
  "--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.",
  "Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).",
  "The account's browser must be open (log inspect start --account <a>, or log host start): a read is a step in it (rule 35).",
].join("\n");

/** The group's saved posts, newest first, with their comments, as `--show` prints them. */
async function renderSaved(twenty: TwentyClient, groupRowId: string, name: string): Promise<{ text: string; json: unknown }> {
  const posts = (await twenty.list(AGENCY_GROUP_POSTS, { agencyGroupId: { eq: groupRowId } })).sort((a, b) => String(b.postedAt ?? "").localeCompare(String(a.postedAt ?? "")));
  const comments = posts.length ? await twenty.list(AGENCY_GROUP_COMMENTS, { agencyGroupPostId: { in: posts.map((p) => p.id) } }) : [];
  const lines = [`Group ${name}: ${posts.length} post(s) saved, ${comments.length} comment(s).`];
  for (const post of posts.slice(0, 30)) {
    const own = comments.filter((c) => c.agencyGroupPostId === post.id);
    lines.push(`  ${String(post.postedAt ?? "").slice(0, 16)} ${post.authorName || "anonymous"}: ${post.name}  [${post.commentCount ?? "?"} comment(s), ${own.length} saved]`);
    for (const c of own.sort((a, b) => String(a.commentedAt ?? "").localeCompare(String(b.commentedAt ?? ""))).slice(0, 5)) lines.push(`      ${c.depth ? "↳ " : ""}${c.authorName || "anonymous"}: ${c.name}`);
  }
  if (posts.length > 30) lines.push(`  … ${posts.length - 30} older`);
  return { text: lines.join("\n"), json: { posts, comments } };
}

/** The run's end as one line for `agencyGroups.lastReadReason`. Pure. */
export function readReason(output: GroupReadOutput, runDir: string): string {
  const head = output.problem ? `stopped, ${output.problem.code}: ${output.problem.detail}` : "read";
  const comments = output.commentReads.length ? `, comments of ${output.commentReads.length} post(s): ${output.comments.length}` : "";
  return `${head}; ${output.posts.length} new of ${output.seen.length} seen${comments}${output.gap ? ", scrolls ran out before the last read" : ""}; ${runDir}`;
}

function renderRun(output: GroupReadOutput, saved: SavedRead, live: boolean): string {
  const head = output.problem ? `stopped: ${output.problem.code}: ${output.problem.detail}` : `${output.posts.length} new post(s) of ${output.seen.length} the feed showed`;
  const lines = [`log read group: ${head}.`];
  for (const post of output.posts) lines.push(`  ${post.createdAt.slice(0, 16)} ${post.author.name || "anonymous"}: ${post.text.replace(/\s+/g, " ").slice(0, 100) || "(no text)"}${post.commentCount ? `  [${post.commentCount} comment(s)]` : ""}`);
  for (const read of output.commentReads) lines.push(`  comments on ${read.postId}: ${read.comments}${read.commentCount !== null ? ` of ${read.commentCount}` : ""}${read.problem ? ` (stopped short: ${read.problem})` : ""}`);
  if (output.commentReads.length && !live) lines.push("  (the page's Most relevant comments: --live switches them to Newest, which shows every one)");
  if (output.gap) lines.push("  The scrolls ran out before the last read's posts showed: posts between may be missing (raise --scrolls).");
  const rejected = Object.entries(output.rejected).map(([why, n]) => `${why} ${n}`);
  if (rejected.length) lines.push(`  rejected (never patched): ${rejected.join(", ")}`);
  lines.push(`  Twenty: ${saved.postsAdded} post(s) added, ${saved.postsUpdated} updated, ${saved.commentsAdded} comment(s) added, ${saved.commentsUpdated} updated; cursor ${saved.cursorMoved ? "moved" : "kept"}.`);
  for (const step of output.steps) lines.push(`  ${step.ok ? "✓" : "✗"} ${step.step}${step.detail ? `: ${step.detail}` : ""}${step.folder ? `  (${step.folder})` : ""}`);
  return lines.join("\n");
}

/** What one read in an account's open browser gave, or why it didn't run (a gate, no open browser). */
type ReadInBrowser = { ok: true; output: GroupReadOutput; saved: SavedRead } | { ok: false; code: ErrorCode; detail: string };

/** How much one read covers. */
export interface ReadOptions {
  scrolls: number;
  commentPosts: number;
  live: boolean;
}

/**
 * One read of one group in a session that is already open, with no gates of its own: the machine,
 * then Twenty (posts, comments, then the cursor). `log read group` reads through it after its gates;
 * the host (`log host start`, rule 35) through it in the browser it holds, inside its hours.
 */
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
        // The posts and comments are read from the step's own recording (rule 22).
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

  context.err("Saving to Twenty: posts first, then comments, then the cursor.");
  const saved = await saveRead(context.twenty, group.id, output, readReason(output, current.runDir), context.now?.() ?? new Date(), (line) => context.err(line));
  return { output, saved };
}

/** `log read group`'s gates (the account's hours, rule 18; its open browser, rule 35), then the read. */
async function readInBrowser(context: CommandContext, account: FacebookAccount, group: Group, ref: GroupRef, options: ReadOptions & { bypass: boolean }): Promise<ReadInBrowser> {
  const home = homeOf(account);
  if (!home.ok) return { ok: false, code: home.code, detail: home.detail };
  const outside = options.bypass ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
  if (outside) return { ok: false, code: "outsideActiveHours", detail: outside };
  if (options.bypass) context.err("--bypass: the waking-hours gate is skipped for this run only (rule 20).");
  const current = readCurrentInspect(undefined, account.accountName);
  if (!current) return { ok: false, code: "groupBrowserNotOpen", detail: `no open browser for ${account.accountName}` };
  return { ok: true, ...(await readGroupOnce(context, current, account, group, ref, options)) };
}

/**
 * `--worker <request>`: OpenMagpie's `facebook_group` worker (obris-dev/openmagpie#178, #188), called
 * through `python/openMagpie/facebookWorker.py`. It answers from Twenty at once and opens nothing:
 * the reading is the host's (`log host start`), which reads each group its account is in on its
 * own clock and pours the posts into Twenty (the firehose, matt 2026-10-22). Each group's posts are
 * those of every account in it, newest first, matched to the terms; OpenMagpie's watermark and its
 * external_id dedup drop what it already has. A group no host has read lately is said in `errors`.
 * The answer is always one JSON object on stdout.
 */
async function runWorker(context: CommandContext, text: string): Promise<CommandResult> {
  const answer = (value: WorkerAnswer): CommandResult => ({ code: value.ok ? 0 : 1, stdout: JSON.stringify(value) });
  const request = parseWorkerRequest(text);
  if ("code" in request) return answer({ ok: false, code: request.code, error: request.error });
  context.err(`OpenMagpie asks for ${request.groupIds.length} group(s), up to ${request.limit} post(s) each${request.terms.length ? `, matching ${request.terms.join(", ")}` : ""}.`);
  const now = context.now?.() ?? new Date();
  const results: WorkerRecord[] = [];
  const errors: { group_id: string; code: string; error: string }[] = [];
  let known = 0;
  for (const groupId of request.groupIds) {
    const failed = (code: string, error: string) => {
      errors.push({ group_id: groupId, code, error });
      context.err(`  ✗ group ${groupId}: ${code}: ${error}`);
    };
    try {
      const rows = await context.twenty.list("agencyGroups", { facebookGroupId: { eq: groupId } });
      if (!rows.length) {
        failed("groupNoAccount", `no account in Twenty is in group ${groupId}: join it first (log join group)`);
        continue;
      }
      known++;
      const freshness = readFreshness(rows.map((r) => r.lastReadAt ?? null), now);
      if (freshness) failed(freshness.code, `group ${groupId}: ${freshness.detail}`);
      const posts = (await Promise.all(rows.map((r) => context.twenty.list(AGENCY_GROUP_POSTS, { agencyGroupId: { eq: r.id } })))).flat();
      const records = recordsOf(uniquePosts(posts), groupId, request.terms, request.limit);
      results.push(...records);
      context.err(`  ✓ group ${groupId}: ${records.length} post(s) from Twenty`);
    } catch (error) {
      failed(error instanceof TwentyError ? error.code : "crashed", error instanceof Error ? error.message : String(error));
    }
  }
  if (!known) return answer({ ok: false, code: errors[0]!.code, error: errors.map((e) => e.error).join("; ") });
  return answer({ ok: true, result: { results, errors }, new_cookies: [] });
}

export async function runRead(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseReadArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `log read: ${parsed.error}\n${READ_USAGE}` };
  if (parsed.worker !== null) return await runWorker(context, parsed.worker);
  if (!parsed.account || !parsed.group) return { code: 1, stderr: `log read: --account and --group are both needed\n${READ_USAGE}` };

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
  summary: "Read a Facebook group's new posts and their comments as one account, in its open browser; saved to agencyGroupPosts and agencyGroupComments, then the cursor moves (#27)",
  args: "group --account <a> --group <g> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json] | --show | --worker <request>",
  run: runRead,
};
