/** Human renderers for the live camofox results. Pure, so tests assert text. */
import type { DoctorChecks, ScanResult } from "../../../camofox/worker/index.ts";
import type { LossReport } from "../../../marketplace/replacement/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

/** The dashboard cards as Facebook shows them. */
export function renderScan(scan: ScanResult): string {
  const lines: string[] = [];
  if (scan.listings.length === 0) {
    lines.push("No listing cards found on Marketplace > Selling.");
  } else {
    lines.push(
      renderTable(
        ["Listing ID", "Title", "Health", "Clicks"],
        scan.listings.map((row) => [row.listingId, row.title ?? "(no title)", row.health, String(row.clicks)]),
      ),
    );
  }
  if (scan.needsAttention.length > 0) {
    lines.push("", "Needs attention:", ...scan.needsAttention.map((title) => `  - ${title}`));
  }
  return lines.join("\n");
}

/** What losing (or flagging) an account did in Twenty. */
export function renderLoss(loss: LossReport): string {
  const lines = [`${loss.account.accountName} is now ${loss.status.toUpperCase()} in Twenty (kept, never deleted).`];
  if (loss.lost.length) lines.push(`${loss.lost.length} listing(s) moved to ACCOUNT_LOST.`);
  for (const r of loss.replacements) {
    lines.push(
      r.next && r.account
        ? `  "${r.old.title}" → new READY listing ${r.next.id} on ${r.account.accountName} (${r.account.homeCity ?? "?"}, ${r.account.homeCountry})`
        : `  "${r.old.title}" → no replacement: ${r.detail}`,
    );
  }
  if (loss.replacements.some((r) => r.next)) lines.push("Publish them with `log facebook campaign run --campaign <id>` (dry run unless --live).");
  return lines.join("\n");
}

export function renderDoctor(
  checks: DoctorChecks,
  accounts: { accountName: string; ready: boolean; why: string | null; hasCookies: boolean }[],
  twentyError: string | null,
): string {
  const mark = (ok: boolean) => (ok ? "ok  " : "MISS");
  const lines = [
    `${mark(true)} python ${checks.python}`,
    `${mark(!!checks.facebookCamofoxClient)} facebook-camofox-client ${checks.facebookCamofoxClient ?? checks.facebookCamofoxClientError ?? ""}`.trimEnd(),
    `${mark(!!checks.camoufoxBrowser)} Camoufox ${checks.camoufoxVersion ?? ""} ${checks.camoufoxBrowser ?? checks.camoufoxBrowserError ?? ""}`.trimEnd(),
    `${mark(!twentyError)} Twenty ${twentyError ? twentyError.split("\n")[0] : `${accounts.length} FACEBOOK account(s)`}`,
  ];
  if (accounts.length) {
    lines.push(
      "",
      renderTable(
        ["Account", "May run", "Cookies", "Why not"],
        accounts.map((a) => [a.accountName, a.ready ? "yes" : "no", a.hasCookies ? "yes" : "no", a.why ?? ""]),
      ),
    );
  }
  return lines.join("\n");
}
