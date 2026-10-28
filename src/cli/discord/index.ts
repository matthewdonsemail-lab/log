import { findDiscordAccount, recordDiscordSession, discordGate } from "../../discord/account/session/index.ts";
import { labelOf, matchChat } from "../../discord/chat/match/index.ts";
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

export const DISCORD_SEND_USAGE = [
  'Usage: log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--approvedBy <who>] [--live] [--json]',
  "Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (vendor/endcord, no browser).",
  "Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write.",
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
  args: '--account <a> --channel <id|name> --text "<message>" [--approvedBy <who>] [--live] [--json]',
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
      if (!live) return { code: 0, stdout: `log discord send: dry run: ${account.accountName} would send "${text}" to ${label}. Nothing was sent. --live --approvedBy <who> sends it (rule 8).` };
      if (!context.directDiscord) return { code: 1, stderr: "log discord send: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: send to ${label} on the direct-API engine (vendor/endcord), approved by ${approvedBy}`);
      const run = context.directDiscord(account, { action: "send", channel: target, text, live: true, approvedBy });
      const code = run.answer.ok && run.answer.event === "sent" ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "discord", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      if (code === 0) return { code, stdout: `log discord send: ${account.accountName} sent message ${run.answer.messageId} to channel ${run.answer.channelId} at ${run.answer.timestamp}.` };
      return { code, stdout: `log discord send: ${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}` };
    } catch (error) {
      return refuseError("discord send", error);
    }
  },
};
