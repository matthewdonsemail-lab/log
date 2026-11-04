import { findDiscordAccount, discordGate } from "../../discord/account/session/index.ts";
import { labelOf, matchChat } from "../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../discord/chat/match/index.ts";
import { findInstagramAccount, instagramGate } from "../../instagram/account/session/index.ts";
import { guardSend } from "../../inbox/claims/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";
import { openAccount as openSlackAccount, chatIdOf as slackChatIdOf, inWorkspace } from "../slack/index.ts";
import { openTwitterAccount } from "../twitter/helpers/account.ts";

type ReactPlatform = "twitter" | "discord" | "slack" | "instagram";

interface Reaction {
  message: string;
  emoji: string;
  remove: boolean;
  approvedBy: string;
}

type Resolved = { ok: true; account: string; chatId: string; label: string; send: (reaction: Reaction) => Promise<PlatformAnswer> } | { ok: false; result: CommandResult };

interface ReactShape {
  platform: ReactPlatform;
  chat: FlagSpec;
  message: FlagSpec;
  extra: FlagSpec[];
  emoji: string;
  engine: string;
  resolve: (context: CommandContext, label: string, flags: Record<string, unknown>) => Promise<Resolved>;
}

const EMOJI: FlagSpec = { name: "emoji", kind: "string", required: true, description: "The reaction: an emoji (😂) or its name (joy, :fire:)" };
const REMOVE: FlagSpec = { name: "remove", kind: "boolean", description: "Take the account's own reaction off instead of adding it" };
const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" };

function usageOf(shape: ReactShape): string {
  return [
    `Usage: log ${shape.platform} react --account <accountName> --${shape.chat.name} <${shape.chat.name}> --${shape.message.name} <id> --emoji <emoji>${shape.extra.map((f) => ` [--${f.name} <${f.name}>]`).join("")} [--remove] [--approvedBy <who>] [--live] [--json]`,
    `Reacts to one message with an emoji, on the direct-API engine (${shape.engine}, no browser), or takes the account's own reaction off with --remove. ${shape.emoji}`,
    `Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).`,
  ].join("\n");
}

function inputOf(shape: ReactShape): CommandInput {
  const summary = `React to a ${shape.platform === "twitter" ? "X" : shape.platform[0].toUpperCase() + shape.platform.slice(1)} message with an emoji, on the direct-API engine; a dry run unless --live`;
  return { forms: [{ words: [], effect: "write", summary, positionals: [], flags: [{ name: "account", kind: "string", required: true, description: `The ${shape.platform.toUpperCase()} socialAccount's accountName (its handle)` }, shape.chat, shape.message, EMOJI, ...shape.extra, REMOVE, APPROVED_BY, { name: "live", kind: "boolean", live: true, description: "React on the platform, only when matt asked (rule 8); without it a dry run contacts nothing" }, JSON_FLAG] }] };
}

export function reactCommandOf(shape: ReactShape): Command {
  const usage = usageOf(shape);
  const input = inputOf(shape);
  const label = `${shape.platform} react`;
  return {
    usage,
    platform: shape.platform,
    name: "react",
    effect: "write",
    input,
    summary: input.forms[0].summary,
    args: `--account <a> --${shape.chat.name} <${shape.chat.name}> --${shape.message.name} <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]`,
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(input));
      if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${usage}` };
      if (parsed.positionals.length) return { code: 1, stderr: `log ${label}: takes no words, only flags\n${usage}` };
      const message = String(parsed.flags[shape.message.name] ?? "").trim();
      const emoji = String(parsed.flags["emoji"] ?? "").trim();
      const remove = parsed.flags["remove"] === true;
      const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? parsed.flags["approvedBy"].trim() : "";
      const live = parsed.flags["live"] === true;
      if (!message || !emoji) return refuse(label, "reactInvalid", `--${shape.message.name} and --emoji can't be empty`);
      if (live && !approvedBy) return refuse(label, "notApproved", "--live needs --approvedBy <who> (rule 8)");
      const verb = remove ? `take ${emoji} off` : `react ${emoji} to`;
      try {
        const resolved = await shape.resolve(context, label, parsed.flags);
        if (!resolved.ok) return resolved.result;
        const where = { platform: shape.platform, account: resolved.account, chat: resolved.chatId, message, emoji, remove };
        if (!live) {
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ engine: "directApi", ok: true, dryRun: true, ...where }, null, 2) };
          return { code: 0, stdout: `log ${label}: dry run: ${resolved.account} would ${verb} message ${message} in ${resolved.label}. Nothing was contacted. --live --approvedBy <who> does it (rule 8).` };
        }
        const guard = guardSend({ platform: shape.platform, account: resolved.account, conversationId: resolved.chatId });
        if (!guard.ok) return refuse(label, "chatClaimedElsewhere", guard.refused);
        context.err(`${resolved.account}: ${verb} message ${message} in ${resolved.label} on the direct-API engine, approved by ${approvedBy}`);
        let answer: PlatformAnswer;
        try {
          answer = await resolved.send({ message, emoji, remove, approvedBy });
        } catch (error) {
          guard.done("failed", error instanceof Error ? error.message : String(error));
          throw error;
        }
        guard.done(answer.ok ? "sent" : "failed", `${remove ? "reaction taken off" : "reacted"} ${emoji} on ${message}${answer.ok ? "" : `: ${answer.code}`}`);
        const code = answer.ok ? 0 : 1;
        if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", approvedBy, ...where, ...answer }, null, 2) };
        if (answer.ok) return { code, stdout: `log ${label}: ${resolved.account} ${remove ? `took ${emoji} off` : `reacted ${emoji} to`} message ${message} in ${resolved.label}${answer.already ? " (it already was)" : ""}.` };
        return { code, stdout: `log ${label}: ${resolved.account}: ${answer.code}: ${answer.detail ?? ""}. Nothing is retried (rule 94).` };
      } catch (error) {
        return refuseError(label, error);
      }
    },
  };
}

export const twitterReactCommand = reactCommandOf({
  platform: "twitter",
  chat: { name: "chat", kind: "string", required: true, description: "The conversation's id, from log twitter dms (a-b for old DMs, a:b for X Chat, which is tried as the same pair)" },
  message: { name: "message", kind: "string", required: true, description: "The message's id, from log twitter dms --with" },
  extra: [],
  emoji: "X takes any emoji; a name (joy, fire, eyes) is turned into it. It goes through X's own DM reaction mutation (useDMReactionMutationAddMutation), so a message only X Chat holds may be refused, and X's answer says so.",
  engine: "vendor/twikit",
  async resolve(context, label, flags) {
    const opened = await openTwitterAccount(context, label, String(flags["account"]));
    if (!opened.ok) return opened;
    const chat = String(flags["chat"]).trim();
    return { ok: true, account: opened.account.accountName, chatId: chat, label: `conversation ${chat}`, send: async (r) => (await opened.engine({ action: "react", conversationId: chat, messageId: r.message, emoji: r.emoji, remove: r.remove, live: true, approvedBy: r.approvedBy })).answer as PlatformAnswer };
  },
});

export const discordReactCommand = reactCommandOf({
  platform: "discord",
  chat: { name: "channel", kind: "string", required: true, description: "The chat as matt says it, matched to one DM or group; or a channel id" },
  message: { name: "message", kind: "string", required: true, description: "The message's id, from log discord read" },
  extra: [],
  emoji: "Discord takes any emoji, a name (joy, fire, eyes) turned into it, or a server's own emoji as name:id.",
  engine: "vendor/endcord",
  async resolve(context, label, flags) {
    const account = await findDiscordAccount(context.twenty, String(flags["account"]));
    const gate = discordGate(account);
    if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
    const direct = context.directDiscord;
    if (!direct) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
    const said = String(flags["channel"]).trim();
    let target = said;
    let shown = said;
    if (!/^\d{15,22}$/.test(said)) {
      const listed = direct(account, { action: "chats" });
      if (!listed.answer.ok) return { ok: false, result: { code: 1, stdout: `log ${label}: ${account.accountName}: reading its chats to find "${said}": ${listed.answer.code}: ${listed.answer.detail ?? ""}` } };
      const found = matchChat((listed.answer.chats as DiscordChat[] | undefined) ?? [], said);
      if (!found.ok) return { ok: false, result: refuse(label, found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n")) };
      target = found.chat.id;
      shown = labelOf(found.chat);
    }
    return { ok: true, account: account.accountName, chatId: target, label: shown, send: async (r) => direct(account, { action: "react", channel: target, message: r.message, emoji: r.emoji, remove: r.remove, live: true, approvedBy: r.approvedBy }).answer };
  },
});

export const slackReactCommand = reactCommandOf({
  platform: "slack",
  chat: { name: "chat", kind: "string", required: true, description: "The chat as matt says it, matched to one DM or group; or its id (D…, G…, C…)" },
  message: { name: "message", kind: "string", required: true, description: "The message's ts, from log slack read" },
  extra: [{ name: "workspace", kind: "string", description: "The workspace's domain; needed when the session is signed in to more than one" }],
  emoji: "Slack reacts by name (joy, fire, eyes, or a workspace's own); the common emoji are turned into their names, and one it doesn't know is refused with reactInvalid, so give its name. Already reacted counts as done.",
  engine: "vendor/gabrielSlack, reactions.add and reactions.remove",
  async resolve(context, label, flags) {
    const opened = await openSlackAccount(context, label, flags);
    if (!opened.ok) return opened;
    const chat = await slackChatIdOf(context, label, opened.account, opened.workspace, String(flags["chat"]).trim());
    if (!chat.ok) return chat;
    return { ok: true, account: opened.account.accountName, chatId: chat.id, label: chat.label, send: async (r) => context.directSlack!(opened.account, { action: "react", chat: chat.id, ts: r.message, emoji: r.emoji, remove: r.remove, live: true, approvedBy: r.approvedBy, ...inWorkspace(opened.workspace) }).answer };
  },
});

export const instagramReactCommand = reactCommandOf({
  platform: "instagram",
  chat: { name: "thread", kind: "string", required: true, description: "The thread's id, from log instagram dms" },
  message: { name: "message", kind: "string", required: true, description: "The message's item id, from log instagram dms --with" },
  extra: [],
  emoji: "Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).",
  engine: "vendor/instagrapi",
  async resolve(context, label, flags) {
    const account = await findInstagramAccount(context.twenty, String(flags["account"]));
    const gate = instagramGate(account);
    if (!gate.ok) return { ok: false, result: refuse(label, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
    const direct = context.directInstagram;
    if (!direct) return { ok: false, result: { code: 1, stderr: `log ${label}: the direct-API engine isn't wired in this context` } };
    const thread = String(flags["thread"]).trim();
    return { ok: true, account: account.accountName, chatId: thread, label: `thread ${thread}`, send: async (r) => direct(account, { action: "react", thread, itemId: r.message, emoji: r.emoji, remove: r.remove, live: true, approvedBy: r.approvedBy }).answer };
  },
});
