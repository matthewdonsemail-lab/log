/**
 * `log launch` — guided entrypoint over the existing commands.
 *
 * Thin interactive wrapper only, ported from `rank launch`: it prompts (Clack)
 * for what to look at, then delegates to the same `listings` / `listing` /
 * `accounts` commands the CLI already exposes. Non-interactive use (`--json`,
 * piped output, missing TTY) never prompts and stays deterministic.
 */
import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts";
import { LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import { checkRunnable, listFacebookAccounts, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { accountsCommand } from "../account/index.ts";
import { listGroups } from "../../group/join/index.ts";
import type { Group } from "../../group/join/index.ts";
import { joinCommand } from "../join/index.ts";
import { warmupCommand as warmupCmd } from "../warmup/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand } from "../live/index.ts";
import { watchCommand } from "../watch/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { parseLaunchArgs, shouldPrompt } from "./helpers/index.ts";
import type { LaunchTTY } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LAUNCH_USAGE = "Usage: log launch [--json]";

const ACTIONS = ["browse", "status", "account", "accounts", "scan", "watch", "connect", "join", "answer", "fill", "reels", "doctor"] as const;

type PromptSelectOptions = Parameters<typeof select>[0];

interface LaunchPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: PromptSelectOptions): Promise<unknown>;
  text(option: Parameters<typeof text>[0]): Promise<unknown>;
}

/** Transport seam for tests. Production uses Clack + the real commands. */
export const launchDeps: {
  prompts: LaunchPrompts;
  tty: () => LaunchTTY;
  run: (command: Command, context: CommandContext, argv: string[]) => Promise<CommandResult> | CommandResult;
} = {
  prompts: { intro, outro, cancel, select: select as LaunchPrompts["select"], text: text as LaunchPrompts["text"] },
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
        { value: "join", label: "Join a Facebook group (in the account's open browser; dry run)", hint: "log join group --account --group" },
        { value: "answer", label: "Answer a group's questions, step by step (saved to Twenty, not sent)", hint: "log join group --answer" },
        { value: "fill", label: "Fill a group's dialog from its answers (in the open browser; dry run)", hint: "log join group --fill" },
        { value: "reels", label: "Warm up: Facebook Reels, as a person watches them", hint: "log warmup facebook reel" },
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
    } else if (action === "join") {
      // Only accounts that pass the account check; the join itself needs the account's browser open (rule 35).
      const runnable = accounts.filter((account) => checkRunnable(account, "run").ok);
      if (!runnable.length) return { code: 1, stderr: "log launch: no FACEBOOK account may run: each needs a usable status, a proxy and a home country in Twenty. See `log accounts`." };
      const accountId = await pick({
        message: "Which account joins?",
        options: runnable.map((account) => ({ value: account.accountName, label: account.accountName, hint: `${account.homeCity ?? "?"}, ${account.homeCountry}` })),
      });
      if (accountId === null) return { code: 1 };
      const group = await prompts.text({ message: "Which group? (its URL or id)", placeholder: "https://www.facebook.com/groups/…" });
      if (isCancel(group) || typeof group !== "string" || !group.trim()) {
        prompts.cancel("Launch cancelled.");
        return { code: 1 };
      }
      // A dry run: it reads the group's gate. Pressing Join stays with matt on the command line (--live, rule 8).
      result = await delegate(joinCommand, context, ["group", "--account", accountId, "--group", group.trim()]);
    } else if (action === "answer") {
      // The groups whose join options ask something (questions or the rules), from Twenty; the stepper is join's own.
      const withQuestions: { account: string; group: Group }[] = [];
      for (const account of accounts) {
        for (const group of await listGroups(context.twenty, account.id)) {
          const options = group.joinSubmission.options;
          if (options && (options.questions.length || options.rulesAgreementRequired)) withQuestions.push({ account: account.accountName, group });
        }
      }
      if (!withQuestions.length) return { code: 1, stderr: "log launch: no group has questions saved yet: they come from a --live join (log join group --account <a> --group <g> --live)" };
      const picked = await pick({
        message: "Which group's questions?",
        options: withQuestions.map(({ account, group }, i) => ({
          value: String(i),
          label: `${group.name ?? group.facebookGroupId}`,
          hint: `${account} · ${group.joinSubmission.options!.path} · ${group.joinSubmission.options!.questions.length} question(s)${group.joinSubmission.draft ? " · draft saved" : ""}`,
        })),
      });
      if (picked === null) return { code: 1 };
      const { account, group } = withQuestions[Number(picked)];
      result = await delegate(joinCommand, context, ["group", "--account", account, "--group", group.facebookGroupId ?? "", "--answer"]);
    } else if (action === "fill") {
      // The groups whose application is ready (every answer given, the rules agreed), from Twenty.
      const ready: { account: string; group: Group }[] = [];
      for (const account of accounts) {
        for (const group of await listGroups(context.twenty, account.id)) {
          if (group.joinSubmission.application?.status === "ready" || group.joinSubmission.application?.status === "filled") ready.push({ account: account.accountName, group });
        }
      }
      if (!ready.length) return { code: 1, stderr: "log launch: no group's answers are ready: answer one first (Answer a group's questions)" };
      const picked = await pick({
        message: "Which group's dialog?",
        options: ready.map(({ account, group }, i) => ({ value: String(i), label: `${group.name ?? group.facebookGroupId}`, hint: `${account} · ${group.joinSubmission.application!.status}` })),
      });
      if (picked === null) return { code: 1 };
      const { account, group } = ready[Number(picked)];
      // A dry run: it finds the way into the dialog. Typing, ticking and Submit stay with matt on the command line (--live, --submit, rule 8).
      result = await delegate(joinCommand, context, ["group", "--account", account, "--group", group.facebookGroupId ?? "", "--fill"]);
    } else if (action === "reels") {
      // The session's shape, step by step; likes act on Facebook, so they default to no (rule 8).
      const reels = await pick({
        message: "How many reels in a session?",
        options: [
          { value: "4-8", label: "A few (4-8)" },
          { value: "8-20", label: "Some (8-20)", hint: "default" },
          { value: "20-40", label: "Many (20-40)" },
        ],
      });
      if (reels === null) return { code: 1 };
      const watch = await pick({
        message: "How long is each one watched?",
        options: [
          { value: "3-10", label: "Skims (3-10 s)" },
          { value: "4-25", label: "Watches (4-25 s)", hint: "default" },
          { value: "10-45", label: "Stays (10-45 s)" },
        ],
      });
      if (watch === null) return { code: 1 };
      const skip = await pick({
        message: "How many are skipped after a glance? (people swipe past most)",
        options: [
          { value: "0.4", label: "Some (4 in 10)" },
          { value: "0.6", label: "Most (6 in 10)", hint: "default" },
          { value: "0.8", label: "Nearly all (8 in 10)" },
        ],
      });
      if (skip === null) return { code: 1 };
      const comments = await pick({ message: "On the ones watched: open and scroll the comments?", options: [{ value: "0", label: "Never" }, { value: "0.3", label: "Sometimes", hint: "3 in 10 reels" }, { value: "0.6", label: "Often" }] });
      if (comments === null) return { code: 1 };
      const profile = await pick({ message: "Visit the creator's profile and come back?", options: [{ value: "0", label: "Never" }, { value: "0.15", label: "Sometimes", hint: "about 1 in 7" }, { value: "0.3", label: "Often" }] });
      if (profile === null) return { code: 1 };
      const likes = await pick({ message: "Like some of them? (acts on Facebook, rule 8)", options: [{ value: "no", label: "No", hint: "default" }, { value: "yes", label: "Yes, sometimes" }] });
      if (likes === null) return { code: 1 };
      const argv = ["facebook", "reel", "plan", "--reels", reels, "--watch", watch, "--skip", skip, "--comments", comments, "--profile", profile, ...(likes === "yes" ? ["--likes"] : [])];
      result = await delegate(warmupCmd, context, argv);
      // Recording comes next (rule 29), in an account's open browser, read-only.
      const runnable = accounts.filter((account) => checkRunnable(account, "run").ok);
      const then = await pick({
        message: "Record it now (the account's browser primed with the reel activity, each step checked)?",
        options: [{ value: "no", label: "Not now" }, ...runnable.map((account) => ({ value: account.accountName, label: `Record on ${account.accountName}`, hint: `${account.homeCity ?? "?"}, ${account.homeCountry}` }))],
      });
      if (then && then !== "no") result = await delegate(warmupCmd, context, ["facebook", "reel", "record", "--account", then]);
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
