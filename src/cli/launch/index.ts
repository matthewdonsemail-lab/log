/**
 * `log launch` — guided entrypoint over the existing commands.
 *
 * Thin interactive wrapper only, ported from `rank launch`: it prompts (Clack)
 * for what to look at, then delegates to the same `listings` / `listing` /
 * `accounts` commands the CLI already exposes. Non-interactive use (`--json`,
 * piped output, missing TTY) never prompts and stays deterministic.
 */
import { cancel, intro, isCancel, outro, select } from "@clack/prompts";
import { LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import { checkRunnable, listFacebookAccounts, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { accountsCommand } from "../account/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand } from "../live/index.ts";
import { watchCommand } from "../watch/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { parseLaunchArgs, shouldPrompt } from "./helpers/index.ts";
import type { LaunchTTY } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LAUNCH_USAGE = "Usage: log launch [--json]";

const ACTIONS = ["browse", "status", "account", "accounts", "scan", "watch", "connect", "doctor"] as const;

type PromptSelectOptions = Parameters<typeof select>[0];

interface LaunchPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: PromptSelectOptions): Promise<unknown>;
}

/** Transport seam for tests. Production uses Clack + the real commands. */
export const launchDeps: {
  prompts: LaunchPrompts;
  tty: () => LaunchTTY;
  run: (command: Command, context: CommandContext, argv: string[]) => Promise<CommandResult> | CommandResult;
} = {
  prompts: { intro, outro, cancel, select: select as LaunchPrompts["select"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  run: (command, context, argv) => command.run(context, argv),
};

/** Delegate to a command and print its output the way the dispatcher would. */
async function delegate(command: Command, context: CommandContext, argv: string[]): Promise<{ code: number }> {
  const result = await launchDeps.run(command, context, argv);
  if (result.stdout) context.out(result.stdout);
  if (result.stderr) context.err(result.stderr);
  return { code: result.code };
}

/** Returns the picked value, or null when the user cancelled. */
async function pick(options: PromptSelectOptions): Promise<string | null> {
  const value = await launchDeps.prompts.select(options);
  if (isCancel(value) || typeof value !== "string") {
    launchDeps.prompts.cancel("Launch cancelled.");
    return null;
  }
  return value;
}

export async function runLaunch(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseLaunchArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `log launch: ${parsed.error}\n${LAUNCH_USAGE}` };

  // Deterministic machine form: the guided actions, never a prompt.
  if (parsed.json) {
    return {
      code: 0,
      stdout: JSON.stringify(
        {
          ok: true,
          interactive: false,
          actions: [...ACTIONS],
          hint: "Run `log launch` in an interactive terminal (no --json) for guided mode.",
        },
        null,
        2,
      ),
    };
  }

  if (!shouldPrompt(false, launchDeps.tty())) {
    return {
      code: 2,
      stderr:
        `log launch: guided mode needs an interactive terminal.\n` +
        `Use the scriptable commands instead: log listings, log listing <id>, log accounts.\n` +
        LAUNCH_USAGE,
    };
  }

  const prompts = launchDeps.prompts;
  try {
    prompts.intro("log launch — Facebook Marketplace");
    // Everything comes from Twenty (socialAccounts, agencyListings).
    const [accounts, listings] = await Promise.all([listFacebookAccounts(context.twenty), listListingsWhere(context.twenty)]);

    const action = await pick({
      message: "What do you want to look at?",
      options: [
        { value: "browse", label: "Browse listings", hint: "log listing <id>" },
        { value: "status", label: "Listings by status", hint: "log listings --status" },
        { value: "account", label: "Listings by account", hint: "log listings --account" },
        { value: "accounts", label: "Facebook accounts", hint: "log accounts" },
        { value: "scan", label: "Check listings live (opens Camoufox)", hint: "log scan --account" },
        { value: "watch", label: "Run the listing monitor and watch each step", hint: "log watch --account" },
        { value: "connect", label: "Connect a Facebook account (opens Camoufox)", hint: "log connect --account" },
        { value: "doctor", label: "Check the live setup", hint: "log doctor" },
      ],
    });
    if (action === null) return { code: 1 };

    let result: { code: number };
    if (action === "browse") {
      const listingId = await pick({
        message: "Which listing?",
        options: listings.map((row) => ({
          value: row.id,
          label: `${row.title} · ${row.price ?? "?"} ${row.priceCurrency ?? ""}`.trimEnd(),
          hint: `${row.status ? toTwentyEnum(row.status) : "unset"} · ${accounts.find((a) => a.id === row.socialAccountId)?.accountName ?? "no account"}`,
        })),
      });
      if (listingId === null) return { code: 1 };
      result = await delegate(listingCommand, context, [listingId]);
    } else if (action === "status") {
      const status = await pick({
        message: "Which status?",
        options: LISTING_STATUSES.filter((value) => listings.some((row) => row.status === value)).map((value) => ({
          value: toTwentyEnum(value),
          label: toTwentyEnum(value),
          hint: `${listings.filter((row) => row.status === value).length} listings`,
        })),
      });
      if (status === null) return { code: 1 };
      result = await delegate(listingsCommand, context, ["--status", status]);
    } else if (action === "account") {
      const accountId = await pick({
        message: "Which account?",
        options: accounts.map((account) => ({
          value: account.accountName,
          label: account.accountName,
          hint: account.status ? toTwentyEnum(account.status) : "unset",
        })),
      });
      if (accountId === null) return { code: 1 };
      result = await delegate(listingsCommand, context, ["--account", accountId]);
    } else if (action === "scan" || action === "watch" || action === "connect") {
      const purpose = action === "connect" ? "connect" : "run";
      if (!accounts.some((account) => checkRunnable(account, purpose).ok)) {
        return { code: 1, stderr: "log launch: no FACEBOOK account may run: each needs a usable status, a proxy and a home country in Twenty. See `log accounts`." };
      }
      const accountId = await pick({
        message: action === "connect" ? "Which account to connect?" : "Which account's listings?",
        // Only accounts that pass the account check (FACEBOOK, usable, proxy, home country) are offered.
        options: accounts
          .filter((account) => checkRunnable(account, purpose).ok)
          .map((account) => ({ value: account.accountName, label: account.accountName, hint: `${account.homeCity ?? "?"}, ${account.homeCountry}` })),
      });
      if (accountId === null) return { code: 1 };
      const command = action === "scan" ? scanCommand : action === "watch" ? watchCommand : connectCommand;
      result = await delegate(command, context, ["--account", accountId]);
    } else if (action === "doctor") {
      result = await delegate(doctorCommand, context, []);
    } else {
      result = await delegate(accountsCommand, context, []);
    }

    if (result.code === 0) prompts.outro("Done.");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 2, stderr: `log launch failed: ${message}` };
  }
}

export const launchCommand: Command = {
  name: "launch",
  summary: "Guided Clack menu over the listings, accounts and live commands",
  args: "[--json]",
  run: runLaunch,
};
