import { localAccountsPath, readLocalAccounts, upsertLocalAccount } from "../../twenty/graphql/index.ts";
import { PLATFORMS, PLATFORM_SITES } from "../runner/helpers/platforms.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const LOCAL_ACCOUNT_USAGE = [
  "Usage: log localAccount add --platform <facebook|twitter|reddit|discord> --account <accountName> [--adsPower <profileId>] [--proxy <scheme://user:pass@host:port>] [--home <CC>] [--city <city>]",
  "       log localAccount list [--json]",
  "A local account lives in ~/.logCli/localAccounts.json (LOG_LOCAL_ACCOUNTS moves it), not in Twenty. Every command finds it by its accountName, a local row winning over a Twenty row of the same name, and the session a run captures is saved back to the file. LOG_ACCOUNTS=local leaves Twenty out of accounts entirely.",
].join("\n");

export const localAccountCommand: Command = {
  usage: LOCAL_ACCOUNT_USAGE,
  platform: "any",
  name: "localAccount",
  effect: "write",
  summary: "Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, or list them",
  args: "<add|list> [--platform <p>] [--account <a>] [--adsPower <id>] [--proxy <url>] [--home <CC>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["platform", "account", "adsPower", "proxy", "home", "city"] });
    if (!parsed.ok) return { code: 1, stderr: `log localAccount: ${parsed.error}\n${LOCAL_ACCOUNT_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (extra !== undefined || !["add", "list"].includes(action ?? "")) return { code: 1, stderr: `log localAccount: pick add or list\n${LOCAL_ACCOUNT_USAGE}` };
    const path = localAccountsPath();
    if (action === "list") {
      const rows = readLocalAccounts(path).map((r) => ({ id: r.id, platform: r.platform, accountName: r.accountName, adsPowerProfileId: r.adsPowerProfileId ?? null, sessionState: r.sessionState ?? null }));
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ path, accounts: rows }, null, 2) };
      if (rows.length === 0) return { code: 0, stdout: `No local accounts in ${path}.` };
      return { code: 0, stdout: [`${rows.length} local account(s) in ${path}:`, ...rows.map((r) => `  ${String(r.platform).padEnd(9)} ${String(r.accountName).padEnd(34)} ${r.adsPowerProfileId ? `adsPower ${r.adsPowerProfileId}` : "(no AdsPower profile)"}  ${r.sessionState ?? "no session yet"}`)].join("\n") };
    }
    const platform = String(parsed.flags["platform"] ?? "").toLowerCase();
    if (!(PLATFORMS as readonly string[]).includes(platform)) return { code: 1, stderr: `log localAccount add: --platform is one of ${PLATFORMS.join(", ")}\n${LOCAL_ACCOUNT_USAGE}` };
    const accountName = typeof parsed.flags["account"] === "string" ? parsed.flags["account"].trim().replace(/^@/, "") : "";
    if (!accountName) return { code: 1, stderr: `log localAccount add: --account is needed\n${LOCAL_ACCOUNT_USAGE}` };
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
