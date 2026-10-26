import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { shouldPrompt } from "../../launch/helpers/index.ts";
import type { LaunchTTY } from "../../launch/helpers/index.ts";
import { parseArgs, parserSpecOf } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { openTwitterAccount } from "./account.ts";

export const CHAT_USAGE = [
  "Usage: log twitter chat pin --account <accountName> [--show]",
  "Saves the account's X Chat PIN (the 4-digit code X asks for to open encrypted DMs) to Twenty, asked twice in a masked Clack prompt and never printed or passed as a flag. It is checked first: the direct-API engine (twikit, no browser, no proxy, rule 80) unlocks the account's keys with it through Juicebox (a wrong PIN uses one of X's limited guesses), and only a PIN that opens them is saved. `log twitter dms` uses it to recover the account's X Chat keys through Juicebox (vendor/chatXdk) and read the encrypted messages. --show says only whether one is set.",
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
  args: "pin --account <name> [--show]",
  async run(context, argv) {
    if (argv[0] !== "pin") return { code: 1, stderr: `log twitter chat: pin is the only subcommand\n${CHAT_USAGE}` };
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
