import { toPublishListing } from "../../../marketplace/agencyListing/index.ts";
import type { AgencyListing, ListingCondition } from "../../../marketplace/agencyListing/index.ts";

const CONDITIONS: readonly ListingCondition[] = ["new", "usedLikeNew", "usedGood", "usedFair"];

/**
 * A `log listing create --file` JSON → the ad to copy onto an account, checked
 * the way `log publish` will check it, so a row that can't post is never made. Pure.
 */
export function listingFromJson(raw: unknown): { ok: true; ad: AgencyListing } | { ok: false; problems: string[] } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, problems: ["the file must hold one JSON object"] };
  const value = raw as Record<string, unknown>;
  const text = (key: string) => (typeof value[key] === "string" && (value[key] as string).trim() ? (value[key] as string).trim() : null);
  const condition = text("condition");
  if (condition && !(CONDITIONS as readonly string[]).includes(condition)) return { ok: false, problems: [`condition must be one of ${CONDITIONS.join(", ")}`] };
  const photos = Array.isArray(value["photos"]) ? value["photos"].filter((p): p is string => typeof p === "string") : [];
  const ad: AgencyListing = {
    id: "",
    title: text("title") ?? "",
    description: text("description"),
    price: typeof value["price"] === "number" ? value["price"] : null,
    priceCurrency: text("priceCurrency"),
    category: text("category"),
    condition: condition as ListingCondition | null,
    photos,
    locationQuery: text("locationQuery"),
    locationCity: text("locationCity"),
    locationCountry: text("locationCountry")?.toUpperCase() ?? null,
    status: null,
    socialAccountId: null,
    campaignId: null,
    replacesId: null,
    generation: 0,
    listingId: null,
    listingUrl: null,
    publishedAt: null,
    lastRunAt: null,
    lastRunResult: null,
    lastErrorCode: null,
    lastError: null,
    clicksCount: null,
    lastCheckedAt: null,
  };
  const checked = toPublishListing(ad);
  return checked.ok ? { ok: true, ad } : { ok: false, problems: checked.problems };
}
