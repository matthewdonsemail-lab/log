import { beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { attachRelay, openRelay, ownOrAttach, readSession, replaceHungOwners, sessionLive, sessionPath } from "./index.ts";
import { takeAlerts } from "../watch/index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "relay"));
});

describe("one owner, every subscriber attached (rule 132)", () => {
  test("the owner records its session and every attached subscriber gets each event", async () => {
    const relay = await openRelay("discord", "acct");
    const session = readSession("discord", "acct")!;
    expect(session).toMatchObject({ platform: "discord", account: "acct", pid: process.pid, status: "connecting", port: relay.port, subscribers: 0 });
    expect(session.token.length).toBeGreaterThan(20);
    const heard: Record<string, unknown>[] = [];
    const attached = attachRelay(session, (event) => heard.push(event));
    while (relay.subscribers() < 1) await Bun.sleep(10);
    expect(readSession("discord", "acct")!.subscribers).toBe(1);
    relay.setStatus("streaming");
    relay.broadcast({ kind: "message", text: "yo" });
    while (heard.length < 2) await Bun.sleep(10);
    await relay.close();
    const result = await attached;
    expect(heard[0]).toMatchObject({ type: "relayJoined", subscribers: 1 });
    expect(heard[1]).toEqual({ kind: "message", text: "yo" });
    expect(result).toMatchObject({ ok: true, events: 1 });
    expect(existsSync(sessionPath("discord", "acct"))).toBe(false);
  });

  test("a subscriber without the owner's token gets nothing", async () => {
    const relay = await openRelay("slack", "acct");
    const heard: Record<string, unknown>[] = [];
    const result = await attachRelay({ ...readSession("slack", "acct")!, token: "wrong" }, (event) => heard.push(event), 5);
    relay.broadcast({ text: "secret" });
    await relay.close();
    expect(heard).toEqual([]);
    expect(result.events).toBe(0);
  });

  test("an owner whose heartbeat went quiet is stopped loudly so the next start becomes the one owner", () => {
    const dir = join(process.env.LOG_INBOX_STATE!, "twitter", "matthewsoldit");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "watch.lock"), "4242");
    const old = new Date(Date.now() - 120_000).toISOString();
    writeFileSync(join(dir, "session.json"), JSON.stringify({ platform: "twitter", account: "matthewsoldit", pid: 4242, hostname: "h", startedAt: old, lastHeartbeat: old, status: "streaming", port: 1, token: "t", subscribers: 0 }));
    expect(sessionLive(readSession("twitter", "matthewsoldit"), Date.now(), () => true)).toBe(false);
    const killed: number[] = [];
    expect(replaceHungOwners("twitter", ["matthewsoldit"], Date.now(), () => true, (pid) => killed.push(pid))).toEqual(["matthewsoldit"]);
    expect(killed).toEqual([4242]);
    expect(takeAlerts("session").join("\n")).toContain("HUNGOWNER twitter matthewsoldit");
  });

  test("the first watch owns the connection, and an inbox watch that loses is refused instead of opening a second", async () => {
    const emitted: string[] = [];
    const owned = await ownOrAttach("instagram", "acct", { inbox: true, onAttached: () => {}, run: async (emit) => (emit({ type: "message" }), emitted.push("ran"), 7) });
    expect(owned).toEqual({ owner: true, result: 7 });
    expect(emitted).toEqual(["ran"]);
    const dir = join(process.env.LOG_INBOX_STATE!, "instagram", "acct");
    writeFileSync(join(dir, "watch.lock"), String(process.ppid));
    const lost = await ownOrAttach("instagram", "acct", { inbox: true, onAttached: () => {}, run: async () => 0 });
    expect("refused" in lost && lost.refused).toContain(`pid ${process.ppid} already owns`);
  });
});
