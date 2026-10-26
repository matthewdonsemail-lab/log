import type { TwitterDmMessage, TwitterDmThread, TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const DMS_USAGE = [
  "Usage: log twitter dms --account <accountName> [--limit <n>] [--waiting] [--conversation <id>] [--json]",
  "Reads the account's X direct messages on the direct-API engine (twikit, no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.",
  "Without --conversation it reads the inbox and the message requests (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and lists the newest conversations first: who, when, the last message and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply. --conversation <id> reads one conversation's messages (dm/conversation), oldest first.",
  "X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.",
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
  return `  ${index + 1}. ${whoOf(thread)} · ${thread.lastAt ?? "?"} · ${flags}\n     ${thread.lastFromMe ? "you" : "them"}: ${oneLine(thread.lastText) || "(no text)"}\n     conversation ${thread.conversationId}`;
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

export const dmsCommand: Command = {
  usage: DMS_USAGE,
  platform: "twitter",
  name: "dms",
  effect: "read",
  input: DMS_INPUT,
  summary: "Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing",
  args: "--account <a> [--limit <n>] [--waiting] [--conversation <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DMS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log twitter dms: ${parsed.error}\n${DMS_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log twitter dms: --account is needed\n${DMS_USAGE}` };
    const rawLimit = parsed.flags["limit"];
    const limit = typeof rawLimit === "string" ? Number(rawLimit) : 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) return refuse("twitter dms", "limitInvalid", "--limit is a whole number from 1 to 200");
    const conversation = parsed.flags["conversation"];
    if (conversation !== undefined && (typeof conversation !== "string" || !/^\d+(?:-\d+)?$/.test(conversation))) return refuse("twitter dms", "conversationInvalid", "--conversation is X's conversation id (digits, or two user ids joined by a dash)");
    const waiting = parsed.flags["waiting"] === true;
    try {
      const opened = await openTwitterAccount(context, "twitter dms", ref);
      if (!opened.ok) return opened.result;
      context.err(`${opened.account.accountName}: ${conversation ? `conversation ${conversation}` : "inbox"} read on the direct-API engine (twikit), X called directly`);
      const run = await opened.engine({ action: "inbox", limit, ...(typeof conversation === "string" ? { conversationId: conversation } : {}) });
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
