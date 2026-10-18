/**
 * `log listings` and `log listing <id>` — the Marketplace listings in Twenty
 * (agencyListings): what each posts, from which account, and its last run.
 */
import { fromTwentyEnum, listFacebookAccounts, findAccount, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { getListing, LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import type { ListingFilter } from "../../marketplace/agencyListing/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderListingDetail, renderListingsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LISTINGS_USAGE = "Usage: log listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]";
export const LISTING_USAGE = "Usage: log listing <agencyListingId> [--json]";

export const listingsCommand: Command = {
  name: "listings",
  summary: "List the Twenty listings, by status, account or campaign",
  args: "[--status <s>] [--account <name>] [--campaign <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["status", "account", "campaign"] });
    if (!parsed.ok) return { code: 1, stderr: `log listings: ${parsed.error}\n${LISTINGS_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log listings: unexpected argument "${parsed.positionals[0]}"\n${LISTINGS_USAGE}` };
    const filters: ListingFilter[] = [];
    const status = parsed.flags["status"];
    if (typeof status === "string") {
      if (!(LISTING_STATUSES as readonly string[]).includes(fromTwentyEnum(status))) {
        return { code: 1, stderr: `log listings: status must be one of ${LISTING_STATUSES.map(toTwentyEnum).join(", ")}` };
      }
      filters.push({ status: { eq: toTwentyEnum(fromTwentyEnum(status)) as never } });
    }
    try {
      const accounts = await listFacebookAccounts(context.twenty);
      if (typeof parsed.flags["account"] === "string") filters.push({ socialAccountId: { eq: (await findAccount(context.twenty, parsed.flags["account"])).id } });
      if (typeof parsed.flags["campaign"] === "string") filters.push({ campaignId: { eq: parsed.flags["campaign"] } });
      const filter: ListingFilter | undefined = filters.length > 1 ? { and: filters } : filters[0];
      const listings = await listListingsWhere(context.twenty, filter);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ listings }, null, 2) };
      return { code: 0, stdout: renderListingsTable(listings, accounts) };
    } catch (error) {
      return refuseError("listings", error);
    }
  },
};

export const listingCommand: Command = {
  name: "listing",
  summary: "Show one Twenty listing: the ad, its account, location and last run",
  args: "<id> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok) return { code: 1, stderr: `log listing: ${parsed.error}\n${LISTING_USAGE}` };
    const [key, extra] = parsed.positionals;
    if (key === undefined) return { code: 1, stderr: `log listing: a listing id is required\n${LISTING_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log listing: unexpected argument "${extra}"\n${LISTING_USAGE}` };
    try {
      const listing = await getListing(context.twenty, key);
      if (!listing) return refuse("listing", "listingNotFound", key);
      const account = listing.socialAccountId ? await findAccount(context.twenty, listing.socialAccountId).catch(() => null) : null;
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ listing, account: account ? { accountName: account.accountName, status: account.status, homeCountry: account.homeCountry } : null }, null, 2) };
      return { code: 0, stdout: renderListingDetail(listing, account) };
    } catch (error) {
      return refuseError("listing", error);
    }
  },
};
