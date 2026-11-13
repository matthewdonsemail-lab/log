import type { IdentityProfileExtra } from "../../storage/platform/index.ts";

export interface ProfileQuery {
  platform: string;
  userId?: string | null;
  handle?: string | null;
}

export interface IdentityProfileView {
  source: "identityProfile";
  readFrom: "log.db";
  platform: string;
  userId: string;
  handle: string | null;
  name: string;
  bio: string | null;
  followerCount: number | null;
  verified: boolean | null;
  extra: IdentityProfileExtra;
  avatar: string | null;
  fetchedAt: string;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export class ProfileMissingError extends Error {
  readonly code = "identityProfileMissing";
  constructor(query: ProfileQuery) {
    super(`identityProfileMissing: log.db holds no stored profile for ${query.userId ? `user id ${query.userId}` : `@${String(query.handle ?? "").replace(/^@/, "")}`} on ${query.platform}: profiles are kept when a session check or a followers read sees them`);
  }
}

export const AVATAR_TYPES: readonly (readonly [string, readonly number[]])[] = [
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/gif", [0x47, 0x49, 0x46, 0x38]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
];
