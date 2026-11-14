import type { Database } from "bun:sqlite";
import { conversationsDbPath } from "../../search/conversations/index.ts";
import { normalHandle, readBlobBytes } from "../../storage/platform/index.ts";
import type { IdentityProfileExtra } from "../../storage/platform/index.ts";
import { useDatabase } from "../../storage/schema/index.ts";
import { AVATAR_TYPES, ProfileMissingError } from "./types.ts";
import type { IdentityProfileView, ProfileQuery } from "./types.ts";

interface ProfileRow {
  userId: string;
  bio: string | null;
  avatarHash: string | null;
  followerCount: number | null;
  verified: number | null;
  extra: string | null;
  fetchedAt: string;
  handle: string | null;
  displayName: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export function avatarDataUri(bytes: Uint8Array | null): string | null {
  if (!bytes?.length) return null;
  const type = AVATAR_TYPES.find(([, magic]) => magic.every((b, i) => bytes[i] === b))?.[0];
  return type ? `data:${type};base64,${Buffer.from(bytes).toString("base64")}` : null;
}

function userIdOf(handle: Database, query: ProfileQuery): string | null {
  if (query.userId) return query.userId.replace(/^@/, "");
  const name = normalHandle(String(query.handle ?? ""));
  if (!name) return null;
  const alias = handle.prepare("SELECT userId FROM handleAliases WHERE platform = ? AND handle = ? ORDER BY lastSeenAt DESC LIMIT 1").get(query.platform, name) as { userId: string } | null;
  if (alias) return alias.userId;
  const known = handle.prepare("SELECT userId FROM identities WHERE platform = ? AND lower(handle) = ? ORDER BY lastSeenAt DESC LIMIT 1").get(query.platform, name) as { userId: string } | null;
  return known?.userId ?? null;
}

export function profileFrom(handle: Database, query: ProfileQuery): IdentityProfileView {
  const userId = userIdOf(handle, query);
  const row = userId ? (handle.prepare("SELECT p.userId, p.bio, p.avatarHash, p.followerCount, p.verified, p.extra, p.fetchedAt, i.handle, i.displayName, i.firstSeenAt, i.lastSeenAt FROM identityProfiles p LEFT JOIN identities i ON i.platform = p.platform AND i.userId = p.userId WHERE p.platform = ? AND p.userId = ?").get(query.platform, userId) as ProfileRow | null) : null;
  if (!row) throw new ProfileMissingError(query);
  let extra: IdentityProfileExtra = {};
  try {
    extra = row.extra ? (JSON.parse(row.extra) as IdentityProfileExtra) : {};
  } catch {}
  return {
    source: "identityProfile",
    readFrom: "log.db",
    platform: query.platform,
    userId: row.userId,
    handle: row.handle,
    name: row.displayName || row.handle || row.userId,
    bio: row.bio,
    followerCount: row.followerCount,
    verified: row.verified === null ? null : row.verified === 1,
    extra,
    avatar: row.avatarHash ? avatarDataUri(readBlobBytes(handle, row.avatarHash)) : null,
    fetchedAt: row.fetchedAt,
    firstSeenAt: row.firstSeenAt,
    lastSeenAt: row.lastSeenAt,
  };
}

export function readIdentityProfile(query: ProfileQuery, path: string = conversationsDbPath()): IdentityProfileView {
  return useDatabase(path, (handle) => profileFrom(handle, query));
}
