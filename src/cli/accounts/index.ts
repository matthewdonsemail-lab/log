import { workspaceAccounts, WORKSPACE_ACCOUNTS_DEFAULT_LIMIT, WORKSPACE_ACCOUNTS_MAX_LIMIT } from "../../platformKit/account/index.ts";
import type { WorkspaceAccountsPage } from "../../platformKit/account/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const ACCOUNTS_USAGE = [
  "Usage: log accounts list [--limit <n>] [--cursor <n>] [--json]",
  `Every social account in this workspace, on every platform: its platform, account name, status and session state, never a credential. The same list the hosted accountsList answers, read from the local accounts file. --limit is how many to list (default ${WORKSPACE_ACCOUNTS_DEFAULT_LIMIT}, at most ${WORKSPACE_ACCOUNTS_MAX_LIMIT}); a page that leaves accounts out names the --cursor of the next.`,
].join("\n");

export const ACCOUNTS_INPUT: CommandInput = {
  forms: [
    {
      words: ["list"],
      effect: "read",
      summary: "Every social account in this workspace with its platform, status and session state, a page at a time, never a credential",
      positionals: [],
      flags: [
        { name: "limit", kind: "integer", min: 1, max: WORKSPACE_ACCOUNTS_MAX_LIMIT, description: `How many accounts to list (default ${WORKSPACE_ACCOUNTS_DEFAULT_LIMIT})` },
        { name: "cursor", kind: "string", pattern: "^[0-9]{1,9}$", takes: "the cursor a page named", description: "Where the next page starts, from the cursor the last page named" },
        JSON_FLAG,
      ],
    },
  ],
};

export function accountsText(page: WorkspaceAccountsPage): string {
  if (!page.accounts.length) return "log accounts list: no accounts in this workspace. Add one with log localAccount add.";
  const rows = page.accounts.map((a) => `  ${a.platform.padEnd(9)} ${a.account.padEnd(34)} ${a.status.padEnd(10)} ${a.sessionState ?? "no session yet"}`);
  return [`log accounts list: ${page.accounts.length} account(s):`, ...rows, ...(page.cursor ? [`  more: --cursor ${page.cursor}`] : [])].join("\n");
}

export const accountsDeps: { read: (options: { limit?: unknown; cursor?: unknown }) => WorkspaceAccountsPage } = { read: (options) => workspaceAccounts(options) };

export const workspaceAccountsCommand: Command = {
  usage: ACCOUNTS_USAGE,
  platform: "any",
  name: "accounts",
  effect: "read",
  input: ACCOUNTS_INPUT,
  summary: "Every social account in this workspace with its platform, status and session state, the list the hosted accountsList answers",
  args: "list [--limit <n>] [--cursor <n>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(ACCOUNTS_INPUT));
    if (!parsed.ok) return refuseInput("accounts", parsed.error, ACCOUNTS_USAGE);
    if (parsed.positionals[0] !== "list" || parsed.positionals.length > 1) return { code: 1, error: "inputInvalid", stderr: `log accounts: say list\n${ACCOUNTS_USAGE}` };
    const cursor = typeof parsed.flags["cursor"] === "string" ? parsed.flags["cursor"] : undefined;
    const page = accountsDeps.read({ limit: numberOf(parsed, "limit"), cursor });
    return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify(page, null, 2) : accountsText(page) };
  },
};
