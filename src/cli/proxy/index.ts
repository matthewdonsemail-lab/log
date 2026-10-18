/**
 * `log proxy` — each account's proxy, the only way its browser reaches the
 * internet (AGENTS.md rule 12).
 *
 *   set    copy a proxy JSON file into ~/.logCli/proxies/<accountId>.json
 *   show   the proxy, password masked
 *   check  the exit IP and its country through the proxy, without a browser
 */
import { readFileSync } from "node:fs";
import { countryName, maskProxy, proxyPath, readProxy, validateProxy, writeProxy } from "../../camofox/proxy/index.ts";
import type { ProxyCheck, ProxyConfig } from "../../camofox/proxy/index.ts";
import { ERROR_CATALOG } from "../../errors/catalog/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandResult } from "../runner/types.ts";

export const PROXY_USAGE = [
  "Usage: log proxy set --account <accountId> --file <proxy.json>",
  "       log proxy show --account <accountId> [--json]",
  "       log proxy check --account <accountId> [--json]",
  'proxy.json: { "server": "http://host:port", "username": "...", "password": "...", "country": "IE" }',
].join("\n");

export const proxyCommand: Command = {
  name: "proxy",
  summary: "Set, show or check an account's proxy (no browser opens without one)",
  args: "<set|show|check> --account <id> [--file <proxy.json>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account", "file"] });
    if (!parsed.ok) return { code: 1, stderr: `log proxy: ${parsed.error}\n${PROXY_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (!action || extra !== undefined || !["set", "show", "check"].includes(action)) {
      return { code: 1, stderr: `log proxy: pick set, show or check\n${PROXY_USAGE}` };
    }
    const accounts = context.load().accounts.map((a) => a.id);
    const accountId = parsed.flags["account"];
    if (typeof accountId !== "string" || !accounts.includes(accountId)) {
      return { code: 1, stderr: `log proxy: --account must be one of ${accounts.join(", ")}\n${PROXY_USAGE}` };
    }
    const json = Boolean(parsed.flags["json"]);

    if (action === "set") {
      const file = parsed.flags["file"];
      if (typeof file !== "string") return { code: 1, stderr: `log proxy set: --file is required\n${PROXY_USAGE}` };
      let value: unknown;
      try {
        value = JSON.parse(readFileSync(file, "utf8"));
      } catch (error) {
        return { code: 1, stderr: `log proxy set: ${file}: ${error instanceof Error ? error.message : String(error)}` };
      }
      const problems = validateProxy(value);
      if (problems.length) return { code: 1, stderr: `log proxy set: proxyMalformed: ${problems.join("; ")}` };
      const proxy = value as ProxyConfig;
      const path = writeProxy(accountId, proxy);
      return {
        code: 0,
        stdout: `Saved the ${accountId} proxy (${countryName(proxy.country)}) to ${path}. You can delete ${file} now.\nRun \`log proxy check --account ${accountId}\` before anything else.`,
      };
    }

    const read = readProxy(accountId);
    if (!read.ok) return refused(action, read.code, read.detail);

    if (action === "show") {
      const shown = { accountId, path: proxyPath(accountId), ...maskProxy(read.proxy) };
      if (json) return { code: 0, stdout: JSON.stringify(shown, null, 2) };
      return { code: 0, stdout: Object.entries(shown).map(([k, v]) => `${k.padEnd(10)}${v}`).join("\n") };
    }

    const result = await context.worker({ action: "proxy.check", account_id: accountId, proxy_path: proxyPath(accountId) });
    if (!result.ok) return refused(action, result.code, result.detail);
    const check = result as ProxyCheck;
    if (json) return { code: 0, stdout: JSON.stringify({ accountId, ...check }, null, 2) };
    return {
      code: 0,
      stdout: `${accountId}: exit IP ${check.exitIp} is in ${countryName(check.exitCountry)}, matching the account. Browsers for it will open through this proxy.`,
    };
  },
};

function refused(action: string, code: keyof typeof ERROR_CATALOG, detail?: string): CommandResult {
  const entry = ERROR_CATALOG[code];
  return { code: 1, stderr: `log proxy ${action}: ${code}: ${entry.meaning}${detail ? ` (${detail})` : ""}\n${entry.action}` };
}
