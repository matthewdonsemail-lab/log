/** Human renderers for Facebook accounts. Pure. Never prints a proxy password or cookies. */
import { checkRunnable, maskProxyUrl, toFacebookCookies } from "../../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import { deviceSummary, toDeviceProfile } from "../../../camofox/device/index.ts";
import { activeWindow, hourLabel } from "../../../marketplace/home/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

/** An account for --json output: no cookies, browser storage, proxy or device, only whether they are there. */
export function safeAccount(a: FacebookAccount): Record<string, unknown> {
  const { cookies: _cookies, storageOrigins: _storage, proxy, deviceProfile, ...rest } = a;
  return { ...rest, hasProxy: Boolean(proxy), hasDevice: toDeviceProfile(deviceProfile) !== null };
}

export function renderAccountsTable(accounts: FacebookAccount[]): string {
  if (accounts.length === 0) return "No FACEBOOK socialAccounts in Twenty yet. docs/vendors/README.md says how to add one.";
  return renderTable(
    ["Account", "Status", "Home", "Proxy", "Exit", "Cookies", "May run"],
    accounts.map((a) => {
      const check = checkRunnable(a, "run");
      return [
        a.accountName,
        a.status ? a.status.toUpperCase() : "unset",
        a.homeCity || a.homeCountry ? `${a.homeCity ?? "?"}, ${a.homeCountry ?? "?"}` : "unset",
        a.proxy ? "set" : "NONE",
        a.proxyExitCountry ? `${a.proxyExitCountry}${a.proxyCheckedAt ? ` ${a.proxyCheckedAt.slice(0, 10)}` : ""}` : "unchecked",
        toFacebookCookies(a.cookies).length ? "yes" : "no",
        check.ok ? "yes" : check.code,
      ];
    }),
  );
}

export function renderAccountDetail(a: FacebookAccount): string {
  const check = checkRunnable(a, "run");
  return [
    `${a.accountName}  (${a.label})`,
    `  Twenty id      ${a.id}`,
    `  Status         ${a.status ? a.status.toUpperCase() : "unset"}${a.statusReason ? `  (${a.statusReason}${a.statusDetail ? `: ${a.statusDetail}` : ""})` : ""}`,
    `  Home           ${a.homeCity ?? "?"}, ${a.homeCountry ?? "?"}`,
    `  Proxy          ${a.proxy ? maskProxyUrl(a.proxy) : "NONE: no browser opens for this account"}`,
    `  Last check     ${a.proxyCheckedAt ? `${a.proxyExitIp ?? "?"} in ${a.proxyExitCountry ?? "?"} at ${a.proxyCheckedAt}` : "never (log proxy check)"}`,
    `  Cookies        ${toFacebookCookies(a.cookies).length} saved`,
    `  Daily cap      ${a.dailyListingCap}   last posted ${a.lastPostedAt ?? "never"}`,
    `  Device         ${deviceSummary(toDeviceProfile(a.deviceProfile))}`,
    `  Active hours   ${(({ start, end }) => `${hourLabel(start)}-${hourLabel(end)}`)(activeWindow(a))} local`,
    `  Vendor         ${a.vendor ?? "-"}`,
    `  May run        ${check.ok ? "yes" : `no: ${check.code} (${check.detail})`}`,
  ].join("\n");
}
