/**
 * A group read in Twenty (rule 65, obris-dev/openmagpie#188): only where the reads have got to is kept, on the
 * group's `agencyGroups` row (`readCursor`, `lastReadAt`, `lastReadReason`). The posts go to OpenMagpie, which
 * keeps every one and sends only its matches to Twenty's `socialListening`; log-cli writes no post or comment to
 * Twenty (`agencyGroupPosts` and `agencyGroupComments` stay, unused, matt 2026-10-22). Nothing here touches
 * Facebook.
 *
 *   readStateOf    before a read: the row's cursor
 *   saveRead       after it: the cursor (only when the feed was settled), when it was read, and what it found
 */
import type { TwentyClient, TwentyObjects } from "../../../twenty/graphql/index.ts";
import type { GroupReadOutput, ReadCursor } from "./types.ts";

const EMPTY_CURSOR: ReadCursor = { lastPostId: null, watermark: null, idsAtWatermark: [] };

/** `agencyGroups.readCursor` → the cursor; anything unreadable is a first read. Pure. */
export function cursorOf(raw: unknown): ReadCursor {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    lastPostId: typeof value.lastPostId === "string" ? value.lastPostId : null,
    watermark: typeof value.watermark === "number" ? value.watermark : null,
    idsAtWatermark: Array.isArray(value.idsAtWatermark) ? value.idsAtWatermark.filter((id): id is string => typeof id === "string") : [],
    // Kept only when the row has them: a cursor written before reads by the time rule once (`seenBy`).
    ...(Array.isArray(value.seenIds) ? { seenIds: value.seenIds.filter((id): id is string => typeof id === "string") } : {}),
  };
}

/**
 * Before a read: where the last one stopped. No post's comment count is kept in Twenty any more (rule 65), so a
 * read by hand that reads comments opens each new post that has any.
 */
export async function readStateOf(twenty: TwentyClient, groupRowId: string): Promise<{ cursor: ReadCursor; commentsRead: Record<string, number> }> {
  const row = await twenty.get("agencyGroups", groupRowId);
  return { cursor: row ? cursorOf(row.readCursor) : EMPTY_CURSOR, commentsRead: {} };
}

export interface SavedRead {
  cursorMoved: boolean;
}

/**
 * After a read: the group row's `lastReadAt` and `lastReadReason`, its numeric id once the page gave it, and the
 * cursor, which moves only when the feed was settled (a stopped read is read again from the same place).
 */
export async function saveRead(twenty: TwentyClient, groupRowId: string, output: GroupReadOutput, reason: string, now: Date): Promise<SavedRead> {
  const group: TwentyObjects["agencyGroups"]["update"] = { lastReadAt: now.toISOString(), lastReadReason: reason };
  if (output.groupId) Object.assign(group, { facebookGroupId: output.groupId, groupUrl: `https://www.facebook.com/groups/${output.groupId}/` });
  if (output.feedDone) group.readCursor = output.cursor as unknown as Record<string, unknown>;
  await twenty.update("agencyGroups", groupRowId, group);
  return { cursorMoved: output.feedDone };
}
