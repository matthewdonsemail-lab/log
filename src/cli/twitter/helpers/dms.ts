import { spawn } from "node:child_process";
import { join } from "node:path";
import type { TwitterDmMessage, TwitterDmThread, TwitterInboxSync, TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { saveConversations, twitterConversationOf } from "../../../search/conversations/index.ts";
import { localAccountId, twitterStateRoot } from "../../../directApi/engine/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { dropMirrors, mergeThreads, ONE_INBOX_NOTE } from "../../../twitter/dm/person/index.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const DMS_USAGE = [
  "Usage: log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--json]",
  "Reads the account's X direct messages on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.",
  "Without --conversation it syncs the inbox the way X's own chat app does (dm-core): the first read takes the whole X Chat inbox (GetInitialXChatPageQuery, then GetInboxPageRequestQuery pages) and the old DM inbox (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and keeps them in ~/.logCli/twitter/<account>/inboxSync.json with the newest event's sequence id; every read after that asks X only for what is newer (GetMessageEventsPageQuery from that sequence id, beside one dm/inbox_initial_state), unlocks the PIN and decrypts only when something is new, opening just those conversations' keys (GetInboxPageConversationDataQuery), and keeps each event once by its id. --full reads everything again. Each read saves its conversations for log search and updates the search index in the background with only the chunks that changed. It then lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply. --conversation <id> reads one conversation's messages, oldest first: a legacy id (two user ids joined by a dash) through dm/conversation, an X Chat id (joined by a colon) the same way --with reads it, never the whole inbox.",
  "--with <handle> reads everything with one person by their handle and nobody else: their user id, their legacy thread (dm/conversation) and their X Chat thread (read the way X's own chat app opens a chat, from its dm-core: GetInboxPageConversationDataQuery for that one conversation, then GetConversationPageQuery from the oldest message held, its fetchOlderMessages, up to 5 pages 1.5 s apart while X says there is more), merged into one timeline, oldest first, a message mirrored into both shown once. It never reads the whole inbox. A 429 stops the read with nothing retried, as X's app does (it retries only 5xx), and pauses the account's governor (rule 94). X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. " + ONE_INBOX_NOTE + " X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.",
].join("\n");

export const DMS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Read an X account's direct messages, newest conversations first, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "limit", kind: "string", description: "How many conversations, or messages with --conversation, to show (default 20, at most 200)" },
        { name: "waiting", kind: "boolean", description: "Only the conversations whose last message isn't the account's" },
        { name: "with", kind: "string", description: "A handle, to read that person's thread without looking up its id" },
        { name: "conversation", kind: "string", description: "One conversation's id, to read its messages" },
        { name: "full", kind: "boolean", description: "Read the whole inbox again instead of only what is new since the last read" },
        JSON_FLAG,
      ],
    },
  ],
};

const oneLine = (text: string | null | undefined, max = 140): string => {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

const whoOf = (thread: TwitterDmThread): string => thread.name || thread.with.map((p) => (p.handle ? `@${p.handle}` : p.userId)).join(", ") || "?";

function threadLine(thread: TwitterDmThread, index: number): string {
  const flags = [thread.box === "request" ? "request" : null, thread.unread ? "unread" : null, thread.lastFromMe ? "you sent last" : "waiting on you"].filter(Boolean).join(", ");
  return `  ${index + 1}. ${whoOf(thread)} · ${thread.lastAt ?? "?"} · ${flags}\n     ${thread.lastFromMe ? "you" : "them"}: ${oneLine(thread.lastText) || "(no text)"}\n     conversation ${(thread.conversationIds ?? [thread.conversationId]).join(" + ")}`;
}

function messageLine(message: TwitterDmMessage): string {
  return `  ${message.time ?? "?"} ${message.fromMe ? "you" : `@${message.from ?? message.senderId}`}: ${oneLine(message.text, 400) || "(no text)"}`;
}

function render(account: string, answer: TwitterSessionAnswer, waiting: boolean): string {
  if (!answer.ok) return `log twitter dms: ${account}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
  if (answer.messages) return [`log twitter dms: @${account}, conversation ${answer.conversationId}, ${answer.messages.length} message${answer.messages.length === 1 ? "" : "s"}, oldest first, via the direct-API engine (no browser):`, ...answer.messages.map(messageLine)].join("\n");
  const threads = (answer.threads ?? []).filter((t) => !waiting || !t.lastFromMe);
  const head = `log twitter dms: @${answer.screenName ?? account}, ${threads.length} conversation${threads.length === 1 ? "" : "s"}${waiting ? " waiting on a reply" : `, ${answer.waitingOnYou ?? 0} waiting on a reply`}, newest first, via the direct-API engine (no browser):`;
  return [head, ...threads.map(threadLine)].join("\n");
}

export const twitterDmsDeps: { reindex: () => void } = {
  reindex: () => {
    const repo = join(import.meta.dir, "..", "..", "..", "..");
    const child = spawn("bun", [join(repo, "bin", "log.ts"), "search", "index", "--saved"], { cwd: repo, detached: true, stdio: "ignore", windowsHide: true, env: process.env });
    child.unref();
  },
};

export function syncLine(account: string, sync: TwitterInboxSync): string {
  if (sync.mode === "full") return `${account}: full inbox read in ${sync.seconds} s (${sync.xchatConversations ?? 0} X Chat conversations, ${sync.legacyPages} old DM page${sync.legacyPages === 1 ? "" : "s"}), kept from sequence ${sync.maxSequenceId}`;
  return `${account}: synced in ${sync.seconds} s: ${sync.newEvents} new X Chat event${sync.newEvents === 1 ? "" : "s"} since sequence ${sync.since}${sync.newEvents ? `, ${sync.newMessages ?? 0} new message${sync.newMessages === 1 ? "" : "s"}` : ", nothing to decrypt"} (${sync.xchatPages ?? 1} X Chat request${(sync.xchatPages ?? 1) === 1 ? "" : "s"}, ${sync.legacyPages} old DM request${sync.legacyPages === 1 ? "" : "s"})`;
}

function keepForSearch(account: string, answer: TwitterSessionAnswer): number {
  const conversations = (answer.conversations ?? []).map((c) => twitterConversationOf(account, c)).filter((c) => c.messages.length);
  if (!conversations.length) return 0;
  saveConversations(conversations);
  if (answer.sync?.mode === "full" || (answer.sync?.newMessages ?? 0) > 0) twitterDmsDeps.reindex();
  return conversations.length;
}

function onePerPerson(answer: TwitterSessionAnswer): TwitterSessionAnswer {
  const threads = mergeThreads(answer.threads ?? []);
  return { ...answer, threads, waitingOnYou: threads.filter((t) => !t.lastFromMe).length };
}

export const dmsCommand: Command = {
  usage: DMS_USAGE,
  platform: "twitter",
  name: "dms",
  effect: "read",
  input: DMS_INPUT,
  summary: "Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing",
  args: "--account <a> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DMS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log twitter dms: ${parsed.error}\n${DMS_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log twitter dms: --account is needed\n${DMS_USAGE}` };
    const rawLimit = parsed.flags["limit"];
    const limit = typeof rawLimit === "string" ? Number(rawLimit) : 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) return refuse("twitter dms", "limitInvalid", "--limit is a whole number from 1 to 200");
    const conversation = parsed.flags["conversation"];
    if (conversation !== undefined && (typeof conversation !== "string" || !/^[\dg]+(?:[-:]\d+)?$/.test(conversation))) return refuse("twitter dms", "conversationInvalid", "--conversation is X's conversation id (digits, or two user ids joined by a dash)");
    const withHandle = parsed.flags["with"];
    if (withHandle !== undefined && (typeof withHandle !== "string" || !withHandle.trim())) return refuse("twitter dms", "targetMissing", "--with names a handle");
    const waiting = parsed.flags["waiting"] === true;
    try {
      const knownId = localAccountId(ref, twitterStateRoot());
      const early = knownId ? context.twenty.loginSecrets(knownId).catch(() => null) : null;
      const opened = await openTwitterAccount(context, "twitter dms", ref);
      if (!opened.ok) return opened.result;
      const secrets = early && knownId === opened.account.id ? await early : await context.twenty.loginSecrets(opened.account.id).catch(() => null);
      const chatPin = secrets?.messengerPin ?? undefined;
      const full = parsed.flags["full"] === true;
      const read = (spec: { limit: number; conversationId?: string; withHandle?: string; export?: boolean; full?: boolean }) => opened.engine({ action: "inbox", ...spec, ...(chatPin ? { chatPin } : {}) });
      let convoId = typeof conversation === "string" ? conversation : undefined;
      if (typeof withHandle === "string") {
        const needle = withHandle.trim().replace(/^@/, "");
        context.err(`${opened.account.accountName}: reading @${needle}'s conversations only (their DM thread, then their X Chat the way X's app opens a chat: GetInboxPageConversationDataQuery, then older pages)${chatPin ? ", X Chat opened with the saved PIN" : ""}`);
        const person = await read({ limit, withHandle: needle });
        if (!person.answer.ok) return { code: 1, stdout: render(opened.account.accountName, person.answer, false) };
        if (!person.answer.messages?.length) return refuse("twitter dms", "targetMissing", `@${needle} has no conversation with this account`);
        const answer = { ...person.answer, messages: dropMirrors(person.answer.messages).slice(-limit) };
        const merged = { ...person, answer };
        if (parsed.flags["json"]) return { code: answer.ok ? 0 : 1, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: opened.account.accountName, ...answer }, null, 2) };
        const governor = governorLine(merged);
        return { code: answer.ok ? 0 : 1, stdout: [render(opened.account.accountName, answer, false), ...(governor ? [governor] : [])].join("\n") };
      }
      context.err(`${opened.account.accountName}: ${convoId ? `conversation ${convoId}` : "inbox"} read on the direct-API engine, X called directly${chatPin ? ", X Chat opened with the saved PIN" : ""}`);
      const raw = await read({ limit, ...(typeof convoId === "string" ? { conversationId: convoId } : { export: true, ...(full ? { full } : {}) }) });
      if (raw.answer.sync) context.err(syncLine(opened.account.accountName, raw.answer.sync));
      if (raw.answer.ok && raw.answer.conversations) {
        const kept = keepForSearch(opened.account.accountName, raw.answer);
        if (kept) context.err(`${opened.account.accountName}: ${kept} conversations kept for log search${raw.answer.sync?.mode === "full" || (raw.answer.sync?.newMessages ?? 0) > 0 ? ", the index updating in the background with what changed" : ", nothing new to index"}`);
      }
      const { conversations: _kept, ...lean } = raw.answer;
      const run = lean.ok && lean.threads ? { ...raw, answer: onePerPerson(lean) } : { ...raw, answer: lean };
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) {
        const answer = waiting && run.answer.threads ? { ...run.answer, threads: run.answer.threads.filter((t) => !t.lastFromMe) } : run.answer;
        return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: opened.account.accountName, ...answer }, null, 2) };
      }
      const governor = governorLine(run);
      return { code, stdout: [render(opened.account.accountName, run.answer, waiting), ...(governor ? [governor] : [])].join("\n") };
    } catch (error) {
      return refuseError("twitter dms", error);
    }
  },
};
