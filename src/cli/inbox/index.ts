import { claimChat, liveClaims, readActions, releaseChat } from "../../inbox/claims/index.ts";
import type { ActionRecord, ChatClaim } from "../../inbox/claims/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const INBOX_USAGE = [
  "Usage: log inbox claim --platform <twitter|discord|slack|instagram> --account <a> --chat <conversationId|handle> [--event <eventId>] [--json]",
  "       log inbox release --platform <p> --account <a> --chat <conversationId|handle> [--json]",
  "       log inbox claims [--json]",
  "       log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId|handle>] [--limit <n>] [--json]",
  "Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting.",
].join("\n");

const PLATFORM: FlagSpec = { name: "platform", kind: "string", required: true, description: "The platform: twitter, discord, slack or instagram" };
const ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The account's accountName" };
const CHAT: FlagSpec = { name: "chat", kind: "string", required: true, description: "The chat: its conversation id (an X user id or pair, a Discord channel, a Slack chat, an Instagram thread) or the person's handle" };

export const INBOX_INPUT: CommandInput = {
  forms: [
    { words: ["claim"], effect: "write", summary: "Claim a chat for this session before drafting or sending in it, so no other session acts on it", positionals: [], flags: [PLATFORM, ACCOUNT, CHAT, { name: "event", kind: "string", description: "The event id from >>> NEW MESSAGE that this claim answers" }, JSON_FLAG] },
    { words: ["release"], effect: "write", summary: "Release this session's claim on a chat when it is done with it", positionals: [], flags: [PLATFORM, ACCOUNT, CHAT, JSON_FLAG] },
    { words: ["claims"], summary: "Every live claim: which session holds which chat, and until when", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["actions"], summary: "The log of every claim, refusal, send and release, oldest first, to see what was already done in a chat",
      positionals: [],
      flags: [
        { name: "platform", kind: "string", description: "Only this platform" },
        { name: "account", kind: "string", description: "Only this account" },
        { name: "chat", kind: "string", description: "Only this chat (its id or the person's handle)" },
        { name: "limit", kind: "string", description: "How many of the newest, default 50" },
        JSON_FLAG,
      ],
    },
  ],
};

const PLATFORMS = ["twitter", "discord", "slack", "instagram"];

function claimLine(c: ChatClaim): string {
  return `  ${c.platform} ${c.account} ${c.with ? `@${c.with} ` : ""}${c.conversationId}  held by pid ${c.by} since ${c.claimedAt} until ${c.expiresAt}${c.eventId ? `  event ${c.eventId}` : ""}`;
}

function actionLine(a: ActionRecord): string {
  return `  ${a.at} ${a.kind.padEnd(11)} ${a.platform} ${a.account} ${a.with ? `@${a.with} ` : ""}${a.conversationId} pid ${a.by}${a.eventId ? ` event ${a.eventId}` : ""}${a.detail ? `: ${a.detail}` : ""}`;
}

export const inboxCommand: Command = {
  usage: INBOX_USAGE,
  platform: "any",
  name: "inbox",
  effect: "write",
  input: INBOX_INPUT,
  summary: "Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat",
  args: "claim|release|claims|actions [--platform <p>] [--account <a>] [--chat <id|handle>] [--event <id>] [--limit <n>]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INBOX_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log inbox: ${parsed.error}\n${INBOX_USAGE}` };
    const [sub = "claims", ...rest] = parsed.positionals;
    if (rest.length) return { code: 1, stderr: `log inbox: unexpected argument "${rest[0]}"\n${INBOX_USAGE}` };
    const json = parsed.flags["json"] === true;
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : "");
    if (sub === "claims") {
      const claims = liveClaims();
      if (json) return { code: 0, stdout: JSON.stringify({ claims }, null, 2) };
      return { code: 0, stdout: claims.length ? [`log inbox claims: ${claims.length} live claim(s):`, ...claims.map(claimLine)].join("\n") : "log inbox claims: no chat is claimed by any session right now." };
    }
    if (sub === "actions") {
      const limit = str("limit") ? Number(str("limit")) : 50;
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) return { code: 1, stderr: `log inbox actions: --limit must be 1 to 1000\n${INBOX_USAGE}` };
      const rows = readActions({ platform: str("platform") || undefined, account: str("account") || undefined, chat: str("chat") || undefined, limit });
      if (json) return { code: 0, stdout: JSON.stringify({ actions: rows }, null, 2) };
      return { code: 0, stdout: rows.length ? [`log inbox actions: the ${rows.length} newest, oldest first:`, ...rows.map(actionLine)].join("\n") : "log inbox actions: nothing has been done in that chat yet." };
    }
    if (sub !== "claim" && sub !== "release") return { code: 1, stderr: `log inbox: unknown subcommand "${sub}"\n${INBOX_USAGE}` };
    const platform = str("platform");
    if (!PLATFORMS.includes(platform)) return { code: 1, stderr: `log inbox ${sub}: --platform is one of ${PLATFORMS.join(", ")}\n${INBOX_USAGE}` };
    const ref = { platform, account: str("account"), conversationId: str("chat").replace(/^@/, ""), ...(/^\d+([-:]\d+)?$|^[CDG][A-Z0-9]+$/.test(str("chat")) ? {} : { with: str("chat").replace(/^@/, "") }), ...(str("event") ? { eventId: str("event") } : {}) };
    if (!ref.account || !ref.conversationId) return { code: 1, stderr: `log inbox ${sub}: --account and --chat can't be empty\n${INBOX_USAGE}` };
    if (sub === "release") {
      const released = releaseChat(ref);
      return { code: 0, stdout: json ? JSON.stringify({ released }, null, 2) : released ? `log inbox release: this session's claim on ${platform} ${ref.account} ${ref.conversationId} is released.` : `log inbox release: this session held no claim on ${platform} ${ref.account} ${ref.conversationId}.` };
    }
    const claimed = claimChat(ref);
    if (!claimed.ok) return refuse("inbox claim", "chatClaimedElsewhere", `pid ${claimed.holder.by} holds ${platform} ${ref.account} ${ref.conversationId} until ${claimed.holder.expiresAt}`);
    if (json) return { code: 0, stdout: JSON.stringify({ claim: claimed.claim, renewed: claimed.renewed }, null, 2) };
    return { code: 0, stdout: `log inbox claim: this session (pid ${claimed.claim.by}) ${claimed.renewed ? "still holds" : "now holds"} ${platform} ${ref.account} ${ref.conversationId} until ${claimed.claim.expiresAt}. Draft and send; the send releases it.` };
  },
};
