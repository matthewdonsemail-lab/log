import { watermarkLine, watermarkReadingOf } from "../../twitter/copy/watermark/index.ts";
import { findSlackAccount, recordSlackSession, slackGate } from "../../slack/account/session/index.ts";
import { labelOf, matchChat } from "../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../discord/chat/match/index.ts";
import { addPending, incomingSince, interruptedLines } from "../../inbox/watch/index.ts";
import { ownOrAttach } from "../../inbox/relay/index.ts";
import { enqueueAttachments } from "../../media/describer/index.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";
import { recordPosition } from "../../inbox/store/index.ts";
import { slackCatchUp, storeRead, waitCaughtUp } from "../../inbox/catchUp/index.ts";
import { guardSend } from "../../inbox/claims/index.ts";
import type { InboxMessage } from "../../inbox/watch/index.ts";
import { withVoiceNotes } from "../transcribe/index.ts";
import type { AudioOf } from "../transcribe/index.ts";
import { profileFor, readProfiles, splitPlan } from "../../voice/pairs/index.ts";
import type { VoiceProfile } from "../../voice/pairs/index.ts";
import type { PlatformAccount, PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";

export const SLACK_SESSION_USAGE = [
  "Usage: log slack session check --account <accountName> [--workspace <domain>] [--json]",
  "Checks that Slack still accepts the account's saved d cookie, on the direct-API engine (vendor/gabrielSlack, no browser): the workspaces it is signed in to, and with --workspace who it is there (auth.test). Sends nothing.",
  "Slack's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const SLACK_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Slack still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The SLACK socialAccount's accountName (its handle)" },
        { name: "workspace", kind: "string", description: "Also check who the account is in this workspace (its domain)" },
        JSON_FLAG,
      ],
    },
  ],
};

function workspacesOf(answer: PlatformAnswer): string[] {
  return ((answer.workspaces as { domain?: string }[] | undefined) ?? []).map((w) => w.domain ?? "?");
}

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log slack session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (vendor/gabrielSlack, no browser), in ${workspacesOf(answer).join(", ") || "no workspace"}.`;
  return `log slack session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const slackSessionCommand: Command = {
  usage: SLACK_SESSION_USAGE,
  platform: "slack",
  name: "session",
  effect: "read",
  input: SLACK_SESSION_INPUT,
  summary: "Check that Slack still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to its row",
  args: "check --account <a> [--workspace <domain>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack session: ${parsed.error}\n${SLACK_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log slack session: give check\n${SLACK_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log slack session check: --account is needed\n${SLACK_SESSION_USAGE}` };
    try {
      const account = await findSlackAccount(context.twenty, ref);
      const gate = slackGate(account);
      if (!gate.ok) return refuse("slack session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directSlack) return { code: 1, stderr: "log slack session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (vendor/gabrielSlack)`);
      const workspace = typeof parsed.flags["workspace"] === "string" ? parsed.flags["workspace"].trim() : "";
      const run = context.directSlack(account, { action: "ping", ...(workspace ? { workspace } : {}) });
      for (const line of await recordSlackSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("slack session check", error);
    }
  },
};

export const slackDeps: { profiles: () => Record<string, VoiceProfile>; wait: (ms: number) => Promise<void>; incoming: (account: string, chat: string, since: string) => InboxMessage[]; now: () => string } = {
  profiles: () => readProfiles(),
  wait: (ms) => new Promise((done) => setTimeout(done, ms)),
  incoming: (account, chat, since) => incomingSince("slack", account, chat, since),
  now: () => new Date().toISOString(),
};

const SLACK_ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The SLACK socialAccount's accountName (its handle)" };
const SLACK_WORKSPACE: FlagSpec = { name: "workspace", kind: "string", description: "The workspace's domain (e.g. acme-team); needed when the session is signed in to more than one (log slack workspaces lists them)" };
const SLACK_CHAT_ID = /^[CDG][A-Z0-9]{6,}$/;

type Opened = { ok: true; account: PlatformAccount; workspace: string } | { ok: false; result: CommandResult };

export async function openAccount(context: CommandContext, label: string, flags: Record<string, unknown>): Promise<Opened> {
  const account = await findSlackAccount(context.twenty, String(flags["account"]));
  const gate = slackGate(account);
  if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
  if (!context.directSlack) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
  return { ok: true, account, workspace: typeof flags["workspace"] === "string" ? flags["workspace"].trim() : "" };
}

export function inWorkspace(workspace: string): { workspace?: string } {
  return workspace ? { workspace } : {};
}

function failed(label: string, account: PlatformAccount, answer: PlatformAnswer): CommandResult {
  const listed = answer.code === "workspaceNeeded" ? workspacesOf(answer).map((d) => `  ${d}`) : [];
  return { code: 1, stdout: [`log ${label}: ${account.accountName}: ${answer.code}: ${answer.detail ?? ""}`, ...listed].join("\n") };
}

export async function chatIdOf(context: CommandContext, label: string, account: PlatformAccount, workspace: string, said: string): Promise<{ ok: true; id: string; label: string } | { ok: false; result: CommandResult }> {
  if (SLACK_CHAT_ID.test(said)) return { ok: true, id: said, label: said };
  const listed = context.directSlack!(account, { action: "chats", limit: 200, ...inWorkspace(workspace) });
  if (!listed.answer.ok) return { ok: false, result: failed(label, account, listed.answer) };
  const found = matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], said);
  if (!found.ok) return { ok: false, result: refuse(label, found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n")) };
  context.err(`"${said}" is ${labelOf(found.chat)} (${found.chat.kind} ${found.chat.id})`);
  return { ok: true, id: found.chat.id, label: `${labelOf(found.chat)} (${found.chat.id})` };
}

export const SLACK_WORKSPACES_USAGE = [
  "Usage: log slack workspaces --account <accountName> [--json]",
  "Lists the workspaces the account's d cookie is signed in to, on the direct-API engine (Slack's own cookie exchange, vendor/gabrielSlack, no browser): each one's id, name and domain, the domain being what --workspace takes. Sends nothing.",
].join("\n");

export const SLACK_WORKSPACES_INPUT: CommandInput = {
  forms: [{ words: [], summary: "The workspaces the account is signed in to, with their domains", positionals: [], flags: [SLACK_ACCOUNT, JSON_FLAG] }],
};

export const slackWorkspacesCommand: Command = {
  usage: SLACK_WORKSPACES_USAGE,
  platform: "slack",
  name: "workspaces",
  effect: "read",
  input: SLACK_WORKSPACES_INPUT,
  summary: "List the workspaces a Slack account is signed in to, on the direct-API engine, sending nothing",
  args: "--account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_WORKSPACES_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack workspaces: ${parsed.error}\n${SLACK_WORKSPACES_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log slack workspaces: takes no words, only flags\n${SLACK_WORKSPACES_USAGE}` };
    try {
      const opened = await openAccount(context, "slack workspaces", parsed.flags);
      if (!opened.ok) return opened.result;
      const run = context.directSlack!(opened.account, { action: "workspaces" });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, ...run.answer }, null, 2) };
      if (!run.answer.ok) return failed("slack workspaces", opened.account, run.answer);
      const rows = (run.answer.workspaces as { id: string; name: string; domain: string }[] | undefined) ?? [];
      return { code, stdout: [`log slack workspaces: ${opened.account.accountName} is signed in to ${rows.length} workspace(s)`, ...rows.map((w) => `  ${w.domain.padEnd(28)} ${w.id}  ${w.name}`)].join("\n") };
    } catch (error) {
      return refuseError("slack workspaces", error);
    }
  },
};

export const SLACK_CHATS_USAGE = [
  "Usage: log slack chats --account <accountName> [--workspace <domain>] [--limit <n>] [--json]",
  "Lists the account's DMs and group DMs in one workspace with their ids and who they are with, newest first, on the direct-API engine (vendor/gabrielSlack, conversations.list, no browser). Sends nothing.",
].join("\n");

export const SLACK_CHATS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "The account's DMs and group DMs in a workspace, with their ids",
      positionals: [],
      flags: [SLACK_ACCOUNT, SLACK_WORKSPACE, { name: "limit", kind: "string", description: "How many, default 30, at most 200" }, JSON_FLAG],
    },
  ],
};

export const slackChatsCommand: Command = {
  usage: SLACK_CHATS_USAGE,
  platform: "slack",
  name: "chats",
  effect: "read",
  input: SLACK_CHATS_INPUT,
  summary: "List a Slack account's DMs and group DMs in a workspace with their ids, on the direct-API engine, sending nothing",
  args: "--account <a> [--workspace <domain>] [--limit <n>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_CHATS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack chats: ${parsed.error}\n${SLACK_CHATS_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log slack chats: takes no words, only flags\n${SLACK_CHATS_USAGE}` };
    const limit = parsed.flags["limit"] === undefined ? 30 : Number(parsed.flags["limit"]);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) return { code: 1, stderr: `log slack chats: --limit must be 1 to 200\n${SLACK_CHATS_USAGE}` };
    try {
      const opened = await openAccount(context, "slack chats", parsed.flags);
      if (!opened.ok) return opened.result;
      context.err(`${opened.account.accountName}: chats on the direct-API engine (vendor/gabrielSlack)`);
      const run = context.directSlack!(opened.account, { action: "chats", limit, ...inWorkspace(opened.workspace) });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, ...run.answer }, null, 2) };
      if (!run.answer.ok) return failed("slack chats", opened.account, run.answer);
      const chats = (run.answer.chats as DiscordChat[] | undefined) ?? [];
      const where = (run.answer.workspace as { domain?: string } | undefined)?.domain ?? opened.workspace;
      return { code, stdout: [`log slack chats: ${opened.account.accountName} has ${chats.length} DM(s) and group(s) in ${where}`, ...chats.map((c) => `  ${c.id}  ${c.kind.padEnd(5)}  ${labelOf(c)}`)].join("\n") };
    } catch (error) {
      return refuseError("slack chats", error);
    }
  },
};

export const SLACK_READ_USAGE = [
  "Usage: log slack read --account <accountName> --chat <chatId|who it is with> [--workspace <domain>] [--limit <n>] [--json]",
  "Reads a DM, group DM or channel's latest messages, oldest first, on the direct-API engine (vendor/gabrielSlack, conversations.history, no browser): who sent each, when, its text and its thread. Sends nothing, and marks nothing read.",
].join("\n");

export const SLACK_READ_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "A Slack chat's latest messages, oldest first, sending nothing",
      positionals: [],
      flags: [
        SLACK_ACCOUNT,
        { name: "chat", kind: "string", required: true, description: "The chat as matt says it (\"sam\"), matched to one DM or group; or its id (D…, G…, C…)" },
        SLACK_WORKSPACE,
        { name: "limit", kind: "string", description: "How many of the latest messages, default 30, at most 1000" },
        JSON_FLAG,
      ],
    },
  ],
};

interface SlackRead {
  ts: string;
  at: string;
  from: string;
  text: string;
  threadTs: string | null;
  replies: number | null;
  attachments?: AudioOf[];
  audio?: AudioOf[];
}

export const slackReadCommand: Command = {
  usage: SLACK_READ_USAGE,
  platform: "slack",
  name: "read",
  effect: "read",
  input: SLACK_READ_INPUT,
  summary: "Read a Slack chat's latest messages, on the direct-API engine, sending nothing",
  args: "--account <a> --chat <id|name> [--workspace <domain>] [--limit <n>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_READ_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack read: ${parsed.error}\n${SLACK_READ_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log slack read: takes no words, only flags\n${SLACK_READ_USAGE}` };
    const limit = parsed.flags["limit"] === undefined ? 30 : Number(parsed.flags["limit"]);
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) return { code: 1, stderr: `log slack read: --limit must be 1 to 1000\n${SLACK_READ_USAGE}` };
    try {
      const opened = await openAccount(context, "slack read", parsed.flags);
      if (!opened.ok) return opened.result;
      const chat = await chatIdOf(context, "slack read", opened.account, opened.workspace, String(parsed.flags["chat"]).trim());
      if (!chat.ok) return chat.result;
      const run = context.directSlack!(opened.account, { action: "read", chat: chat.id, limit, ...inWorkspace(opened.workspace) });
      const code = run.answer.ok ? 0 : 1;
      const messages = (await withVoiceNotes({ platform: "slack", account: opened.account.accountName, conversationId: chat.id }, ((run.answer.messages as SlackRead[] | undefined) ?? []).map((m) => ({ ...m, id: m.ts })), (m) => m.audio ?? [], context.err));
      if (run.answer.ok) for (const m of messages) storeRead("slack", opened.account.accountName, chat.id, "dm", { id: m.ts, at: m.at, from: m.from, fromMe: m.from === "me", text: m.text }, context.now?.() ?? new Date(), "backfill");
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, ...run.answer, ...(run.answer.messages ? { messages } : {}) }, null, 2) };
      if (!run.answer.ok) return failed("slack read", opened.account, run.answer);
      return {
        code,
        stdout: [
          `log slack read: ${messages.length} message(s) in ${chat.label}`,
          ...messages.map((m) => [`  ${m.at} ${m.from} · ${m.ts}${m.replies ? ` · ${m.replies} repl${m.replies === 1 ? "y" : "ies"}` : ""}`, ...(m.text ? m.text.split("\n").map((l) => `    ${l}`) : [])].join("\n")),
        ].join("\n"),
      };
    } catch (error) {
      return refuseError("slack read", error);
    }
  },
};

export const SLACK_WATCH_USAGE = [
  "Usage: log slack watch --account <accountName> [--workspace <domain>] [--chat <chatId|who it is with>] [--seconds <s>] [--inbox] [--json]",
  "Opens each workspace's own websocket on the direct-API engine (vendor/gabrielSlack, wss-primary.slack.com, no browser), every workspace the session is signed in to unless --workspace names one, and prints each message, typing, read marker, reaction and draft the moment Slack pushes it, nothing polled. --chat keeps one chat; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message or mention of the account from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.",
].join("\n");

export const SLACK_WATCH_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Every Slack event as the workspace's websocket pushes it, sending nothing",
      positionals: [],
      flags: [
        SLACK_ACCOUNT,
        SLACK_WORKSPACE,
        { name: "chat", kind: "string", description: "Only this chat (as matt says it) or its id" },
        { name: "seconds", kind: "string", description: "Stop after this many seconds (at least 5); default: until stopped" },
        { name: "inbox", kind: "boolean", description: "Hand each new DM, group message or mention of the account to the inbox hook" },
        JSON_FLAG,
      ],
    },
  ],
};

export function slackWatchLine(event: Record<string, unknown>): string {
  if (event.type === "message") return `${event.ts ?? ""} chat ${event.channel} · ${event.from}${event.subtype ? ` [${event.subtype}]` : ""}: ${String(event.text ?? "").replace(/\s+/g, " ").slice(0, 400)}`;
  return `${event.ts ?? ""} ${String(event.type)}${event.channel ? ` chat ${event.channel}` : ""}${event.user ? ` · ${event.user}` : ""}`;
}

export function slackToInboxOf(event: Record<string, unknown>): boolean {
  if (event.type !== "message" || event.fromMe || event.subtype) return false;
  const channel = String(event.channel ?? "");
  return channel.startsWith("D") || channel.startsWith("G") || event.mentionsMe === true;
}

export function slackInboxMessageOf(account: string, event: Record<string, unknown>, now: Date) {
  const channel = String(event.channel ?? "");
  return { platform: "slack", account, conversationId: channel, with: String(event.from ?? "?"), text: String(event.text ?? ""), at: String(event.at ?? now.toISOString()), box: channel.startsWith("D") ? "dm" : channel.startsWith("G") ? "group" : "mention", seenAt: now.toISOString(), workspace: String(event.workspace ?? "") };
}

export const slackWatchCommand: Command = {
  usage: SLACK_WATCH_USAGE,
  platform: "slack",
  name: "watch",
  effect: "read",
  input: SLACK_WATCH_INPUT,
  summary: "Watch a Slack workspace's events as its websocket pushes them, nothing polled, sending nothing",
  args: "--account <a> [--workspace <domain>] [--chat <id|name>] [--seconds <s>] [--inbox] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_WATCH_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack watch: ${parsed.error}\n${SLACK_WATCH_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log slack watch: takes no words, only flags\n${SLACK_WATCH_USAGE}` };
    const seconds = parsed.flags["seconds"] === undefined ? 0 : Number(parsed.flags["seconds"]);
    if (!Number.isFinite(seconds) || (seconds !== 0 && seconds < 5)) return refuse("slack watch", "secondsInvalid", "--seconds must be at least 5");
    try {
      const opened = await openAccount(context, "slack watch", parsed.flags);
      if (!opened.ok) return opened.result;
      if (!context.directSlackLive) return { code: 1, stderr: "log slack watch: the direct-API engine isn't wired in this context" };
      const said = typeof parsed.flags["chat"] === "string" ? parsed.flags["chat"].trim() : "";
      let only: string | null = null;
      if (said) {
        const chat = await chatIdOf(context, "slack watch", opened.account, opened.workspace, said);
        if (!chat.ok) return chat.result;
        only = chat.id;
      }
      const seen: Record<string, unknown>[] = [];
      const toInbox = parsed.flags["inbox"] === true;
      const shown = (event: Record<string, unknown>) => !(only && event.channel && event.channel !== only);
      const directSlackLive = context.directSlackLive;
      const owned = await ownOrAttach("slack", opened.account.accountName, {
        inbox: toInbox,
        seconds,
        onAttached: (event) => {
          if (event.type === "relayJoined") context.err(`${opened.account.accountName}: attached to the one Slack websocket already open (${String(event.subscribers)} subscriber(s)), nothing new opened`);
          else if (shown(event)) context.err(parsed.flags["json"] ? JSON.stringify(event) : slackWatchLine(event));
        },
        run: (emit) => {
          context.err(`${opened.account.accountName}: the one owner of ${opened.workspace || "every workspace"}'s websocket through vendor/gabrielSlack${only ? `, showing only ${only}` : ""}${seconds ? `, for ${seconds} s` : ", until stopped"}; new DMs, group messages and mentions go to the inbox and every event to every attached subscriber`);
          return directSlackLive(opened.account, { action: "watch", seconds, ...inWorkspace(opened.workspace) }, (event) => {
            emit(event);
            if (event.type === "message" && event.channel && event.ts && slackToInboxOf({ ...event, fromMe: false })) recordPosition("slack", opened.account.accountName, String(event.ts), String(event.channel));
            const mine = slackToInboxOf(event);
            if (mine) {
              const inbox = slackInboxMessageOf(opened.account.accountName, event, context.now?.() ?? new Date());
              enqueueAttachments(inbox, (event.attachments as { name?: string; type?: string; path?: string }[] | undefined) ?? []);
              addPending([inbox]);
            }
            if (!shown(event) || (toInbox && event.type === "message" && !mine)) return;
            if (event.type === "message") seen.push(event);
            context.err(parsed.flags["json"] ? JSON.stringify(event) : slackWatchLine(event));
          });
        },
        log: (line) => context.err(line),
        catchUp: (gap) => slackCatchUp(opened.account, gap, context.directSlack!, context.now?.() ?? new Date(), undefined, inWorkspace(opened.workspace)),
      });
      if ("refused" in owned) return refuse("slack watch", "watcherAlreadyRunning", owned.refused);
      if (!owned.owner) return { code: owned.attached.ok ? 0 : 1, stdout: `log slack watch: ${opened.account.accountName}: attached to the one owner, ${owned.attached.events} event(s) received; ${owned.attached.reason}` };
      const run = owned.result;
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, ...run.answer, messages: seen }, null, 2) };
      if (!run.answer.ok) return failed("slack watch", opened.account, run.answer);
      return { code, stdout: `log slack watch: ${opened.account.accountName}: ${seen.length} message(s) pushed in ${run.answer.watchedSeconds ?? seconds} s, nothing polled.` };
    } catch (error) {
      return refuseError("slack watch", error);
    }
  },
};

export const SLACK_SEND_USAGE = [
  'Usage: log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]',
  "Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).",
  "A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.",
].join("\n");

export const SLACK_SEND_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      effect: "write",
      summary: "Send a message on Slack, on the direct-API engine; a dry run unless --live",
      positionals: [],
      flags: [
        SLACK_ACCOUNT,
        { name: "chat", kind: "string", required: true, description: "The chat as matt says it (\"sam\"), matched to one DM or group; or its id (D…, G…, C…)" },
        { name: "text", kind: "string", required: true, description: "The message, as matt gave it" },
        SLACK_WORKSPACE,
        { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" },
        { name: "asOne", kind: "boolean", description: "Send it as one message, never split" },
        { name: "live", kind: "boolean", live: true, description: "Send it on Slack, only when matt asked (rule 8); without it a dry run contacts nothing" },
        JSON_FLAG,
      ],
    },
  ],
};

export const slackSendCommand: Command = {
  usage: SLACK_SEND_USAGE,
  platform: "slack",
  name: "send",
  effect: "write",
  input: SLACK_SEND_INPUT,
  summary: "Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live",
  args: '--account <a> --chat <id|name> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]',
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SLACK_SEND_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log slack send: ${parsed.error}\n${SLACK_SEND_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log slack send: takes no words, only flags\n${SLACK_SEND_USAGE}` };
    const said = String(parsed.flags["chat"]).trim();
    const text = String(parsed.flags["text"]);
    const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
    const live = parsed.flags["live"] === true;
    if (!said || !text.trim()) return { code: 1, stderr: `log slack send: --chat and --text can't be empty\n${SLACK_SEND_USAGE}` };
    if (live && !approvedBy) return refuse("slack send", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const watermark = watermarkReadingOf(text);
    if (watermark.level === "artifacts") return refuse("slack send", "aiArtifacts", `the copy carries what AI chat interfaces leave in text: ${watermark.findings.filter((f) => f.deterministic).map((f) => `${f.label} ×${f.count}`).join(", ")}`);
    try {
      const opened = await openAccount(context, "slack send", parsed.flags);
      if (!opened.ok) return opened.result;
      const chat = await chatIdOf(context, "slack send", opened.account, opened.workspace, said);
      if (!chat.ok) return chat.result;
      const profiles = slackDeps.profiles();
      const profile = profileFor({ profiles }, { platform: "slack", conversationId: chat.id });
      const plan = splitPlan(text, profile?.key === `chat:slack:${chat.id}` ? profile : null, parsed.flags["asOne"] === true, profiles.everyone?.startRates ?? {});
      const planLine = `${plan.parts.length === 1 ? "as one message" : `as ${plan.parts.length} messages, ${plan.gapSeconds} s apart`} (${plan.why})`;
      context.err(`${opened.account.accountName}: ${watermarkLine(watermark)}`);
      if (!live && parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, ok: true, dryRun: true, chat: chat.id, split: { parts: plan.parts, gapSeconds: plan.gapSeconds, why: plan.why }, watermark }, null, 2) };
      if (!live) return { code: 0, stdout: [`log slack send: dry run: ${opened.account.accountName} would send to ${chat.label} ${planLine}:`, ...plan.parts.map((p, i) => `  ${i + 1}. ${p}`), watermarkLine(watermark), "Nothing was sent. --live --approvedBy <who> sends it (rule 8); --asOne sends it as one message."].join("\n") };
      context.err(`${opened.account.accountName}: send to ${chat.label} ${planLine} on the direct-API engine, approved by ${approvedBy}`);
      const caught = await waitCaughtUp("slack", opened.account.accountName);
      if (!caught.ok) return refuse("slack send", "accountBehind", caught.refused);
      const voiced = await gateDeps.gate(context, { platform: "slack", account: opened.account.accountName, to: chat.label, text, conversationId: chat.id });
      if (!voiced.ok) return refuse("slack send", "voiceGateFailed", voiced.refused);
      context.err(voiced.line);
      const guard = guardSend({ platform: "slack", account: opened.account.accountName, conversationId: chat.id });
      if (!guard.ok) return refuse("slack send", "chatClaimedElsewhere", guard.refused);
      const sent: PlatformAnswer[] = [];
      const startedAt = slackDeps.now();
      let interrupted: InboxMessage[] = [];
      let fenced = false;
      try {
      for (const [i, part] of plan.parts.entries()) {
        if (i) {
          await slackDeps.wait(plan.gapSeconds * 1000);
          interrupted = slackDeps.incoming(opened.account.accountName, chat.id, startedAt);
          if (interrupted.length) break;
          if (!guard.held()) {
            fenced = true;
            break;
          }
        }
        const run = context.directSlack!(opened.account, { action: "send", chat: chat.id, lines: [part], live: true, approvedBy, ...inWorkspace(opened.workspace) });
        sent.push(run.answer);
        if (!run.answer.ok) break;
        context.err(`  ${i + 1}/${plan.parts.length} sent ${((run.answer.sent as { ts?: string }[] | undefined) ?? [])[0]?.ts ?? ""}: ${part}`);
      }
      } finally {
        const ok = sent.filter((a) => a.ok).length;
        guard.done(interrupted.length ? "interrupted" : ok === plan.parts.length ? "sent" : "failed", `${ok} of ${plan.parts.length}${fenced ? ", then the claim on this chat was lost, so the rest was held" : ""}: ${plan.parts.slice(0, ok).join(" / ").slice(0, 300)}`);
      }
      const done = sent.filter((a) => a.ok);
      const last = sent[sent.length - 1];
      const code = done.length === plan.parts.length ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "slack", account: opened.account.accountName, approvedBy, chat: chat.id, split: { parts: plan.parts, gapSeconds: plan.gapSeconds, why: plan.why }, watermark, sent, interrupted }, null, 2) };
      if (interrupted.length) return { code, stdout: interruptedLines(opened.account.accountName, interrupted, plan.parts.slice(done.length), done.length, plan.parts.length).join("\n") };
      if (code === 0) return { code, stdout: `log slack send: ${opened.account.accountName} sent ${done.length} message(s) to ${chat.label}${done.length > 1 ? `, ${plan.gapSeconds} s apart` : ""}.` };
      return { code, stdout: `log slack send: ${opened.account.accountName}: ${done.length} of ${plan.parts.length} sent, then ${last.code}: ${last.detail ?? ""}. What was sent stays sent; nothing is retried (rule 94).` };
    } catch (error) {
      return refuseError("slack send", error);
    }
  },
};

export { slackCookiesCommand, slackCookiesDeps } from "./helpers/index.ts";
