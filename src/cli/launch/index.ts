import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts";
import { LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import { checkRunnable, listFacebookAccounts, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { accountsCommand } from "../account/index.ts";
import { listGroups } from "../../facebook/group/join/index.ts";
import type { Group } from "../../facebook/group/join/index.ts";
import { joinCommand } from "../join/index.ts";
import { warmupCommand as warmupCmd } from "../warmup/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand } from "../live/index.ts";
import { watchCommand } from "../watch/index.ts";
import { COMMAND_INDEX } from "../runner/helpers/commandIndex.ts";
import { PLATFORM_LABELS } from "../runner/helpers/platforms.ts";
import type { Platform } from "../runner/helpers/platforms.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";
import { agentSetupText, browserSignInSteps, parseLaunchArgs, platformOfTwenty, platformOption, shouldPrompt, signInRouteOf, START_ACTIONS, START_PLATFORMS, twentyReady } from "./helpers/index.ts";
import type { LaunchTTY } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LAUNCH_USAGE = "Usage: log launch [--json]";

const MARKETPLACE_ACTIONS = ["browse", "status", "account", "accounts", "scan", "watch", "connect", "join", "answer", "fill", "reels", "doctor"] as const;

type PromptSelectOptions = Parameters<typeof select>[0];

interface LaunchPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: PromptSelectOptions): Promise<unknown>;
  text(option: Parameters<typeof text>[0]): Promise<unknown>;
}

export const launchDeps: {
  prompts: LaunchPrompts;
  tty: () => LaunchTTY;
  run: (command: Command, context: CommandContext, argv: string[]) => Promise<CommandResult> | CommandResult;
  twentyReady: () => boolean;
} = {
  prompts: { intro, outro, cancel, select: select as LaunchPrompts["select"], text: text as LaunchPrompts["text"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  run: (command, context, argv) => command.run(context, argv),
  twentyReady: () => twentyReady(),
};

async function commandFor(name: string, platform: string): Promise<Command> {
  const entry = COMMAND_INDEX.find((e) => e.name === name && e.platform === platform);
  if (!entry) throw new Error(`no ${platform} ${name} command`);
  const loaded = (await import(`../../../${entry.module}`)) as Record<string, unknown>;
  return loaded[entry.exportName] as Command;
}

async function delegate(command: Command, context: CommandContext, argv: string[]): Promise<{ code: number }> {
  const result = await launchDeps.run(command, context, argv);
  if (result.stdout) context.out(result.stdout);
  if (result.stderr) context.err(result.stderr);
  return { code: result.code };
}

async function pick(options: PromptSelectOptions): Promise<string | null> {
  const value = await launchDeps.prompts.select(options);
  if (isCancel(value) || typeof value !== "string") {
    launchDeps.prompts.cancel("Launch cancelled.");
    return null;
  }
  return value;
}

async function ask(message: string, placeholder?: string, optional = false): Promise<string | null> {
  const value = await launchDeps.prompts.text({ message, ...(placeholder ? { placeholder } : {}) });
  if (isCancel(value) || typeof value !== "string" || (!optional && !value.trim())) {
    launchDeps.prompts.cancel("Launch cancelled.");
    return null;
  }
  return value.trim();
}

interface PickedAccount {
  platform: Platform;
  accountName: string;
  hasProfile: boolean;
}

async function pickAccount(context: CommandContext, message: string, keep: (account: PickedAccount) => boolean): Promise<PickedAccount | null | string> {
  const rows = (await context.twenty.list("socialAccounts")) as unknown as Record<string, unknown>[];
  const accounts = rows
    .flatMap((row): PickedAccount[] => {
      const platform = platformOfTwenty(row.platform);
      const accountName = String(row.accountName || row.name || "");
      return platform && accountName ? [{ platform, accountName, hasProfile: Boolean(row.adsPowerProfileId) }] : [];
    })
    .filter(keep);
  if (!accounts.length) return "no account yet: pick Add an account first.";
  const picked = await pick({ message, options: accounts.map((a, i) => ({ value: String(i), label: a.accountName, hint: PLATFORM_LABELS[a.platform] })) });
  return picked === null ? null : accounts[Number(picked)];
}

async function signIn(context: CommandContext, account: PickedAccount): Promise<{ code: number }> {
  const route = signInRouteOf(account.platform);
  if (route.kind === "cookies") {
    context.out(`Sign in ${account.accountName}: ${route.hint}. The prompt hides what you paste.`);
    return delegate(await commandFor("cookies", account.platform), context, ["save", "--account", account.accountName]);
  }
  if (route.kind === "connect") {
    const now = await pick({
      message: `Connect ${account.accountName} now? It opens the account's browser through its proxy and signs in.`,
      options: [
        { value: "yes", label: "Connect now", hint: `log facebook connect --account ${account.accountName}` },
        { value: "no", label: "Later" },
      ],
    });
    if (now === null) return { code: 1 };
    if (now === "no") {
      context.out(`Later: log facebook connect --account ${account.accountName}`);
      return { code: 0 };
    }
    return delegate(connectCommand, context, ["--account", account.accountName]);
  }
  context.out(browserSignInSteps(account.platform, account.accountName, account.hasProfile));
  return { code: 0 };
}

async function addAccount(context: CommandContext): Promise<{ code: number }> {
  const platform = (await pick({ message: "Which platform?", options: START_PLATFORMS.map(platformOption) })) as Platform | null;
  if (platform === null) return { code: 1 };
  const placeholder = platform === "linkedin" ? "the part after linkedin.com/in/" : platform === "twitter" ? "the handle, without @" : "a name you'll know it by";
  const name = await ask(`The account's name on ${PLATFORM_LABELS[platform]}`, placeholder);
  if (name === null) return { code: 1 };
  const accountName = name.replace(/^@/, "");
  if (signInRouteOf(platform).kind === "cookies") return signIn(context, { platform, accountName, hasProfile: false });
  const argv = ["add", "--platform", platform, "--account", accountName];
  const profile = await ask("Its AdsPower browser profile id (leave empty if it has none yet)", undefined, true);
  if (profile === null) return { code: 1 };
  if (profile) argv.push("--adsPower", profile);
  if (platform === "facebook") {
    const proxy = await ask("Its proxy (scheme://user:pass@host:port, in the account's country)");
    if (proxy === null) return { code: 1 };
    const home = await ask("Its home country code", "US");
    if (home === null) return { code: 1 };
    const city = await ask("Its home city", "Bethlehem");
    if (city === null) return { code: 1 };
    argv.push("--proxy", proxy, "--home", home.toUpperCase(), "--city", city);
  }
  const added = await delegate(await commandFor("localAccount", "any"), context, argv);
  if (added.code !== 0) return added;
  return signIn(context, { platform, accountName, hasProfile: Boolean(profile) });
}

async function runStart(context: CommandContext, action: string): Promise<CommandResult> {
  if (action === "add") return addAccount(context);
  if (action === "agent") {
    context.out(agentSetupText());
    return { code: 0 };
  }
  if (action === "signIn") {
    const account = await pickAccount(context, "Which account to sign in?", () => true);
    if (typeof account === "string") return { code: 1, stderr: `log launch: ${account}` };
    return account === null ? { code: 1 } : signIn(context, account);
  }
  const account = await pickAccount(context, "Which account to check?", (a) => a.platform !== "facebook");
  if (typeof account === "string") return { code: 1, stderr: `log launch: ${account} Facebook accounts are checked when they connect.` };
  if (account === null) return { code: 1 };
  return delegate(await commandFor("session", account.platform), context, ["check", "--account", account.accountName]);
}

export async function runLaunch(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseLaunchArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `log launch: ${parsed.error}\n${LAUNCH_USAGE}` };

  if (parsed.json) {
    return {
      code: 0,
      stdout: JSON.stringify(
        {
          ok: true,
          interactive: false,
          start: [...START_ACTIONS],
          actions: [...MARKETPLACE_ACTIONS],
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
        `Use the scriptable commands instead: log localAccount add, log twitter cookies save, log <platform> session check.\n` +
        LAUNCH_USAGE,
    };
  }

  const prompts = launchDeps.prompts;
  try {
    prompts.intro("log launch");
    const start = await pick({
      message: "What do you want to do?",
      options: [
        { value: "add", label: "Add an account and sign it in", hint: "log localAccount add" },
        { value: "signIn", label: "Sign in an account you added", hint: "log <platform> cookies save" },
        { value: "check", label: "Check an account is still signed in", hint: "log <platform> session check" },
        { value: "agent", label: "Connect your agent (Claude Code, Codex)", hint: "logMcp" },
        ...(launchDeps.twentyReady() ? [{ value: "marketplace", label: "Facebook Marketplace (listings in Twenty)", hint: "log facebook listings" }] : []),
      ],
    });
    if (start === null) return { code: 1 };
    const result = start === "marketplace" ? await runMarketplace(context) : await runStart(context, start);
    if (result.code === 0) prompts.outro("Done.");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 2, stderr: `log launch failed: ${message}` };
  }
}

async function runMarketplace(context: CommandContext): Promise<CommandResult> {
  const prompts = launchDeps.prompts;
  {
    const [accounts, listings] = await Promise.all([listFacebookAccounts(context.twenty), listListingsWhere(context.twenty)]);

    const action = await pick({
      message: "What do you want to look at?",
      options: [
        { value: "browse", label: "Browse listings", hint: "log facebook listing <id>" },
        { value: "status", label: "Listings by status", hint: "log facebook listings --status" },
        { value: "account", label: "Listings by account", hint: "log facebook listings --account" },
        { value: "accounts", label: "Facebook accounts", hint: "log facebook accounts" },
        { value: "scan", label: "Check listings live (opens Camoufox)", hint: "log facebook scan --account" },
        { value: "watch", label: "Run the listing monitor and watch each step", hint: "log facebook watch --account" },
        { value: "connect", label: "Connect a Facebook account (opens Camoufox)", hint: "log facebook connect --account" },
        { value: "join", label: "Join a Facebook group (in the account's open browser; dry run)", hint: "log facebook join group --account --group" },
        { value: "answer", label: "Answer a group's questions, step by step (saved to Twenty, not sent)", hint: "log facebook join group --answer" },
        { value: "fill", label: "Fill a group's dialog from its answers (in the open browser; dry run)", hint: "log facebook join group --fill" },
        { value: "reels", label: "Warm up: Facebook Reels, as a person watches them", hint: "log facebook warmup reel" },
        { value: "doctor", label: "Check the live setup", hint: "log facebook doctor" },
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
        return { code: 1, stderr: "log launch: no FACEBOOK account may run: each needs a usable status, a proxy and a home country in Twenty. See `log facebook accounts`." };
      }
      const accountId = await pick({
        message: action === "connect" ? "Which account to connect?" : "Which account's listings?",
        options: accounts
          .filter((account) => checkRunnable(account, purpose).ok)
          .map((account) => ({ value: account.accountName, label: account.accountName, hint: `${account.homeCity ?? "?"}, ${account.homeCountry}` })),
      });
      if (accountId === null) return { code: 1 };
      const command = action === "scan" ? scanCommand : action === "watch" ? watchCommand : connectCommand;
      result = await delegate(command, context, ["--account", accountId]);
    } else if (action === "join") {
      const runnable = accounts.filter((account) => checkRunnable(account, "run").ok);
      if (!runnable.length) return { code: 1, stderr: "log launch: no FACEBOOK account may run: each needs a usable status, a proxy and a home country in Twenty. See `log facebook accounts`." };
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
      result = await delegate(joinCommand, context, ["group", "--account", accountId, "--group", group.trim()]);
    } else if (action === "answer") {
      const withQuestions: { account: string; group: Group }[] = [];
      for (const account of accounts) {
        for (const group of await listGroups(context.twenty, account.id)) {
          const options = group.joinSubmission.options;
          if (options && (options.questions.length || options.rulesAgreementRequired)) withQuestions.push({ account: account.accountName, group });
        }
      }
      if (!withQuestions.length) return { code: 1, stderr: "log launch: no group has questions saved yet: they come from a --live join (log facebook join group --account <a> --group <g> --live)" };
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
      result = await delegate(joinCommand, context, ["group", "--account", account, "--group", group.facebookGroupId ?? "", "--fill"]);
    } else if (action === "reels") {
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

    return result;
  }
}

export const launchCommand: Command = {
  usage: LAUNCH_USAGE,
  platform: "any",
  name: "launch",
  effect: "write",
  summary: "Start here: a guided menu to add an account, sign it in, check it and connect your agent (and Facebook Marketplace when Twenty is set up)",
  args: "[--json]",
  run: runLaunch,
};
