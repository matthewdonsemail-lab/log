import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { attachRelay, openRelay, ownOrAttach, readSession, replaceHungOwners, sessionLive } from "./index.ts";
import { db } from "../store/index.ts";
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
    expect(readSession("discord", "acct")).toBeNull();
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
    const old = new Date(Date.now() - 120_000).toISOString();
    db().prepare("INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status, port, token, subscribers) VALUES ('twitter', 'matthewsoldit', 4242, 'h', ?, ?, 'streaming', 1, 't', 0)").run(old, old);
    expect(sessionLive(readSession("twitter", "matthewsoldit"), Date.now(), () => true)).toBe(false);
    const killed: number[] = [];
    const now = Date.now();
    const sameStart = () => null;
    expect(replaceHungOwners("twitter", ["matthewsoldit"], now, () => true, (pid) => killed.push(pid), sameStart)).toEqual([]);
    expect(replaceHungOwners("twitter", ["matthewsoldit"], now + 5_000, () => true, (pid) => killed.push(pid), sameStart)).toEqual([]);
    expect(killed).toEqual([]);
    expect(replaceHungOwners("twitter", ["matthewsoldit"], now + 10_000, () => true, (pid) => killed.push(pid), sameStart)).toEqual(["matthewsoldit"]);
    expect(killed).toEqual([4242]);
    expect(takeAlerts("session").join("\n")).toContain("HUNGOWNER twitter matthewsoldit");
  });

  test("a quiet owner whose pid now belongs to another process is not killed", () => {
    const old = new Date(Date.now() - 120_000).toISOString();
    db().prepare("INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status, port, token, subscribers, pidStartedAt) VALUES ('slack', 'reused', 4343, 'h', ?, ?, 'streaming', 1, 't', 0, ?)").run(old, old, old);
    const killed: number[] = [];
    const now = Date.now();
    const otherStart = () => new Date(now - 1_000).toISOString();
    replaceHungOwners("slack", ["reused"], now, () => true, (pid) => killed.push(pid), otherStart);
    expect(replaceHungOwners("slack", ["reused"], now + 10_000, () => true, (pid) => killed.push(pid), otherStart)).toEqual(["reused"]);
    expect(killed).toEqual([]);
    expect(takeAlerts("session").join("\n")).toContain("OWNERPIDREUSED slack reused");
  });

  test("the first watch owns the connection, and an inbox watch that loses is refused instead of opening a second", async () => {
    const emitted: string[] = [];
    const owned = await ownOrAttach("instagram", "acct", { inbox: true, onAttached: () => {}, run: async (emit) => (emit({ type: "message" }), emitted.push("ran"), 7) });
    expect(owned).toEqual({ owner: true, result: 7 });
    expect(db().prepare("SELECT status, port FROM owners WHERE platform = 'instagram'").get()).toEqual({ status: "stopped", port: 0 });
    expect(emitted).toEqual(["ran"]);
    const fresh = new Date().toISOString();
    db().prepare("INSERT OR REPLACE INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES ('instagram', 'acct', ?, 'h', ?, ?, 'streaming')").run(process.ppid, fresh, fresh);
    const lost = await ownOrAttach("instagram", "acct", { inbox: true, onAttached: () => {}, run: async () => 0 });
    expect("refused" in lost && lost.refused).toContain(`pid ${process.ppid} already owns`);
  });
});
