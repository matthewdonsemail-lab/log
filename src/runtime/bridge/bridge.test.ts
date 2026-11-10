import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { generateKeyPairSync, sign } from "node:crypto";
import { migrate } from "../../storage/schema/index.ts";
import { canonical, checkAuthority, journalAccept, journalRead, journalState, requestHash, settleInterrupted } from "./client.ts";
import type { Authority, Binding, Envelope } from "./types.ts";

const keys = generateKeyPairSync("ed25519");
const publicKey = Buffer.from((keys.publicKey.export({ format: "jwk" }) as { x: string }).x, "base64url").toString("base64");
const binding: Binding = { origin: "https://app.example", workspaceId: "w1", installationId: "i1", credential: "c", generation: 1, expiresAt: "2099-01-01T00:00:00Z", dispatchPublicKey: publicKey, bridgeUrl: "wss://app.example/bridge", pairedAt: "2026-11-10T00:00:00Z" };

function signed(fields: Partial<Omit<Authority, "signature">> = {}, args: Record<string, unknown> = { limit: 2 }): Envelope {
  const unsigned: Omit<Authority, "signature"> = { teamId: "t1", workspaceId: "w1", actorUserId: "u1", grantId: null, tool: "accountsList", requestHash: requestHash("accountsList", args), routeGeneration: 3, authzVersion: 1, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), ...fields };
  const signature = sign(null, Buffer.from(canonical(unsigned)), keys.privateKey).toString("base64");
  return { protocolVersion: 1, kind: "dispatch", workspaceId: "w1", routeGeneration: 3, operationId: "op1", authority: { ...unsigned, signature }, payload: { tool: "accountsList", args } };
}

describe("runtime bridge", () => {
  test("canonical JSON sorts keys and drops spaces, as the control service signs it", () => {
    expect(canonical({ b: 1, a: [true, null, "é"], c: { z: 1, y: 2 } })).toBe('{"a":[true,null,"é"],"b":1,"c":{"y":2,"z":1}}');
    expect(requestHash("accountsList", {})).toBe("0b95986a5143b9ee6805723b22961240736545f81650cb30ddeee08edf2ad0ca");
  });

  test("a signed dispatch for this workspace and generation passes", () => {
    expect(checkAuthority(binding, signed(), 3)).toMatchObject({ ok: true, tool: "accountsList" });
  });

  test("refuses another generation, another workspace, an expired authority, changed args and a bad signature", () => {
    expect(checkAuthority(binding, signed(), 4)).toMatchObject({ code: "leaseStale" });
    expect(checkAuthority(binding, signed({ workspaceId: "w2" }), 3)).toMatchObject({ code: "forbidden" });
    expect(checkAuthority(binding, signed({ expiresAt: new Date(Date.now() - 1000).toISOString() }), 3)).toMatchObject({ code: "approvalExpired" });
    const tampered = signed();
    tampered.payload = { tool: "accountsList", args: { limit: 200 } };
    expect(checkAuthority(binding, tampered, 3)).toMatchObject({ code: "forbidden" });
    const forged = signed();
    forged.authority = { ...forged.authority!, signature: Buffer.alloc(64).toString("base64") };
    expect(checkAuthority(binding, forged, 3)).toMatchObject({ code: "forbidden" });
  });

  test("the journal accepts an operation once, answers reconcile from it, and refuses the same id for another request", () => {
    const db = new Database(":memory:");
    migrate(db);
    const authority = signed().authority!;
    expect(journalAccept(db, authority, "op1", { limit: 2 }, false)).toMatchObject({ fresh: true });
    journalState(db, "op1", "succeeded", { result: { accounts: [] } });
    expect(journalAccept(db, authority, "op1", { limit: 2 }, false)).toMatchObject({ fresh: false });
    expect(journalRead(db, "op1")).toEqual({ state: "succeeded", result: { accounts: [] } });
    expect(journalAccept(db, { ...authority, requestHash: "other" }, "op1", {}, false)).toMatchObject({ code: "idempotencyConflict" });
  });

  test("a restart marks an unfinished read failed and an unfinished write unknown, never replayed", () => {
    const db = new Database(":memory:");
    migrate(db);
    journalAccept(db, signed().authority!, "read1", { limit: 2 }, false);
    journalAccept(db, { ...signed().authority!, tool: "discordSendLive" }, "write1", {}, true);
    expect(settleInterrupted(db)).toBe(2);
    expect(journalRead(db, "read1")?.state).toBe("failed");
    expect(journalRead(db, "write1")?.state).toBe("unknown");
  });
});
