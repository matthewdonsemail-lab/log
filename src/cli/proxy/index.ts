/**
 * `log proxy` — each account's proxy, the only way its browser reaches the
 * internet (AGENTS.md rule 12). Proxies live on the socialAccount in Twenty
 * (`proxy`, `homeCountry`); never in local files.
 *
 *   check    the exit IP and its country through the proxy, no browser;
 *            written to the account (proxyCheckedAt, proxyExitIp, proxyExitCountry)
 *   assign   a residential proxy from a provider (`--vendor twoCaptcha|byteful`,
 *            2Captcha by default) pinned to the account's home country and city,
 *            with a sticky session of its own. Checked first, saved to Twenty
 *            only if it really exits near home and is fast enough
 *   balance  every provider that is set up: traffic left, money balance
 *   static   Byteful's static (ISP) IPs on the account, each with where it is
 *
 * Provider-agnostic (`proxyVendor/vendor`): Twenty keeps one `proxy` URL per
 * account, whichever provider it is from.
 */
import { countryName, slowFacebookMs } from "../../camofox/proxy/index.ts";
import type { ProxyCheck } from "../../camofox/proxy/index.ts";
import { prepareRun } from "../../camofox/run/index.ts";
import { distanceKm, homeOf } from "../../marketplace/home/index.ts";
import { findAccount, listFacebookAccounts, maskProxyUrl, recordProxyCheck } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import {
  buildProxyUrl,
  gatewayHost,
  getBalance,
  getProxyAccount,
  pickPlace,
  searchPlaces,
  slug,
  sessionFor,
  twoCaptchaCredentials,
} from "../../proxyVendor/twoCaptcha/index.ts";
import type { TwoCaptchaPlace } from "../../proxyVendor/twoCaptcha/index.ts";
import { bytefulCredentials, getCreditCents, getResidentialSummary, pickCity, residentialProxyUrl, searchCities, staticProxies } from "../../proxyVendor/byteful/index.ts";
import type { BytefulCredentials } from "../../proxyVendor/byteful/index.ts";
import { parseVendor } from "../../proxyVendor/vendor/index.ts";
import { openAccount } from "../live/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandResult } from "../runner/types.ts";

/** How far from the home city an assigned proxy may exit. Lancaster → Kutztown is 97 km; the Texas miss was 2,000. */
export const MAX_PROXY_KM = 100;

/** Fresh 2Captcha sessions tried before giving up with proxyTooFar. */
export const PROXY_ATTEMPTS = 3;

export const PROXY_USAGE = [
  "Usage: log proxy check   --account <accountName> [--json]",
  "       log proxy assign  --account <accountName> | --missing  [--vendor twoCaptcha|byteful] [--city <city> [--region <state>] | --anyCity] [--minutes <1-120>] [--socks5]",
  "       log proxy balance [--json]",
  "       log proxy static  [--json]   (Byteful's static ISP IPs on the account, where each is)",
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

/**
 * Candidate proxies for one account, each checked through the proxy before it
 * is saved: it must exit in the home country (the check refuses otherwise),
 * within MAX_PROXY_KM of home, and be fast enough for Facebook. The first that
 * passes goes to Twenty's `proxy`; the misses are said. Any provider.
 */
async function saveFirstGood(
  context: CommandContext,
  account: FacebookAccount,
  centre: { latitude: number; longitude: number } | null,
  next: (attempt: number) => Promise<string>,
  where: string,
): Promise<{ ok: boolean; line: string }> {
  const misses: string[] = [];
  for (let attempt = 0; attempt < PROXY_ATTEMPTS; attempt++) {
    const url = await next(attempt);
    const checked = await checkProxy(context, { ...account, proxy: url });
    if (!checked.ok) {
      return { ok: false, line: `${account.accountName}: not saved. ${(checked.result.stderr ?? "").split("\n")[0].replace(/^log proxy: /, "")}` };
    }
    // A provider doesn't always honour the state and city it was asked for.
    const { latitude, longitude } = checked.check;
    const km = centre && latitude !== undefined && longitude !== undefined ? Math.round(distanceKm(centre, { latitude, longitude })) : null;
    if (km !== null && km > MAX_PROXY_KM) {
      misses.push(`${checked.check.exitIp} ${km} km away`);
      continue;
    }
    // Nor one too slow for Facebook: its pages would never get past the loading skeleton.
    const ms = checked.check.facebookMs;
    if (ms != null && ms > slowFacebookMs()) {
      misses.push(`${checked.check.exitIp} ${ms} ms per Facebook file`);
      continue;
    }
    await context.twenty.update("socialAccounts", account.id, { proxy: url });
    await recordProxyCheck(context.twenty, account.id, { exitIp: checked.check.exitIp, exitCountry: checked.check.exitCountry });
    const away = km !== null ? `, ${km} km from ${account.homeCity}` : "";
    return { ok: true, line: `${account.accountName}: ${maskProxyUrl(url)} → exits at ${checked.check.exitIp} in ${countryName(checked.check.exitCountry)} (${where}${away}). Saved to Twenty.` };
  }
  return { ok: false, line: `${account.accountName}: proxyTooFar: not saved. ${PROXY_ATTEMPTS} sessions exited over ${MAX_PROXY_KM} km from ${account.homeCity} or too slow for Facebook (${misses.join("; ")}). Try again, or --city/--region nearby.` };
}

/** Where to measure from: the home city's coordinates, unless --anyCity. */
function centreOf(account: FacebookAccount, anyCity: boolean): { latitude: number; longitude: number } | null {
  const home = homeOf(account);
  return home.ok && !anyCity ? home.home.coordinates : null;
}

/** One account → a checked Byteful residential proxy (sticky 24 hours, its city) saved to Twenty, or why not. */
async function assignByteful(
  context: CommandContext,
  account: FacebookAccount,
  creds: BytefulCredentials,
  proxyUserId: string,
  options: { city: string | null; anyCity: boolean; socks5: boolean },
): Promise<{ ok: boolean; line: string }> {
  if (account.platform !== "FACEBOOK") return { ok: false, line: `${account.accountName}: accountNotFacebook` };
  if (!account.homeCountry) return { ok: false, line: `${account.accountName}: noHomeCountry (set homeCountry in Twenty first)` };
  const country = account.homeCountry;
  const centre = centreOf(account, options.anyCity);
  const city = options.anyCity ? null : (options.city ?? account.homeCity);
  let cityId: number | null = null;
  let where = countryName(country);
  if (city) {
    const picked = pickCity(await searchCities(creds, city), city, centre);
    if (!picked) return { ok: false, line: `${account.accountName}: bytefulNoCity: Byteful's residential pool has no devices in "${city}" (use --city <a nearby city> or --anyCity)` };
    cityId = picked.cityId;
    where = `${picked.cityName}${picked.subdivisionId ? `, ${picked.subdivisionId.toUpperCase()}` : ""}, ${picked.nodes} devices`;
  }
  // Each list call is a new sticky session, so each attempt is another exit IP.
  const next = () => residentialProxyUrl(creds, { proxyUserId, country, cityId, ttl: "24h", protocol: options.socks5 ? "socks5" : "http" });
  return saveFirstGood(context, account, centre, next, where);
}

/** One account → a checked 2Captcha proxy saved to Twenty, or why not. */
async function assignOne(
  context: CommandContext,
  account: FacebookAccount,
  options: { username: string; password: string; city: string | null; region: string | null; anyCity: boolean; minutes: number; socks5: boolean },
): Promise<{ ok: boolean; line: string }> {
  if (account.platform !== "FACEBOOK") return { ok: false, line: `${account.accountName}: accountNotFacebook` };
  if (!account.homeCountry) return { ok: false, line: `${account.accountName}: noHomeCountry (set homeCountry in Twenty first)` };
  const country = account.homeCountry;
  const city = options.anyCity ? null : (options.city ?? account.homeCity);
  let place: TwoCaptchaPlace | null = null;
  if (city) {
    // 2Captcha writes `wilkes-barre` as `wilkesbarre`, so the slug is searched too.
    place = pickPlace(await searchPlaces(city), city, country, options.region);
    if (!place && slug(city) !== city.toLowerCase()) place = pickPlace(await searchPlaces(slug(city)), city, country, options.region);
    const inRegion = options.region ? `, ${options.region}` : "";
    if (!place) return { ok: false, line: `${account.accountName}: twoCaptchaNoPlace: 2Captcha has no "${city}"${inRegion} in ${countryName(country)} (use --city, --region or --anyCity)` };
  }
  // Measured from the home city even with --city: a nearby city is fine, a far one is not.
  const centre = centreOf(account, options.anyCity);
  const where = place ? `${place.city}, ${place.region}, ${countryName(country)}` : countryName(country);
  const next = async (attempt: number) =>
    buildProxyUrl({
      username: options.username,
      password: options.password,
      country,
      place,
      session: sessionFor(account.id, place, attempt),
      sessionMinutes: options.minutes,
      protocol: options.socks5 ? "socks5" : "http",
      host: gatewayHost(country),
    });
  return saveFirstGood(context, account, centre, next, where);
}

export const proxyCommand: Command = {
  name: "proxy",
  summary: "Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic",
  args: "<check|assign|balance|static> [--account <name>] [--vendor twoCaptcha|byteful] [...]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "missing", "anyCity", "socks5"], valued: ["account", "city", "region", "minutes", "vendor"] });
    if (!parsed.ok) return { code: 1, stderr: `log proxy: ${parsed.error}\n${PROXY_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (!action || extra !== undefined || !["check", "assign", "balance", "static"].includes(action)) {
      return { code: 1, stderr: `log proxy: pick check, assign, balance or static\n${PROXY_USAGE}` };
    }

    if (action === "balance") {
      // Every provider that is set up; one not set up is said, not refused.
      const creds = twoCaptchaCredentials();
      const apiKey = "apiKey" in creds ? creds.apiKey : (process.env["2CAPTCHA_API_KEY"] || process.env.TWOCAPTCHA_API_KEY || "").trim();
      const bytefulCreds = bytefulCredentials();
      if (!apiKey && "missing" in bytefulCreds) return refuse("proxy balance", "twoCaptchaNotConfigured", "2CAPTCHA_API_KEY or BYTEFUL_PUBLIC_KEY");
      try {
        const out: Record<string, unknown> = {};
        const lines: string[] = [];
        if (apiKey) {
          const [account, balance] = await Promise.all([getProxyAccount(apiKey), getBalance(apiKey)]);
          out.twoCaptcha = {
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
          lines.push(
            `2Captcha proxies ${account.status === 1 ? "active" : "NOT active"} (user ***)`,
            `  Traffic left  ${account.leftFlow}  (used ${account.usedFlow} of ${account.totalFlow})`,
            `  Balance       $${balance.balance}`,
            `  Proxy password ${"apiKey" in creds ? "set" : "MISSING: 2CAPTCHA_PROXY_PASSWORD in log-cli/.env.local"}`,
          );
        } else lines.push("2Captcha: not set up (2CAPTCHA_API_KEY)");
        if (!("missing" in bytefulCreds)) {
          const [summary, creditCents] = await Promise.all([getResidentialSummary(bytefulCreds), getCreditCents(bytefulCreds)]);
          const mb = (b: number) => Math.round(b / 1_000_000);
          out.byteful = { residentialMbLeft: mb(summary.bytesLeft), residentialMbUsed: mb(summary.bytesUsed), residentialMbTotal: mb(summary.bytes), proxyUsers: summary.proxyUserIds.length, creditUsd: creditCents / 100 };
          lines.push(
            `Byteful residential: ${mb(summary.bytesLeft)} MB left (used ${mb(summary.bytesUsed)} of ${mb(summary.bytes)} MB), ${summary.proxyUserIds.length} proxy user(s)`,
            `  Credit        $${(creditCents / 100).toFixed(2)} (API checkouts are paid from it)`,
          );
        } else lines.push(`Byteful: not set up (${bytefulCreds.missing})`);
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(out, null, 2) };
        return { code: 0, stdout: lines.join("\n") };
      } catch (error) {
        return refuseError("proxy balance", error);
      }
    }

    if (action === "static") {
      const bytefulCreds = bytefulCredentials();
      if ("missing" in bytefulCreds) return refuse("proxy static", "bytefulNotConfigured", bytefulCreds.missing);
      try {
        const proxies = await staticProxies(bytefulCreds);
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(proxies, null, 2) };
        if (!proxies.length) return { code: 0, stdout: "Byteful: no static IPs on the account yet." };
        return { code: 0, stdout: proxies.map((p) => `${p.ipAddress}  ${p.type}  ${[p.cityName, p.subdivisionName, p.countryId?.toUpperCase()].filter(Boolean).join(", ") || "location unknown"}  http ${p.httpPort ?? "-"} socks5 ${p.socks5Port ?? "-"}${p.online === false ? "  OFFLINE" : ""}`).join("\n") };
      } catch (error) {
        return refuseError("proxy static", error);
      }
    }

    if (action === "assign" && parseVendor(typeof parsed.flags["vendor"] === "string" ? parsed.flags["vendor"] : "twoCaptcha") === "byteful") {
      const bytefulCreds = bytefulCredentials();
      if ("missing" in bytefulCreds) return refuse("proxy assign", "bytefulNotConfigured", bytefulCreds.missing);
      try {
        const summary = await getResidentialSummary(bytefulCreds);
        if (!summary.proxyUserIds.length) return refuse("proxy assign", "bytefulRefused", "the residential plan has no proxy user (Byteful dashboard → Proxy users)");
        if (summary.bytesLeft <= 0) return refuse("proxy assign", "bytefulRefused", "the residential plan has no traffic left (log proxy balance)");
        let accounts: FacebookAccount[];
        if (parsed.flags["missing"]) {
          accounts = (await listFacebookAccounts(context.twenty)).filter((a) => !a.proxy);
          if (accounts.length === 0) return { code: 0, stdout: "Every FACEBOOK account already has a proxy." };
        } else if (typeof parsed.flags["account"] === "string") {
          accounts = [await findAccount(context.twenty, parsed.flags["account"])];
        } else {
          return { code: 1, stderr: `log proxy assign: --account <name> or --missing\n${PROXY_USAGE}` };
        }
        const options = { city: typeof parsed.flags["city"] === "string" ? parsed.flags["city"] : null, anyCity: Boolean(parsed.flags["anyCity"]), socks5: Boolean(parsed.flags["socks5"]) };
        const results = [];
        for (const account of accounts) results.push(await assignByteful(context, account, bytefulCreds, summary.proxyUserIds[0], options));
        const failed = results.filter((r) => !r.ok).length;
        return { code: failed ? 1 : 0, stdout: results.map((r) => r.line).join("\n") };
      } catch (error) {
        return refuseError("proxy assign", error);
      }
    }

    if (action === "assign" && typeof parsed.flags["vendor"] === "string" && parseVendor(parsed.flags["vendor"]) === null) {
      return { code: 1, stderr: `log proxy assign: --vendor is twoCaptcha or byteful\n${PROXY_USAGE}` };
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
          region: typeof parsed.flags["region"] === "string" ? parsed.flags["region"] : null,
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
        stdout: `${account.accountName}: ${maskProxyUrl(account.proxy)} exits at ${check.exitIp}, in ${countryName(check.exitCountry)}, matching the account. Saved to Twenty.` +
          (check.facebookMs != null ? `\nFacebook through it: ${check.facebookMs} ms per file${check.facebookMs > slowFacebookMs() ? ` (too slow, over ${slowFacebookMs()} ms: launches are refused with proxyTooSlow; run log proxy assign --account ${account.accountName})` : ""}.` : ""),
      };
    } catch (error) {
      return refuseError("proxy check", error);
    }
  },
};
