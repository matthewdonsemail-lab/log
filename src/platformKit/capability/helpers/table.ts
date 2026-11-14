import type { CapabilityDefinition, CapabilityInput } from "../types.ts";

const ACCOUNT: CapabilityInput = { name: "account", kind: "string", required: true, description: "The account, by its accountName. Its platform is the one it is kept under, unless platform is given" };
const SPACE: CapabilityInput = { name: "space", kind: "string", description: "Where the chats live, on a platform with more than one place per account (a workspace's domain); refused with inputUnsupported on a platform whose command takes none" };
const LIMIT: CapabilityInput = { name: "limit", kind: "integer", min: 1, description: "At most this many; refused with inputUnsupported on a platform whose command has no limit" };
const CHAT: CapabilityInput = { name: "chat", kind: "string", required: true, description: "The chat: as the owner says it (a name or handle) or its id, from chatsList" };

const WATCH_CHAT: CapabilityInput = { name: "chat", kind: "string", description: "Only this chat: as the owner says it or its id; refused with inputUnsupported on a platform whose watch takes none" };
const SECONDS: CapabilityInput = { name: "seconds", kind: "integer", min: 5, max: 3600, fallback: 60, description: "Listen for this many seconds, then stop (default 60)" };
const SEND_TO: CapabilityInput = { name: "chat", kind: "string", required: true, description: "Who it goes to: the chat or channel id from chatsList, a Slack chat as the owner says it, an Instagram handle, or on X the person's numeric user id" };
const TEXT: CapabilityInput = { name: "text", kind: "string", required: true, description: "What is sent, in the owner's approved words" };
const AS_ONE: CapabilityInput = { name: "asOne", kind: "boolean", description: "Send a draft of several lines as one message, only when the owner asked (rule 90); refused with inputUnsupported on a platform whose send has no asOne" };
const BRIEF: CapabilityInput = { name: "brief", kind: "boolean", description: "The message hands someone a task: gated as a brief (clear, why, done when, kind, how to ask), not as casual chat (rule 162); refused with inputUnsupported on a platform whose send has no brief" };
const OVER_GATE: CapabilityInput = { name: "overGate", kind: "boolean", description: "The owner said to send this exact message over the voice gate's refusal: its SubQ read is skipped, the AI artifact check still runs; only when the owner said so for this message (rule 152); refused with inputUnsupported on a platform whose send has no overGate" };
const MESSAGE: CapabilityInput ={ name: "message", kind: "string", required: true, description: "The message reacted to, by its id from messagesRead" };
const EMOJI: CapabilityInput = { name: "emoji", kind: "string", required: true, description: "The emoji" };
const APPROVED_BY: CapabilityInput = { name: "approvedBy", kind: "string", approval: true, description: "Who approved it: needed on a live run (rule 8)" };

const X_CONVERSATION_ID = /^\d+[-:]\d+$/;

export const CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    noun: "chats",
    verb: "list",
    summary: "List an account's chats on its own platform, the platform taken from the account",
    effect: "read",
    inputs: [ACCOUNT, SPACE, LIMIT],
    platforms: {
      twitter: { command: "twitterDms", words: [], inputs: { account: { flag: "account" }, limit: { flag: "limit" } } },
      discord: { command: "discordChats", words: [], inputs: { account: { flag: "account" } } },
      slack: { command: "slackChats", words: [], inputs: { account: { flag: "account" }, space: { flag: "workspace" }, limit: { flag: "limit" } } },
      instagram: { command: "instagramDms", words: [], inputs: { account: { flag: "account" }, limit: { flag: "limit" } } },
      facebook: { command: "facebookConversations", words: [], inputs: { account: { flag: "account" } } },
    },
  },
  {
    noun: "messages",
    verb: "read",
    summary: "Read one chat's messages on the account's own platform, the platform taken from the account",
    effect: "read",
    inputs: [ACCOUNT, CHAT, SPACE, LIMIT],
    platforms: {
      twitter: { command: "twitterDms", words: [], inputs: { account: { flag: "account" }, chat: { choose: (value) => ({ flag: X_CONVERSATION_ID.test(value) ? "conversation" : "with" }), flags: ["conversation", "with"] }, limit: { flag: "limit" } } },
      discord: { command: "discordRead", words: [], inputs: { account: { flag: "account" }, chat: { flag: "channel" }, limit: { flag: "limit" } } },
      slack: { command: "slackRead", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, space: { flag: "workspace" }, limit: { flag: "limit" } } },
      instagram: { command: "instagramDms", words: [], inputs: { account: { flag: "account" }, chat: { flag: "with" }, limit: { flag: "limit" } } },
      facebook: { command: "facebookConversation", words: ["show"], inputs: { chat: { positional: true } } },
    },
  },
  {
    noun: "messages",
    verb: "watch",
    summary: "Listen to an account's messages for a set time as its platform pushes them, through the account's one watcher, the platform taken from the account",
    effect: "read",
    inputs: [ACCOUNT, WATCH_CHAT, SPACE, SECONDS],
    platforms: {
      twitter: { command: "twitterChat", words: ["watch"], inputs: { account: { flag: "account" }, seconds: { flag: "seconds" } } },
      discord: { command: "discordWatch", words: [], inputs: { account: { flag: "account" }, chat: { flag: "channel" }, seconds: { flag: "seconds" } } },
      slack: { command: "slackWatch", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, space: { flag: "workspace" }, seconds: { flag: "seconds" } } },
      instagram: { command: "instagramWatch", words: [], inputs: { account: { flag: "account" }, seconds: { flag: "seconds" } } },
    },
  },
  {
    noun: "messages",
    verb: "send",
    summary: "Send a message as the account on its own platform, the platform taken from the account; a dry run unless live",
    effect: "write",
    live: true,
    inputs: [ACCOUNT, SEND_TO, TEXT, SPACE, AS_ONE, BRIEF, OVER_GATE, APPROVED_BY],
    platforms: {
      twitter: { command: "twitterDm", words: [], inputs: { account: { flag: "account" }, chat: { flag: "userId" }, text: { flag: "text" }, asOne: { flag: "asOne" }, overGate: { flag: "overGate" },approvedBy: { flag: "approvedBy" } } },
      discord: { command: "discordSend", words: [], inputs: { account: { flag: "account" }, chat: { flag: "channel" }, text: { flag: "text" }, asOne: { flag: "asOne" }, brief: { flag: "brief" }, overGate: { flag: "overGate" },approvedBy: { flag: "approvedBy" } } },
      slack: { command: "slackSend", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, text: { flag: "text" }, space: { flag: "workspace" }, asOne: { flag: "asOne" }, approvedBy: { flag: "approvedBy" } } },
      instagram: { command: "instagramSend", words: [], inputs: { account: { flag: "account" }, chat: { flag: "with" }, text: { flag: "text" }, asOne: { flag: "asOne" }, approvedBy: { flag: "approvedBy" } } },
    },
  },
  {
    noun: "messages",
    verb: "react",
    summary: "React to one message as the account on its own platform, the platform taken from the account; a dry run unless live",
    effect: "write",
    live: true,
    inputs: [ACCOUNT, CHAT, MESSAGE, EMOJI, SPACE, APPROVED_BY],
    platforms: {
      twitter: { command: "twitterReact", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, message: { flag: "message" }, emoji: { flag: "emoji" }, approvedBy: { flag: "approvedBy" } } },
      discord: { command: "discordReact", words: [], inputs: { account: { flag: "account" }, chat: { flag: "channel" }, message: { flag: "message" }, emoji: { flag: "emoji" }, approvedBy: { flag: "approvedBy" } } },
      slack: { command: "slackReact", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, message: { flag: "message" }, emoji: { flag: "emoji" }, space: { flag: "workspace" }, approvedBy: { flag: "approvedBy" } } },
      instagram: { command: "instagramReact", words: [], inputs: { account: { flag: "account" }, chat: { flag: "thread" }, message: { flag: "message" }, emoji: { flag: "emoji" }, approvedBy: { flag: "approvedBy" } } },
    },
  },
  {
    noun: "voiceNotes",
    verb: "send",
    summary: "Send a voice note in the owner's cloned voice as the account on its own platform, the platform taken from the account; a dry run unless live",
    effect: "write",
    live: true,
    inputs: [ACCOUNT, SEND_TO, TEXT, SPACE, APPROVED_BY],
    platforms: {
      twitter: { command: "twitterVoice", words: [], inputs: { account: { flag: "account" }, chat: { flag: "with" }, text: { flag: "text" }, approvedBy: { flag: "approvedBy" } } },
      discord: { command: "discordVoice", words: [], inputs: { account: { flag: "account" }, chat: { flag: "channel" }, text: { flag: "text" }, approvedBy: { flag: "approvedBy" } } },
      slack: { command: "slackVoice", words: [], inputs: { account: { flag: "account" }, chat: { flag: "chat" }, text: { flag: "text" }, space: { flag: "workspace" }, approvedBy: { flag: "approvedBy" } } },
      instagram: { command: "instagramVoice", words: [], inputs: { account: { flag: "account" }, chat: { flag: "with" }, text: { flag: "text" }, approvedBy: { flag: "approvedBy" } } },
    },
  },
];
