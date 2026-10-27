import type { TwitterDmMessage, TwitterDmThread, TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { dropMirrors, mergeThreads, ONE_INBOX_NOTE } from "../../../twitter/dm/person/index.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const DMS_USAGE = [
  "Usage: log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--json]",
  "Reads the account's X direct messages on the direct-API engine (twikit, no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.",
  "Without --conversation it reads the inbox and the message requests (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply. --conversation <id> reads one conversation's messages (dm/conversation), oldest first.",
  "--with <handle> reads everything with one person by their handle: their legacy thread and their X Chat thread merged into one timeline, oldest first, a message mirrored into both shown once. X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. " + ONE_INBOX_NOTE + " X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.",
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
  if (answer.messages) return [`log twitter dms: @${account}, conversation ${answer.conversationId}, ${answer.messages.length} message${answer.messages.length === 1 ? "" : "s"}, oldest first, via the direct-API engine (twikit, no browser):`, ...answer.messages.map(messageLine)].join("\n");
  const threads = (answer.threads ?? []).filter((t) => !waiting || !t.lastFromMe);
  const head = `log twitter dms: @${answer.screenName ?? account}, ${threads.length} conversation${threads.length === 1 ? "" : "s"}${waiting ? " waiting on a reply" : `, ${answer.waitingOnYou ?? 0} waiting on a reply`}, newest first, via the direct-API engine (twikit, no browser):`;
  return [head, ...threads.map(threadLine)].join("\n");
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
      const opened = await openTwitterAccount(context, "twitter dms", ref);
      if (!opened.ok) return opened.result;
      const secrets = await context.twenty.loginSecrets(opened.account.id).catch(() => null);
      const chatPin = secrets?.messengerPin ?? undefined;
      const read = (spec: { limit: number; conversationId?: string; export?: boolean }) => opened.engine({ action: "inbox", ...spec, ...(chatPin ? { chatPin } : {}) });
      let convoId = typeof conversation === "string" ? conversation : undefined;
      if (typeof withHandle === "string") {
        const needle = withHandle.trim().replace(/^@/, "").toLowerCase();
        context.err(`${opened.account.accountName}: finding @${needle}'s conversations${chatPin ? ", X Chat opened with the saved PIN" : ""}`);
        const index = await read({ limit: 200, export: true });
        if (!index.answer.ok) return { code: 1, stdout: render(opened.account.accountName, index.answer, false) };
        const matches = (index.answer.conversations ?? []).filter((c) => c.with.some((p) => (p.handle ?? "").toLowerCase() === needle));
        if (!matches.length) return refuse("twitter dms", "targetMissing", `@${needle} has no conversation in this account's inbox`);
        const messages = dropMirrors(matches.flatMap((c) => c.messages)).slice(-limit);
        const answer = { ...index.answer, conversations: undefined, threads: undefined, ok: true, conversationId: matches.map((m) => m.conversationId).join(" + "), messages };
        const merged = { ...index, answer };
        if (parsed.flags["json"]) return { code: answer.ok ? 0 : 1, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: opened.account.accountName, ...answer }, null, 2) };
        const governor = governorLine(merged);
        return { code: answer.ok ? 0 : 1, stdout: [render(opened.account.accountName, answer, false), ...(governor ? [governor] : [])].join("\n") };
      }
      context.err(`${opened.account.accountName}: ${convoId ? `conversation ${convoId}` : "inbox"} read on the direct-API engine (twikit), X called directly${chatPin ? ", X Chat opened with the saved PIN" : ""}`);
      const raw = await read({ limit, ...(typeof convoId === "string" ? { conversationId: convoId } : {}) });
      const run = raw.answer.ok && raw.answer.threads ? { ...raw, answer: onePerPerson(raw.answer) } : raw;
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
