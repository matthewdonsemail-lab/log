import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { shouldPrompt } from "../../launch/helpers/index.ts";
import type { LaunchTTY } from "../../launch/helpers/index.ts";
import { addPending } from "../../../inbox/watch/index.ts";
import { recordTwitterSession } from "../../../twitter/account/session/index.ts";
import type { XChatLiveEvent } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult } from "../../runner/types.ts";
import { openTwitterAccount } from "./account.ts";

export const CHAT_USAGE = [
  "Usage: log twitter chat pin --account <accountName> [--show]",
  "       log twitter chat watch --account <accountName> [--seconds <n>] [--inbox] [--json]",
  "Saves the account's X Chat PIN (the 4-digit code X asks for to open encrypted DMs) to Twenty, asked twice in a masked Clack prompt and never printed or passed as a flag. It is checked first: the direct-API engine (no browser, no proxy, rule 80) unlocks the account's keys with it through Juicebox (a wrong PIN uses one of X's limited guesses), and only a PIN that opens them is saved. `log twitter dms` uses it to recover the account's X Chat keys through Juicebox (vendor/chatXdk) and read the encrypted messages. --show says only whether one is set.",
  "watch keeps one socket open to X Chat, the way X's own chat app does (read with rea from X's shipped code, issue #68): a token from GenerateXChatTokenMutation, wss://chat-ws.x.com/ws, a KeepAlive every 30 s, a fresh token and a new socket when it drops. X pushes each message the moment it lands, so nothing is polled and no inbox read can hit X's 429. Each message is decrypted with the saved PIN and printed as it arrives (who, when, what they said). --inbox also hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next. --seconds stops it after that long; without it, it watches until stopped.",
].join("\n");

interface ChatPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

export const chatDeps: { prompts: ChatPrompts; tty: () => LaunchTTY } = {
  prompts: { intro, outro, cancel, password: password as ChatPrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

export const CHAT_INPUT: CommandInput = {
  forms: [
    {
      words: ["pin"],
      summary: "Save the account's X Chat PIN to Twenty from a masked prompt, checked against X first",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "show", kind: "boolean", description: "Only say whether a PIN is set" },
      ],
    },
    {
      words: ["watch"],
      summary: "Watch the account's X Chat live over X's own socket: each message the moment X pushes it, nothing polled",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "seconds", kind: "string", description: "Stop after this many seconds (default: watch until stopped)" },
        { name: "inbox", kind: "boolean", description: "Hand each new message from someone else to the inbox hook" },
        JSON_FLAG,
      ],
    },
  ],
};

export function isChatPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{4,6}$/.test(value);
}

export const chatCommand: Command = {
  usage: CHAT_USAGE,
  platform: "twitter",
  name: "chat",
  effect: "write",
  summary: "X Chat's PIN for the account's encrypted DMs: asked in a Clack prompt, kept in Twenty, never printed",
  input: CHAT_INPUT,
  args: "pin --account <name> [--show] | watch --account <name> [--seconds <n>] [--inbox] [--json]",
  async run(context, argv) {
    if (argv[0] === "watch") return watchChat(context, argv.slice(1));
    if (argv[0] !== "pin") return { code: 1, stderr: `log twitter chat: pin or watch\n${CHAT_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...CHAT_INPUT.forms[0], words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log twitter chat: ${parsed.error}\n${CHAT_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log twitter chat pin: --account is needed\n${CHAT_USAGE}` };
    const opened = await openTwitterAccount(context, "twitter chat pin", ref);
    if (!opened.ok) return opened.result;
    const account = opened.account;
    if (parsed.flags["show"]) {
      const secrets = await context.twenty.loginSecrets(account.id);
      return { code: 0, stdout: `${account.accountName}: X Chat PIN ${secrets?.messengerPin ? "<set>" : "<empty>"}` };
    }
    if (!shouldPrompt(false, chatDeps.tty())) {
      return { code: 1, stderr: "log twitter chat pin: the PIN is typed in a Clack prompt, so it needs an interactive terminal: run it there (it is never passed as a flag)" };
    }
    const prompts = chatDeps.prompts;
    prompts.intro(`log twitter chat pin — ${account.accountName}`);
    const ask = async (message: string) => {
      const value = await prompts.password({ message, mask: "•", validate: (v) => (isChatPin(v) ? undefined : "4 to 6 digits") });
      return isCancel(value) || !isChatPin(value) ? null : value;
    };
    const first = await ask("X Chat PIN for this account's encrypted DMs");
    const again = first ? await ask("The same PIN again") : null;
    if (!first || !again) {
      prompts.cancel("Nothing saved.");
      return { code: 1, stderr: "log twitter chat pin: cancelled, nothing saved" };
    }
    if (first !== again) {
      prompts.cancel("The two PINs differ. Nothing saved.");
      return { code: 1, stderr: "log twitter chat pin: the two PINs differ, nothing saved" };
    }
    context.err(`${account.accountName}: checking the PIN against X Chat's key store (Juicebox) before saving`);
    const check = await opened.engine({ action: "xchatUnlock", chatPin: first });
    if (!check.answer.ok) {
      prompts.cancel("X Chat didn't unlock with that PIN. Nothing saved.");
      return { code: 1, stderr: `log twitter chat pin: ${check.answer.code}: ${check.answer.detail ?? ""}` };
    }
    await context.twenty.update("socialAccounts", account.id, { messengerPin: first } as never);
    prompts.outro("Saved to Twenty. `log twitter dms` opens X Chat with it, never printed.");
    return { code: 0, stdout: `${account.accountName}: X Chat PIN <set> in Twenty` };
  },
};

export function liveLine(event: XChatLiveEvent): string {
  if (event.type === "socket") return `X Chat socket ${event.state}${event.error ? `: ${event.error}` : ""}`;
  const who = event.fromMe ? "you" : `@${event.from || event.senderId}`;
  return `${event.fromMe ? "" : ">>> NEW "}${event.time ?? "?"} ${who}: ${(event.text ?? "").replace(/\s+/g, " ")}`;
}

export function inboxMessageOf(account: string, event: XChatLiveEvent, now: Date) {
  return { platform: "twitter", account, conversationId: event.conversationId ?? "", with: event.from || event.senderId || "?", text: event.text ?? "", at: event.time ?? now.toISOString(), box: "xchat", seenAt: now.toISOString() };
}

async function watchChat(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseArgs(argv, parserSpecOf({ forms: [{ ...CHAT_INPUT.forms[1], words: [] }] }));
  if (!parsed.ok) return { code: 1, stderr: `log twitter chat watch: ${parsed.error}\n${CHAT_USAGE}` };
  const ref = parsed.flags["account"];
  if (typeof ref !== "string") return { code: 1, stderr: `log twitter chat watch: --account is needed\n${CHAT_USAGE}` };
  const rawSeconds = parsed.flags["seconds"];
  const seconds = typeof rawSeconds === "string" ? Number(rawSeconds) : undefined;
  if (seconds !== undefined && (!Number.isFinite(seconds) || seconds < 5)) return refuse("twitter chat watch", "secondsInvalid", "--seconds is a number of seconds, at least 5");
  const opened = await openTwitterAccount(context, "twitter chat watch", ref);
  if (!opened.ok) return opened.result;
  const live = context.directTwitterLive;
  if (!live) return { code: 1, stderr: "log twitter chat watch: the live direct-API engine isn't wired in this context" };
  const account = opened.account;
  const secrets = await context.twenty.loginSecrets(account.id).catch(() => null);
  const chatPin = secrets?.messengerPin ?? undefined;
  const toInbox = parsed.flags["inbox"] === true;
  const json = parsed.flags["json"] === true;
  const events: XChatLiveEvent[] = [];
  context.err(`${account.accountName}: watching X Chat over X's own socket (wss://chat-ws.x.com)${chatPin ? ", opened with the saved PIN" : ", no PIN saved so messages stay encrypted"}${toInbox ? ", new messages go to the inbox hook" : ""}`);
  const run = await live(account, { action: "xchatWatch", ...(seconds ? { seconds } : {}), ...(chatPin ? { chatPin } : {}) }, (event) => {
    events.push(event);
    context.err(liveLine(event));
    if (toInbox && event.type !== "socket" && !event.fromMe) addPending([inboxMessageOf(account.accountName, event, context.now?.() ?? new Date())]);
  });
  for (const line of await recordTwitterSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
  const messages = events.filter((e) => e.type !== "socket");
  if (json) return { code: run.answer.ok ? 0 : 1, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, ...run.answer, events: messages }, null, 2) };
  if (!run.answer.ok) return { code: 1, stdout: `log twitter chat watch: ${account.accountName}: ${run.answer.code}: ${run.answer.detail ?? ""}` };
  return { code: 0, stdout: `log twitter chat watch: @${account.accountName}, ${messages.length} message${messages.length === 1 ? "" : "s"} pushed by X while watching, nothing polled` };
}
