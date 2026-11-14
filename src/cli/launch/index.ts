import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cancel, intro, isCancel, multiselect, outro, password, select, text } from "@clack/prompts";
import { buildBrowserCommand } from "../../auth/session/helpers/urls.ts";
import { DEFAULT_LOCAL_API_URL } from "../../browser/adsPower/types.ts";
import { userEnvPath } from "../../config/userEnv/index.ts";
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
import { installOpenCode, opencodeConfigDir } from "../../agentHooks/opencode/index.ts";
import type { HarnessInstall } from "../../agentHooks/opencode/index.ts";
import { hermesHome, installHermes } from "../../agentHooks/hermes/index.ts";
import { ADSPOWER_SETUP, agentSetupText, browserSignInSteps, needsBrowser, parseLaunchArgs, platformOfTwenty, platformOption, setEnvValue, SETUP_EXTENSIONS, SETUP_HARNESSES, setupSummary, shouldPrompt, signInRouteOf, START_ACTIONS, START_PLATFORMS, twentyReady } from "./helpers/index.ts";
import type { LaunchTTY, SetupExtension, SetupHarness, SetupOutcome } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LAUNCH_USAGE = "Usage: log launch [--setup] [--json]";

const MARKETPLACE_ACTIONS = ["browse", "status", "account", "accounts", "scan", "watch", "connect", "join", "answer", "fill", "reels", "doctor"] as const;

type PromptSelectOptions = Parameters<typeof select>[0];

interface LaunchPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: PromptSelectOptions): Promise<unknown>;
  text(option: Parameters<typeof text>[0]): Promise<unknown>;
  multiselect(option: Parameters<typeof multiselect>[0]): Promise<unknown>;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

const harnessHomes: Partial<Record<SetupHarness["id"], () => string>> = { opencode: opencodeConfigDir, hermes: hermesHome };

export const launchDeps: {
  prompts: LaunchPrompts;
  tty: () => LaunchTTY;
  run: (command: Command, context: CommandContext, argv: string[]) => Promise<CommandResult> | CommandResult;
  twentyReady: () => boolean;
  openUrl: (url: string) => boolean;
  runInTerminal: (command: string, args: readonly string[]) => { found: boolean; code: number };
  adsPowerUp: () => Promise<boolean>;
  harnesses: () => readonly SetupHarness[];
  installHarness: (harness: SetupHarness) => HarnessInstall;
  envFile: () => string;
  readEnv: (file: string) => string;
  writeEnv: (file: string, text: string) => void;
} = {
  prompts: {
    intro,
    outro,
    cancel,
    select: select as LaunchPrompts["select"],
    text: text as LaunchPrompts["text"],
    multiselect: multiselect as LaunchPrompts["multiselect"],
    password: password as LaunchPrompts["password"],
  },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  run: (command, context, argv) => command.run(context, argv),
  twentyReady: () => twentyReady(),
  openUrl: (url) => {
    const { command, args } = buildBrowserCommand(url, process.platform);
    return !spawnSync(command, args, { stdio: "ignore", windowsHide: true }).error;
  },
  runInTerminal: (command, args) => {
    const run = spawnSync(command, [...args], { stdio: "inherit", shell: process.platform === "win32", windowsHide: true });
    return { found: !run.error && run.status !== 9009 && run.status !== 127, code: run.status ?? 1 };
  },
  adsPowerUp: async () => {
    try {
      const response = await fetch(`${process.env.ADSPOWER_HOST?.trim() || DEFAULT_LOCAL_API_URL}/status`, { signal: AbortSignal.timeout(3000) });
      return response.ok;
    } catch {
      return false;
    }
  },
  harnesses: () => SETUP_HARNESSES.filter((harness) => existsSync(harnessHomes[harness.id]?.() ?? "")),
  installHarness: (harness) => (harness.id === "hermes" ? installHermes() : installOpenCode()),
  envFile: () => userEnvPath(),
  readEnv: (file) => (existsSync(file) ? readFileSync(file, "utf8") : ""),
  writeEnv: (file, text) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text, { mode: 0o600 });
  },
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

export interface PickedAccount {
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

export async function signInAccount(context: CommandContext, account: PickedAccount): Promise<{ code: number }> {
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

async function addAccount(context: CommandContext, preset?: Platform): Promise<{ code: number }> {
  const platform = preset ?? ((await pick({ message: "Which platform?", options: START_PLATFORMS.map(platformOption) })) as Platform | null);
  if (platform === null) return { code: 1 };
  const placeholder = platform === "linkedin" ? "the part after linkedin.com/in/" : platform === "twitter" ? "the handle, without @" : "a name you'll know it by";
  const name = await ask(`The account's name on ${PLATFORM_LABELS[platform]}`, placeholder);
  if (name === null) return { code: 1 };
  const accountName = name.replace(/^@/, "");
  if (signInRouteOf(platform).kind === "cookies") return signInAccount(context, { platform, accountName, hasProfile: false });
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
  return signInAccount(context, { platform, accountName, hasProfile: Boolean(profile) });
}

async function pickMany(options: Parameters<typeof multiselect>[0]): Promise<string[] | null> {
  const value = await launchDeps.prompts.multiselect(options);
  if (isCancel(value) || !Array.isArray(value)) {
    launchDeps.prompts.cancel("Setup cancelled.");
    return null;
  }
  return value.map(String);
}

async function askSecret(message: string): Promise<string | null> {
  const value = await launchDeps.prompts.password({ message, mask: "•" });
  if (isCancel(value)) {
    launchDeps.prompts.cancel("Setup cancelled.");
    return null;
  }
  return typeof value === "string" ? value.trim() : "";
}

function saveKey(context: CommandContext, keyName: string, value: string): void {
  const file = launchDeps.envFile();
  launchDeps.writeEnv(file, setEnvValue(launchDeps.readEnv(file), keyName, value));
  process.env[keyName] = value;
  context.out(`  ✓ ${keyName} saved in ${file}`);
}

async function openSignUp(context: CommandContext, label: string, url: string, note?: string): Promise<boolean | null> {
  const choice = await pick({
    message: `${label}: do you have an account?`,
    options: [
      { value: "signUp", label: "No, open the sign-up page", hint: url },
      { value: "have", label: "Yes, I have one" },
      { value: "skip", label: `Skip ${label}` },
    ],
  });
  if (choice === null) return null;
  if (choice === "skip") return false;
  if (choice === "signUp") {
    if (note) context.out(`  ${note}`);
    context.out(launchDeps.openUrl(url) ? `  Opened ${url} in your browser.` : `  Open this in your browser: ${url}`);
  }
  return true;
}

async function setUpExtension(context: CommandContext, extension: SetupExtension): Promise<SetupOutcome | null> {
  context.out(`\n${extension.label}: ${extension.adds}`);
  const go = await openSignUp(context, extension.label, extension.signUpUrl, extension.signUpNote);
  if (go === null) return null;
  if (!go) return { label: extension.label, ok: false, detail: "skipped" };
  const access = extension.access;
  if (access.kind === "signIn") {
    const command = `${access.command} ${access.args.join(" ")}`;
    context.out(`  Signing in: ${command} opens your browser.`);
    const run = launchDeps.runInTerminal(access.command, access.args);
    if (!run.found) return { label: extension.label, ok: false, detail: `${access.command} isn't installed: install it from ${extension.signUpUrl}, then run ${command}` };
    return run.code === 0 ? { label: extension.label, ok: true, detail: "signed in" } : { label: extension.label, ok: false, detail: `sign-in didn't finish: run ${command}` };
  }
  context.out(launchDeps.openUrl(access.keyUrl) ? `  Opened ${access.keyUrl} for the key (${access.keyHint}).` : `  Get the key at ${access.keyUrl} (${access.keyHint}).`);
  const key = await askSecret(`Paste the ${extension.label} key (${access.keyName}), or leave it empty to skip`);
  if (key === null) return null;
  if (!key) return { label: extension.label, ok: false, detail: `no key: add ${access.keyName} to ${launchDeps.envFile()} later` };
  saveKey(context, access.keyName, key);
  return { label: extension.label, ok: true, detail: `${access.keyName} saved` };
}

async function setUpAdsPower(context: CommandContext): Promise<SetupOutcome | null> {
  context.out(`\n${ADSPOWER_SETUP.label}: ${ADSPOWER_SETUP.adds}`);
  const go = await openSignUp(context, ADSPOWER_SETUP.label, ADSPOWER_SETUP.signUpUrl);
  if (go === null) return null;
  if (!go) return { label: ADSPOWER_SETUP.label, ok: false, detail: "skipped: browser platforms need it to sign in" };
  const key = await askSecret(ADSPOWER_SETUP.keyHint);
  if (key === null) return null;
  if (key) saveKey(context, ADSPOWER_SETUP.keyName, key);
  return (await launchDeps.adsPowerUp())
    ? { label: ADSPOWER_SETUP.label, ok: true, detail: "its Local API answered" }
    : { label: ADSPOWER_SETUP.label, ok: false, detail: "its Local API didn't answer: open AdsPower and turn on its Local API (Automation, API)" };
}

async function setUpHarness(harness: SetupHarness): Promise<SetupOutcome> {
  try {
    const got = launchDeps.installHarness(harness);
    const detail = got.changed ? `wired: ${got.configPath}` : `already wired: ${got.configPath}`;
    return { label: harness.label, ok: true, detail: `${detail}, hooks in ${got.pluginDir}` };
  } catch (error) {
    return { label: harness.label, ok: false, detail: `couldn't wire it: ${String(error).slice(0, 200)}` };
  }
}

async function runSetup(context: CommandContext): Promise<CommandResult> {
  const outcomes: SetupOutcome[] = [];
  context.out(`Your settings and keys go in ${launchDeps.envFile()}. Space picks, Enter goes on.`);
  const picked = await pickMany({ message: "Which platforms do you want log on?", options: START_PLATFORMS.map(platformOption), required: false });
  if (picked === null) return { code: 1 };
  const platforms = START_PLATFORMS.filter((platform) => picked.includes(platform));
  if (needsBrowser(platforms)) {
    const adsPower = await setUpAdsPower(context);
    if (adsPower === null) return { code: 1 };
    outcomes.push(adsPower);
  }
  for (const platform of platforms) {
    const label = PLATFORM_LABELS[platform];
    context.out(`\n${label}: add the account and sign it in.`);
    const added = await addAccount(context, platform);
    outcomes.push({ label, ok: added.code === 0, detail: added.code === 0 ? "account added and signed in" : "not signed in yet: log launch, Sign in an account you added" });
  }
  const chosen = await pickMany({
    message: "Which extensions do you want?",
    options: SETUP_EXTENSIONS.map((extension) => ({ value: extension.id, label: extension.label, hint: extension.adds })),
    required: false,
  });
  if (chosen === null) return { code: 1 };
  for (const extension of SETUP_EXTENSIONS.filter((e) => chosen.includes(e.id))) {
    const outcome = await setUpExtension(context, extension);
    if (outcome === null) return { code: 1 };
    outcomes.push(outcome);
  }
  const offered = launchDeps.harnesses();
  if (offered.length) {
    const wired = await pickMany({
      message: "Which agent harnesses should log wire itself into?",
      options: offered.map((harness) => ({ value: harness.id, label: harness.label, hint: harness.adds })),
      required: false,
    });
    if (wired === null) return { code: 1 };
    for (const harness of offered.filter((h) => wired.includes(h.id))) outcomes.push(await setUpHarness(harness));
  }
  context.out(`\n${setupSummary(outcomes, launchDeps.envFile())}`);
  return { code: 0 };
}

async function runStart(context: CommandContext, action: string): Promise<CommandResult> {
  if (action === "setup") return runSetup(context);
  if (action === "add") return addAccount(context);
  if (action === "agent") {
    context.out(agentSetupText());
    return { code: 0 };
  }
  if (action === "console") {
    const { runConsoleMenu } = await import("../console/index.ts");
    return runConsoleMenu(context);
  }
  if (action === "signIn") {
    const account = await pickAccount(context, "Which account to sign in?", () => true);
    if (typeof account === "string") return { code: 1, stderr: `log launch: ${account}` };
    return account === null ? { code: 1 } : signInAccount(context, account);
  }
  const account = await pickAccount(context, "Which account to check?", (a) => a.platform !== "facebook");
  if (typeof account === "string") return { code: 1, stderr: `log launch: ${account} Facebook accounts are checked when they connect.` };
  if (account === null) return { code: 1 };
  return checkAccountSession(context, account);
}

export async function checkAccountSession(context: CommandContext, account: Pick<PickedAccount, "platform" | "accountName">): Promise<{ code: number }> {
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
    prompts.intro(parsed.setup ? "log setup" : "log launch");
    if (parsed.setup) {
      const result = await runSetup(context);
      if (result.code === 0) prompts.outro("Done.");
      return result;
    }
    const start = await pick({
      message: "What do you want to do?",
      options: [
        { value: "setup", label: "Set up log: pick platforms, sign in, add extensions", hint: "log launch --setup" },
        { value: "add", label: "Add an account and sign it in", hint: "log localAccount add" },
        { value: "signIn", label: "Sign in an account you added", hint: "log <platform> cookies save" },
        { value: "check", label: "Check an account is still signed in", hint: "log <platform> session check" },
        { value: "agent", label: "Connect your agent (Claude Code, Codex)", hint: "logMcp" },
        { value: "console", label: "Console: this machine's status, accounts, usage, events and settings", hint: "log console" },
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
  summary: "Start here: a guided menu to set log up (platforms, sign-ins, the account's browser and extensions), add an account, sign it in, check it and connect your agent (and the listing tools when Twenty is set up)",
  args: "[--setup] [--json]",
  run: runLaunch,
};
