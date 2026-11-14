import type { CapabilityDefinition, CapabilityInput } from "../types.ts";

const ACCOUNT: CapabilityInput = { name: "account", kind: "string", required: true, description: "The account, by its accountName. Its platform is the one it is kept under, unless platform is given" };
const SPACE: CapabilityInput = { name: "space", kind: "string", description: "Where the chats live, on a platform with more than one place per account (a workspace's domain); refused with inputUnsupported on a platform whose command takes none" };
const LIMIT: CapabilityInput = { name: "limit", kind: "integer", min: 1, description: "At most this many; refused with inputUnsupported on a platform whose command has no limit" };
const CHAT: CapabilityInput = { name: "chat", kind: "string", required: true, description: "The chat: as the owner says it (a name or handle) or its id, from chatsList" };

const WATCH_CHAT: CapabilityInput = { name: "chat", kind: "string", description: "Only this chat: as the owner says it or its id; refused with inputUnsupported on a platform whose watch takes none" };
const SECONDS: CapabilityInput = { name: "seconds", kind: "integer", min: 5, max: 3600, fallback: 60, description: "Listen for this many seconds, then stop (default 60)" };

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
];
