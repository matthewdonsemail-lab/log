/** Human renderers for Twenty agencyListings. Pure. */
import type { AgencyListing } from "../../../marketplace/agencyListing/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

const upper = (value: string | null) => (value ? value.replace(/([A-Z])/g, "_$1").toUpperCase() : "unset");

export function renderListingsTable(listings: AgencyListing[], accounts: FacebookAccount[]): string {
  if (listings.length === 0) return "No listings match.";
  const name = (id: string | null) => (id ? (accounts.find((a) => a.id === id)?.accountName ?? id.slice(0, 8)) : "-");
  return renderTable(
    ["Id", "Title", "Status", "Account", "Location", "Gen", "Facebook id", "Last run"],
    listings.map((l) => [
      l.id,
      l.title.length > 32 ? `${l.title.slice(0, 31)}…` : l.title,
      upper(l.status),
      name(l.socialAccountId),
      l.locationQuery ?? "-",
      String(l.generation),
      l.listingId ?? "-",
      l.lastRunResult ? `${upper(l.lastRunResult)}${l.lastErrorCode ? ` ${l.lastErrorCode}` : ""}` : "-",
    ]),
  );
}

export function renderListingDetail(l: AgencyListing, account: FacebookAccount | null): string {
  return [
    `${l.title}`,
    `  Twenty id    ${l.id}`,
    `  Status       ${upper(l.status)}`,
    `  Account      ${account ? `${account.accountName} (${account.status ? account.status.toUpperCase() : "unset"}, ${account.homeCity ?? "?"}, ${account.homeCountry ?? "?"})` : "none"}`,
    `  Campaign     ${l.campaignId ?? "-"}`,
    `  Price        ${l.price ?? "?"} ${l.priceCurrency ?? ""}`.trimEnd(),
    `  Category     ${l.category ?? "?"}   condition ${upper(l.condition)}`,
    `  Location     ${l.locationQuery ?? "?"}  (${l.locationCity ?? "?"}, ${l.locationCountry ?? "?"})`,
    `  Photos       ${l.photos.length}`,
    `  Facebook     ${l.listingId ? `${l.listingId}  ${l.listingUrl ?? ""}` : "not published"}`,
    `  Generation   ${l.generation}${l.replacesId ? `  (replaces ${l.replacesId})` : ""}`,
    `  Last run     ${l.lastRunAt ? `${l.lastRunAt}  ${upper(l.lastRunResult)}${l.lastErrorCode ? `  ${l.lastErrorCode}: ${l.lastError ?? ""}` : ""}` : "never"}`,
  ].join("\n");
}
