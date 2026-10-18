/** Human renderers for listings. Pure, so tests assert text. */
import type { ConnectionRecord } from "../../../marketplace/account/index.ts";
import { LISTING_STATUS_LABELS, getSellerActions } from "../../../marketplace/listing/index.ts";
import type { ListingRecord } from "../../../marketplace/listing/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

/** "Removed (platform)" vs "Removed (seller)" — the provenance matters for relisting. */
export function renderStatus(listing: ListingRecord): string {
  const label = LISTING_STATUS_LABELS[listing.status];
  return listing.status === "removed" && listing.removedBy ? `${label} (${listing.removedBy})` : label;
}

export function renderListingsTable(listings: ListingRecord[]): string {
  if (listings.length === 0) return "No listings match.";
  return renderTable(
    ["Listing ID", "Title", "Price", "Status", "Account", "Location", "Published"],
    listings.map((row) => [
      row.listingId,
      row.title,
      `€${row.price}`,
      renderStatus(row),
      row.account,
      row.location,
      row.publishedAt.slice(0, 10),
    ]),
  );
}

export function renderListingDetail(listing: ListingRecord, accounts: ConnectionRecord[]): string {
  const offered = Object.entries(getSellerActions(listing, accounts))
    .filter(([, allowed]) => allowed)
    .map(([name]) => name);
  const point = listing.locationPoint;
  const lines = [
    listing.title,
    "",
    `  Listing ID  ${listing.listingId}`,
    `  Price       €${listing.price}`,
    `  Category    ${listing.category}`,
    `  Condition   ${listing.condition ?? "n/a"}`,
    `  Status      ${renderStatus(listing)}`,
    `  Account     ${listing.account} (${listing.accountId})`,
    `  Location    ${listing.location}`,
    point ? `  Pin         ${point.lat}, ${point.lng} · ${point.radiusKm} km radius` : null,
    `  Published   ${listing.publishedAt}`,
    `  URL         ${listing.listingUrl}`,
    `  Photos      ${listing.images.length}`,
    ...listing.images.map((image) => `    ${image}`),
    `  Actions     ${offered.join(", ")}`,
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}
