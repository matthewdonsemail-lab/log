import { findDiscordAccount, recordDiscordSession, discordGate } from "../../discord/account/session/index.ts";
import { labelOf, matchChat } from "../../discord/chat/match/index.ts";
import { addPending } from "../../inbox/watch/index.ts";
import { profileFor, readProfiles, splitPlan } from "../../voice/pairs/index.ts";
import type { VoiceProfile } from "../../voice/pairs/index.ts";
import type { DiscordChat } from "../../discord/chat/match/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const DISCORD_SESSION_USAGE = [
  "Usage: log discord session check --account <accountName> [--json]",
  "Checks that Discord still accepts the account's saved session, on the direct-API engine (vendor/endcord, no browser). Sends nothing.",
  "Discord's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const DISCORD_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Discord still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The DISCORD socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log discord session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (vendor/endcord, no browser).`;
  return `log discord session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const discordSessionCommand: Command = {
  usage: DISCORD_SESSION_USAGE,
  platform: "discord",
  name: "session",
  effect: "read",
  input: DISCORD_SESSION_INPUT,
  summary: "Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord session: ${parsed.error}\n${DISCORD_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log discord session: give check\n${DISCORD_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log discord session check: --account is needed\n${DISCORD_SESSION_USAGE}` };
    try {
      const account = await findDiscordAccount(context.twenty, ref);
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directDiscord) return { code: 1, stderr: "log discord session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine (vendor/endcord)`);
      const run = context.directDiscord(account, { action: "ping" });
      for (const line of await recordDiscordSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("discord session check", error);
    }
  },
};

export const discordDeps: { profiles: () => Record<string, VoiceProfile>; wait: (ms: number) => Promise<void> } = { profiles: () => readProfiles(), wait: (ms) => new Promise((done) => setTimeout(done, ms)) };

const DISCORD_ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The DISCORD socialAccount's accountName (its handle)" };

export const DISCORD_CHATS_USAGE = [
  "Usage: log discord chats --account <accountName> [--json]",
  "Lists the account's DMs and group DMs with their ids, names and members, on the direct-API engine (vendor/endcord, no browser). Sends nothing.",
].join("\n");

export const DISCORD_CHATS_INPUT: CommandInput = {
  forms: [{ words: [], summary: "The account's DMs and group DMs, with their ids", positionals: [], flags: [DISCORD_ACCOUNT, JSON_FLAG] }],
};

export const discordChatsCommand: Command = {
  usage: DISCORD_CHATS_USAGE,
  platform: "discord",
  name: "chats",
  effect: "read",
  input: DISCORD_CHATS_INPUT,
  summary: "List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing",
  args: "--account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_CHATS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord chats: ${parsed.error}\n${DISCORD_CHATS_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log discord chats: takes no words, only flags\n${DISCORD_CHATS_USAGE}` };
    try {
      const account = await findDiscordAccount(context.twenty, String(parsed.flags["account"]));
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord chats", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directDiscord) return { code: 1, stderr: "log discord chats: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: chats on the direct-API engine (vendor/endcord)`);
      const run = context.directDiscord(account, { action: "chats" });
      const chats = (run.answer.chats as DiscordChat[] | undefined) ?? [];
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, ...run.answer }, null, 2) };
      if (!run.answer.ok) return { code, stdout: `log discord chats: ${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}` };
      return { code, stdout: [`log discord chats: ${account.accountName} has ${chats.length} DM(s) and group(s)`, ...chats.map((c) => `  ${c.id}  ${c.kind.padEnd(5)}  ${c.name ?? "(no name)"}  (${c.members.join(", ")})`)].join("\n") };
    } catch (error) {
      return refuseError("discord chats", error);
    }
  },
};

export const DISCORD_READ_USAGE = [
  "Usage: log discord read --account <accountName> --channel <channelId|chat name> [--limit <n>] [--after <messageId>] [--json]",
  "Reads a DM, group DM or server channel's latest messages, oldest first, on the direct-API engine (vendor/endcord, no browser): who sent each, when, whether a bot, what it replies to, its text and embeds. --after keeps only what came after that message (a bot's answer to ours). Sends nothing.",
].join("\n");

export const DISCORD_READ_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "A chat's latest messages, oldest first, sending nothing",
      positionals: [],
      flags: [
        DISCORD_ACCOUNT,
        { name: "channel", kind: "string", required: true, description: "The chat as matt says it, matched to one DM or group; or a channel id (a server channel by its id)" },
        { name: "limit", kind: "string", description: "How many of the latest messages, default 20, at most 200" },
        { name: "after", kind: "string", description: "Only messages after this message id" },
        JSON_FLAG,
      ],
    },
  ],
};

interface DiscordRead {
  id: string;
  at: string;
  from: string;
  bot: boolean;
  fromMe: boolean;
  replyTo: string | null;
  text: string;
  embeds: { title?: string; description?: string; url?: string }[];
}

export const discordReadCommand: Command = {
  usage: DISCORD_READ_USAGE,
  platform: "discord",
  name: "read",
  effect: "read",
  input: DISCORD_READ_INPUT,
  summary: "Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing",
  args: "--account <a> --channel <id|name> [--limit <n>] [--after <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_READ_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord read: ${parsed.error}\n${DISCORD_READ_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log discord read: takes no words, only flags\n${DISCORD_READ_USAGE}` };
    const channel = String(parsed.flags["channel"]).trim();
    const limit = parsed.flags["limit"] === undefined ? 20 : Number(parsed.flags["limit"]);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) return { code: 1, stderr: `log discord read: --limit must be 1 to 200\n${DISCORD_READ_USAGE}` };
    const after = typeof parsed.flags["after"] === "string" ? parsed.flags["after"].trim() : undefined;
    try {
      const account = await findDiscordAccount(context.twenty, String(parsed.flags["account"]));
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord read", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directDiscord) return { code: 1, stderr: "log discord read: the direct-API engine isn't wired in this context" };
      let target = channel;
      if (!/^\d{15,22}$/.test(channel)) {
        const listed = context.directDiscord(account, { action: "chats" });
        if (!listed.answer.ok) return { code: 1, stdout: `log discord read: ${account.accountName}: reading its chats to find "${channel}": ${listed.answer.code}: ${listed.answer.detail ?? ""}` };
        const found = matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], channel);
        if (!found.ok) return refuse("discord read", found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n"));
        target = found.chat.id;
        context.err(`"${channel}" is ${labelOf(found.chat)} (${found.chat.kind} ${found.chat.id})`);
      }
      const run = context.directDiscord(account, { action: "read", channel: target, limit, ...(after ? { after } : {}) });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, ...run.answer }, null, 2) };
      if (!run.answer.ok) return { code, stdout: `log discord read: ${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}` };
      const messages = (run.answer.messages as DiscordRead[] | undefined) ?? [];
      return {
        code,
        stdout: [
          `log discord read: ${messages.length} message(s) in ${target}${after ? ` after ${after}` : ""}`,
          ...messages.map((m) => [`  ${m.at} ${m.from}${m.bot ? " [bot]" : ""}${m.fromMe ? " (me)" : ""}${m.replyTo ? ` replying to ${m.replyTo}` : ""} · ${m.id}`, ...(m.text ? m.text.split("\n").map((l) => `    ${l}`) : []), ...m.embeds.map((e) => `    [embed] ${[e.title, e.description, e.url].filter(Boolean).join(" · ")}`)].join("\n")),
        ].join("\n"),
      };
    } catch (error) {
      return refuseError("discord read", error);
    }
  },
};

export const DISCORD_WATCH_USAGE = [
  "Usage: log discord watch --account <accountName> [--channel <channelId|chat name>] [--seconds <s>] [--inbox] [--json]",
  "Opens the account's Discord gateway on the direct-API engine (wss://gateway.discord.gg, through vendor/endcord, no browser) and prints every message the moment Discord pushes it, nothing polled. --channel keeps only one chat or channel; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message, mention of the account or reply to it from someone else to the inbox hook, which puts it in front of the agent with what to do next. Sends nothing.",
].join("\n");

export const DISCORD_WATCH_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Every Discord message as Discord pushes it, over the gateway, sending nothing",
      positionals: [],
      flags: [
        DISCORD_ACCOUNT,
        { name: "channel", kind: "string", description: "Only this chat (as matt says it) or channel id" },
        { name: "seconds", kind: "string", description: "Stop after this many seconds (at least 5); default: until stopped" },
        { name: "inbox", kind: "boolean", description: "Hand each new DM, group message, mention or reply to the account to the inbox hook" },
        JSON_FLAG,
      ],
    },
  ],
};

export function watchLine(event: Record<string, unknown>): string {
  if (event.kind !== "message") return `${event.at ?? ""} ${String(event.kind)}: ${event.detail ?? ""}`;
  const text = String(event.text ?? "").replace(/\s+/g, " ").slice(0, 400);
  return `${event.at ?? ""} ${event.guildId ? `channel ${event.channelId}` : `chat ${event.channelId}`} · ${event.from}${event.bot ? " [bot]" : ""}${event.fromMe ? " (me)" : ""}${event.replyTo ? ` replying to ${event.replyTo}` : ""} · ${event.id}: ${text}`;
}

export function toInboxOf(event: Record<string, unknown>): boolean {
  if (event.kind !== "message" || event.fromMe) return false;
  if (event.bot && String(event.text ?? "").trim() === "Thinking...") return false;
  return !event.guildId || event.mentionsMe === true || event.repliesToMe === true;
}

export function discordInboxMessageOf(account: string, event: Record<string, unknown>, now: Date) {
  return { platform: "discord", account, conversationId: String(event.channelId ?? ""), with: String(event.from ?? "?"), text: String(event.text ?? ""), at: String(event.at ?? now.toISOString()), box: event.guildId ? (event.mentionsMe ? "mention" : "reply") : "dm", seenAt: now.toISOString() };
}

export const discordWatchCommand: Command = {
  usage: DISCORD_WATCH_USAGE,
  platform: "discord",
  name: "watch",
  effect: "read",
  input: DISCORD_WATCH_INPUT,
  summary: "Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing",
  args: "--account <a> [--channel <id|name>] [--seconds <s>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_WATCH_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord watch: ${parsed.error}\n${DISCORD_WATCH_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log discord watch: takes no words, only flags\n${DISCORD_WATCH_USAGE}` };
    const seconds = parsed.flags["seconds"] === undefined ? 0 : Number(parsed.flags["seconds"]);
    if (!Number.isFinite(seconds) || (seconds !== 0 && seconds < 5)) return refuse("discord watch", "secondsInvalid", "--seconds must be at least 5");
    try {
      const account = await findDiscordAccount(context.twenty, String(parsed.flags["account"]));
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord watch", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directDiscord || !context.directDiscordLive) return { code: 1, stderr: "log discord watch: the direct-API engine isn't wired in this context" };
      let only: string | null = null;
      const channel = typeof parsed.flags["channel"] === "string" ? parsed.flags["channel"].trim() : "";
      if (channel) {
        if (/^\d{15,22}$/.test(channel)) only = channel;
        else {
          const listed = context.directDiscord(account, { action: "chats" });
          const found = listed.answer.ok ? matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], channel) : null;
          if (!found) return { code: 1, stdout: `log discord watch: reading its chats to find "${channel}": ${listed.answer.code}: ${listed.answer.detail ?? ""}` };
          if (!found.ok) return refuse("discord watch", found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n"));
          only = found.chat.id;
          context.err(`"${channel}" is ${labelOf(found.chat)} (${found.chat.kind} ${found.chat.id})`);
        }
      }
      context.err(`${account.accountName}: opening Discord's gateway through vendor/endcord${only ? `, only ${only}` : ""}${seconds ? `, for ${seconds} s` : ", until stopped"}`);
      const seen: Record<string, unknown>[] = [];
      const toInbox = parsed.flags["inbox"] === true;
      if (toInbox) context.err("new DMs, group messages, mentions and replies to the account go to the inbox hook");
      const run = await context.directDiscordLive(account, { action: "watch", seconds }, (event) => {
        if (event.kind === "message" && only && event.channelId !== only) return;
        const mine = toInbox && toInboxOf(event);
        if (toInbox && event.kind === "message" && !mine) return;
        if (event.kind === "message") seen.push(event);
        if (mine) addPending([discordInboxMessageOf(account.accountName, event, context.now?.() ?? new Date())]);
        context.err(parsed.flags["json"] ? JSON.stringify(event) : watchLine(event));
      });
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, ...run.answer, messages: seen }, null, 2) };
      if (!run.answer.ok) return { code, stdout: `log discord watch: ${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}` };
      return { code, stdout: `log discord watch: ${account.accountName}: ${seen.length} message(s) pushed in ${run.answer.seconds ?? seconds} s, nothing polled.` };
    } catch (error) {
      return refuseError("discord watch", error);
    }
  },
};

export const DISCORD_SEND_USAGE = [
  'Usage: log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--approvedBy <who>] [--live] [--json]',
  "Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (vendor/endcord, no browser).",
  "It is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write.",
].join("\n");

export const DISCORD_SEND_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      effect: "write",
      summary: "Send one message on Discord, on the direct-API engine; a dry run unless --live",
      positionals: [],
      flags: [
        DISCORD_ACCOUNT,
        { name: "channel", kind: "string", required: true, description: "The chat as matt says it (\"the log group\", \"jilly\", \"listaro\"), matched to one DM or group; or a channel id" },
        { name: "text", kind: "string", required: true, description: "The message, as matt gave it" },
        { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" },
        { name: "asOne", kind: "boolean", description: "Send it as one message, never split" },
        { name: "live", kind: "boolean", live: true, description: "Send it on Discord, only when matt asked (rule 8); without it a dry run contacts nothing" },
        JSON_FLAG,
      ],
    },
  ],
};

export const discordSendCommand: Command = {
  usage: DISCORD_SEND_USAGE,
  platform: "discord",
  name: "send",
  effect: "write",
  input: DISCORD_SEND_INPUT,
  summary: "Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live",
  args: '--account <a> --channel <id|name> --text "<message>" [--asOne] [--approvedBy <who>] [--live] [--json]',
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(DISCORD_SEND_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log discord send: ${parsed.error}\n${DISCORD_SEND_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log discord send: takes no words, only flags\n${DISCORD_SEND_USAGE}` };
    const channel = String(parsed.flags["channel"]).trim();
    const text = String(parsed.flags["text"]);
    const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
    const live = parsed.flags["live"] === true;
    if (!channel || !text.trim()) return { code: 1, stderr: `log discord send: --channel and --text can't be empty\n${DISCORD_SEND_USAGE}` };
    if (live && !approvedBy) return refuse("discord send", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    try {
      const account = await findDiscordAccount(context.twenty, String(parsed.flags["account"]));
      const gate = discordGate(account);
      if (!gate.ok) return refuse("discord send", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      let target = channel;
      let label = channel;
      if (!/^\d{15,22}$/.test(channel)) {
        if (!context.directDiscord) return { code: 1, stderr: "log discord send: the direct-API engine isn't wired in this context" };
        const listed = context.directDiscord(account, { action: "chats" });
        if (!listed.answer.ok) return { code: 1, stdout: `log discord send: ${account.accountName}: reading its chats to find "${channel}": ${listed.answer.code}: ${listed.answer.detail ?? ""}` };
        const found = matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], channel);
        if (!found.ok) return refuse("discord send", found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n"));
        target = found.chat.id;
        label = `${labelOf(found.chat)} (${found.chat.kind} ${found.chat.id})`;
        context.err(`"${channel}" is ${label}`);
      }
      const profiles = discordDeps.profiles();
      const profile = profileFor({ profiles }, { platform: "discord", conversationId: target });
      const plan = splitPlan(text, profile?.key === `chat:discord:${target}` ? profile : null, parsed.flags["asOne"] === true, profiles.everyone?.startRates ?? {});
      const planLine = `${plan.parts.length === 1 ? "as one message" : `as ${plan.parts.length} messages, ${plan.gapSeconds} s apart`} (${plan.why})`;
      if (!live) return { code: 0, stdout: [`log discord send: dry run: ${account.accountName} would send to ${label} ${planLine}:`, ...plan.parts.map((p, i) => `  ${i + 1}. ${p}`), "Nothing was sent. --live --approvedBy <who> sends it (rule 8); --asOne sends it as one message."].join("\n") };
      if (!context.directDiscord) return { code: 1, stderr: "log discord send: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: send to ${label} ${planLine} on the direct-API engine (vendor/endcord), approved by ${approvedBy}`);
      const sent: PlatformAnswer[] = [];
      for (const [i, part] of plan.parts.entries()) {
        if (i) await discordDeps.wait(plan.gapSeconds * 1000);
        const run = context.directDiscord(account, { action: "send", channel: target, text: part, live: true, approvedBy });
        sent.push(run.answer);
        if (!run.answer.ok || run.answer.event !== "sent") break;
        context.err(`  ${i + 1}/${plan.parts.length} sent ${run.answer.messageId}: ${part}`);
      }
      const last = sent[sent.length - 1];
      const done = sent.filter((a) => a.ok && a.event === "sent");
      const code = done.length === plan.parts.length ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, approvedBy, split: { parts: plan.parts, gapSeconds: plan.gapSeconds, why: plan.why }, sent }, null, 2) };
      if (code === 0) return { code, stdout: `log discord send: ${account.accountName} sent ${done.length === 1 ? `message ${last.messageId}` : `${done.length} messages (${done.map((a) => a.messageId).join(", ")})`} to channel ${last.channelId}${done.length > 1 ? `, ${plan.gapSeconds} s apart` : ""}, the last at ${last.timestamp}.` };
      return { code, stdout: `log discord send: ${account.accountName}: ${done.length} of ${plan.parts.length} sent, then ${last.code}: ${last.detail ?? ""}. What was sent stays sent; nothing is retried.` };
    } catch (error) {
      return refuseError("discord send", error);
    }
  },
};
