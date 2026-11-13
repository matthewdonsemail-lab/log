import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { db, rememberProfiles } from "../../inbox/store/index.ts";
import { recordDiscordSession } from "../../discord/account/session/index.ts";
import { recordLinkedinSession } from "../../linkedin/account/session/index.ts";
import { recordSlackSession } from "../../slack/account/session/index.ts";
import { recordTwitterSession } from "../../twitter/account/session/index.ts";
import type { PlatformAccount, PlatformAnswer } from "../../platformKit/session/index.ts";
import type { TwitterAccount, TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import { migrate } from "../schema/client.ts";
import { MIGRATIONS, SCHEMA_VERSION } from "../schema/index.ts";
import { blobCodecOf, derivedFingerprint, insertEventRow, profileSeenEvent, putBlob, readBlob, readBlobBytes, rebuildDerived, sessionProfileOf, twitterFollowerProfile, verifyDerived } from "./index.ts";

const NOW = new Date("2026-11-14T10:00:00Z");
const twenty = { update: async () => ({}) } as unknown as TwentyClient;

function fresh(): Database {
  const handle = new Database(":memory:");
  migrate(handle);
  return handle;
}

function profileOf(handle: Database, platform: string, userId: string) {
  return handle.prepare("SELECT bio, avatarHash, followerCount, verified, extra, fetchedAt FROM identityProfiles WHERE platform = ? AND userId = ?").get(platform, userId) as { bio: string | null; avatarHash: string | null; followerCount: number | null; verified: number | null; extra: string | null; fetchedAt: string } | null;
}

function identityOf(handle: Database, platform: string, userId: string) {
  return handle.prepare("SELECT handle, displayName FROM identities WHERE platform = ? AND userId = ?").get(platform, userId) as { handle: string | null; displayName: string | null } | null;
}

const fakeFollower = { userId: "9001", handle: "fakeBird", name: "Fake Bird", bio: "builds small tools", location: "Somewhere", followers: 1234, following: 56, posts: 789, canDm: true, protected: false, createdAt: "2020-01-01T00:00:00Z", pictureUrl: "https://pbs.example/fakeBird_normal.jpg" };

describe("migration 19 adds identityProfiles", () => {
  test("a fresh database ends at version 19 with the table and its index", () => {
    const handle = fresh();
    expect(SCHEMA_VERSION).toBe(19);
    const names = (handle.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'identityProfiles%'").all() as { name: string }[]).map((r) => r.name).sort();
    expect(names).toEqual(["identityProfiles", "identityProfilesByFetchedAt"]);
    const columns = (handle.prepare("PRAGMA table_info(identityProfiles)").all() as { name: string; pk: number }[]).map((c) => [c.name, c.pk]);
    expect(columns).toEqual([["platform", 1], ["userId", 2], ["bio", 0], ["avatarHash", 0], ["followerCount", 0], ["verified", 0], ["extra", 0], ["fetchedAt", 0]]);
  });

  test("a version 18 database keeps its rows and gains only the new table", () => {
    const handle = new Database(":memory:");
    for (const migration of MIGRATIONS.filter((m) => m.version <= 18)) migration.apply(handle);
    handle.exec("PRAGMA user_version = 18");
    insertEventRow(handle, { platform: "discord", account: "fakeGuild", conversationId: "c1", type: "message", with: "jd", text: "hi", box: "dm", payload: { id: "1", senderId: "42" }, sourceAt: "2026-11-08T01:00:00Z", receivedAt: "2026-11-08T01:00:01Z", source: "live" });
    const count = (table: string) => (handle.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
    const before = ["events", "messages", "identities", "chats"].map(count);
    expect(migrate(handle).map((m) => m.version)).toEqual([19]);
    expect((handle.prepare("PRAGMA user_version").get() as { user_version: number }).user_version).toBe(19);
    expect(["events", "messages", "identities", "chats"].map(count)).toEqual(before);
    expect(before[0]).toBe(1);
    expect(count("identityProfiles")).toBe(0);
    expect(verifyDerived(handle).ok).toBe(true);
  });

  test("extra must be JSON", () => {
    const handle = fresh();
    expect(() => handle.prepare("INSERT INTO identityProfiles (platform, userId, extra, fetchedAt) VALUES ('x', '1', 'not json', 'now')").run()).toThrow();
  });
});

describe("the raw blob codec", () => {
  test("avatar bytes are stored as they are and read back unchanged", () => {
    const handle = fresh();
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0x00, 0xfe]);
    expect(blobCodecOf("avatar")).toBe("raw");
    const hash = putBlob(handle, "avatar", bytes, NOW);
    const row = handle.prepare("SELECT kind, codec, size, storedSize FROM blobs WHERE hash = ?").get(hash);
    expect(row).toEqual({ kind: "avatar", codec: "raw", size: bytes.length, storedSize: bytes.length });
    expect(new Uint8Array(readBlobBytes(handle, hash)!)).toEqual(bytes);
  });

  test("text blobs are still gzip and read back as text", () => {
    const handle = fresh();
    const hash = putBlob(handle, "eventPayload", "{\"a\":1}", NOW);
    expect(handle.prepare("SELECT codec FROM blobs WHERE hash = ?").get(hash)).toEqual({ codec: "gzip" });
    expect(readBlob(handle, hash)).toBe("{\"a\":1}");
  });
});

describe("identityProfiles is derived from events", () => {
  test("profileSeen and notification events give rows that a rebuild makes again byte for byte", () => {
    const handle = fresh();
    insertEventRow(handle, profileSeenEvent("twitter", "fakeAccount", "9001", { bio: "first", followerCount: 10, extra: { location: "Here" } }, "2026-11-10T00:00:00.000Z"), NOW);
    insertEventRow(handle, profileSeenEvent("twitter", "fakeAccount", "9001", { followerCount: 12, extra: { postCount: 3 } }, "2026-11-11T00:00:00.000Z"), NOW);
    insertEventRow(handle, { platform: "twitter", account: "fakeAccount", conversationId: "", type: "notification", with: "otherBird", text: "", box: "", payload: { key: "n1", kind: "follow", userId: "9002", handle: "otherBird", followers: 40 }, sourceAt: "", receivedAt: "2026-11-12T00:00:00.000Z", source: "live" }, NOW);
    expect(profileOf(handle, "twitter", "9001")).toEqual({ bio: "first", avatarHash: null, followerCount: 12, verified: null, extra: JSON.stringify({ location: "Here", postCount: 3 }), fetchedAt: "2026-11-11T00:00:00.000Z" });
    expect(profileOf(handle, "twitter", "9002")?.followerCount).toBe(40);
    const live = derivedFingerprint(handle).identityProfiles;
    expect(verifyDerived(handle).ok).toBe(true);
    rebuildDerived(handle);
    expect(derivedFingerprint(handle).identityProfiles).toEqual(live);
  });

  test("the same profile seen twice is one event", () => {
    const handle = fresh();
    const event = profileSeenEvent("discord", "fakeGuild", "42", { verified: true }, "2026-11-10T00:00:00.000Z");
    insertEventRow(handle, event, NOW);
    expect(insertEventRow(handle, { ...event, receivedAt: "2026-11-11T00:00:00.000Z" }, NOW)).toBeNull();
    expect((handle.prepare("SELECT COUNT(*) AS n FROM events WHERE type = 'profileSeen'").get() as { n: number }).n).toBe(1);
  });

  test("extra keeps only the documented keys", () => {
    const handle = fresh();
    rememberProfiles("twitter", "fakeAccount", [{ userId: "77", handle: null, displayName: null, fields: { extra: { location: "Here", secret: "no" } as never } }], NOW, handle);
    expect(JSON.parse(profileOf(handle, "twitter", "77")!.extra!)).toEqual({ location: "Here" });
  });
});

describe("writers keep the profile fields the engines already return", () => {
  test("X: a followers read keeps each follower's bio, counts and name", () => {
    const handle = fresh();
    expect(rememberProfiles("twitter", "fakeAccount", [twitterFollowerProfile(fakeFollower)], NOW, handle)).toBe(1);
    const row = profileOf(handle, "twitter", "9001")!;
    expect(row).toMatchObject({ bio: "builds small tools", followerCount: 1234, verified: null, fetchedAt: NOW.toISOString() });
    expect(JSON.parse(row.extra!)).toEqual({ location: "Somewhere", followingCount: 56, postCount: 789, canDm: true, protected: false, joinedAt: "2020-01-01T00:00:00Z", pictureUrl: "https://pbs.example/fakeBird_normal.jpg" });
    expect(identityOf(handle, "twitter", "9001")).toEqual({ handle: "fakeBird", displayName: "Fake Bird" });
  });

  test("X: the session check keeps the account's display name, with no profile row", async () => {
    const answer: TwitterSessionAnswer = { ok: true, loginState: "loggedIn", userId: "5001", screenName: "fakeOwner", name: "Fake Owner" };
    const account = { id: "acc1", accountName: "fakeOwner", cookies: {} } as unknown as TwitterAccount;
    await recordTwitterSession(twenty, account, { answer, refreshed: null }, NOW);
    expect(identityOf(db(), "twitter", "5001")).toEqual({ handle: "fakeOwner", displayName: "Fake Owner" });
    expect(profileOf(db(), "twitter", "5001")).toBeNull();
  });

  test("Discord: the session check keeps the global name and the verified flag", async () => {
    const answer: PlatformAnswer = { ok: true, loginState: "loggedIn", httpStatus: 200, screenName: "fakeguilder", userId: "6001", globalName: "Fake Guilder", verified: true, mfaEnabled: false, avatar: "0123456789abcdef0123456789abcdef" };
    await recordDiscordSession(twenty, { id: "acc2", accountName: "fakeGuild", cookies: {} } as unknown as PlatformAccount, { answer, refreshed: null }, NOW);
    expect(profileOf(db(), "discord", "6001")).toMatchObject({ verified: 1, bio: null, avatarHash: null });
    expect(JSON.parse(profileOf(db(), "discord", "6001")!.extra!)).toEqual({ pictureUrl: "https://cdn.discordapp.com/avatars/6001/0123456789abcdef0123456789abcdef.png" });
    expect(identityOf(db(), "discord", "6001")).toEqual({ handle: "fakeguilder", displayName: "Fake Guilder" });
  });

  test("LinkedIn: the session check keeps the name and premium", async () => {
    const answer: PlatformAnswer = { ok: true, loginState: "loggedIn", httpStatus: 200, screenName: "fakeLinker", name: "Fake Linker", userId: "ACoFake", premium: true };
    await recordLinkedinSession(twenty, { id: "acc3", accountName: "fakeLinker", cookies: {} } as unknown as PlatformAccount, { answer, refreshed: null }, NOW);
    expect(JSON.parse(profileOf(db(), "linkedin", "ACoFake")!.extra!)).toEqual({ premium: true });
    expect(identityOf(db(), "linkedin", "ACoFake")).toEqual({ handle: "fakeLinker", displayName: "Fake Linker" });
  });

  test("Slack: the session answer carries no profile field, so no row is written", async () => {
    const answer: PlatformAnswer = { ok: true, loginState: "loggedIn", screenName: "fakeslacker", userId: "U0FAKE" };
    expect(sessionProfileOf("slack", answer)).toBeNull();
    await recordSlackSession(twenty, { id: "acc4", accountName: "fakeSlack", cookies: {} } as unknown as PlatformAccount, { answer, refreshed: null }, NOW);
    expect(profileOf(db(), "slack", "U0FAKE")).toBeNull();
  });

  test("a failed session check writes nothing", () => {
    expect(sessionProfileOf("discord", { ok: false, loginState: "loggedOut", userId: "6002", verified: true })).toBeNull();
  });
});
