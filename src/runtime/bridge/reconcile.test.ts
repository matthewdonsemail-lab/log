import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { generateKeyPairSync, sign } from "node:crypto";
import { redactConsoleResult } from "../../console/operations/index.ts";
import { migrate } from "../../storage/schema/index.ts";
import { canonical, connectOnce, requestHash } from "./client.ts";
import type { Authority, Binding, Envelope, ResultPayload } from "./types.ts";

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

const reconcile = (operationId: string) => ({ protocolVersion: 1, kind: "reconcile", workspaceId: "w1", routeGeneration: 3, operationId, authority: null, payload: null });

describe("a reconcile for an operation still running here waits for its result", () => {
  test("a report still running answers the hosted reconcile with its own result, not the journal's running row or its redacted copy", async () => {
    const db = new Database(":memory:");
    migrate(db);
    const socket = new FakeSocket();
    let finish: (payload: ResultPayload) => void = () => {};
    const closed = connectOnce({
      binding,
      db,
      runTool: () => new Promise<ResultPayload>((resolve) => (finish = resolve)),
      isLive: () => false,
      redactResult: redactConsoleResult,
      hello: () => ({ runtimeVersion: "test", schemaVersion: 1, capabilities: {} }),
      onLine: () => {},
      socket: () => socket as unknown as WebSocket,
    });
    socket.deliver({ protocolVersion: 1, kind: "heartbeat", workspaceId: "w1", routeGeneration: 3, payload: { heartbeatSeconds: 3600 } });
    socket.deliver(dispatch("report", "slow1", { title: "Fake report" }));
    await settle();
    socket.deliver(reconcile("slow1"));
    await settle();
    expect(socket.sent.map((envelope) => envelope.kind)).toEqual(["accepted"]);
    finish({ state: "succeeded", result: { text: "# Fake report", spec: { title: "Fake report" } } });
    await settle();
    const results = socket.sent.filter((envelope) => envelope.kind === "result");
    expect(results).toHaveLength(1);
    expect(results[0].payload).toEqual({ state: "succeeded", result: { text: "# Fake report", spec: { title: "Fake report" } } });
    socket.deliver(reconcile("slow1"));
    await settle();
    const after = socket.sent.filter((envelope) => envelope.kind === "result");
    expect(after).toHaveLength(2);
    expect((after[1].payload as ResultPayload).result).toEqual({ text: "<redacted>", spec: "<redacted>" });
    socket.close();
    await closed;
  });

  test("a reconcile for an operation this runtime is not running answers from the journal at once", async () => {
    const db = new Database(":memory:");
    migrate(db);
    const socket = new FakeSocket();
    const closed = connectOnce({ binding, db, runTool: async () => ({ state: "succeeded" }), isLive: () => false, hello: () => ({ runtimeVersion: "test", schemaVersion: 1, capabilities: {} }), onLine: () => {}, socket: () => socket as unknown as WebSocket });
    socket.deliver({ protocolVersion: 1, kind: "heartbeat", workspaceId: "w1", routeGeneration: 3, payload: { heartbeatSeconds: 3600 } });
    socket.deliver(reconcile("neverSeen"));
    await settle();
    expect(socket.sent).toHaveLength(1);
    expect((socket.sent[0].payload as ResultPayload).error?.code).toBe("operationUnknown");
    socket.close();
    await closed;
  });
});
