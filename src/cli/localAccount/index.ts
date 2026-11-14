import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { saveAccountLogin, signInRequestOf } from "../../console/signIn/index.ts";
import type { SignInPrompts } from "../../console/signIn/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { shouldPrompt } from "../launch/helpers/shouldPrompt.ts";
import type { LaunchTTY } from "../launch/helpers/shouldPrompt.ts";
import { createTwentyClient, localAccountsPath, pullLocalAccounts, readLocalAccounts, upsertLocalAccount } from "../../twenty/graphql/index.ts";
import { PLATFORMS, PLATFORM_SITES } from "../runner/helpers/platforms.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult } from "../runner/types.ts";

export const LOCAL_ACCOUNT_USAGE = [
  "Usage: log localAccount add --platform <facebook|twitter|reddit|discord|linkedin|slack> --account <accountName> [--adsPower <profileId>] [--proxy <scheme://user:pass@host:port>] [--home <CC>] [--city <city>]",
  "       log localAccount list [--json]",
  "       log localAccount login --platform <p> --account <accountName>   (saves the account's email and password to the file from two masked prompts, the same save as the console's password sign-in, on a platform that signs in from them; run in a terminal)",
  "       log localAccount pull [--platform <p>] [--refresh] [--json]   (copies every account Twenty has, cookies and login included, into the file; an account already there is kept unless --refresh; each keeps its Twenty id, so listings and groups still find it)",
  "A local account lives in ~/.logCli/localAccounts.json (LOG_LOCAL_ACCOUNTS moves it), not in Twenty. Every command finds it by its accountName, a local row winning over a Twenty row of the same name, and the session a run captures is saved back to the file. LOG_ACCOUNTS=local leaves Twenty out of accounts entirely.",
].join("\n");

export const LOCAL_ACCOUNT_INPUT: CommandInput = {
  forms: [
    {
      words: ["add"],
      summary: "Add or update one account in the local accounts file, with its browser profile, proxy and home",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", required: true, values: PLATFORMS, description: "The account's platform" },
        { name: "account", kind: "string", required: true, description: "The account's accountName (its handle or name on the platform)" },
        { name: "adsPower", kind: "string", description: "Its AdsPower profile id" },
        { name: "proxy", kind: "string", description: "Its proxy, scheme://user:pass@host:port" },
        { name: "home", kind: "string", pattern: "^[A-Za-z]{2}$", takes: "a two-letter country code", description: "Its home country" },
        { name: "city", kind: "string", description: "Its home city" },
      ],
    },
    { words: ["list"], effect: "read", summary: "Every account in the local accounts file", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["login"],
      effect: "write",
      terminalOnly: "asks for the account's email and password in masked prompts: the owner runs it in a terminal",
      summary: "Save an account's email and password to the local accounts file from masked prompts, for a platform that signs in from them",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", values: PLATFORMS, required: true, description: "The account's platform" },
        { name: "account", kind: "string", required: true, description: "The account's accountName, already in the file" },
      ],
    },
    {
      words: ["pull"],
      summary: "Copy every Twenty account, cookies and login included, into the local accounts file",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", values: PLATFORMS, description: "Only this platform's accounts" },
        { name: "refresh", kind: "boolean", description: "Replace an account already in the file" },
        JSON_FLAG,
      ],
    },
  ],
};

export const localAccountDeps: { prompts: SignInPrompts; tty: () => LaunchTTY; env?: Record<string, string | undefined> } = {
  prompts: { intro, outro, cancel, password: password as SignInPrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

async function saveLogin(flags: Record<string, string | true>): Promise<CommandResult> {
  const name = "localAccount login";
  const platform = String(flags["platform"] ?? "");
  const account = typeof flags["account"] === "string" ? flags["account"] : "";
  if (!shouldPrompt(false, localAccountDeps.tty())) return refuse(name, "terminalOnly", "the email and password are typed in masked prompts, so it runs in a terminal (they are never passed as flags)");
  const prompts = localAccountDeps.prompts;
  prompts.intro(`log localAccount login: ${platform} ${account}`);
  const ask = async (message: string) => {
    const answer = await prompts.password({ message, validate: (v) => ((v ?? "").trim() ? undefined : "this is needed") });
    return isCancel(answer) ? null : String(answer ?? "");
  };
  const username = await ask("Email (or the sign-in name)");
  const secret = username === null ? null : await ask("Password");
  if (username === null || secret === null) {
    prompts.cancel("Nothing saved.");
    return refuse(name, "inputInvalid", "cancelled, nothing saved");
  }
  try {
    const saved = saveAccountLogin(signInRequestOf({ platform, method: "password", account, username, password: secret }), localAccountDeps.env ?? process.env);
    prompts.outro("Saved. Check the account to sign it in.");
    return { code: 0, stdout: `log localAccount login: ${platform} ${account} login saved in ${localAccountsPath(localAccountDeps.env ?? process.env)} (email and password <set>); it is ${saved.state} until a check signs it in.` };
  } catch (error) {
    prompts.cancel("Nothing saved.");
    const code = error instanceof Error ? error.message.split(":")[0] : "";
    return isErrorCode(code) ? refuse(name, code) : refuse(name, "crashed", error instanceof Error ? error.message : String(error));
  }
}

export const localAccountCommand: Command = {
  usage: LOCAL_ACCOUNT_USAGE,
  platform: "any",
  name: "localAccount",
  effect: "write",
  input: LOCAL_ACCOUNT_INPUT,
  summary: "Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, pull every Twenty account in, or list them",
  args: "<add|list|pull|login> [--platform <p>] [--account <a>] [--adsPower <id>] [--proxy <url>] [--home <CC>] [--refresh] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LOCAL_ACCOUNT_INPUT));
    if (!parsed.ok) return refuseInput("localAccount", parsed.error, LOCAL_ACCOUNT_USAGE);
    const [action, extra] = parsed.positionals;
    if (extra !== undefined || !["add", "list", "pull", "login"].includes(action ?? "")) return { code: 1, error: "inputInvalid", stderr: `log localAccount: pick add, list, pull or login\n${LOCAL_ACCOUNT_USAGE}` };
    const path = localAccountsPath();
    if (action === "login") return saveLogin(parsed.flags);
    if (action === "list") {
      const rows = readLocalAccounts(path).map((r) => ({ id: r.id, platform: r.platform, accountName: r.accountName, adsPowerProfileId: r.adsPowerProfileId ?? null, sessionState: r.sessionState ?? null }));
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ path, accounts: rows }, null, 2) };
      if (rows.length === 0) return { code: 0, stdout: `No local accounts in ${path}.` };
      return { code: 0, stdout: [`${rows.length} local account(s) in ${path}:`, ...rows.map((r) => `  ${String(r.platform).padEnd(9)} ${String(r.accountName).padEnd(34)} ${r.adsPowerProfileId ? `adsPower ${r.adsPowerProfileId}` : "(no AdsPower profile)"}  ${r.sessionState ?? "no session yet"}`)].join("\n") };
    }
    const platform = String(parsed.flags["platform"] ?? "").toLowerCase();
    if (action === "pull") {
      if (platform && !(PLATFORMS as readonly string[]).includes(platform)) return { code: 1, error: "inputInvalid", stderr: `log localAccount pull: --platform is one of ${PLATFORMS.join(", ")}\n${LOCAL_ACCOUNT_USAGE}` };
      const pulled = await pullLocalAccounts(createTwentyClient(), { ...(platform ? { platform: PLATFORM_SITES[platform as (typeof PLATFORMS)[number]].twenty } : {}), refresh: Boolean(parsed.flags["refresh"]) }, path);
      const line = (r: Record<string, unknown>) => `${String(r.platform).padEnd(9)} ${String(r.accountName)}`;
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ path, added: pulled.added.map(line), refreshed: pulled.refreshed.map(line), kept: pulled.kept.map(line) }, null, 2) };
      return { code: 0, stdout: [`log localAccount pull: ${pulled.added.length} added, ${pulled.refreshed.length} refreshed, ${pulled.kept.length} already local (kept) in ${path}. Twenty is not changed.`, ...pulled.added.map((r) => `  + ${line(r)}`), ...pulled.refreshed.map((r) => `  ~ ${line(r)}`)].join("\n") };
    }
    if (!(PLATFORMS as readonly string[]).includes(platform)) return { code: 1, error: "inputInvalid", stderr: `log localAccount add: --platform is one of ${PLATFORMS.join(", ")}\n${LOCAL_ACCOUNT_USAGE}` };
    const accountName = typeof parsed.flags["account"] === "string" ? parsed.flags["account"].trim().replace(/^@/, "") : "";
    if (!accountName) return { code: 1, error: "inputInvalid", stderr: `log localAccount add: --account is needed\n${LOCAL_ACCOUNT_USAGE}` };
    const text = (name: string) => (typeof parsed.flags[name] === "string" && parsed.flags[name] ? String(parsed.flags[name]).trim() : undefined);
    const home = text("home")?.toUpperCase();
    const row = upsertLocalAccount(
      {
        accountName,
        platform: PLATFORM_SITES[platform as (typeof PLATFORMS)[number]].twenty,
        ...(text("adsPower") ? { adsPowerProfileId: text("adsPower"), browserDriver: "adsPower" } : {}),
        ...(text("proxy") ? { proxy: text("proxy") } : {}),
        ...(home ? { homeCountry: home } : {}),
        ...(text("city") ? { homeCity: text("city") } : {}),
      },
      path,
    );
    return { code: 0, stdout: `log localAccount: ${row.platform} ${accountName} saved in ${path} (${row.id}). Twenty is not touched.` };
  },
};
