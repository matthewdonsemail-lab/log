/** Human renderers for the live camofox results. Pure, so tests assert text. */
import { toListingStatus } from "../../../camofox/worker/index.ts";
import type { DoctorChecks, ScanResult } from "../../../camofox/worker/index.ts";
import { LISTING_STATUS_LABELS } from "../../../marketplace/listing/index.ts";
import type { ListingRecord } from "../../../marketplace/listing/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

/** Live dashboard rows next to what log's data says for the same listing id. */
export function renderScan(scan: ScanResult, known: ListingRecord[]): string {
  const lines: string[] = [];
  if (scan.listings.length === 0) {
    lines.push("No listing cards found on Marketplace > Selling.");
  } else {
    lines.push(
      renderTable(
        ["Listing ID", "Title", "Live status", "Clicks", "In log"],
        scan.listings.map((row) => {
          const live = toListingStatus(row.health);
          const label = LISTING_STATUS_LABELS[live.status] + (live.removedBy ? ` (${live.removedBy})` : "");
          const match = known.find((listing) => listing.listingId === row.listingId);
          return [
            row.listingId,
            row.title ?? "(no title)",
            label,
            String(row.clicks),
            match ? LISTING_STATUS_LABELS[match.status] : "not in log",
          ];
        }),
      ),
    );
  }
  if (scan.needsAttention.length > 0) {
    lines.push("", "Needs attention:", ...scan.needsAttention.map((title) => `  - ${title}`));
  }
  return lines.join("\n");
}

export function renderDoctor(checks: DoctorChecks, sessions: { accountId: string; path: string; exists: boolean }[]): string {
  const mark = (ok: boolean) => (ok ? "ok  " : "MISS");
  return [
    `${mark(true)}  python ${checks.python}`,
    `${mark(Boolean(checks.facebookCamofoxClient))}  facebook-camofox-client  ${checks.facebookCamofoxClient ?? checks.facebookCamofoxClientError ?? ""}`,
    `${mark(Boolean(checks.camoufoxBrowser))}  camoufox browser ${checks.camoufoxVersion ?? ""}  ${checks.camoufoxBrowser ?? checks.camoufoxBrowserError ?? ""}`,
    "",
    "Facebook sessions:",
    ...sessions.map((s) => `  ${mark(s.exists)}  ${s.accountId}  ${s.exists ? s.path : `run: log login --account ${s.accountId}`}`),
  ].join("\n");
}
