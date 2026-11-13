import { claimChat, liveClaims, readActions, releaseChat } from "../../inbox/claims/index.ts";
import { behindOf, resumeGap } from "../../inbox/store/index.ts";
import type { ActionRecord, ChatClaim } from "../../inbox/claims/index.ts";
import { lastWordOf, waitingOf } from "../../inbox/lastWord/index.ts";
import type { LastWord } from "../../inbox/lastWord/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const INBOX_USAGE = [
  "Usage: log inbox claim --platform <twitter|discord|slack|instagram> --account <a> --chat <conversationId|handle> [--event <eventId>] [--json]",
  "       log inbox release --platform <p> --account <a> --chat <conversationId|handle> [--json]",
  "       log inbox claims [--json]",
  "       log inbox resume --platform <p> --account <a> --by <who> [--json]",
  "       log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId|handle>] [--limit <n>] [--json]",
  "       log inbox waiting [--platform <p>] [--account <a>] [--limit <n>] [--oldest] [--json]",
  "Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when the owner says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.",
].join("\n");

const PLATFORM: FlagSpec = { name: "platform", kind: "enum", values: ["twitter", "discord", "slack", "instagram"], required: true, description: "The platform: twitter, discord, slack or instagram" };
const ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The account's accountName" };
const CHAT: FlagSpec = { name: "chat", kind: "string", required: true, description: "The chat: its conversation id (an X user id or pair, a Discord channel, a Slack chat, an Instagram thread) or the person's handle" };

export const INBOX_INPUT: CommandInput = {
  forms: [
    { words: ["claim"], effect: "write", summary: "Claim a chat for this session before drafting or sending in it, so no other session acts on it", positionals: [], flags: [PLATFORM, ACCOUNT, CHAT, { name: "event", kind: "string", description: "The event id from >>> NEW MESSAGE that this claim answers" }, JSON_FLAG] },
    { words: ["release"], effect: "write", summary: "Release this session's claim on a chat when it is done with it", positionals: [], flags: [PLATFORM, ACCOUNT, CHAT, JSON_FLAG] },
    { words: ["resume"], effect: "write", summary: "The owner's go-ahead after a refused catch-up: the account catches up again through its own session (rule 94), only when the owner says so", positionals: [], flags: [PLATFORM, ACCOUNT, { name: "by", kind: "string", required: true, description: "Who said to resume: the owner" }, JSON_FLAG] },
    {
      words: ["waiting"], summary: "Who wrote last on every platform, from log.db in time order: the people waiting on a reply, and apart the ones who reacted to your last message",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", values: ["twitter", "discord", "slack", "instagram"], description: "Only this platform: twitter, discord, slack or instagram" },
        { name: "account", kind: "string", description: "Only this account" },
        { name: "limit", kind: "integer", min: 1, max: 1000, description: "How many per list, default 50, at most 1000" },
        { name: "oldest", kind: "boolean", description: "Oldest first instead of newest first" },
        JSON_FLAG,
      ],
    },
    { words: ["claims"], summary: "Every live claim: which session holds which chat, and until when", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["actions"], summary: "The log of every claim, refusal, send and release, oldest first, to see what was already done in a chat",
      positionals: [],
      flags: [
        { name: "platform", kind: "string", description: "Only this platform" },
        { name: "account", kind: "string", description: "Only this account" },
        { name: "chat", kind: "string", description: "Only this chat (its id or the person's handle)" },
        { name: "limit", kind: "integer", min: 1, max: 1000, description: "How many of the newest, default 50, at most 1000" },
        JSON_FLAG,
      ],
    },
  ],
};

const PLATFORMS = ["twitter", "discord", "slack", "instagram"];

function claimLine(c: ChatClaim): string {
  return `  ${c.platform} ${c.account} ${c.with ? `@${c.with} ` : ""}${c.conversationId}  held by pid ${c.by} since ${c.claimedAt} until ${c.expiresAt}${c.eventId ? `  event ${c.eventId}` : ""}`;
}

function wordLine(w: LastWord): string {
  const who = w.kind === "group" ? `${w.with} (group)` : w.with;
  const how = w.followUp ? `they reacted ${w.theyReacted ?? ""} to your last message`.trim() : w.youReactedOnly ? "waiting on you (you only reacted)" : "waiting on you";
  return `  ${w.platform} ${w.account} · ${who} · ${w.lastAt} · ${how}\n     ${w.followUp ? "them" : "they said"}: ${w.lastText.replace(/\s+/g, " ").slice(0, 160)}`;
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
  args: "claim|release|claims|actions|resume|waiting [--by <who>] [--platform <p>] [--account <a>] [--chat <id|handle>] [--event <id>] [--limit <n>] [--oldest]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INBOX_INPUT));
    if (!parsed.ok) return refuseInput("inbox", parsed.error, INBOX_USAGE);
    const [sub = "claims", ...rest] = parsed.positionals;
    if (rest.length) return { code: 1, error: "inputInvalid", stderr: `log inbox: unexpected argument "${rest[0]}"\n${INBOX_USAGE}` };
    const json = parsed.flags["json"] === true;
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : "");
    if (sub === "claims") {
      const claims = liveClaims();
      if (json) return { code: 0, stdout: JSON.stringify({ claims }, null, 2) };
      return { code: 0, stdout: claims.length ? [`log inbox claims: ${claims.length} live claim(s):`, ...claims.map(claimLine)].join("\n") : "log inbox claims: no chat is claimed by any session right now." };
    }
    if (sub === "actions") {
      const limit = numberOf(parsed, "limit") ?? 50;
      const rows = readActions({ platform: str("platform") || undefined, account: str("account") || undefined, chat: str("chat") || undefined, limit });
      if (json) return { code: 0, stdout: JSON.stringify({ actions: rows }, null, 2) };
      return { code: 0, stdout: rows.length ? [`log inbox actions: the ${rows.length} newest, oldest first:`, ...rows.map(actionLine)].join("\n") : "log inbox actions: nothing has been done in that chat yet." };
    }
    if (sub === "waiting") {
      const limit = numberOf(parsed, "limit") ?? 50;
      const platform = str("platform");
      if (platform && !PLATFORMS.includes(platform)) return { code: 1, error: "inputInvalid", stderr: `log inbox waiting: --platform is one of ${PLATFORMS.join(", ")}
${INBOX_USAGE}` };
      const oldest = parsed.flags["oldest"] === true;
      const order = (list: LastWord[]) => (oldest ? [...list].reverse() : list).slice(0, limit);
      const { waiting, followUps } = waitingOf(lastWordOf({ platform: platform || undefined, account: str("account") || undefined }));
      if (json) return { code: 0, stdout: JSON.stringify({ waiting: order(waiting), followUps: order(followUps), totals: { waiting: waiting.length, followUps: followUps.length } }, null, 2) };
      const counts = PLATFORMS.map((p) => [p, waiting.filter((w) => w.platform === p).length] as const).filter(([, n]) => n).map(([p, n]) => `${p} ${n}`).join(", ");
      return {
        code: 0,
        stdout: [
          `log inbox waiting: ${waiting.length} waiting on a reply${counts ? ` (${counts})` : ""}, ${oldest ? "oldest" : "newest"} first, from log.db in time order:`,
          ...order(waiting).map(wordLine),
          ...(followUps.length ? [`${followUps.length} reacted to your last message, each a follow-up to send, not a reply they wait on:`, ...order(followUps).map(wordLine)] : []),
        ].join("\n"),
      };
    }
    if (sub === "resume") {
      const platform = str("platform");
      const account = str("account");
      const by = str("by");
      if (!PLATFORMS.includes(platform) || !account || !by) return { code: 1, error: "inputInvalid", stderr: `log inbox resume: --platform (${PLATFORMS.join(", ")}), --account and --by are needed
${INBOX_USAGE}` };
      const gap = behindOf(platform, account);
      const resumed = resumeGap(platform, account, by);
      if (json) return { code: 0, stdout: JSON.stringify({ resumed, gap }, null, 2) };
      if (resumed) return { code: 0, stdout: `log inbox resume: ${platform} ${account} catches up again from ${resumed.fromAt} (refused before: ${gap?.detail ?? "refused"}); its owner retries through its own session within 30 s, and sends wait for it.` };
      return { code: 0, stdout: gap ? `log inbox resume: ${platform} ${account} isn't refused: its gap is ${gap.status} from ${gap.fromAt}, so its owner is already on it.` : `log inbox resume: ${platform} ${account} isn't behind.` };
    }
    if (sub !== "claim" && sub !== "release") return { code: 1, stderr: `log inbox: unknown subcommand "${sub}"\n${INBOX_USAGE}` };
    const platform = str("platform");
    if (!PLATFORMS.includes(platform)) return { code: 1, error: "inputInvalid", stderr: `log inbox ${sub}: --platform is one of ${PLATFORMS.join(", ")}\n${INBOX_USAGE}` };
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
