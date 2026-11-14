import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writesPerDayOf } from "../../../directApi/engine/index.ts";
import { fileSize, mediaKindOf, planSend } from "../../../twitter/post/send/index.ts";
import { watermarkLine } from "../../../twitter/copy/watermark/index.ts";
import type { SendAction } from "../../../twitter/post/send/index.ts";
import type { TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, listOf, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../../runner/types.ts";
import { ONE_INBOX_NOTE } from "../../../twitter/dm/person/index.ts";
import type { TwitterEngineSpec } from "../../../twitter/account/session/index.ts";
import { readProfiles, splitPlan } from "../../../voice/pairs/index.ts";
import { incomingSince, interruptedLines } from "../../../inbox/watch/index.ts";
import { guardSend } from "../../../inbox/claims/index.ts";
import { latestSeq } from "../../../inbox/store/index.ts";
import { waitCaughtUp } from "../../../inbox/catchUp/index.ts";
import { gateDeps } from "./voice.ts";
import type { InboxMessage } from "../../../inbox/watch/index.ts";
import type { SplitPlan, VoiceProfile } from "../../../voice/pairs/index.ts";
import type { CommandContext } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";
import type { Engine } from "./account.ts";

const ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle) that sends it" };
const TWEET: FlagSpec = { name: "tweet", kind: "string", required: true, pattern: "^https?://(?:www\\.)?(?:x|twitter)\\.com/[A-Za-z0-9_]+/status/\\d+", takes: "an x.com post url (https://x.com/<handle>/status/<id>)", refusal: "tweetUrlInvalid", description: "The post's url (https://x.com/<handle>/status/<id>), from treg research" };
const USER_ID: FlagSpec = { name: "userId", kind: "string", required: true, pattern: "^\\d+$", takes: "an X user id (digits only)", refusal: "userIdInvalid", description: "The recipient's numeric X user id, from treg research" };
const DM_USER_ID: FlagSpec = { ...USER_ID, pattern: "^(?:\\d+|g\\d+)$", takes: "an X user id (digits only) or an X Chat group id (g and digits)" };
const MEDIA: FlagSpec = { name: "media", kind: "list", description: "Files to attach, comma separated: one video (.mp4 .mov) or gif, or up to 4 images (.jpg .png .webp) on a post or a reply, one file on a dm (it goes on the first message); a file path or an https url, which is downloaded first; uploaded to X before it is sent" };

export async function localMedia(entries: readonly string[] | undefined, fetcher: typeof fetch = fetch): Promise<string[] | undefined> {
  if (!entries?.length) return entries as string[] | undefined;
  const out: string[] = [];
  for (const entry of entries) {
    if (!/^https:\/\//.test(entry)) {
      out.push(entry);
      continue;
    }
    const answer = await fetcher(entry);
    if (!answer.ok) throw Object.assign(new Error(`${entry}: the download answered HTTP ${answer.status}`), { code: "mediaInvalid" });
    const name = (new URL(entry).pathname.split("/").filter(Boolean).slice(-2).join("_") || "media").replace(/[^A-Za-z0-9._]/g, "_");
    const dir = mkdtempSync(join(tmpdir(), "logMedia"));
    const path = join(dir, name);
    writeFileSync(path, Buffer.from(await answer.arrayBuffer()));
    out.push(path);
  }
  return out;
}
const TEXT: FlagSpec = { name: "text", kind: "string", required: true, description: "The approved copy, in house style (lowercase, no commas, full stops or dashes; urls exempt)" };
const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", approval: true, description: "Who approved it: needed with --live (rule 8)" };
const SKIP_STYLE: FlagSpec = { name: "skipStyleCheck", kind: "boolean", description: "Skip the account's copy style check (copyStyle, empty: house), only when the owner asked" };
export const FORCE: FlagSpec = { name: "force", kind: "boolean", description: "Go past the account's governor (its pause, hourly, daily and write caps) for this call, only when the owner asked (rule 86)" };
const AS_ONE: FlagSpec = { name: "asOne", kind: "boolean", description: "Send the dm as one message, never split, only when the owner asked (rule 90)" };
const OVER_GATE: FlagSpec = { name: "overGate", kind: "boolean", description: "the owner said to send this exact dm over the voice gate's refusal: its SubQ read is skipped, the AI artifact check still runs; only when he said so for this message (rule 152)" };
const LIVE: FlagSpec = { name: "live", kind: "boolean", live: true, description: "Send it on X, only when the owner asked (rule 8); without it a dry run checks it and contacts nothing" };

interface SendShape {
  action: SendAction;
  verb: string;
  target: "tweet" | "userId" | "none";
  text: boolean;
  summary: string;
  says: string;
}

const SHAPES: Record<SendAction, SendShape> = {
  reply: { action: "reply", verb: "reply to", target: "tweet", text: true, summary: "Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live", says: "X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits)" },
  quote: { action: "quote", verb: "quote", target: "tweet", text: true, summary: "Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live", says: "X's create answer decides: a tweet id is sent, an empty result is a drop" },
  like: { action: "like", verb: "like", target: "tweet", text: false, summary: "Like one post on X, on the direct-API engine; a dry run unless --live", says: "X's favorite answer decides: Done (or already liked, code 139) is sent" },
  repost: { action: "repost", verb: "repost", target: "tweet", text: false, summary: "Repost one post on X, on the direct-API engine; a dry run unless --live", says: "X's retweet answer decides: a created retweet (or already reposted, code 327) is sent" },
  follow: { action: "follow", verb: "follow", target: "userId", text: false, summary: "Follow one person on X, on the direct-API engine; a dry run unless --live", says: "X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them" },
  post: { action: "post", verb: "post", target: "none", text: true, summary: "Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live", says: "Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted" },
  dm: { action: "dm", verb: "dm", target: "userId", text: true, summary: "Send one approved direct message on X, on the direct-API engine; a dry run unless --live", says: `A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). ${ONE_INBOX_NOTE} A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed` },
};

function usageOf(shape: SendShape): string {
  const target = shape.target === "tweet" ? "--tweet <postUrl>" : shape.target === "userId" ? "--userId <id>" : "";
  const text = shape.text ? ` --text "<copy>"${shape.action === "post" || shape.action === "reply" ? " [--media <file>[,<file>]]" : shape.action === "dm" ? " [--media <file|url>]" : ""}` : "";
  const skip = shape.text ? ` [--skipStyleCheck]${shape.action === "dm" ? " [--asOne] [--overGate]" : ""}` : "";
  return [
    `Usage: log twitter ${shape.action} --account <accountName>${target ? ` ${target}` : ""}${text} [--approvedBy <who>]${skip} [--force] [--live] [--json]`,
    `${shape.summary.replace(", on the direct-API engine; a dry run unless --live", "")}, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).`,
    `Without --live it is a dry run: the target${shape.text ? ", the text and its house style" : ""} are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (${writesPerDayOf("twitter")} a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.`,
    `${shape.says}. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.`,
  ].join("\n");
}

function inputOf(shape: SendShape): CommandInput {
  const flags: FlagSpec[] = [ACCOUNT, ...(shape.target === "tweet" ? [TWEET] : shape.target === "userId" ? [shape.action === "dm" ? DM_USER_ID : USER_ID] : []), ...(shape.text ? [TEXT, SKIP_STYLE] : []), ...(shape.action === "post" || shape.action === "reply" || shape.action === "dm" ? [MEDIA] : []), ...(shape.action === "dm" ? [AS_ONE, OVER_GATE] : []), APPROVED_BY, FORCE, LIVE, JSON_FLAG];
  return { forms: [{ words: [], effect: "write", summary: shape.summary, positionals: [], flags }] };
}

export function renderSent(label: string, account: string, answer: TwitterSessionAnswer): string {
  if (answer.ok && answer.event === "sent") {
    if (answer.liked) return `log ${label}: ${account} liked ${answer.tweetId}${answer.already ? " (it was already liked)" : ""}.`;
    if (answer.reposted) return `log ${label}: ${account} reposted ${answer.tweetId}${answer.already ? " (it was already reposted)" : ""}.`;
    if (answer.followed) return `log ${label}: ${account} follows ${answer.handle ? `@${answer.handle}` : answer.userId}${answer.already ? " (already did)" : ""}.`;
    if (answer.conversationId) return `log ${label}: ${account} sent the dm (conversation ${answer.conversationId}): delivered, it shows in their X Chat too, so it is never resent.`;
    return `log ${label}: ${account} posted https://x.com/${account}/status/${answer.tweetId}.${answer.forcedPast ? ` Forced past the governor: ${answer.forcedPast}.` : ""}`;
  }
  const reset = answer.rateLimitReset ? `, X's limit resets at ${new Date(answer.rateLimitReset * 1000).toISOString()}` : "";
  return `log ${label}: ${account}: ${answer.event ?? answer.code}${answer.code && answer.event ? ` (${answer.code})` : ""}: ${answer.detail ?? ""}${reset}`;
}

export const twitterSendDeps: { profiles: () => Record<string, VoiceProfile>; incoming: (account: string, userId: string, since: string) => InboxMessage[]; now: () => string } = {
  profiles: () => readProfiles(),
  incoming: (account, userId, since) => incomingSince("twitter", account, (id) => id.split(/[-:]/).includes(userId), since),
  now: () => new Date().toISOString(),
};

export function dmChatProfile(profiles: Record<string, VoiceProfile>, userId: string): VoiceProfile | null {
  const chats = Object.entries(profiles).filter(([key, p]) => key.startsWith("chat:twitter:") && p.replies && key.slice("chat:twitter:".length).split(/[-:]/).includes(userId));
  const xChat = chats.find(([key]) => key.slice("chat:twitter:".length).includes(":"));
  return (xChat ?? chats[0])?.[1] ?? null;
}

export function dmSplit(text: string, userId: string, asOne: boolean): SplitPlan {
  const profiles = twitterSendDeps.profiles();
  return splitPlan(text, dmChatProfile(profiles, userId), asOne, profiles.everyone?.startRates ?? {});
}

export function splitLine(plan: SplitPlan): string {
  return `${plan.parts.length === 1 ? "as one message" : `as ${plan.parts.length} messages, ${plan.gapSeconds} s apart`} (${plan.why})`;
}

export interface PartGuard {
  part: (n: number, text: string) => "go" | "lost" | "alreadySent" | "movedOn";
  partSent: (n: number, text: string, messageId?: string | null) => void;
  heard: () => string[];
}

export async function sendDmParts(context: Pick<CommandContext, "err" | "sleep">, engine: Engine, spec: TwitterEngineSpec, plan: SplitPlan, watch?: { account: string; userId: string }, guard?: PartGuard): Promise<{ answers: TwitterSessionAnswer[]; last: Awaited<ReturnType<Engine>>; interrupted: InboxMessage[]; lost?: boolean; movedOn?: string[] }> {
  const sleep = context.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const answers: TwitterSessionAnswer[] = [];
  const startedAt = twitterSendDeps.now();
  let interrupted: InboxMessage[] = [];
  let last: Awaited<ReturnType<Engine>> | undefined;
  for (const [i, part] of plan.parts.entries()) {
    if (i) {
      await sleep(plan.gapSeconds * 1000);
      if (watch) interrupted = twitterSendDeps.incoming(watch.account, watch.userId, startedAt);
      if (interrupted.length) break;
    }
    const step = guard?.part(i, part) ?? "go";
    if (step === "lost") return { answers, last: last!, interrupted, lost: true };
    if (step === "movedOn") return { answers, last: last!, interrupted, movedOn: guard!.heard() };
    if (step === "alreadySent") {
      answers.push({ ok: true, event: "sent" } as TwitterSessionAnswer);
      continue;
    }
    last = await engine({ ...spec, text: part, ...(i && spec.media ? { media: undefined } : {}), ...(i ? { continuesSend: true } : {}) });
    answers.push(last.answer);
    if (!last.answer.ok || last.answer.event !== "sent") break;
    guard?.partSent(i, part, last.answer.messageId ? String(last.answer.messageId) : null);
    if (plan.parts.length > 1) context.err(`  ${i + 1}/${plan.parts.length} sent: ${part}`);
  }
  return { answers, last: last!, interrupted };
}

export function dmInterruptedLines(account: string, plan: SplitPlan, sentCount: number, heard: readonly InboxMessage[]): string[] {
  return interruptedLines(account, heard, plan.parts.slice(sentCount), sentCount, plan.parts.length);
}

function sendCommand(shape: SendShape): Command {
  const usage = usageOf(shape);
  const input = inputOf(shape);
  const label = `twitter ${shape.action}`;
  return {
    usage,
    platform: "twitter",
    name: shape.action,
    effect: "write",
    input,
    summary: shape.summary,
    args: `--account <a>${shape.target === "tweet" ? " --tweet <url>" : shape.target === "userId" ? " --userId <id>" : ""}${shape.text ? ' --text "<copy>"' : ""}${shape.action === "post" || shape.action === "reply" ? " [--media <files>]" : shape.action === "dm" ? " [--media <file|url>]" : ""} [--approvedBy <who>] [--force] [--live] [--json]`,
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(input));
      if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${usage}` };
      if (parsed.positionals.length) return { code: 1, error: "inputInvalid", stderr: `log ${label}: takes no words, only flags\n${usage}` };
      const ref = parsed.flags["account"];
      if (typeof ref !== "string") return { code: 1, error: "inputInvalid", stderr: `log ${label}: --account is needed\n${usage}` };
      const str = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
      const live = parsed.flags["live"] === true;
      let media: string[] | undefined;
      try {
        media = await localMedia(listOf(parsed, "media"));
      } catch (error) {
        return refuseError(label, error);
      }
      const request = { action: shape.action, tweetUrl: str("tweet"), userId: str("userId"), text: str("text"), media, approvedBy: str("approvedBy"), skipStyleCheck: parsed.flags["skipStyleCheck"] === true, live };
      const early = planSend({ ...request, skipStyleCheck: true });
      if (!early.ok) return refuse(label, early.problem.code, early.problem.detail);
      try {
        const opened = await openTwitterAccount(context, label, ref);
        if (!opened.ok) return opened.result;
        const { account, engine } = opened;
        const plan = planSend({ ...request, style: account.copyStyle });
        if (!plan.ok) return refuse(label, plan.problem.code, plan.problem.detail);
        if (plan.watermark) context.err(`${account.accountName}: ${watermarkLine(plan.watermark)}`);
        const split = shape.action === "dm" && plan.spec.text ? dmSplit(plan.spec.text, plan.target, parsed.flags["asOne"] === true) : null;
        if (!live) {
          if (split) {
            if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, ok: true, dryRun: true, action: shape.action, target: plan.target, split: { parts: split.parts, gapSeconds: split.gapSeconds, why: split.why }, style: parsed.flags["skipStyleCheck"] ? "skipped" : "pass", approvedBy: plan.spec.approvedBy ?? null }, null, 2) };
            return { code: 0, stdout: [`log ${label}: dry run: ${account.accountName} would dm ${plan.target} ${splitLine(split)}:`, ...split.parts.map((p, i) => `  ${i + 1}. ${p}`), "Checked; X was not contacted. --live --approvedBy <who> sends it (rule 8); --asOne sends it as one message."].join("\n") };
          }
          const files = (plan.spec.media ?? []).map((path) => ({ path, kind: mediaKindOf(path), bytes: fileSize(path) }));
          const dry = { engine: "directApi", library: "twikit", account: account.accountName, ok: true, dryRun: true, action: shape.action, target: plan.target, text: plan.spec.text ?? null, ...(files.length ? { media: files } : {}), style: shape.text ? (parsed.flags["skipStyleCheck"] ? "skipped" : "pass") : null, approvedBy: plan.spec.approvedBy ?? null };
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(dry, null, 2) };
          const attached = files.length ? ` with ${files.map((f) => `${f.kind} ${f.path} (${((f.bytes ?? 0) / 1024 / 1024).toFixed(1)} MB)`).join(", ")}` : "";
          const what = shape.action === "post" ? `make a new post${attached}${plan.spec.text ? `, text "${plan.spec.text}"` : ""}` : `${shape.verb} ${plan.target}${plan.spec.text ? ` with "${plan.spec.text}"` : ""}`;
          return { code: 0, stdout: `log ${label}: dry run: ${account.accountName} would ${what}. Checked; X was not contacted. --live --approvedBy <who> sends it (rule 8).` };
        }
        if (plan.spec.media?.length) context.err(`${account.accountName}: uploading ${plan.spec.media.length} file${plan.spec.media.length === 1 ? "" : "s"} to X first (${plan.spec.media.map((m) => mediaKindOf(m)).join(", ")}), then the ${shape.action === "dm" ? "dm" : shape.action === "reply" ? "reply" : "post"}`);
        context.err(`${account.accountName}: ${shape.action === "post" ? "new post" : `${shape.action} ${plan.target}`}${split ? ` ${splitLine(split)}` : ""} on the direct-API engine, X called directly, approved by ${plan.spec.approvedBy}`);
        if (split) {
          const group = /^g\d+$/.test(plan.target);
          const groupPin = group ? String((await context.twenty.loginSecrets(account.id).catch(() => null))?.messengerPin ?? "") : "";
          if (group && !groupPin) return refuse(label, "xchatPinMissing", `${account.accountName} has no X Chat PIN saved, so the X Chat group ${plan.target} can't be opened to send: matt saves it once with log twitter chat pin --account ${account.accountName}`);
          const spec = { ...(parsed.flags["force"] === true ? { ...plan.spec, force: true } : plan.spec), ...(groupPin ? { chatPin: groupPin } : {}) };
          const caught = await waitCaughtUp("twitter", account.accountName);
          if (!caught.ok) return refuse(label, "accountBehind", caught.refused);
          let readUpTo = latestSeq();
          if (parsed.flags["overGate"] === true) {
            const same = gateDeps.same({ platform: "twitter", account: account.accountName, to: plan.target, text: plan.spec.text ?? "" });
            if (!same.ok) return refuse(label, "sameAsSent", same.refused);
            context.err(`${account.accountName}: --overGate: matt said to send this dm over the voice gate, so its read is skipped; the AI artifact check passed (rule 152)`);
          } else {
            readUpTo = latestSeq();
            const voiced = await gateDeps.gate(context, { platform: "twitter", account: account.accountName, to: plan.target, text: plan.spec.text ?? "", userId: plan.target });
            if (!voiced.ok) return refuse(label, "voiceGateFailed", voiced.refused);
            context.err(voiced.line);
          }
          const guard = guardSend({ platform: "twitter", account: account.accountName, conversationId: plan.target }, undefined, { readUpTo });
          if (!guard.ok) return refuse(label, "chatClaimedElsewhere", guard.refused);
          let parts: Awaited<ReturnType<typeof sendDmParts>>;
          try {
            parts = await sendDmParts(context, engine, spec, split, { account: account.accountName, userId: plan.target }, guard);
          } catch (error) {
            guard.done("failed", error instanceof Error ? error.message : String(error));
            throw error;
          }
          const { answers, last, interrupted } = parts;
          const okParts = answers.filter((a) => a.ok && a.event === "sent").length;
          guard.done(interrupted.length ? "interrupted" : okParts === split.parts.length ? "sent" : "failed", `${okParts} of ${split.parts.length}${parts.lost ? ", then the claim on this chat was lost, so the rest was held" : ""}: ${split.parts.slice(0, okParts).join(" / ").slice(0, 300)}`);
          if (parts.movedOn?.length) return refuse(label, "chatMovedOn", `>>> THEY WROTE AFTER THE GATE READ THE CHAT: nothing was sent, so answer what they said first.\n${parts.movedOn.map((m) => `  ${m}`).join("\n")}`);
          if (!last) return refuse(label, "chatClaimLost", "the claim on this chat was lost before anything was sent, so nothing went out");
          const done = answers.filter((a) => a.ok && a.event === "sent").length;
          const code = done === split.parts.length ? 0 : 1;
          if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, action: shape.action, target: plan.target, approvedBy: plan.spec.approvedBy, split: { parts: split.parts, gapSeconds: split.gapSeconds, why: split.why }, sent: answers, interrupted, ...last.answer }, null, 2) };
          if (interrupted.length) return { code, stdout: dmInterruptedLines(account.accountName, split, done, interrupted).join("\n") };
          const governor = governorLine(last);
          const failed = renderSent(label, account.accountName, last.answer).replace(`log ${label}: ${account.accountName}: `, "");
          const head = split.parts.length === 1 ? renderSent(label, account.accountName, last.answer) : code === 0 ? `log ${label}: ${account.accountName} sent the dm as ${done} messages, ${split.gapSeconds} s apart (conversation ${last.answer.conversationId}): delivered, it shows in their X Chat too, so it is never resent.` : `log ${label}: ${account.accountName}: ${done} of ${split.parts.length} sent, then ${failed}. What was sent stays sent; nothing is retried.`;
          return { code, stdout: [head, ...(governor ? [governor] : [])].join("\n") };
        }
        const run = await engine(parsed.flags["force"] === true ? { ...plan.spec, force: true } : plan.spec);
        const code = run.answer.ok && run.answer.event === "sent" ? 0 : 1;
        if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, action: shape.action, target: plan.target, approvedBy: plan.spec.approvedBy, ...run.answer }, null, 2) };
        const governor = governorLine(run);
        return { code, stdout: [renderSent(label, account.accountName, run.answer), ...(governor ? [governor] : [])].join("\n") };
      } catch (error) {
        return refuseError(label, error);
      }
    },
  };
}

export const replyCommand = sendCommand(SHAPES.reply);
export const quoteCommand = sendCommand(SHAPES.quote);
export const likeCommand = sendCommand(SHAPES.like);
export const repostCommand = sendCommand(SHAPES.repost);
export const followCommand = sendCommand(SHAPES.follow);
export const dmCommand = sendCommand(SHAPES.dm);
export const postCommand = sendCommand(SHAPES.post);
