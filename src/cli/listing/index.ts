import { readFileSync } from "node:fs";
import { loadFlow } from "../../browser/flow/index.ts";
import { setListingStatus } from "../../marketplace/agencyListing/index.ts";
import { runFlow } from "../flow/index.ts";
import { fromTwentyEnum, listFacebookAccounts, findAccount, toTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { countryMismatch, createSlot, getListing, LISTING_STATUSES, listListingsWhere } from "../../marketplace/agencyListing/index.ts";
import type { AgencyListing } from "../../marketplace/agencyListing/index.ts";
import type { ListingFilter } from "../../marketplace/agencyListing/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { listingFromJson, renderListingDetail, renderListingsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const LISTINGS_USAGE = "Usage: log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]";
export const LISTING_USAGE = [
  "Usage: log facebook listing <agencyListingId> [--json]",
  "       log facebook listing create --account <accountName> --file <listing.json> [--json]",
  "       log facebook listing lint --file <listing.json> [--json]   (the copy rules on the file's copy versions, and whether it would publish; nothing is saved)",
  "       log facebook listing remove <agencyListingId|facebookListingId> [--live] [--bypass] [--now] [--json]   (delete it on Facebook through the recorded flow marketplaceListingDelete, then REMOVED in Twenty; a dry run unless --live)",
  "The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).",
].join("\n");

export const LISTINGS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "List the Twenty listings",
      positionals: [],
      flags: [
        { name: "status", kind: "enum", values: LISTING_STATUSES.map(toTwentyEnum), description: "Only listings in this status" },
        { name: "account", kind: "string", description: "Only this account's listings" },
        { name: "campaign", kind: "string", description: "Only this campaign's listings (its id)" },
        JSON_FLAG,
      ],
    },
  ],
};

export const listingsCommand: Command = {
  usage: LISTINGS_USAGE,
  platform: "facebook",
  name: "listings",
  effect: "read",
  input: LISTINGS_INPUT,
  summary: "List the Twenty listings, by status, account or campaign",
  args: "[--status <s>] [--account <name>] [--campaign <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LISTINGS_INPUT));
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

export const LISTING_INPUT: CommandInput = {
  forms: [
    { words: [], summary: "One listing in full", positionals: [{ name: "id", kind: "string", required: true, description: "The agencyListing id" }], flags: [JSON_FLAG] },
    {
      words: ["create"], effect: "write",
      summary: "Create a listing in Twenty from a listing.json",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account that will publish it" },
        { name: "file", kind: "string", required: true, description: "The listing.json path: title, description, price, priceCurrency, category, condition, photos, locationQuery, locationCity, locationCountry, locationPostalCode, copyVersions" },
        JSON_FLAG,
      ],
    },
    {
      words: ["remove"], effect: "browser",
      summary: "Delete a listing on Facebook from its account's Selling page, then set it REMOVED in Twenty (the row stays); a dry run unless live",
      positionals: [{ name: "listing", kind: "string", required: true, description: "The agencyListing id, or the Facebook listing id" }],
      flags: [
        { name: "live", kind: "boolean", live: true, description: "Delete it on Facebook, only when matt asked (rule 8)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when matt asked (rule 20)" },
        { name: "now", kind: "boolean", description: "Skip the 10-minute launch gap only (rule 24)" },
        JSON_FLAG,
      ],
    },
    {
      words: ["lint"],
      summary: "Check a listing.json against the copy rules and the create form, saving nothing",
      positionals: [],
      flags: [{ name: "file", kind: "string", required: true, description: "The listing.json path" }, JSON_FLAG],
    },
  ],
};

export const listingCommand: Command = {
  usage: LISTING_USAGE,
  platform: "facebook",
  name: "listing",
  effect: "read",
  input: LISTING_INPUT,
  summary: "Show one Twenty listing, or create one for an account from a JSON file",
  args: "<id> | create --account <name> --file <listing.json> | lint --file <listing.json> | remove <id> [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LISTING_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log facebook listing: ${parsed.error}\n${LISTING_USAGE}` };
    const [key, extra] = parsed.positionals;
    if (key === "lint") {
      const file = parsed.flags["file"];
      if (typeof file !== "string") return { code: 1, stderr: `log facebook listing lint: --file is required\n${LISTING_USAGE}` };
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(file, "utf8"));
      } catch (error) {
        return { code: 1, stderr: `log facebook listing lint: can't read ${file}: ${error instanceof Error ? error.message : String(error)}` };
      }
      const checked = listingFromJson(raw);
      if (parsed.flags["json"]) return { code: checked.ok ? 0 : 1, stdout: JSON.stringify(checked.ok ? { ok: true, copyVersions: checked.ad.copyVersions.map((v) => v.id) } : { ok: false, problems: checked.problems }, null, 2) };
      if (!checked.ok) return { code: 1, stdout: [`${file}: ${checked.problems.length} problem(s)`, ...checked.problems.map((p) => `  - ${p}`)].join("\n") };
      const n = checked.ad.copyVersions.length;
      return { code: 0, stdout: `${file}: passes${n ? `, ${n} copy version(s) (${checked.ad.copyVersions.map((v) => v.id).join(", ")}), enough for ${n} listing(s) live in one city` : ", no copy versions: fine on one account, a campaign over 1 listing in a city needs at least 3"}.` };
    }
    if (key === "remove") return removeListing(context, extra, parsed.flags);
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

export const REMOVABLE_STATUSES = ["active", "underReview", "unconfirmed", "sold", "duplicateTakedown"] as const;

async function removeListing(context: Parameters<Command["run"]>[0], ref: string | undefined, flags: Record<string, string | true>) {
  if (!ref) return { code: 1, stderr: `log facebook listing remove: give the listing\n${LISTING_USAGE}` };
  try {
    const listing = (await getListing(context.twenty, ref).catch(() => null)) ?? (await listListingsWhere(context.twenty, { listingId: { eq: ref } }))[0] ?? null;
    if (!listing) return refuse("listing", "listingNotFound", ref);
    if (!listing.listingId) return refuse("listing", "listingNotRemovable", `${listing.id} has no Facebook listing id: it was never published, so there is nothing to delete on Facebook`);
    if (!listing.status || !(REMOVABLE_STATUSES as readonly string[]).includes(listing.status)) return refuse("listing", "listingNotRemovable", `${listing.id} is ${toTwentyEnum(listing.status ?? "unknown")}: only ${REMOVABLE_STATUSES.map(toTwentyEnum).join(", ")} listings are deleted on Facebook`);
    if (!listing.socialAccountId) return refuse("listing", "listingNotRemovable", `${listing.id} has no account`);
    const account = await findAccount(context.twenty, listing.socialAccountId);
    const flow = loadFlow("marketplaceListingDelete");
    if (!flow) return { code: 1, stderr: "log facebook listing remove: the flow marketplaceListingDelete is missing (src/browser/flow/definitions)" };
    const values = { listingTitle: listing.title ?? "", listingId: listing.listingId };
    const after = async () => {
      await setListingStatus(context.twenty, listing.id, "removed", { lastRunAt: new Date().toISOString(), lastErrorCode: null, lastError: null });
      return [`Facebook answered the delete for listing ${listing.listingId}. ${listing.id} is now REMOVED in Twenty (kept, never deleted, rule 13).`];
    };
    const result = await runFlow(context, flow, values, { ...flags, account: account.accountName }, after);
    if (!flags["live"]) return { ...result, stdout: [`${listing.title} (${listing.listingId}) on ${account.accountName}, ${toTwentyEnum(listing.status)} in Twenty.`, result.stdout ?? "", "Then: REMOVED in Twenty, only once Facebook's answer names this listing's id."].join("\n") };
    return result;
  } catch (error) {
    return refuseError("listing", error);
  }
}

