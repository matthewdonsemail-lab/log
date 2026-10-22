/**
 * `log facebook messenger pin --account <a>`: Messenger's PIN for the account's
 * encrypted chats. Messenger stops at "Create a PIN to access your chats on any
 * device" until one is set (Bethlehem, warm-up 20261022T092119 steps 25-27), so
 * the inbox and its conversations can't be reached without it. matt types it in
 * a Clack prompt (masked, twice); it is kept in Twenty's `socialAccounts.messengerPin`
 * with the account's other secrets and is never printed. `log inspect do pin --live`
 * types it into the page from the run's private login.json (rule 21).
 */
import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { shouldPrompt } from "../launch/helpers/index.ts";
import type { LaunchTTY } from "../launch/helpers/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const MESSENGER_USAGE = [
  "Usage: log facebook messenger pin --account <accountName> [--show]   (a Clack prompt asks for the 6-digit PIN twice, masked, and keeps it in Twenty; --show says only whether one is set)",
].join("\n");

interface MessengerPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

/** Transport seam for tests. Production uses Clack and the real terminal. */
export const messengerDeps: { prompts: MessengerPrompts; tty: () => LaunchTTY } = {
  prompts: { intro, outro, cancel, password: password as MessengerPrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

/** A Messenger PIN: six digits. Pure. */
export function isMessengerPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

export const messengerCommand: Command = {
  usage: MESSENGER_USAGE,
  platform: "facebook",
  name: "messenger",
  summary: "Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed",
  args: "pin --account <name> [--show]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["show"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook messenger: ${parsed.error}\n${MESSENGER_USAGE}` };
    const [sub, ...rest] = parsed.positionals;
    if (sub !== "pin" || rest.length > 0) return { code: 1, stderr: `log facebook messenger: pin is the only subcommand\n${MESSENGER_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log facebook messenger pin: --account is needed\n${MESSENGER_USAGE}` };
    let account;
    try {
      account = await findAccount(context.twenty, ref);
    } catch (error) {
      return { code: 1, stderr: `log facebook messenger pin: ${(error as Error).message}` };
    }
    if (parsed.flags["show"]) {
      const secrets = await context.twenty.loginSecrets(account.id);
      return { code: 0, stdout: `${account.accountName}: Messenger PIN ${secrets?.messengerPin ? "<set>" : "<empty>"}` };
    }
    if (!shouldPrompt(false, messengerDeps.tty())) {
      return { code: 1, stderr: `log facebook messenger pin: the PIN is typed in a Clack prompt, so it needs an interactive terminal: run it there (it is never passed as a flag)` };
    }
    const prompts = messengerDeps.prompts;
    prompts.intro(`log facebook messenger pin — ${account.accountName}`);
    const ask = async (message: string) => {
      const value = await prompts.password({ message, mask: "•", validate: (v) => (isMessengerPin(v) ? undefined : "Six digits") });
      return isCancel(value) || !isMessengerPin(value) ? null : value;
    };
    const first = await ask("Messenger PIN for this account's chats (6 digits)");
    const again = first ? await ask("The same PIN again") : null;
    if (!first || !again) {
      prompts.cancel("Nothing saved.");
      return { code: 1, stderr: "log facebook messenger pin: cancelled, nothing saved" };
    }
    if (first !== again) {
      prompts.cancel("The two PINs differ. Nothing saved.");
      return { code: 1, stderr: "log facebook messenger pin: the two PINs differ, nothing saved" };
    }
    await context.twenty.update("socialAccounts", account.id, { messengerPin: first } as never);
    prompts.outro("Saved to Twenty. It is typed into Messenger by `log inspect do pin --live`, never printed.");
    return { code: 0, stdout: `${account.accountName}: Messenger PIN <set> in Twenty` };
  },
};
