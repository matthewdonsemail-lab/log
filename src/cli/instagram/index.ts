import { findInstagramAccount, recordInstagramSession, instagramGate } from "../../instagram/account/session/index.ts";
import type { PlatformAccount, PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuse, refuseGated, refuseError, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult } from "../runner/types.ts";
import { watermarkLine, watermarkReadingOf } from "../../twitter/copy/watermark/index.ts";
import { addPending, interruptedLines } from "../../inbox/watch/index.ts";
import { ownOrAttach } from "../../inbox/relay/index.ts";
import { enqueueAttachments } from "../../media/describer/index.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";
import { latestSeq, recordPosition } from "../../inbox/store/index.ts";
import { instagramCatchUp, storeRead, waitCaughtUp } from "../../inbox/catchUp/index.ts";
import { guardSend } from "../../inbox/claims/index.ts";
import type { PartStep, SendGuard } from "../../inbox/claims/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { confirmAnswer, errorText, rethrowFailure, runAction } from "../../platformKit/action/index.ts";
import type { InboxMessage } from "../../inbox/watch/index.ts";

type HeldGuard = Extract<SendGuard, { ok: true }>;
import { saveConversations } from "../../search/conversations/index.ts";
import type { Conversation } from "../../search/conversations/index.ts";
import { twitterDmsDeps } from "../twitter/helpers/dms.ts";

export const INSTAGRAM_SESSION_USAGE = [
  "Usage: log instagram session check --account <accountName> [--json]",
  "Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.",
  "Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const INSTAGRAM_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Instagram still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The INSTAGRAM socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log instagram session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (instagrapi, no browser).`;
  return `log instagram session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const instagramSessionCommand: Command = {
  usage: INSTAGRAM_SESSION_USAGE,
  platform: "instagram",
  name: "session",
  effect: "read",
  input: INSTAGRAM_SESSION_INPUT,
  summary: "Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSTAGRAM_SESSION_INPUT));
    if (!parsed.ok) return refuseInput("instagram session", parsed.error, INSTAGRAM_SESSION_USAGE);
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log instagram session: give check\n${INSTAGRAM_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, error: "inputInvalid", stderr: `log instagram session check: --account is needed\n${INSTAGRAM_SESSION_USAGE}` };
    try {
      const account = await findInstagramAccount(context.twenty, ref);
      const gate = instagramGate(account);
      if (!gate.ok) return refuse("instagram session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directInstagram) return { code: 1, stderr: "log instagram session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (instagrapi)`);
      const run = context.directInstagram(account, { action: "ping" });
      for (const line of await recordInstagramSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("instagram session check", error);
    }
  },
};

export const INSTAGRAM_DMS_USAGE = [
  "Usage: log instagram dms --account <accountName> [--with <handle|thread name|thread id>] [--limit <n>] [--json]",
  "Without --with, lists the account's Instagram DM threads, newest first: who each is with, its last message and whether it is unread. With --with, reads that one thread's latest messages, oldest first.",
  "On the direct-API engine (vendor/instagrapi, direct_threads and direct_thread, no browser). Sends nothing, and marks nothing seen.",
].join("\n");

export const INSTAGRAM_DMS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "An Instagram account's DM threads, or one thread's messages with --with, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The INSTAGRAM socialAccount's accountName (its handle)" },
        { name: "with", kind: "string", description: "Read one thread: who it is with (their handle), its name, or its id" },
        { name: "limit", kind: "integer", min: 1, max: 200, description: "Threads to list (default 20, at most 100), or messages to read with --with (default 30, at most 200)" },
        JSON_FLAG,
      ],
    },
  ],
};

interface InstagramMessage {
  id: string;
  at: string | null;
  from: string;
  fromMe: boolean;
  text: string;
  kind: string | null;
}

interface InstagramThread {
  id: string;
  title: string;
  group: boolean;
  with: string[];
  lastActivity: string | null;
  unread: boolean;
  pending: boolean;
  last?: InstagramMessage | null;
}

export function instagramConversationOf(account: string, thread: InstagramThread, messages: readonly InstagramMessage[]): Conversation {
  return {
    platform: "instagram",
    account,
    conversationId: thread.id,
    box: thread.group ? `group ${thread.title}` : "dm",
    with: thread.with.length ? thread.with : [thread.title],
    messages: messages.map((m) => ({ id: m.id, at: m.at, from: m.from, fromMe: m.fromMe, text: m.text || (m.kind ? `(${m.kind})` : "") })),
  };
}

export const instagramDmsDeps: { save: (conversations: Conversation[]) => number; reindex: () => void } = {
  save: (conversations) => saveConversations(conversations),
  reindex: () => twitterDmsDeps.reindex(),
};

function threadLine(t: InstagramThread): string {
  const who = t.group ? `${t.title} (${t.with.map((u) => `@${u}`).join(", ")})` : `@${t.with[0] ?? t.title}`;
  const last = t.last ? ` · ${t.last.fromMe ? "you: " : ""}${t.last.text || `(${t.last.kind})`}` : "";
  return `  ${t.lastActivity ?? ""} ${t.unread ? "● " : "  "}${who}${last}  [${t.id}]`;
}

function dmsFailed(account: PlatformAccount, answer: PlatformAnswer): CommandResult {
  const candidates = ((answer.candidates as { id: string; title: string; with: string[] }[] | undefined) ?? []).map((c) => `  ${c.id}  ${c.title} (${c.with.map((u) => `@${u}`).join(", ")})`);
  return { code: 1, stdout: [`log instagram dms: ${account.accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`, ...candidates].join("\n") };
}

export const instagramDmsCommand: Command = {
  usage: INSTAGRAM_DMS_USAGE,
  platform: "instagram",
  name: "dms",
  effect: "read",
  input: INSTAGRAM_DMS_INPUT,
  summary: "Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing",
  args: "--account <a> [--with <handle|id>] [--limit <n>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSTAGRAM_DMS_INPUT));
    if (!parsed.ok) return refuseInput("instagram dms", parsed.error, INSTAGRAM_DMS_USAGE);
    if (parsed.positionals.length) return { code: 1, error: "inputInvalid", stderr: `log instagram dms: takes no words, only flags\n${INSTAGRAM_DMS_USAGE}` };
    const said = typeof parsed.flags["with"] === "string" ? parsed.flags["with"].trim() : "";
    const most = said ? 200 : 100;
    const limit = numberOf(parsed, "limit") ?? (said ? 30 : 20);
    if (limit > most) return { code: 1, error: "inputInvalid", stderr: `log instagram dms: --limit must be 1 to ${most}\n${INSTAGRAM_DMS_USAGE}` };
    try {
      const account = await findInstagramAccount(context.twenty, String(parsed.flags["account"]));
      const gate = instagramGate(account);
      if (!gate.ok) return refuse("instagram dms", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directInstagram) return { code: 1, stderr: "log instagram dms: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: ${said ? `the thread with ${said}` : "DM threads"} on the direct-API engine (instagrapi)`);
      const run = context.directInstagram(account, said ? { action: "thread", with: said, limit } : { action: "inbox", limit });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, ...run.answer }, null, 2) };
      if (!run.answer.ok) return dmsFailed(account, run.answer);
      if (!said) {
        const threads = (run.answer.threads as InstagramThread[] | undefined) ?? [];
        return { code, stdout: [`log instagram dms: ${account.accountName} (@${run.answer.screenName ?? "?"}) has ${threads.length} thread(s), newest first (● unread)`, ...threads.map(threadLine)].join("\n") };
      }
      const thread = run.answer.thread as InstagramThread;
      const messages = (run.answer.messages as InstagramMessage[] | undefined) ?? [];
      for (const m of messages) if (m.at) storeRead("instagram", account.accountName, thread.id, "dm", { id: m.id, at: m.at, from: m.from, fromMe: m.fromMe, text: m.text }, context.now?.() ?? new Date(), "backfill");
      if (messages.length) {
        instagramDmsDeps.save([instagramConversationOf(account.accountName, thread, messages)]);
        instagramDmsDeps.reindex();
        context.err(`${account.accountName}: the thread kept for log search and the voice index, the index updating in the background`);
      }
      return {
        code,
        stdout: [
          `log instagram dms: ${messages.length} message(s) with ${thread.group ? thread.title : `@${thread.with[0] ?? thread.title}`} [${thread.id}]`,
          ...messages.map((m) => `  ${m.at ?? ""} ${m.fromMe ? "me" : `@${m.from}`}: ${m.text || `(${m.kind})`}`),
        ].join("\n"),
      };
    } catch (error) {
      return refuseError("instagram dms", error);
    }
  },
};

export const INSTAGRAM_SEND_USAGE = [
  'Usage: log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]',
  "Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.",
  "Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).",
].join("\n");

export const INSTAGRAM_SEND_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Send text and a photo to an Instagram DM; a dry run unless --live",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The INSTAGRAM socialAccount's accountName (its handle)" },
        { name: "with", kind: "string", required: true, description: "Who it goes to: their handle, a thread's name, or its id" },
        { name: "text", kind: "string", description: "The message, as the owner gave it; one message per line" },
        { name: "photo", kind: "string", description: "A picture to send first (a meme, a screenshot): the file's path" },
        { name: "asOne", kind: "boolean", description: "Send the text as one message, never split" },
        { name: "approvedBy", kind: "string", approval: true, description: "Who approved it: needed with --live (rule 8)" },
        { name: "live", kind: "boolean", live: true, description: "Send it on Instagram, only when the owner asked (rule 8); without it a dry run contacts nothing" },
        JSON_FLAG,
      ],
      groups: [{ rule: "atLeastOne", names: ["text", "photo"] }],
    },
  ],
};

export const instagramSendCommand: Command = {
  usage: INSTAGRAM_SEND_USAGE,
  platform: "instagram",
  name: "send",
  effect: "write",
  input: INSTAGRAM_SEND_INPUT,
  summary: "Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live",
  args: '--account <a> --with <handle|id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]',
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSTAGRAM_SEND_INPUT));
    if (!parsed.ok) return refuseInput("instagram send", parsed.error, INSTAGRAM_SEND_USAGE);
    if (parsed.positionals.length) return { code: 1, error: "inputInvalid", stderr: `log instagram send: takes no words, only flags\n${INSTAGRAM_SEND_USAGE}` };
    const said = String(parsed.flags["with"]).trim();
    const text = typeof parsed.flags["text"] === "string" ? parsed.flags["text"] : "";
    const photo = typeof parsed.flags["photo"] === "string" ? parsed.flags["photo"].trim() : "";
    const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
    const asOne = parsed.flags["asOne"] === true;
    const live = parsed.flags["live"] === true;
    if (!said) return { code: 1, stderr: `log instagram send: --with can't be empty\n${INSTAGRAM_SEND_USAGE}` };
    if (!text.trim() && !photo) return { code: 1, stderr: `log instagram send: give --text, --photo or both\n${INSTAGRAM_SEND_USAGE}` };
    if (live && !approvedBy) return refuse("instagram send", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const watermark = watermarkReadingOf(text);
    if (text && watermark.level === "artifacts") return refuse("instagram send", "aiArtifacts", `the copy carries what AI chat interfaces leave in text: ${watermark.findings.filter((f) => f.deterministic).map((f) => `${f.label} ×${f.count}`).join(", ")}`);
    const lines = asOne ? (text.trim() ? [text.trim()] : []) : text.split("\n").map((l) => l.trim()).filter(Boolean);
    const plan = [...(photo ? [`(photo) ${photo}`] : []), ...lines];
    try {
      const account = await findInstagramAccount(context.twenty, String(parsed.flags["account"]));
      const gate = instagramGate(account);
      if (!gate.ok) return refuse("instagram send", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directInstagram) return { code: 1, stderr: "log instagram send: the direct-API engine isn't wired in this context" };
      if (text) context.err(`${account.accountName}: ${watermarkLine(watermark)}`);
      if (!live && parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, ok: true, dryRun: true, with: said, plan, watermark }, null, 2) };
      if (!live) return { code: 0, stdout: [`log instagram send: dry run: ${account.accountName} would send to ${said}, ${plan.length} message(s):`, ...plan.map((p, i) => `  ${i + 1}. ${p}`), "Nothing was sent. --live --approvedBy <who> sends it (rule 8); --asOne sends the text as one message."].join("\n") };
      context.err(`${account.accountName}: send to ${said}, ${plan.length} message(s), on the direct-API engine (instagrapi), approved by ${approvedBy}`);
      const direct = context.directInstagram;
      const whole = text.trim() || "(photo)";
      const acted = await runAction<HeldGuard, { step: PartStep; run?: PlatformEngineRun }>({
        gate: async () => {
          const caught = await waitCaughtUp("instagram", account.accountName);
          if (!caught.ok) return { ok: false, code: "accountBehind", detail: caught.refused };
          const readUpTo = latestSeq();
          if (text.trim()) {
            const voiced = await gateDeps.gate(context, { platform: "instagram", account: account.accountName, to: said, text, handle: said });
            if (!voiced.ok) return { ok: false, code: "voiceGateFailed", detail: voiced.refused };
            context.err(voiced.line);
          }
          const guard = guardSend({ platform: "instagram", account: account.accountName, conversationId: said, with: said }, undefined, { readUpTo });
          return guard.ok ? { ok: true, held: guard } : { ok: false, code: "chatClaimedElsewhere", detail: guard.refused };
        },
        act: async (guard) => {
          const step = guard.part(0, whole);
          if (step !== "go") return { step };
          return { step, run: direct(account, { action: "send", with: said, text, ...(photo ? { photo } : {}), asOne, live: true, approvedBy }) };
        },
        confirm: ({ step, run }) => {
          if (step === "alreadySent") return { ok: true };
          if (!run) return { ok: false, code: step === "movedOn" ? "chatMovedOn" : "chatClaimLost", detail: "nothing was sent" };
          const heard = ((run.answer.interrupted as unknown[] | undefined) ?? []).length;
          return heard ? { ok: false, code: "chatMovedOn", detail: "they wrote while it was being sent" } : confirmAnswer(run.answer);
        },
      });
      if (acted.outcome === "uncertain") acted.held?.done("failed", errorText(acted.error));
      rethrowFailure(acted);
      if (!acted.held || !acted.answer) return refuseGated("instagram send", acted, "chatClaimedElsewhere");
      const guard = acted.held;
      const { step } = acted.answer;
      if (step !== "go" || !acted.answer.run) {
        guard.done("failed", step === "alreadySent" ? "it had already gone out before" : step === "movedOn" ? "they wrote after the gate read the chat" : "the claim on this chat was lost");
        if (step === "movedOn") return refuse("instagram send", "chatMovedOn", `>>> THEY WROTE AFTER THE GATE READ THE CHAT: nothing was sent, so answer what they said first.\n${guard.heard().map((m) => `  ${m}`).join("\n")}`);
        if (step === "alreadySent") return { code: 0, stdout: `log instagram send: ${account.accountName}: this message already went out to ${said} before (its echo is in the chat), so it was not sent again.` };
        return refuse("instagram send", "chatClaimLost", "the claim on this chat was lost before anything was sent, so nothing went out");
      }
      const run = acted.answer.run;
      const sent = (run.answer.sent as { id: string; kind: string; text?: string }[] | undefined) ?? [];
      if (run.answer.ok && sent.length) guard.partSent(0, whole, sent.map((s) => s.id).join(","));
      guard.done(((run.answer.interrupted as unknown[] | undefined) ?? []).length ? "interrupted" : run.answer.ok ? "sent" : "failed", `${sent.length} of ${plan.length}: ${sent.map((s) => s.text ?? s.kind).join(" / ").slice(0, 300)}`);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      if (!run.answer.ok) return { code, stdout: [`log instagram send: ${account.accountName}: ${sent.length} of ${plan.length} sent, then ${run.answer.code}: ${run.answer.detail ?? ""}. What was sent stays sent; nothing is retried (rule 94).`, ...(dmsFailed(account, run.answer).stdout ?? "").split("\n").slice(1)].join("\n") };
      const heard = (run.answer.interrupted as InboxMessage[] | undefined) ?? [];
      if (heard.length) return { code: 1, stdout: interruptedLines(account.accountName, heard, (run.answer.held as string[] | undefined) ?? [], sent.length, plan.length).join("\n") };
      return { code, stdout: [`log instagram send: ${account.accountName} sent ${sent.length} message(s) to ${said}:`, ...sent.map((s) => `  ${s.kind === "photo" ? "(photo)" : s.text} · ${s.id}`)].join("\n") };
    } catch (error) {
      return refuseError("instagram send", error);
    }
  },
};

export const INSTAGRAM_WATCH_USAGE = [
  "Usage: log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]",
  "Opens Instagram's own realtime connection on the direct-API engine (vendor/instagrapi, MQTT to edge-mqtt.facebook.com, subscribed to the DM sync, no browser) and prints each DM the moment Instagram pushes it, nothing polled. --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.",
].join("\n");

export const INSTAGRAM_WATCH_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Every Instagram DM as Instagram's realtime connection pushes it, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The INSTAGRAM socialAccount's accountName (its handle)" },
        { name: "seconds", kind: "number", min: 0, refusal: "secondsInvalid", description: "Stop after this many seconds (at least 5); default: until stopped" },
        { name: "inbox", kind: "boolean", description: "Hand each new message from someone else to the inbox hook" },
        JSON_FLAG,
      ],
    },
  ],
};

export function instagramWatchLine(event: Record<string, unknown>): string {
  if (event.type === "message") return `${event.at ?? ""} ${event.title ?? event.thread} · ${event.fromMe ? "me" : `@${event.from}`}: ${String(event.text ?? "").replace(/\s+/g, " ").slice(0, 400)}`;
  return `${String(event.type)}${event.host ? ` on ${event.host}` : ""}${event.threads ? `, ${event.threads} thread(s) known` : ""}`;
}

export function instagramInboxMessageOf(account: string, event: Record<string, unknown>, now: Date) {
  return { platform: "instagram", account, conversationId: String(event.thread ?? ""), with: String(event.from ?? "?"), text: String(event.text ?? ""), at: String(event.at ?? now.toISOString()), box: "dm", seenAt: now.toISOString(), ...(event.itemId ? { id: String(event.itemId) } : {}), ...(event.userId ? { senderId: String(event.userId) } : {}) };
}

export const instagramWatchCommand: Command = {
  usage: INSTAGRAM_WATCH_USAGE,
  platform: "instagram",
  name: "watch",
  longRunning: true,
  effect: "read",
  input: INSTAGRAM_WATCH_INPUT,
  summary: "Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing",
  args: "--account <a> [--seconds <s>] [--inbox] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSTAGRAM_WATCH_INPUT));
    if (!parsed.ok) return refuseInput("instagram watch", parsed.error, INSTAGRAM_WATCH_USAGE);
    if (parsed.positionals.length) return { code: 1, error: "inputInvalid", stderr: `log instagram watch: takes no words, only flags\n${INSTAGRAM_WATCH_USAGE}` };
    const seconds = numberOf(parsed, "seconds") ?? 0;
    if (seconds !== 0 && seconds < 5) return refuse("instagram watch", "secondsInvalid", "--seconds must be at least 5");
    try {
      const account = await findInstagramAccount(context.twenty, String(parsed.flags["account"]));
      const gate = instagramGate(account);
      if (!gate.ok) return refuse("instagram watch", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directInstagramLive) return { code: 1, stderr: "log instagram watch: the direct-API engine isn't wired in this context" };
      const toInbox = parsed.flags["inbox"] === true;
      const seen: Record<string, unknown>[] = [];
      const directInstagramLive = context.directInstagramLive;
      const owned = await ownOrAttach("instagram", account.accountName, {
        inbox: toInbox,
        seconds,
        onAttached: (event) => context.err(event.type === "relayJoined" ? `${account.accountName}: attached to the one Instagram realtime connection already open (${String(event.subscribers)} subscriber(s)), nothing new opened` : parsed.flags["json"] ? JSON.stringify(event) : instagramWatchLine(event)),
        run: (emit) => {
          context.err(`${account.accountName}: the one owner of Instagram's realtime connection through vendor/instagrapi${seconds ? `, for ${seconds} s` : ", until stopped"}; new messages from others go to the inbox and every event to every attached subscriber`);
          return directInstagramLive(account, { action: "watch", seconds }, (event) => {
            emit(event);
            if (event.type === "message") seen.push(event);
            if (event.type === "message" && !event.fromMe) {
              const inbox = instagramInboxMessageOf(account.accountName, event, context.now?.() ?? new Date());
              enqueueAttachments(inbox, (event.attachments as { name?: string; type?: string; path?: string }[] | undefined) ?? []);
              addPending([inbox]);
            }
            if (event.type === "message" && event.fromMe && event.thread) storeRead("instagram", account.accountName, String(event.thread), "dm", { id: String(event.id ?? ""), at: String(event.at ?? ""), from: "me", fromMe: true, text: String(event.text ?? "") }, context.now?.() ?? new Date(), "live");
            if (event.type === "message" && event.at) recordPosition("instagram", account.accountName, String(event.at));
            context.err(parsed.flags["json"] ? JSON.stringify(event) : instagramWatchLine(event));
          });
        },
        log: (line) => context.err(line),
        catchUp: (gap) => instagramCatchUp(account, gap, context.directInstagram!, context.now?.() ?? new Date()),
      });
      if ("refused" in owned) return refuse("instagram watch", "watcherAlreadyRunning", owned.refused);
      if (!owned.owner) return { code: owned.attached.ok ? 0 : 1, stdout: `log instagram watch: ${account.accountName}: attached to the one owner, ${owned.attached.events} event(s) received; ${owned.attached.reason}` };
      const run = owned.result;
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "instagram", account: account.accountName, ...run.answer, messages: seen }, null, 2) };
      if (!run.answer.ok) return dmsFailed(account, run.answer);
      return { code, stdout: `log instagram watch: ${account.accountName}: ${seen.length} message(s) pushed in ${run.answer.watchedSeconds ?? seconds} s, nothing polled.` };
    } catch (error) {
      return refuseError("instagram watch", error);
    }
  },
};
