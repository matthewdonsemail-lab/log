import { copyVersionsOf, lintVersions, skipWordsOf } from "../../../facebook/marketplace/copy/index.ts";
import { toPublishListing } from "../../../marketplace/agencyListing/index.ts";
import type { AgencyListing, ListingCondition } from "../../../marketplace/agencyListing/index.ts";

const CONDITIONS: readonly ListingCondition[] = ["new", "usedLikeNew", "usedGood", "usedFair"];

export function listingFromJson(raw: unknown): { ok: true; ad: AgencyListing } | { ok: false; problems: string[] } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, problems: ["the file must hold one JSON object"] };
  const value = raw as Record<string, unknown>;
  const text = (key: string) => (typeof value[key] === "string" && (value[key] as string).trim() ? (value[key] as string).trim() : null);
  const condition = text("condition");
  if (condition && !(CONDITIONS as readonly string[]).includes(condition)) return { ok: false, problems: [`condition must be one of ${CONDITIONS.join(", ")}`] };
  const photos = Array.isArray(value["photos"]) ? value["photos"].filter((p): p is string => typeof p === "string") : [];
  const versions = copyVersionsOf(value["copyVersions"]);
  if (value["copyVersions"] !== undefined && versions.length !== (Array.isArray(value["copyVersions"]) ? value["copyVersions"].length : -1)) {
    return { ok: false, problems: ["copyVersions must be a list of { id, title, description }, all three text"] };
  }
  const first = versions[0];
  if (first && text("title") && text("title") !== first.title) return { ok: false, problems: ["title must be the first copy version's title, or left out"] };
  if (first && text("description") && text("description") !== first.description) return { ok: false, problems: ["description must be the first copy version's description, or left out"] };
  const ad: AgencyListing = {
    id: "",
    title: first?.title ?? text("title") ?? "",
    description: first?.description ?? text("description"),
    price: typeof value["price"] === "number" ? value["price"] : null,
    priceCurrency: text("priceCurrency"),
    category: text("category"),
    condition: condition as ListingCondition | null,
    photos,
    locationQuery: text("locationQuery"),
    locationCity: text("locationCity"),
    locationCountry: text("locationCountry")?.toUpperCase() ?? null,
    locationPostalCode: text("locationPostalCode"),
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
    copyVersions: versions,
    copyVersionId: null,
  };
  const copyProblems = lintVersions(versions, ad.locationCity, skipWordsOf(ad.locationCity, ad.locationQuery)).map((p) => `copy version ${p.versionId}: ${p.detail}`);
  if (copyProblems.length) return { ok: false, problems: copyProblems };
  const checked = toPublishListing(ad);
  return checked.ok ? { ok: true, ad } : { ok: false, problems: checked.problems };
}
