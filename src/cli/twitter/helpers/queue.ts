import { spawnSync } from "node:child_process";
import { namedLabel } from "../../../inbox/store/index.ts";
import { providerOf } from "../../../extensions/voiceClone/index.ts";
import { voiceNoteDeps } from "../../voiceNote/index.ts";
import { closeSync, existsSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { planSend } from "../../../twitter/post/send/index.ts";
import { dmInterruptedLines, dmSplit, localMedia, sendDmParts, splitLine } from "./send.ts";
import { guardSend } from "../../../inbox/claims/index.ts";
import { waitCaughtUp } from "../../../inbox/catchUp/index.ts";
import { chatContextOf } from "../../../inbox/context/index.ts";
import { gateDeps } from "./voice.ts";
import {
  addToQueue,
  approvalProblem,
  approveQueue,
  buildQueue,
  fingerprint,
  itemProblems,
  linesOf,
  loadQueue,
  editItem,
  liveLock,
  logPathOf,
  pidAlive,
  planQueue,
  QUEUE_ACTIONS,
  toAPerson,
  queueLog,
  saveQueue,
  sendIncoming,
  takeIncoming,
  statusCounts,
  systemRandom,
  targetOfItem,
  targetsOf,
} from "../../../twitter/queue/plan/index.ts";
import type { EventKind, Queue, QueueAction, QueueItem } from "../../../twitter/queue/plan/index.ts";
import { addQueueNudge, queueExists, releaseQueueLock, takeQueueLock, takeQueueNudge } from "../../../twitter/queue/store/index.ts";
import { runQueue } from "../../../twitter/queue/run/index.ts";
import { createInspector, formatTraceLine } from "../../../observability/trace/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec, PositionalSpec } from "../../runner/types.ts";
import { openTwitterAccount } from "./account.ts";
import { watermarkLine } from "../../../twitter/copy/watermark/index.ts";
import { activityOf, contextChangesSince } from "../../../twitter/dm/person/index.ts";
import type { TwitterNotification } from "../../../twitter/notification/feed/index.ts";
import { findTwitterAccount } from "../../../twitter/account/session/index.ts";

const QUEUE: PositionalSpec = { name: "queue", kind: "string", required: true, description: "The queue file (.json)" };

export const QUEUE_USAGE = [
  "Usage: log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm|voice] [--seed <n>]",
  "       log twitter queue show <queue.json> [--json]",
  "       log twitter queue check <queue.json> [--skipXChatCheck] [--json]",
  "       log twitter queue status <queue.json> [--json]",
  "       log twitter queue approve <queue.json> --by <who>",
  "       log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]",
  "       log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]",
  "       log twitter queue add <queue.json> --targets <targets.json> --by <who> [--action reply|quote|dm|voice] [--window <2h|90m>] [--minGap <s>]",
  "       log twitter queue nudge <queue.json> [--replies <n>]",
  "       log twitter queue edit <queue.json> --n <n> --text \"<new copy>\" --by <who> [--window <30m>]",
  "A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).",
  "build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.",
  "run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.",
].join("\n");

const flag = (name: string, kind: FlagSpec["kind"], description: string, extra: Partial<FlagSpec> = {}): FlagSpec => ({ name, kind, description, ...extra });

export const QUEUE_INPUT: CommandInput = {
  forms: [
    {
      words: ["build"],
      effect: "write",
      summary: "Build a queue file pairing each target with one unique approved line, sending nothing",
      positionals: [],
      flags: [
        flag("targets", "string", "The targets file: a list (or items) of {handle, tweet_url | post_url | user_id, post_text, text}; text is that target's own line", { required: true }),
        flag("variations", "list", "The copy files, comma-separated: each a list (or messages) of lines; not needed when every target carries its own text"),
        flag("out", "string", "The queue file to write (never overwritten)", { required: true }),
        flag("account", "string", "The TWITTER socialAccount that will send it", { required: true }),
        flag("action", "enum", "What each item sends (default reply)", { values: QUEUE_ACTIONS }),
        flag("seed", "integer", "The shuffle's seed (default 1)"),
      ],
    },
    { words: ["show"], summary: "Show a queue: who, which post, what copy, and its approval", positionals: [QUEUE], flags: [JSON_FLAG] },
    { words: ["check"], summary: "Check every pending item's target and house style; for a dm queue, read the account's X Chat inbox and drop anyone already in a conversation", positionals: [QUEUE], flags: [flag("skipXChatCheck", "boolean", "Skip the X Chat prior-conversation drop, only when matt asked (rule 87)"), JSON_FLAG] },
    { words: ["status"], summary: "Count a queue's items by status", positionals: [QUEUE], flags: [JSON_FLAG] },
    { words: ["approve"], effect: "write", summary: "Record who approved the queue as it stands now", positionals: [QUEUE], flags: [flag("by", "string", "Who approved it", { required: true })] },
    {
      words: ["plan"],
      effect: "write",
      summary: "Draw a random time for every like and reply inside a window, contacting nothing",
      positionals: [QUEUE],
      flags: [
        flag("window", "string", "How long to spread it over: 5h or 90m", { required: true, pattern: "^\\d+(?:\\.\\d+)?[hm]$", takes: "a span in hours or minutes, e.g. 5h or 90m" }),
        flag("limit", "integer", "Plan at most this many posts"),
        flag("start", "string", "When the window opens (an ISO time, default now)"),
        flag("minGap", "integer", "Seconds between any two events, at least 30 (default 120)"),
        flag("like", "boolean", "Randomly like posts too, each at its own random moment"),
        flag("likeChance", "number", "The chance a post gets a like, 0-1 (default 0.7)", { min: 0, max: 1 }),
      ],
    },
    {
      words: ["run"],
      effect: "write",
      summary: "Run a queue's plan as an XState machine; a dry run lists what it would send unless --live",
      positionals: [QUEUE],
      flags: [
        flag("alertChannel", "string", "A buzz channel to post the stop to"),
        flag("alertReplyTo", "string", "A buzz event id to thread them under"),
        flag("alertMention", "list", "Pubkeys (hex) the halt tags, comma-separated"),
        flag("force", "boolean", "Go past the account's governor (its pause and caps) for every send, only when matt asked (rule 86)"),
        flag("keepOpen", "boolean", "Stay running once everything is sent, taking in what queue add puts in, until cancelled"),
        flag("live", "boolean", "Send on X, only when matt asked (rule 8)", { live: true }),
        JSON_FLAG,
      ],
    },
    {
      words: ["add"],
      effect: "write",
      summary: "Add approved dms, replies or quotes to an account's queue, even while it runs: each is fitted between what is already planned, at least the queue's minGap apart, and sent through the same run and the account's one X session",
      positionals: [QUEUE],
      flags: [
        flag("targets", "string", "The targets file: a list (or items) of {handle, tweet_url | post_url | user_id, post_text, text}; each target carries its own text", { required: true }),
        flag("action", "enum", "What each added item sends (default reply)", { values: QUEUE_ACTIONS }),
        flag("by", "string", "Who approved what is added (the queue is approved again as it then stands)", { required: true }),
        flag("window", "string", "How far ahead to fit them: 2h or 90m (default 2h)", { pattern: "^\\d+(?:\\.\\d+)?[hm]$", takes: "a span in hours or minutes, e.g. 2h or 90m" }),
        flag("minGap", "integer", "Seconds from any other planned send, at least 30 (default the queue's own)"),
      ],
    },
    { words: ["nudge"], effect: "write", summary: "Tell a running queue to send its next replies now", positionals: [QUEUE], flags: [flag("replies", "integer", "How many replies to send now (default 1)")] },
    {
      words: ["edit"],
      effect: "write",
      summary: "Put new copy on a pending or held queue item (redrafted from the person's full context), plan a held one again and approve the queue as it then stands",
      positionals: [QUEUE],
      flags: [
        flag("n", "integer", "The item's number", { required: true }),
        flag("text", "string", "The new copy, gated with voice first", { required: true }),
        flag("by", "string", "Who approved the new copy", { required: true }),
        flag("window", "string", "For a held item, how soon to send it again: 30m or 2h (default 30m)", { pattern: "^\\d+(?:\\.\\d+)?[hm]$", takes: "a span in hours or minutes, e.g. 30m or 2h" }),
      ],
    },
  ],
};

const fail = (message: string): CommandResult => ({ code: 1, stderr: `log twitter queue: ${message}\n${QUEUE_USAGE}` });

export function wholeFlag(flags: Record<string, unknown>, name: string, fallback: number): number {
  const value = flags[name];
  if (value === undefined) return fallback;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n)) throw new Error(`--${name} is a whole number`);
  return n;
}

function readJson(path: string): unknown {
  if (!existsSync(path)) throw Object.assign(new Error(`no file at ${path}`), { code: "queueInvalid" });
  return JSON.parse(readFileSync(path, "utf8"));
}

function load(path: string): Queue {
  try {
    return loadQueue(path);
  } catch (error) {
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), { code: "queueInvalid" });
  }
}

function showQueue(queue: Queue): string {
  const rows = queue.items.flatMap((it) => [`${String(it.n).padStart(4)} ${it.status.padEnd(8)} @${(it.handle ?? "?").padEnd(20)} ${targetOfItem(it) ?? "-"}`, `       ${it.text}`]);
  const approval = queue.approval ? `${queue.approval.by} at ${queue.approval.at}${queue.approval.fingerprint === fingerprint(queue) ? "" : " (VOID: the queue changed after it)"}` : "none";
  const plan = queue.randomRun ? `, planned ${queue.randomRun.events.length} events across ${queue.randomRun.window}` : "";
  return [...rows, "", `account @${queue.account} | approval: ${approval}${plan}`].join("\n");
}

function takeNudge(path: string): number {
  return takeQueueNudge(path);
}

function buzz(args: { channel?: string; replyTo?: string; mentions: string[] }, content: string, mention: boolean): string {
  if (!args.channel) return "";
  const cmd = ["messages", "send", "--channel", args.channel, "--content", content];
  if (args.replyTo) cmd.push("--reply-to", args.replyTo);
  if (mention) for (const m of args.mentions) cmd.push("--mention", m);
  const sent = spawnSync("buzz", cmd, { encoding: "utf8", timeout: 60_000, windowsHide: true });
  return sent.status === 0 ? "buzz alert sent" : `buzz alert FAILED: ${(sent.stderr || sent.stdout || String(sent.error ?? "")).slice(-160)}`;
}

function dryRunLines(queue: Queue): string[] {
  const byN = new Map(queue.items.map((it) => [it.n, it]));
  const events = (queue.randomRun?.events ?? []).filter((e) => !e.done && !e.skipped);
  return events.map((e) => {
    const it = byN.get(e.n);
    const what = e.kind === "like" ? `like ${it?.tweetUrl}` : `${it?.action} ${targetOfItem(it ?? ({} as QueueItem))}: "${it?.text}"`;
    return `  ${e.at}  #${e.n} @${it?.handle ?? "?"}  ${what}`;
  });
}

function specFor(item: QueueItem, kind: EventKind, approvedBy: string, style: string | null | undefined, media?: string[]) {
  if (kind === "like") return planSend({ action: "like", tweetUrl: item.tweetUrl, approvedBy, live: true });
  return planSend({ action: (item.action === "voice" ? "dm" : item.action) as Exclude<QueueAction, "voice">, tweetUrl: item.tweetUrl, userId: item.userId, text: item.text, media, approvedBy, style, live: true });
}

async function runCommand(context: CommandContext, path: string, flags: Record<string, unknown>): Promise<CommandResult> {
  const queue = load(path);
  const refused = approvalProblem(queue);
  if (refused) return refuse("twitter queue run", "queueNotApproved", refused);
  if (!queue.randomRun) return refuse("twitter queue run", "queueNoPlan", `${path} has no plan`);
  if (flags["live"] !== true) {
    const lines = dryRunLines(queue);
    if (flags["json"]) return { code: 0, stdout: JSON.stringify({ dryRun: true, account: queue.account, approvedBy: queue.approval!.by, events: queue.randomRun.events.filter((e) => !e.done && !e.skipped) }, null, 2) };
    return { code: 0, stdout: [`log twitter queue run: dry run: @${queue.account}, approved by ${queue.approval!.by}, ${lines.length} events would fire:`, ...lines, "X was not contacted. --live sends them at these times (rule 8)."].join("\n") };
  }
  const opened = await openTwitterAccount(context, "twitter queue run", queue.account);
  if (!opened.ok) return opened.result;
  const taken = takeQueueLock(path, process.pid, pidAlive);
  if (!taken.ok) return refuse("twitter queue run", "queueBusy", `a run (pid ${taken.holder}) is already going on this queue`);
  const alertArgs = { channel: typeof flags["alertChannel"] === "string" ? (flags["alertChannel"] as string) : undefined, replyTo: typeof flags["alertReplyTo"] === "string" ? (flags["alertReplyTo"] as string) : undefined, mentions: Array.isArray(flags["alertMention"]) ? (flags["alertMention"] as string[]) : [] };
  const nowMs = () => (context.now?.() ?? new Date()).getTime();
  const log = (line: string) => context.err(queueLog(path, line, new Date(nowMs())));
  const approvedBy = queue.approval!.by;
  const contextChanged = async (item: QueueItem): Promise<string[]> => {
    const since = item.draftedAt ?? queue.created;
    if (!item.handle && !item.userId) return ["no handle or user id, so their context could not be read before sending"];
    const caught = await waitCaughtUp("twitter", queue.account);
    if (!caught.ok) {
      log(`#${item.n}: ${caught.refused}`);
      return [caught.refused];
    }
    const who = { userId: item.userId ?? null, handle: item.handle ?? null };
    const held = chatContextOf("twitter", queue.account, who, since);
    const activity = activityOf(held.activity as unknown as TwitterNotification[], who, since);
    const changed = contextChangesSince(held.messages, activity, since);
    if (!changed.length && item.text?.trim()) {
      const voiced = await gateDeps.gate(context, { platform: "twitter", account: queue.account, to: item.handle ? `@${item.handle.replace(/^@/, "")}` : namedLabel("twitter", queue.account, String(item.userId ?? ""), String(item.userId ?? "")), text: item.text, handle: item.handle ?? null, userId: item.userId ?? null, ...(item.postText?.trim() ? { said: item.postText } : {}), ...(item.action === "voice" ? { spoken: true } : {}) });
      if (!voiced.ok) {
        log(`#${item.n} @${item.handle ?? "?"}: ${voiced.refused}`);
        return voiced.refused.split("\n").slice(1).map((l) => `voice gate: ${l.replace(/^\s*-\s*/, "")}`);
      }
      log(`#${item.n} @${item.handle ?? "?"}: ${voiced.line}`);
    }
    log(`#${item.n} @${item.handle ?? "?"}: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at ${since}, the account caught up): ${changed.length ? `${changed.length} new` : "nothing new"}`);
    return changed;
  };
  try {
    const result = await runQueue(
      queue,
      {
        send: async (item, kind): Promise<TwitterSessionAnswer> => {
          let media: string[] | undefined;
          try {
            media = kind === "like" ? undefined : await localMedia(item.media);
          } catch (error) {
            return { ok: false, code: "mediaInvalid", detail: error instanceof Error ? error.message : String(error) };
          }
          if (kind !== "like" && item.action === "voice") {
            if (!item.userId || !item.text?.trim()) return { ok: false, code: "targetMissing", detail: "a voice item needs the person's user id and the words to say" };
            const caught = await waitCaughtUp("twitter", opened.account.accountName);
            if (!caught.ok) return { ok: false, code: "accountBehind", detail: caught.refused };
            const secrets = await context.twenty.loginSecrets(opened.account.id).catch(() => null);
            const chatPin = secrets?.messengerPin ? String(secrets.messengerPin) : "";
            if (!chatPin) return { ok: false, code: "xchatPinMissing", detail: `${opened.account.accountName} has no X Chat PIN saved, so X Chat can't be opened to send a voice note` };
            const chosen = providerOf(undefined);
            if (!chosen.ok) return { ok: false, code: "voiceProviderInvalid", detail: String((chosen as { detail?: string }).detail ?? "no voice provider") };
            const rendered = await voiceNoteDeps.render(chosen.provider, "twitter", item.text);
            if (!rendered.ok) return { ok: false, code: rendered.code, detail: rendered.detail };
            log(`#${item.n} @${item.handle ?? "?"}: voice note made in the owner's cloned voice, ${rendered.note.seconds} s`);
            const guard = guardSend({ platform: "twitter", account: opened.account.accountName, conversationId: item.userId });
            if (!guard.ok) return { ok: false, code: "chatClaimedElsewhere", detail: guard.refused };
            if (guard.part(0, `voice note: ${item.text}`) !== "go") {
              guard.done("failed", "the claim on this chat was lost before the voice note went out");
              return { ok: false, code: "chatClaimLost", detail: "the claim on this chat was lost before the voice note went out, so nothing was sent" };
            }
            const answer = (await opened.engine({ action: "xchatVoice", userId: item.userId, path: rendered.note.path, seconds: rendered.note.seconds, live: true, approvedBy, chatPin, ...(flags["force"] === true ? { force: true } : {}) } as never)).answer;
            if (answer.ok && answer.event === "sent") guard.partSent(0, `voice note: ${item.text}`, answer.messageId ? String(answer.messageId) : null);
            guard.done(answer.ok && answer.event === "sent" ? "sent" : "failed", answer.ok ? "voice note" : String(answer.code ?? ""));
            return answer;
          }
          const plan = specFor(item, kind, approvedBy, opened.account.copyStyle, media);
          if (!plan.ok) return { ok: false, code: plan.problem.code, detail: plan.problem.detail };
          if (plan.watermark) log(`#${item.n} @${item.handle ?? "?"}: ${watermarkLine(plan.watermark)}`);
          const spec = flags["force"] === true ? { ...plan.spec, force: true } : plan.spec;
          if (kind === "like" || item.action !== "dm" || !plan.spec.text || !item.userId) return (await opened.engine(spec)).answer;
          const split = dmSplit(plan.spec.text, item.userId, false);
          if (split.parts.length > 1) log(`#${item.n} dm ${splitLine(split)}`);
          const caught = await waitCaughtUp("twitter", opened.account.accountName);
          if (!caught.ok) return { ok: false, code: "accountBehind", detail: caught.refused };
          const guard = guardSend({ platform: "twitter", account: opened.account.accountName, conversationId: item.userId });
          if (!guard.ok) return { ok: false, code: "chatClaimedElsewhere", detail: guard.refused };
          let parts: Awaited<ReturnType<typeof sendDmParts>>;
          try {
            parts = await sendDmParts(context, opened.engine, spec, split, { account: opened.account.accountName, userId: item.userId }, guard);
          } catch (error) {
            guard.done("failed", error instanceof Error ? error.message : String(error));
            throw error;
          }
          const { answers, last, interrupted } = parts;
          const okParts = answers.filter((a) => a.ok && a.event === "sent").length;
          guard.done(interrupted.length ? "interrupted" : okParts === split.parts.length ? "sent" : "failed", `${okParts} of ${split.parts.length}${parts.lost ? ", then the claim on this chat was lost, so the rest was held" : ""}`);
          if (!last) return { ok: false, code: "chatClaimLost", detail: "the claim on this chat was lost before anything was sent, so nothing went out" };
          const done = answers.filter((a) => a.ok && a.event === "sent").length;
          if (interrupted.length) {
            for (const line of dmInterruptedLines(opened.account.accountName, split, done, interrupted)) log(`#${item.n} @${item.handle ?? "?"}: ${line}`);
            return { ...answers[done - 1], detail: `${done} of ${split.parts.length} parts sent, then they wrote while it was going out ("${interrupted[0].text}"), so the rest was held; what was sent stays sent, never resent` };
          }
          if (done && done < split.parts.length) return { ...answers[done - 1], detail: `${done} of ${split.parts.length} parts sent, then ${last.answer.event ?? last.answer.code}: ${last.answer.detail ?? ""}; what was sent stays sent, never resent` };
          return last.answer;
        },
        nowMs,
        sleep: context.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
        cancelled: context.cancelled,
        rng: systemRandom,
        log,
        alert: (message, mention) => {
          if (mention) {
            log("!".repeat(60));
            log(`STOPPED: ${message}`);
            log("!".repeat(60));
          } else log(message);
          const said = buzz(alertArgs, `x reply queue${mention ? " stopped" : ""}: ${message}`, mention);
          if (said) log(said);
        },
        takeNudge: () => takeNudge(path),
        takeAdded: () => {
          const additions = takeIncoming(path);
          const events = additions.flatMap((addition) => addToQueue(queue, addition, systemRandom, new Date(nowMs())));
          if (additions.length) saveQueue(path, queue);
          return events;
        },
        keepOpen: flags["keepOpen"] === true,
        contextChanged,
        save: () => saveQueue(path, queue),
      },
      createInspector((line) => context.err(formatTraceLine(line))),
    );
    const counts = statusCounts(queue);
    if (flags["json"]) return { code: result.state === "finished" ? 0 : 5, stdout: JSON.stringify({ ...result, counts, log: logPathOf(path) }, null, 2) };
    return { code: result.state === "finished" ? 0 : 5, stdout: `log twitter queue run: ${result.state}${result.reason ? `: ${result.reason}` : ""}. ${result.sent} replies sent, ${result.skipped} skipped. ${JSON.stringify(counts)} (log: ${logPathOf(path)})` };
  } finally {
    releaseQueueLock(path, process.pid);
  }
}

export const queueCommand: Command = {
  usage: QUEUE_USAGE,
  platform: "twitter",
  name: "queue",
  effect: "write",
  input: QUEUE_INPUT,
  summary: "Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine",
  args: "build|show|check|status|approve|plan|run|add|nudge|edit <queue.json> …",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(QUEUE_INPUT));
    if (!parsed.ok) return fail(parsed.error);
    const [word, path, ...extra] = parsed.positionals;
    const form = QUEUE_INPUT.forms.find((f) => f.words[0] === word);
    if (!form) return fail("give build, show, check, status, approve, plan, run, add, nudge or edit");
    const allowed = new Set(form.flags.map((f) => f.name));
    const stray = Object.keys(parsed.flags).filter((name) => !allowed.has(name));
    if (stray.length) return fail(`${word} doesn't take --${stray.join(", --")}`);
    if (extra.length || (word === "build" ? path !== undefined : typeof path !== "string")) return fail(word === "build" ? "build takes only flags" : `${word} needs the queue file`);
    const flags = parsed.values;
    const now = context.now?.() ?? new Date();
    try {
      if (word === "build") {
        const out = flags["out"] as string;
        if (existsSync(out) || queueExists(out)) return refuse("twitter queue build", "queueInvalid", `${out} exists; it is never overwritten`);
        const files = (flags["variations"] as string[] | undefined) ?? [];
        let targets;
        let lines: string[];
        try {
          targets = targetsOf(readJson(flags["targets"] as string));
          lines = files.flatMap((f) => linesOf(readJson(f)));
        } catch (error) {
          return refuse("twitter queue build", "queueInvalid", error instanceof Error ? error.message : String(error));
        }
        const action = (flags["action"] as QueueAction | undefined) ?? "reply";
        let queue: Queue;
        try {
          queue = buildQueue({ account: flags["account"] as string, action, targets, lines, sources: [flags["targets"] as string, ...files], seed: wholeFlag(flags, "seed", 1), now });
        } catch (error) {
          return refuse("twitter queue build", "queueInvalid", error instanceof Error ? error.message : String(error));
        }
        saveQueue(out, queue);
        return { code: 0, stdout: `log twitter queue build: ${out}: ${queue.items.length} ${action} items from ${new Set(lines).size} lines, nothing sent. Next: show, check, approve.` };
      }
      const file = path as string;
      if (word === "show") {
        const queue = load(file);
        return { code: 0, stdout: flags["json"] ? JSON.stringify(queue, null, 2) : showQueue(queue) };
      }
      if (word === "status") {
        const queue = load(file);
        const out = { account: queue.account, approvedBy: queue.approval?.by ?? null, approvalValid: !approvalProblem(queue), ...statusCounts(queue) };
        return { code: 0, stdout: flags["json"] ? JSON.stringify(out, null, 2) : JSON.stringify(out) };
      }
      if (word === "check") {
        const queue = load(file);
        const styleAccount = await findTwitterAccount(context.twenty, queue.account).catch(() => null);
        const problems = itemProblems(queue, styleAccount?.copyStyle);
        let priorSkipped: { handle: string | null; n: number }[] = [];
        if (queue.items.some((i) => i.action === "dm" && i.status === "pending") && flags["skipXChatCheck"] !== true) {
          const opened = await openTwitterAccount(context, "twitter queue check", queue.account);
          if (!opened.ok) return opened.result;
          context.err(queueLog(file, `reading ${queue.account}'s X Chat inbox to drop anyone already in a conversation (rule 87)`, now));
          const run = await opened.engine({ action: "xchatContacts" });
          if (!run.answer.ok) return refuse("twitter queue check", "xChatCheckFailed", run.answer.detail ?? run.answer.code ?? "the X Chat inbox read failed");
          const contacts = new Set(run.answer.contacts ?? []);
          for (const item of queue.items) {
            if (item.action === "dm" && item.status === "pending" && item.userId && contacts.has(item.userId)) {
              item.status = "skipped";
              item.result = "priorConversation: already in an X Chat conversation with this account (rule 87)";
              priorSkipped.push({ handle: item.handle ?? null, n: item.n });
            }
          }
          if (priorSkipped.length) saveQueue(file, queue);
        }
        const pending = queue.items.filter((i) => i.status === "pending").length;
        context.err(queueLog(file, `checked ${pending} pending: ${problems.length} failed, ${priorSkipped.length} dropped for a prior X Chat conversation (nothing sent)`, now));
        const priorLines = priorSkipped.map((p) => `  dropped #${p.n} @${p.handle ?? "?"}: already in an X Chat conversation`);
        if (flags["json"]) return { code: problems.length ? 1 : 0, stdout: JSON.stringify({ pending, problems, priorConversationDropped: priorSkipped }, null, 2) };
        return { code: problems.length ? 1 : 0, stdout: [`log twitter queue check: ${pending} pending, ${problems.length} failed, ${priorSkipped.length} dropped for a prior X Chat conversation, nothing sent.`, ...priorLines, ...problems.map((p) => `  #${p.n}: ${p.detail}`)].join("\n") };
      }
      if (word === "approve") {
        const queue = approveQueue(load(file), flags["by"] as string, now);
        saveQueue(file, queue);
        context.err(queueLog(file, `approved by ${queue.approval!.by}: ${queue.approval!.count} pending items as they stand now`, now));
        return { code: 0, stdout: `log twitter queue approve: ${file} approved by ${queue.approval!.by}, ${queue.approval!.count} pending items. Any edit voids it.` };
      }
      if (word === "plan") {
        const chance = (flags["likeChance"] as number | undefined) ?? 0.7;
        const start = typeof flags["start"] === "string" ? new Date(flags["start"] as string) : now;
        if (Number.isNaN(start.getTime())) return fail("--start is a time, e.g. 2026-10-26T09:00:00+07:00");
        let queue: Queue;
        try {
          queue = planQueue(load(file), { window: flags["window"] as string, limit: wholeFlag(flags, "limit", 0), start, minGap: wholeFlag(flags, "minGap", 120), like: flags["like"] === true, likeChance: chance }, systemRandom, now);
        } catch (error) {
          return fail(error instanceof Error ? error.message : String(error));
        }
        saveQueue(file, queue);
        const events = queue.randomRun!.events;
        const byN = new Map(queue.items.map((it) => [it.n, it]));
        const lines = events.map((e) => `  ${e.at}  ${e.kind.padEnd(5)} #${e.n} @${byN.get(e.n)?.handle ?? "?"}`);
        return { code: 0, stdout: [`log twitter queue plan: ${events.length} events across ${queue.randomRun!.window} from ${start.toISOString()}, at least ${queue.randomRun!.minGap}s apart. Saved in ${file}; nothing sent.`, ...lines].join("\n") };
      }
      if (word === "run") return await runCommand(context, file, flags);
      if (word === "add") {
        let targets;
        try {
          targets = targetsOf(readJson(flags["targets"] as string));
        } catch (error) {
          return refuse("twitter queue add", "queueInvalid", error instanceof Error ? error.message : String(error));
        }
        const addition = { action: (flags["action"] as QueueAction | undefined) ?? "reply", targets, approvedBy: flags["by"] as string, window: typeof flags["window"] === "string" ? (flags["window"] as string) : "2h", minGap: flags["minGap"] === undefined ? undefined : wholeFlag(flags, "minGap", 120), at: now.toISOString() };
        if (liveLock(file)) {
          sendIncoming(file, addition);
          context.err(queueLog(file, `add: ${targets.length} ${addition.action} handed to the running run, approved by ${addition.approvedBy}`, now));
          return { code: 0, stdout: `log twitter queue add: ${targets.length} ${addition.action} handed to the run going on ${file}; it fits them between what is planned and sends them through the account's one X session (log: ${logPathOf(file)}).` };
        }
        const queue = load(file);
        let events;
        try {
          events = addToQueue(queue, addition, systemRandom, now);
        } catch (error) {
          return refuse("twitter queue add", "queueInvalid", error instanceof Error ? error.message : String(error));
        }
        saveQueue(file, queue);
        const byN = new Map(queue.items.map((it) => [it.n, it]));
        context.err(queueLog(file, `add: ${events.length} ${addition.action} added and planned, approved by ${addition.approvedBy}`, now));
        return { code: 0, stdout: [`log twitter queue add: ${events.length} ${addition.action} added to ${file} and fitted into its plan; no run is going, so start one with queue run --live (--keepOpen to keep taking more).`, ...events.map((e) => `  ${e.at}  #${e.n} @${byN.get(e.n)?.handle ?? "?"}`)].join("\n") };
      }
      if (word === "edit") {
        if (liveLock(file)) return refuse("twitter queue edit", "queueBusy", "a run is going on this queue: stop it with jobCancel, edit, then run it again (its saves would undo the edit)");
        const queue = load(file);
        let event;
        try {
          event = editItem(queue, wholeFlag(flags, "n", 0), String(flags["text"] ?? ""), flags["by"] as string, systemRandom, now, typeof flags["window"] === "string" ? (flags["window"] as string) : "30m");
        } catch (error) {
          return refuse("twitter queue edit", "queueInvalid", error instanceof Error ? error.message : String(error));
        }
        saveQueue(file, queue);
        const n = wholeFlag(flags, "n", 0);
        const item = queue.items.find((i) => i.n === n)!;
        context.err(queueLog(file, `edit: #${n} @${item.handle ?? "?"} has new copy, approved by ${flags["by"] as string}${event ? `, planned again at ${event.at}` : ""}`, now));
        const lines = item.text.split("\n").map((l) => `  ${l}`);
        return { code: 0, stdout: [`log twitter queue edit: #${n} @${item.handle ?? "?"} now reads:`, ...lines, `${event ? `planned at ${event.at}` : "keeps its planned time"}; the queue is approved again by ${flags["by"] as string}. Nothing sent.`].join("\n") };
      }
      let replies: number;
      try {
        replies = wholeFlag(flags, "replies", 1);
      } catch (error) {
        return fail(error instanceof Error ? error.message : String(error));
      }
      if (replies < 1) return fail("--replies must be at least 1");
      if (!liveLock(file)) return refuse("twitter queue nudge", "queueBusy", "no run is going on this queue: start one with queue run --live first");
      const total = addQueueNudge(file, replies);
      context.err(queueLog(file, `nudge: send the next ${total} replies now`, now));
      return { code: 0, stdout: `log twitter queue nudge: the run sends its next ${total} replies now (log: ${logPathOf(file)}).` };
    } catch (error) {
      return refuseError(`twitter queue ${word}`, error);
    }
  },
};
