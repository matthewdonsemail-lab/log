import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { appendEvent, asOwner, behindOf, db, markGap, openGap, OwnerFencedError, recordPosition } from "./index.ts";
import { claimWatcher, releaseWatcher } from "../watch/index.ts";
import { catchUpRunner } from "../relay/index.ts";
import { migrate } from "../../storage/schema/client.ts";

describe("an owner that was replaced writes nothing more", () => {
  test("once another process holds a newer generation, this owner's appends, positions and gaps are refused", () => {
    const claim = claimWatcher("discord", "fenced", process.pid, () => false);
    expect(claim).toMatchObject({ ok: true });
    expect(appendEvent({ platform: "discord", account: "fenced", conversationId: "c1", type: "message", with: "jd", text: "before", payload: { id: "1" } })).not.toBeNull();
    db().prepare("UPDATE owners SET pid = 999999, generation = generation + 1 WHERE platform = 'discord' AND account = 'fenced'").run();
    expect(() => asOwner("discord", "fenced", () => appendEvent({ platform: "discord", account: "fenced", conversationId: "c1", type: "message", with: "jd", text: "after", payload: { id: "2" } }))).toThrow(OwnerFencedError);
    expect(() => asOwner("discord", "fenced", () => recordPosition("discord", "fenced", "2", "c1"))).toThrow(OwnerFencedError);
    expect(appendEvent({ platform: "discord", account: "fenced", conversationId: "c1", type: "message", with: "jd", text: "a read in the same process", payload: { id: "3" }, source: "backfill" })).not.toBeNull();
    expect((db().prepare("SELECT text FROM events WHERE platform = 'discord' AND account = 'fenced' AND type = 'message' ORDER BY seq").all() as { text: string }[]).map((r) => r.text)).toEqual(["before", "a read in the same process"]);
    releaseWatcher("discord", "fenced");
  });

  test("a position write by a replaced owner is refused too", () => {
    claimWatcher("slack", "fenced", process.pid, () => false);
    db().prepare("UPDATE owners SET generation = generation + 1 WHERE platform = 'slack' AND account = 'fenced'").run();
    expect(() => asOwner("slack", "fenced", () => recordPosition("slack", "fenced", "1.5", "D1"))).toThrow(OwnerFencedError);
    releaseWatcher("slack", "fenced");
  });
});

describe("a gap is never closed over a newer drop", () => {
  test("a drop while catching up keeps the gap open, and the next run catches up again", async () => {
    openGap("instagram", "drops", "2026-11-08T01:00:00Z", "socketDropped");
    let runs = 0;
    const runner = catchUpRunner("instagram", "drops", async () => {
      runs++;
      if (runs === 1) openGap("instagram", "drops", "2026-11-08T01:05:00Z", "socketDropped");
      return { appended: 1 };
    });
    await runner.run();
    const gap = behindOf("instagram", "drops");
    expect(gap?.status).toBe("open");
    expect(gap?.drops).toBe(1);
    await runner.run();
    expect(behindOf("instagram", "drops")).toBeNull();
    expect(runs).toBe(2);
  });

  test("closing only works on the drop count it started from", () => {
    const gap = openGap("twitter", "cas", "2026-11-08T01:00:00Z", "noOwner");
    markGap(gap.id, "catchingUp");
    expect(markGap(gap.id, "closed", null, 0, new Date(), gap.drops + 1)).toBe(false);
    expect(markGap(gap.id, "closed", null, 0, new Date(), gap.drops)).toBe(true);
  });

  test("migration 9 leaves one open gap per account and refuses a second", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    handle.exec("DROP INDEX gapsOneOpen");
    const insert = handle.prepare("INSERT INTO gaps (platform, account, fromAt, reason, status, openedAt) VALUES ('discord', 'a', ?, 'x', 'open', ?)");
    insert.run("2026-11-08T01:00:00Z", "2026-11-08T01:00:00Z");
    insert.run("2026-11-08T02:00:00Z", "2026-11-08T02:00:00Z");
    handle.exec("PRAGMA user_version = 8");
    migrate(handle);
    expect(handle.prepare("SELECT status FROM gaps ORDER BY id").all()).toEqual([{ status: "open" }, { status: "closed" }]);
    expect(() => insert.run("2026-11-08T03:00:00Z", "2026-11-08T03:00:00Z")).toThrow();
  });
});
