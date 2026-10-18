import type { ListingStatus, RemovalProvenance } from "../../../marketplace/listing/index.ts";
import type { DashboardHealth } from "../types.ts";

/**
 * Map a seller-dashboard badge onto the listing status vocabulary. Facebook
 * takedowns land in `removed` with `platform` provenance, so the listing
 * machine refuses a seller relist. Unknown stays unknown.
 */
export function toListingStatus(health: DashboardHealth): { status: ListingStatus; removedBy?: RemovalProvenance } {
  switch (health) {
    case "ACTIVE":
      return { status: "active" };
    case "UNDER_REVIEW":
      return { status: "underReview" };
    case "DUPLICATE_TAKEDOWN":
      return { status: "underReviewDuplicate" };
    case "SOLD":
      return { status: "sold" };
    case "DELETED_BY_FB":
    case "POLICY_VIOLATION":
    case "COMMERCE_BAN":
      return { status: "removed", removedBy: "platform" };
    case "CHECKPOINT_REQUIRED":
      return { status: "loginWall" };
    default:
      return { status: "unknown" };
  }
}
