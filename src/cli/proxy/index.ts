/**
 * `log proxy check --account <name>` — the account's proxy (Twenty
 * socialAccounts.proxy) is reachable and its exit IP is in the account's
 * homeCountry. No browser opens. The result goes back to Twenty
 * (proxyCheckedAt, proxyExitIp, proxyExitCountry). Proxies are set in Twenty
 * itself, never in local files (AGENTS.md rule 12).
 */
import { countryName } from "../../camofox/proxy/index.ts";
import type { ProxyCheck } from "../../camofox/proxy/index.ts";
import { maskProxyUrl, recordProxyCheck } from "../../marketplace/socialAccount/index.ts";
import { openAccount } from "../live/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const PROXY_USAGE = [
  "Usage: log proxy check --account <accountName> [--json]",
  "The proxy is the socialAccount's `proxy` field in Twenty (scheme://user:pass@host:port), its country `homeCountry`.",
].join("\n");

export const proxyCommand: Command = {
  name: "proxy",
  summary: "Check an account's proxy exits in its home country (no browser)",
  args: "check --account <name> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log proxy: ${parsed.error}\n${PROXY_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (action !== "check" || extra !== undefined) return { code: 1, stderr: `log proxy: only \`check\`\n${PROXY_USAGE}` };

    const opened = await openAccount(context, "proxy check", PROXY_USAGE, parsed.flags["account"], "check");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    try {
      const result = await context.worker({ action: "proxy.check", account_id: account.id, proxy_path: run.proxyPath });
      if (!result.ok) {
        const exitCountry = /is in ([A-Z]{2})/.exec(result.detail ?? "")?.[1] ?? null;
        const exitIp = /exit IP (\S+)/.exec(result.detail ?? "")?.[1] ?? null;
        await recordProxyCheck(context.twenty, account.id, { exitIp, exitCountry });
        return refuse("proxy check", result.code, result.detail);
      }
      const check = result as ProxyCheck;
      await recordProxyCheck(context.twenty, account.id, { exitIp: check.exitIp, exitCountry: check.exitCountry });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountName: account.accountName, proxy: maskProxyUrl(account.proxy), ...check }, null, 2) };
      return {
        code: 0,
        stdout: `${account.accountName}: ${maskProxyUrl(account.proxy)} exits at ${check.exitIp}, in ${countryName(check.exitCountry)}, matching the account. Saved to Twenty.`,
      };
    } catch (error) {
      return refuseError("proxy check", error);
    } finally {
      run.cleanup();
    }
  },
};
