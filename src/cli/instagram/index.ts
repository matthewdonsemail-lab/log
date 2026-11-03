import { findInstagramAccount, recordInstagramSession, instagramGate } from "../../instagram/account/session/index.ts";
import type { PlatformAccount, PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult } from "../runner/types.ts";

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
    if (!parsed.ok) return { code: 1, stderr: `log instagram session: ${parsed.error}\n${INSTAGRAM_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log instagram session: give check\n${INSTAGRAM_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log instagram session check: --account is needed\n${INSTAGRAM_SESSION_USAGE}` };
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
        { name: "limit", kind: "string", description: "Threads to list (default 20, at most 100), or messages to read with --with (default 30, at most 200)" },
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
    if (!parsed.ok) return { code: 1, stderr: `log instagram dms: ${parsed.error}\n${INSTAGRAM_DMS_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log instagram dms: takes no words, only flags\n${INSTAGRAM_DMS_USAGE}` };
    const said = typeof parsed.flags["with"] === "string" ? parsed.flags["with"].trim() : "";
    const most = said ? 200 : 100;
    const limit = parsed.flags["limit"] === undefined ? (said ? 30 : 20) : Number(parsed.flags["limit"]);
    if (!Number.isInteger(limit) || limit < 1 || limit > most) return { code: 1, stderr: `log instagram dms: --limit must be 1 to ${most}\n${INSTAGRAM_DMS_USAGE}` };
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
