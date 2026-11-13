import { recordLinkedinSession } from "../../../linkedin/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { ACCOUNT_FLAG, failed, openAccount, text } from "./share.ts";

export type LinkedinPerson = { name: string; profileId: string; profileUrl: string; headline: string };
export type LinkedinMessage = { at: string | null; from: string; fromMe: boolean; text: string; attachments?: { name: string; type: string; url: string }[]; messageUrn: string };
export type LinkedinConversation = { conversationUrn: string; people: LinkedinPerson[]; groupChat: boolean; unreadCount: number; lastActivityAt: string | null; url: string; last?: LinkedinMessage };

const PREVIEW_CHARS = 120;

function oneLine(value: string, max = PREVIEW_CHARS): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export function conversationLine(c: LinkedinConversation): string {
  const who = c.people.map((p) => p.name).filter(Boolean).join(", ") || "(nobody named)";
  const unread = c.unreadCount ? ` [${c.unreadCount} unread]` : "";
  const last = c.last ? `: ${c.last.fromMe ? "you" : c.last.from}: "${oneLine(c.last.text)}"` : "";
  return `  ${c.lastActivityAt ?? "?"} ${who}${unread}${last}`;
}

export function messageLine(m: LinkedinMessage): string {
  return `  ${m.at ?? "?"} ${m.fromMe ? "you" : m.from}: ${m.text}`;
}

export const LINKEDIN_INBOX_USAGE = [
  "Usage: log linkedin inbox --account <accountName> [--json]",
  "Lists the account's 20 newest LinkedIn conversations (its primary inbox), on the direct-API engine (no browser): the feed, the account's own profile (/voyager/api/me, for its mailbox), then messengerConversations, the call LinkedIn's messaging page makes, recorded from a real visit. Each conversation names the people in it, its unread count and its last message.",
  "Reads only: nothing is sent, and nothing is marked seen or read.",
].join("\n");

const LINKEDIN_INBOX_INPUT: CommandInput = {
  forms: [{ words: [], summary: "List the account's newest LinkedIn conversations", positionals: [], flags: [ACCOUNT_FLAG, JSON_FLAG] }],
};

export const linkedinInboxCommand: Command = {
  usage: LINKEDIN_INBOX_USAGE,
  platform: "linkedin",
  name: "inbox",
  effect: "read",
  input: LINKEDIN_INBOX_INPUT,
  summary: "List the account's newest LinkedIn conversations, on the direct-API engine",
  args: "--account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_INBOX_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin inbox: ${parsed.error}\n${LINKEDIN_INBOX_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log linkedin inbox: takes no words, only flags\n${LINKEDIN_INBOX_USAGE}` };
    const ref = text(parsed.flags, "account");
    if (!ref) return { code: 1, stderr: `log linkedin inbox: --account is needed\n${LINKEDIN_INBOX_USAGE}` };
    try {
      const opened = await openAccount(context, "inbox", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      context.err(`${account.accountName}: reading the LinkedIn inbox on the direct-API engine (reads only)`);
      const run = context.directLinkedin!(account, { action: "inbox" });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("inbox", run);
      const conversations = (Array.isArray(run.answer["conversations"]) ? run.answer["conversations"] : []) as LinkedinConversation[];
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, conversations }, null, 2) };
      return { code: 0, stdout: `log linkedin inbox: ${account.accountName}'s ${conversations.length} newest conversations:\n${conversations.map(conversationLine).join("\n")}` };
    } catch (error) {
      return refuseError("linkedin inbox", error);
    }
  },
};

export const LINKEDIN_MESSAGES_USAGE = [
  "Usage: log linkedin messages --account <accountName> (--with <name|profileId|publicId> | --conversation <urn>) [--json]",
  "Reads one LinkedIn conversation in full, on the direct-API engine (no browser): the inbox as log linkedin inbox reads it, then messengerMessages for the conversation, the call LinkedIn's messaging page makes when one is opened. --with picks the conversation among the 20 newest by the other person's name, profile id or public id; --conversation takes its urn from log linkedin inbox --json.",
  "Reads only: nothing is sent, and nothing is marked seen or read. Someone not in the 20 newest is refused (conversationNotFound), two matches too (conversationAmbiguous).",
].join("\n");

const LINKEDIN_MESSAGES_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Read one LinkedIn conversation in full",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "with", kind: "string", description: "The other person's name, profile id (ACoA…) or public id" },
        { name: "conversation", kind: "string", description: "The conversation's urn, from log linkedin inbox --json" },
        JSON_FLAG,
      ],
    },
  ],
};

export const linkedinMessagesCommand: Command = {
  usage: LINKEDIN_MESSAGES_USAGE,
  platform: "linkedin",
  name: "messages",
  effect: "read",
  input: LINKEDIN_MESSAGES_INPUT,
  summary: "Read one LinkedIn conversation in full, on the direct-API engine",
  args: "--account <a> (--with <who> | --conversation <urn>) [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_MESSAGES_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin messages: ${parsed.error}\n${LINKEDIN_MESSAGES_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log linkedin messages: takes no words, only flags\n${LINKEDIN_MESSAGES_USAGE}` };
    const ref = text(parsed.flags, "account");
    const withWhom = text(parsed.flags, "with");
    const conversation = text(parsed.flags, "conversation");
    if (!ref || Boolean(withWhom) === Boolean(conversation)) return { code: 1, stderr: `log linkedin messages: --account and one of --with or --conversation are needed\n${LINKEDIN_MESSAGES_USAGE}` };
    try {
      const opened = await openAccount(context, "messages", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      context.err(`${account.accountName}: reading the LinkedIn conversation ${withWhom ? `with ${withWhom}` : conversation} on the direct-API engine (reads only)`);
      const run = context.directLinkedin!(account, { action: "messages", ...(withWhom ? { with: withWhom } : { conversation }) });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("messages", run);
      const found = (run.answer["conversation"] ?? {}) as Partial<LinkedinConversation>;
      const messages = (Array.isArray(run.answer["messages"]) ? run.answer["messages"] : []) as LinkedinMessage[];
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, conversation: found, messages }, null, 2) };
      const who = (found.people ?? []).map((p) => p.name).join(", ") || found.conversationUrn || conversation;
      return { code: 0, stdout: `log linkedin messages: ${account.accountName} and ${who}, ${messages.length} messages:\n${messages.map(messageLine).join("\n")}` };
    } catch (error) {
      return refuseError("linkedin messages", error);
    }
  },
};
