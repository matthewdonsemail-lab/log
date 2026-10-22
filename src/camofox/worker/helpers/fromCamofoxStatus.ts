import { LISTING_STATUSES } from "../../../marketplace/listing/index.ts";
import type { ListingStatus } from "../../../marketplace/listing/index.ts";

export function fromCamofoxStatus(raw: string): ListingStatus {
  const camel = raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return (LISTING_STATUSES as string[]).includes(camel) ? (camel as ListingStatus) : "unknown";
}
