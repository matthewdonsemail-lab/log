import { LISTING_STATUSES } from "../../../marketplace/listing/index.ts";
import type { ListingStatus } from "../../../marketplace/listing/index.ts";

/**
 * facebook-camofox-client `classify_status` speaks kebab-case
 * (`under-review-duplicate`). log-cli is camelCase everywhere, so the
 * worker boundary converts it once, here. Unknown stays unknown. Pure.
 */
export function fromCamofoxStatus(raw: string): ListingStatus {
  const camel = raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return (LISTING_STATUSES as string[]).includes(camel) ? (camel as ListingStatus) : "unknown";
}
