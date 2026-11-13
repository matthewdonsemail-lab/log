import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { redactConsoleResult } from "../../console/operations/index.ts";
import type { IdentityProfileView } from "../../inbox/profiles/index.ts";
import { runReport } from "../../mcp/apps/report/client.ts";
import { migrate } from "../../storage/schema/index.ts";
import { journalAccept, journalState } from "./client.ts";
import type { Authority } from "./types.ts";

const BIO = "a private bio line that must never reach the journal";
const MESSAGE = "a private message text that must never reach the journal";

const PROFILE: IdentityProfileView = { source: "identityProfile", readFrom: "log.db", platform: "twitter", userId: "9001", handle: "fakeBird", name: "Fake Bird", bio: BIO, followerCount: 12, verified: null, extra: { location: "Somewhere" }, avatar: null, fetchedAt: "2026-11-14T10:00:00.000Z", firstSeenAt: null, lastSeenAt: null };

const authority = (tool: string): Authority => ({ teamId: "t1", workspaceId: "w1", actorUserId: "u1", grantId: null, tool, requestHash: "h", routeGeneration: 1, authzVersion: 1, issuedAt: "2026-11-14T10:00:00Z", expiresAt: "2099-01-01T00:00:00Z", signature: "s" });

function journaled(db: Database, operationId: string): string {
  return (db.prepare("SELECT result FROM operations WHERE operationId = ?").get(operationId) as { result: string }).result;
}

describe("a hosted report result is redacted before it is journaled", () => {
  test("bios and message text in a report's result never reach operations.result", async () => {
    const answer = await runReport({ title: "Who is this", data: { person: { source: "identityProfile", platform: "twitter", handle: "fakeBird" } } }, false, { readProfile: () => PROFILE });
    const text = answer.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
    const result = { text, spec: answer.structuredContent ?? null };
    expect(JSON.stringify(result)).toContain(BIO);
    const db = new Database(":memory:");
    migrate(db);
    journalAccept(db, authority("report"), "op1", { title: "Who is this" }, false);
    journalState(db, "op1", "succeeded", { result: redactConsoleResult("report", result) });
    const row = journaled(db, "op1");
    expect(row).not.toContain(BIO);
    expect(row).not.toContain("Somewhere");
    expect(JSON.parse(row)).toEqual({ text: "<redacted>", spec: "<redacted>" });
  });

  test("reportData's sender list is redacted the same way, and other tools are left as they are", () => {
    const db = new Database(":memory:");
    migrate(db);
    const senders = { source: "twitterDmsBySender", senders: [{ handle: "fakeOne", lastMessage: MESSAGE }] };
    journalAccept(db, authority("reportData"), "op2", {}, false);
    journalState(db, "op2", "succeeded", { result: redactConsoleResult("reportData", senders) });
    expect(journaled(db, "op2")).not.toContain(MESSAGE);
    expect(redactConsoleResult("accountsList", { accounts: [] })).toEqual({ accounts: [] });
  });
});
