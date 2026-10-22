/**
 * `log facebook poll <group> <account> [<how long to poll>]` (matt, rule 63): poll a Facebook group from one
 * account, in that account's open browser (rule 35). One poll is one read of the group through the group read
 * machine (`group/read`), posts only, nothing clicked (rule 8), and its answer is one JSON line: the posts the
 * read saw, in OpenMagpie's record shape (`group/read/helpers/openMagpieWorker.ts`). With a time, it polls
 * again every 5 minutes (OpenMagpie's own default feed interval) until the time is up, a line per poll as it
 * happens (rule 26).
 *
 *   log facebook poll <group url|id> <account> [30m|2h] [--bypass]
 *   log facebook poll --request <json>
 *       OpenMagpie's `facebook_group` worker (obris-dev/openmagpie#178, #188), called by
 *       `python/openMagpie/facebookWorker.py`: `groups.search` with its group ids, terms and limit. Each group
 *       is read by an account in it (its `agencyGroups` row, a member first) that may run, is inside its
 *       hours and has its browser open; one poll, one JSON answer.
 *
 * Which posts are new is the group's cursor in Twenty (`readCursor`, by post id); OpenMagpie dedups repeats.
 */
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import { ensureGroup, parseGroupRef } from "../../group/join/index.ts";
import type { GroupRef } from "../../group/join/index.ts";
import type { Group } from "../../group/join/index.ts";
import { parseWorkerRequest, recordsOf, scrollsFor, WORKER_DEFAULT_LIMIT, workerCodeOf } from "../../group/read/index.ts";
import type { WorkerAnswer, WorkerRecord } from "../../group/read/index.ts";
import { checkRunnable, findAccount } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { TwentyError } from "../../twenty/graphql/index.ts";
import { readInBrowser } from "../read/index.ts";
import { refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { parsePollArgs } from "./helpers/index.ts";

export * from "./helpers/index.ts";

/** Between polls when it polls for a time: OpenMagpie's default feed interval (`poll_interval_seconds` 300). */
export const POLL_EVERY_MS = 5 * 60_000;

export const POLL_USAGE = [
  "Usage: log facebook poll <group url or id> <accountName> [<how long to poll: 30m, 2h>] [--bypass]",
  "       log facebook poll --request <request json>   (OpenMagpie's facebook_group worker: groups.search in, post records out as one JSON line; python/openMagpie/facebookWorker.py calls it)",
  "One poll reads the group once in the account's open browser, posts only, nothing clicked, and prints one JSON line: the posts it saw, as OpenMagpie's records. With a time it polls every 5 minutes until the time is up, a line each.",
  "Every poll runs inside the account's local hours (rule 18); --bypass skips that, only when matt asked (rule 20). --request never skips it.",
  "The account's browser must be open (log inspect start for that account, or log facebook host start): a poll is a step in it (rule 35).",
].join("\n");

/** The seams tests replace: the wait between polls. */
export const pollDeps = { sleep: (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)) };

type GroupError = { group_id: string; code: string; error: string };

/** One poll of one group by one account: its records, or why there are none. A checkpoint or sign-out is `auth_required`. */
async function pollOnce(context: CommandContext, account: FacebookAccount, group: Group, ref: GroupRef, limit: number, terms: string[], bypass: boolean): Promise<{ records: WorkerRecord[]; error: GroupError | null }> {
  const groupId = group.facebookGroupId ?? ref.key;
  const read = await readInBrowser(context, account, group, ref, { scrolls: scrollsFor(limit), commentPosts: 0, live: false, bypass });
  if (!read.ok) return { records: [], error: { group_id: groupId, code: workerCodeOf(read.code), error: read.detail } };
  const records = recordsOf(read.output.seen, terms, limit);
  const problem = read.output.problem;
  context.err(`  ${problem ? "✗" : "✓"} group ${groupId}: ${records.length} post(s) for the answer, ${read.output.posts.length} new${problem ? `, stopped: ${problem.code}` : ""}`);
  return { records, error: problem ? { group_id: groupId, code: workerCodeOf(problem.code), error: problem.detail } : null };
}

/** `--request`: OpenMagpie's call, one poll of each group it names. Always one JSON answer. */
async function pollRequest(context: CommandContext, text: string): Promise<CommandResult> {
  const answer = (value: WorkerAnswer): CommandResult => ({ code: value.ok ? 0 : 1, stdout: JSON.stringify(value) });
  const request = parseWorkerRequest(text);
  if ("code" in request) return answer({ ok: false, code: request.code, error: request.error });
  context.err(`OpenMagpie asks for ${request.groupIds.length} group(s), up to ${request.limit} post(s) each${request.terms.length ? `, matching ${request.terms.join(", ")}` : ""}.`);
  const results: WorkerRecord[] = [];
  const errors: GroupError[] = [];
  for (const groupId of request.groupIds) {
    const failed = (code: string, error: string) => {
      errors.push({ group_id: groupId, code: workerCodeOf(code), error });
      context.err(`  ✗ group ${groupId}: ${code}: ${error}`);
    };
    try {
      const rows = await context.twenty.list("agencyGroups", { facebookGroupId: { eq: groupId } });
      if (!rows.length) {
        failed("groupNoAccount", `no account in Twenty is in group ${groupId}: join it first (log facebook join group)`);
        continue;
      }
      // A member's row first; then the first one whose account may run and has its browser open.
      const ordered = [...rows].sort((a, b) => Number(b.joinStatus === "MEMBER") - Number(a.joinStatus === "MEMBER"));
      let account: FacebookAccount | null = null;
      for (const row of ordered) {
        if (!row.socialAccountId) continue;
        const candidate = await findAccount(context.twenty, row.socialAccountId);
        if (checkRunnable(candidate, "run").ok && readCurrentInspect(undefined, candidate.accountName)) {
          account = candidate;
          break;
        }
      }
      if (!account) {
        failed("groupBrowserNotOpen", `no account in group ${groupId} has its browser open (log inspect start --account <a> --detach)`);
        continue;
      }
      const ref = parseGroupRef(groupId);
      if (!ref.ok) {
        failed("groupRefInvalid", ref.error);
        continue;
      }
      const group = await ensureGroup(context.twenty, account.id, ref.group);
      const polled = await pollOnce(context, account, group, ref.group, request.limit, request.terms, false);
      results.push(...polled.records);
      if (polled.error) errors.push(polled.error);
    } catch (error) {
      failed(error instanceof TwentyError ? error.code : "crashed", error instanceof Error ? error.message : String(error));
    }
  }
  if (!results.length && errors.length) return answer({ ok: false, code: errors[0]!.code, error: errors.map((e) => `${e.group_id}: ${e.error}`).join("; ") });
  return answer({ ok: true, result: { results, errors }, new_cookies: [] });
}

export async function runPoll(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parsePollArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `log facebook poll: ${parsed.error}\n${POLL_USAGE}` };
  if (parsed.mode === "request") return await pollRequest(context, parsed.request);

  try {
    const ref = parseGroupRef(parsed.group);
    if (!ref.ok) return refuse("poll", "groupRefInvalid", ref.error);
    const account = await findAccount(context.twenty, parsed.account);
    const check = checkRunnable(account, "run");
    if (!check.ok) return refuse("poll", check.code, check.detail);
    const group = await ensureGroup(context.twenty, account.id, ref.group);
    const now = () => (context.now?.() ?? new Date()).getTime();
    const until = parsed.forMs === null ? null : now() + parsed.forMs;
    if (until !== null) context.err(`Polling ${group.name ?? ref.group.key} as ${account.accountName} every ${POLL_EVERY_MS / 60_000} min until ${new Date(until).toISOString().slice(11, 16)}Z.`);
    let polls = 0;
    let lastCode = 0;
    for (;;) {
      polls++;
      const polled = await pollOnce(context, account, group, ref.group, WORKER_DEFAULT_LIMIT, [], parsed.bypass);
      const answer: WorkerAnswer =
        !polled.records.length && polled.error ? { ok: false, code: polled.error.code, error: polled.error.error } : { ok: true, result: { results: polled.records, errors: polled.error ? [polled.error] : [] }, new_cookies: [] };
      lastCode = answer.ok ? 0 : 1;
      // A line per poll as it happens (rule 26); one poll returns its line as the command's output.
      if (until === null) return { code: lastCode, stdout: JSON.stringify(answer) };
      context.out(JSON.stringify(answer));
      // A checkpoint or a sign-out ends the polling: the account needs its issue cleared first.
      if (polled.error?.code === "auth_required") return { code: 1, stderr: `log facebook poll: stopped after poll ${polls}: ${polled.error.error}` };
      if (now() + POLL_EVERY_MS > until) break;
      await pollDeps.sleep(POLL_EVERY_MS);
    }
    return { code: lastCode, stderr: `log facebook poll: ${polls} poll(s), done.` };
  } catch (error) {
    return refuseError("poll", error);
  }
}

export const pollCommand: Command = {
  usage: POLL_USAGE,
  platform: "facebook",
  name: "poll",
  summary: "Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63)",
  args: "<group> <account> [<how long to poll>] [--bypass] | --request <json>",
  run: runPoll,
};
