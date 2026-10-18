/**
 * `log proxy` — each account's proxy, the only way its browser reaches the
 * internet (AGENTS.md rule 12). Proxies live on the socialAccount in Twenty
 * (`proxy`, `homeCountry`); never in local files.
 *
 *   check    the exit IP and its country through the proxy, no browser;
 *            written to the account (proxyCheckedAt, proxyExitIp, proxyExitCountry)
 *   assign   a 2Captcha residential proxy pinned to the account's home country
 *            and city, with a sticky session of its own. Checked first, saved
 *            to Twenty only if it really exits in the home country
 *   balance  the 2Captcha proxy account: traffic left, money balance
 */
import { countryName } from "../../camofox/proxy/index.ts";
import type { ProxyCheck } from "../../camofox/proxy/index.ts";
import { prepareRun } from "../../camofox/run/index.ts";
import { findAccount, listFacebookAccounts, maskProxyUrl, recordProxyCheck } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import {
  buildProxyUrl,
  gatewayHost,
  getBalance,
  getProxyAccount,
  searchPlaces,
  sessionFor,
  twoCaptchaCredentials,
} from "../../proxyVendor/twoCaptcha/index.ts";
import type { TwoCaptchaPlace } from "../../proxyVendor/twoCaptcha/index.ts";
import { openAccount } from "../live/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";

export const PROXY_USAGE = [
  "Usage: log proxy check   --account <accountName> [--json]",
  "       log proxy assign  --account <accountName> | --missing  [--city <city> | --anyCity] [--minutes <1-120>] [--socks5]",
  "       log proxy balance [--json]",
  "The proxy is the socialAccount's `proxy` field in Twenty (scheme://user:pass@host:port), its country `homeCountry`.",
].join("\n");

/** Runs proxy.check for `account` as it is (or with a candidate proxy). Never opens a browser. */
async function checkProxy(context: CommandContext, account: FacebookAccount): Promise<{ ok: true; check: ProxyCheck } | { ok: false; result: CommandResult; exitIp: string | null; exitCountry: string | null }> {
  const prepared = prepareRun(account, "check");
  if (!prepared.ok) return { ok: false, result: refuse("proxy", prepared.code, prepared.detail), exitIp: null, exitCountry: null };
  try {
    const result = await context.worker({ action: "proxy.check", account_id: account.id, proxy_path: prepared.run.proxyPath });
    if (result.ok) return { ok: true, check: result as ProxyCheck };
    return {
      ok: false,
      result: refuse("proxy", result.code, result.detail),
      exitIp: /exit IP (\S+)/.exec(result.detail ?? "")?.[1] ?? null,
      exitCountry: /is in ([A-Z]{2})/.exec(result.detail ?? "")?.[1] ?? null,
    };
  } finally {
    prepared.run.cleanup();
  }
}

/** One account → a checked 2Captcha proxy saved to Twenty, or why not. */
async function assignOne(
  context: CommandContext,
  account: FacebookAccount,
  options: { username: string; password: string; city: string | null; anyCity: boolean; minutes: number; socks5: boolean },
): Promise<{ ok: boolean; line: string }> {
  if (account.platform !== "FACEBOOK") return { ok: false, line: `${account.accountName}: accountNotFacebook` };
  if (!account.homeCountry) return { ok: false, line: `${account.accountName}: noHomeCountry (set homeCountry in Twenty first)` };
  const country = account.homeCountry;
  const city = options.anyCity ? null : (options.city ?? account.homeCity);
  let place: TwoCaptchaPlace | null = null;
  if (city) {
    const found = (await searchPlaces(city)).filter((p) => p.countryCode.toUpperCase() === country);
    place = found[0] ?? null;
    if (!place) return { ok: false, line: `${account.accountName}: twoCaptchaNoPlace: 2Captcha has no "${city}" in ${countryName(country)} (use --city or --anyCity)` };
  }
  const url = buildProxyUrl({
    username: options.username,
    password: options.password,
    country,
    place,
    session: sessionFor(account.id),
    sessionMinutes: options.minutes,
    protocol: options.socks5 ? "socks5" : "http",
    host: gatewayHost(country),
  });
  // Checked before it is saved: a proxy that doesn't exit in the home country never reaches Twenty.
  const checked = await checkProxy(context, { ...account, proxy: url });
  if (!checked.ok) {
    return { ok: false, line: `${account.accountName}: not saved. ${(checked.result.stderr ?? "").split("\n")[0].replace(/^log proxy: /, "")}` };
  }
  await context.twenty.update("socialAccounts", account.id, { proxy: url });
  await recordProxyCheck(context.twenty, account.id, { exitIp: checked.check.exitIp, exitCountry: checked.check.exitCountry });
  const where = place ? `${place.city}, ${place.region}, ${countryName(country)}` : countryName(country);
  return { ok: true, line: `${account.accountName}: ${maskProxyUrl(url)} → exits at ${checked.check.exitIp} in ${countryName(checked.check.exitCountry)} (${where}). Saved to Twenty.` };
}

export const proxyCommand: Command = {
  name: "proxy",
  summary: "Check an account's proxy, give it a 2Captcha one in its home country, or see 2Captcha traffic",
  args: "<check|assign|balance> [--account <name>] [...]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "missing", "anyCity", "socks5"], valued: ["account", "city", "minutes"] });
    if (!parsed.ok) return { code: 1, stderr: `log proxy: ${parsed.error}\n${PROXY_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (!action || extra !== undefined || !["check", "assign", "balance"].includes(action)) {
      return { code: 1, stderr: `log proxy: pick check, assign or balance\n${PROXY_USAGE}` };
    }

    if (action === "balance") {
      const creds = twoCaptchaCredentials();
      const apiKey = "apiKey" in creds ? creds.apiKey : (process.env["2CAPTCHA_API_KEY"] || process.env.TWOCAPTCHA_API_KEY || "").trim();
      if (!apiKey) return refuse("proxy balance", "twoCaptchaNotConfigured", "2CAPTCHA_API_KEY");
      try {
        const [account, balance] = await Promise.all([getProxyAccount(apiKey), getBalance(apiKey)]);
        const out = {
          // The username is the 2Captcha proxy password's prefix: never shown.
          username: "***",
          active: account.status === 1,
          trafficLeft: account.leftFlow,
          trafficUsed: account.usedFlow,
          trafficTotal: account.totalFlow,
          balance: balance.balance,
          whitelistedIps: account.whitelistedIps.length,
          proxyPasswordSet: "apiKey" in creds,
        };
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(out, null, 2) };
        return {
          code: 0,
          stdout: [
            `2Captcha proxies ${out.active ? "active" : "NOT active"} (user ${out.username})`,
            `  Traffic left  ${out.trafficLeft}  (used ${out.trafficUsed} of ${out.trafficTotal})`,
            `  Balance       $${out.balance}`,
            `  Proxy password ${out.proxyPasswordSet ? "set" : "MISSING: 2CAPTCHA_PROXY_PASSWORD in log-cli/.env.local"}`,
          ].join("\n"),
        };
      } catch (error) {
        return refuseError("proxy balance", error);
      }
    }

    if (action === "assign") {
      const creds = twoCaptchaCredentials();
      if ("missing" in creds) return refuse("proxy assign", "twoCaptchaNotConfigured", creds.missing);
      const minutes = parsed.flags["minutes"] === undefined ? 120 : Number(parsed.flags["minutes"]);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) return { code: 1, stderr: "log proxy assign: --minutes must be 1 to 120 (2Captcha's sticky limit)" };
      try {
        let accounts: FacebookAccount[];
        if (parsed.flags["missing"]) {
          accounts = (await listFacebookAccounts(context.twenty)).filter((a) => !a.proxy);
          if (accounts.length === 0) return { code: 0, stdout: "Every FACEBOOK account already has a proxy." };
        } else if (typeof parsed.flags["account"] === "string") {
          accounts = [await findAccount(context.twenty, parsed.flags["account"])];
        } else {
          return { code: 1, stderr: `log proxy assign: --account <name> or --missing\n${PROXY_USAGE}` };
        }
        const { username } = await getProxyAccount(creds.apiKey);
        const options = {
          username,
          password: creds.proxyPassword,
          city: typeof parsed.flags["city"] === "string" ? parsed.flags["city"] : null,
          anyCity: Boolean(parsed.flags["anyCity"]),
          minutes,
          socks5: Boolean(parsed.flags["socks5"]),
        };
        const results = [];
        for (const account of accounts) results.push(await assignOne(context, account, options));
        const failed = results.filter((r) => !r.ok).length;
        return { code: failed ? 1 : 0, stdout: results.map((r) => r.line).join("\n") };
      } catch (error) {
        return refuseError("proxy assign", error);
      }
    }

    // check
    const opened = await openAccount(context, "proxy check", PROXY_USAGE, parsed.flags["account"], "check");
    if (!("run" in opened)) return opened;
    const { account, run } = opened;
    run.cleanup();
    try {
      const checked = await checkProxy(context, account);
      if (!checked.ok) {
        await recordProxyCheck(context.twenty, account.id, { exitIp: checked.exitIp, exitCountry: checked.exitCountry });
        return { ...checked.result, stderr: (checked.result.stderr ?? "").replace(/^log proxy:/, "log proxy check:") };
      }
      const check = checked.check;
      await recordProxyCheck(context.twenty, account.id, { exitIp: check.exitIp, exitCountry: check.exitCountry });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ accountName: account.accountName, proxy: maskProxyUrl(account.proxy), ...check }, null, 2) };
      return {
        code: 0,
        stdout: `${account.accountName}: ${maskProxyUrl(account.proxy)} exits at ${check.exitIp}, in ${countryName(check.exitCountry)}, matching the account. Saved to Twenty.`,
      };
    } catch (error) {
      return refuseError("proxy check", error);
    }
  },
};
