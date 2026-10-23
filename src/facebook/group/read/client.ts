import type { TwentyClient, TwentyObjects } from "../../../twenty/graphql/index.ts";
import type { GroupReadOutput, ReadCursor } from "./types.ts";

const EMPTY_CURSOR: ReadCursor = { lastPostId: null, watermark: null, idsAtWatermark: [] };

export function cursorOf(raw: unknown): ReadCursor {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    lastPostId: typeof value.lastPostId === "string" ? value.lastPostId : null,
    watermark: typeof value.watermark === "number" ? value.watermark : null,
    idsAtWatermark: Array.isArray(value.idsAtWatermark) ? value.idsAtWatermark.filter((id): id is string => typeof id === "string") : [],
    ...(Array.isArray(value.seenIds) ? { seenIds: value.seenIds.filter((id): id is string => typeof id === "string") } : {}),
  };
}

export async function readStateOf(twenty: TwentyClient, groupRowId: string): Promise<{ cursor: ReadCursor; commentsRead: Record<string, number> }> {
  const row = await twenty.get("agencyGroups", groupRowId);
  return { cursor: row ? cursorOf(row.readCursor) : EMPTY_CURSOR, commentsRead: {} };
}

export interface SavedRead {
  cursorMoved: boolean;
}

export async function saveRead(twenty: TwentyClient, groupRowId: string, output: GroupReadOutput, reason: string, now: Date): Promise<SavedRead> {
  const group: TwentyObjects["agencyGroups"]["update"] = { lastReadAt: now.toISOString(), lastReadReason: reason };
  if (output.groupId) Object.assign(group, { facebookGroupId: output.groupId, groupUrl: `https://www.facebook.com/groups/${output.groupId}/` });
  if (output.feedDone) group.readCursor = output.cursor as unknown as Record<string, unknown>;
  await twenty.update("agencyGroups", groupRowId, group);
  return { cursorMoved: output.feedDone };
}
