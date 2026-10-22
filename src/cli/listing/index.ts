/**
 * `log facebook listings` and `log facebook listing <id>` — the Marketplace listings in Twenty
 * (agencyListings): what each posts, from which account, and its last run.
 * `log facebook listing create` adds one READY row for an account (Twenty only, nothing
 * on Facebook until `log facebook publish`).
 */
import { readFileSync } from "node:fs";
import { fromTwentyEnum, listFacebookAccounts, findAccount, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { countryMismatch, createSlot, getListing, LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import type { AgencyListing } from "../../marketplace/agencyListing/index.ts";
import type { ListingFilter } from "../../marketplace/agencyListing/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { listingFromJson, renderListingDetail, renderListingsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LISTINGS_USAGE = "Usage: log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]";
export const LISTING_USAGE = [
  "Usage: log facebook listing <agencyListingId> [--json]",
  "       log facebook listing create --account <accountName> --file <listing.json> [--json]",
  "The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery, locationCity, locationCountry, locationPostalCode (the zip: Facebook finds a US city by it).",
].join("\n");

export const listingsCommand: Command = {
  usage: LISTINGS_USAGE,
  platform: "facebook",
  name: "listings",
  summary: "List the Twenty listings, by status, account or campaign",
  args: "[--status <s>] [--account <name>] [--campaign <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["status", "account", "campaign"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook listings: ${parsed.error}\n${LISTINGS_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log facebook listings: unexpected argument "${parsed.positionals[0]}"\n${LISTINGS_USAGE}` };
    const filters: ListingFilter[] = [];
    const status = parsed.flags["status"];
    if (typeof status === "string") {
      if (!(LISTING_STATUSES as readonly string[]).includes(fromTwentyEnum(status))) {
        return { code: 1, stderr: `log facebook listings: status must be one of ${LISTING_STATUSES.map(toTwentyEnum).join(", ")}` };
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
  usage: LISTING_USAGE,
  platform: "facebook",
  name: "listing",
  summary: "Show one Twenty listing, or create one for an account from a JSON file",
  args: "<id> | create --account <name> --file <listing.json> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account", "file"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook listing: ${parsed.error}\n${LISTING_USAGE}` };
    const [key, extra] = parsed.positionals;
    if (key === "create") {
      const account = parsed.flags["account"];
      const file = parsed.flags["file"];
      if (typeof account !== "string" || typeof file !== "string") return { code: 1, stderr: `log facebook listing create: --account and --file are required\n${LISTING_USAGE}` };
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(file, "utf8"));
      } catch (error) {
        return { code: 1, stderr: `log facebook listing create: can't read ${file}: ${error instanceof Error ? error.message : String(error)}` };
      }
      const checked = listingFromJson(raw);
      if (!checked.ok) return { code: 1, stderr: `log facebook listing create: ${file} can't be published:\n${checked.problems.map((p) => `  - ${p}`).join("\n")}` };
      try {
        const owner = await findAccount(context.twenty, account);
        // The same country check publish runs (rule 12), so a row that can never post isn't written.
        const mismatch = owner.homeCountry ? countryMismatch(checked.ad as unknown as AgencyListing, owner.homeCountry) : "the account has no home country";
        if (mismatch) return refuse("listing", "listingCountryMismatch", mismatch);
        const created = await createSlot(context.twenty, checked.ad, owner.id, { campaignId: null });
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ listing: created }, null, 2) };
        return { code: 0, stdout: `Created ${created.id} (READY) for ${owner.accountName}: ${created.title}\nNext: log facebook publish --listing ${created.id}` };
      } catch (error) {
        return refuseError("listing", error);
      }
    }
    if (parsed.flags["account"] !== undefined || parsed.flags["file"] !== undefined) return { code: 1, stderr: `log facebook listing: --account and --file are for \`log facebook listing create\`\n${LISTING_USAGE}` };
    if (key === undefined) return { code: 1, stderr: `log facebook listing: a listing id is required\n${LISTING_USAGE}` };
    if (extra !== undefined) return { code: 1, stderr: `log facebook listing: unexpected argument "${extra}"\n${LISTING_USAGE}` };
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
