import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { generateKeyPairSync, sign } from "node:crypto";
import { UNJOURNALED_TOOLS } from "../../console/operations/index.ts";
import { migrate } from "../../storage/schema/index.ts";
import { canonical, connectOnce, requestHash } from "./client.ts";
import type { Authority, Binding, Envelope } from "./types.ts";

const keys = generateKeyPairSync("ed25519");
const publicKey = Buffer.from((keys.publicKey.export({ format: "jwk" }) as { x: string }).x, "base64url").toString("base64");
const binding: Binding = { origin: "https://app.example", workspaceId: "w1", installationId: "i1", credential: "c", generation: 1, expiresAt: "2099-01-01T00:00:00Z", dispatchPublicKey: publicKey, bridgeUrl: "wss://app.example/bridge", pairedAt: "2026-11-10T00:00:00Z" };

function dispatch(tool: string, operationId: string, args: Record<string, unknown>): Envelope {
  const unsigned: Omit<Authority, "signature"> = { teamId: "t1", workspaceId: "w1", actorUserId: "u1", grantId: null, tool, requestHash: requestHash(tool, args), routeGeneration: 3, authzVersion: 1, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString() };
  const signature = sign(null, Buffer.from(canonical(unsigned)), keys.privateKey).toString("base64");
  return { protocolVersion: 1, kind: "dispatch", workspaceId: "w1", routeGeneration: 3, operationId, authority: { ...unsigned, signature }, payload: { tool, args } };
}

class FakeSocket extends EventTarget {
  readyState = 1;
  sent: Envelope[] = [];
  send(text: string) {
    this.sent.push(JSON.parse(text) as Envelope);
  }
  close() {
    this.readyState = 3;
    this.dispatchEvent(Object.assign(new Event("close"), { code: 1000, reason: "stopped" }));
  }
  deliver(envelope: unknown) {
    this.dispatchEvent(Object.assign(new Event("message"), { data: JSON.stringify(envelope) }));
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("the live view's polling does not write a journal row per frame", () => {
  test("a burst of frame and input calls answers each one and writes no operations row; other tools are still journaled", async () => {
    const db = new Database(":memory:");
    migrate(db);
    const socket = new FakeSocket();
    const ran: string[] = [];
    const closed = connectOnce({
      binding,
      db,
      runTool: async (tool) => (ran.push(tool), { state: "succeeded", result: { tool } }),
      isLive: () => false,
      unjournaled: (tool) => UNJOURNALED_TOOLS.includes(tool),
      hello: () => ({ runtimeVersion: "test", schemaVersion: 1, capabilities: {} }),
      onLine: () => {},
      socket: () => socket as unknown as WebSocket,
    });
    socket.deliver({ protocolVersion: 1, kind: "heartbeat", workspaceId: "w1", routeGeneration: 3, payload: { heartbeatSeconds: 3600 } });
    const rows = () => (db.prepare("SELECT COUNT(*) AS n FROM operations").get() as { n: number }).n;
    for (let index = 0; index < 20; index++) socket.deliver(dispatch(index % 2 ? "browserViewInput" : "browserViewFrame", `poll${index}`, { account: "fakeGuild", generation: "g" }));
    await settle();
    expect(ran).toHaveLength(20);
    expect(socket.sent.filter((envelope) => envelope.kind === "result")).toHaveLength(20);
    expect(rows()).toBe(0);
    socket.deliver(dispatch("sessionsSignIn", "signIn1", { account: "fakeGuild" }));
    await settle();
    expect(rows()).toBe(1);
    socket.close();
    await closed;
  });
});
