/**
 * `log listings` and `log listing <id>` — the Facebook Marketplace listings,
 * the same rows the dashboard's Listings view loads.
 */
import { LISTING_STATUSES, filterListings, findListing, getSellerActions } from "../../marketplace/listing/index.ts";
import type { ListingStatus } from "../../marketplace/listing/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderListingDetail, renderListingsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LISTINGS_USAGE = "Usage: log listings [--status <status>] [--account <accountId>] [--json]";
export const LISTING_USAGE = "Usage: log listing <listingId> [--json]";
export const listingsCommand: Command = {
  name: "listings",
  summary: "List Marketplace listings, optionally filtered by status or account",
  args: "[--status <s>] [--account <id>] [--json]",
  run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["status", "account"] });
    if (!parsed.ok) return { code: 1, stderr: `log listings: ${parsed.error}\n${LISTINGS_USAGE}` };
    if (parsed.positionals.length > 0) {
      return { code: 1, stderr: `log listings: unexpected argument "${parsed.positionals[0]}"\n${LISTINGS_USAGE}` };
    }

    const status = parsed.flags["status"] as string | undefined;
    if (status !== undefined && !(LISTING_STATUSES as string[]).includes(status)) {
      return { code: 1, stderr: `log listings: status must be one of: ${LISTING_STATUSES.join(", ")}` };
    }

    const data = context.load();
    const accountId = parsed.flags["account"] as string | undefined;
    if (accountId !== undefined && !data.accounts.some((account) => account.id === accountId)) {
      return {
        code: 1,
        stderr: `log listings: unknown account "${accountId}". Known: ${data.accounts.map((a) => a.id).join(", ")}`,
      };
    }

    const listings = filterListings(data.listings, { status: status as ListingStatus | undefined, accountId });
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ listings }, null, 2) };
    return { code: 0, stdout: renderListingsTable(listings) };
  },
};

export const listingCommand: Command = {
  name: "listing",
  summary: "Show one listing and the seller actions it allows",
  args: "<listingId> [--json]",
  run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok) return { code: 1, stderr: `log listing: ${parsed.error}\n${LISTING_USAGE}` };
    const [key, extra] = parsed.positionals;
    if (key === undefined) return { code: 1, stderr: `log listing: a listing id is required\n${LISTING_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log listing: unexpected argument "${extra}"\n${LISTING_USAGE}` };

    const data = context.load();
    const listing = findListing(data.listings, key);
    if (!listing) {
      return { code: 1, stderr: `log listing: no listing "${key}". Run \`log listings\` to see the ids.` };
    }
    if (parsed.flags["json"]) {
      return { code: 0, stdout: JSON.stringify({ listing, actions: getSellerActions(listing, data.accounts) }, null, 2) };
    }
    return { code: 0, stdout: renderListingDetail(listing, data.accounts) };
  },
};
