import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { catchUpRunner, socketChange } from "../relay/index.ts";
import { appendEvent, behindOf, db, handleOfUserId, markGap, openGap, positionsOf, recordPosition, resumeGap } from "../store/index.ts";
import { claimWatcher, releaseWatcher } from "../watch/index.ts";
import { catchUpOneChat, discordCatchUp, instagramCatchUp, waitCaughtUp } from "./index.ts";
import type { PlatformRead } from "./index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "catchUp"));
});

const account = { id: "a1", accountName: "acct" } as Parameters<PlatformRead>[0];
const noWait = async () => {};

describe("catching up after a gap (rule 135)", () => {
  test("an owner that takes over from a stopped one opens a gap from its last heartbeat", () => {
    expect(claimWatcher("discord", "acct", 111, () => false).ok).toBe(true);
    releaseWatcher("discord", "acct", 111);
    expect(behindOf("discord", "acct")).toBeNull();
    expect(claimWatcher("discord", "acct", 222, () => false).ok).toBe(true);
    expect(behindOf("discord", "acct")).toMatchObject({ reason: "ownerRestarted", status: "open" });
  });

  test("a first owner with events already stored opens a gap from the newest one, and one with none opens nothing", () => {
    expect(claimWatcher("slack", "fresh", 111, () => false).ok).toBe(true);
    expect(behindOf("slack", "fresh")).toBeNull();
    appendEvent({ platform: "slack", account: "old", conversationId: "D1", type: "message", with: "x", text: "yo", receivedAt: "2026-11-04T01:00:00Z" });
    expect(claimWatcher("slack", "old", 111, () => false).ok).toBe(true);
    expect(behindOf("slack", "old")).toMatchObject({ fromAt: "2026-11-04T01:00:00Z", reason: "noOwner" });
  });

  test("the runner closes the gap with what it appended, and a refusal keeps the account behind and alerts", async () => {
    openGap("twitter", "acct", "2026-11-04T00:00:00Z", "socketDropped");
    await catchUpRunner("twitter", "acct", async () => ({ appended: 3 })).run();
    expect(behindOf("twitter", "acct")).toBeNull();
    expect(db().prepare("SELECT status, appended FROM gaps").get()).toEqual({ status: "closed", appended: 3 });
    openGap("twitter", "acct", "2026-11-04T01:00:00Z", "socketDropped");
    await catchUpRunner("twitter", "acct", async () => ({ appended: 0, refused: "429: rate limited" })).run();
    expect(behindOf("twitter", "acct")).toMatchObject({ status: "refused" });
    expect(db().prepare("SELECT kind FROM alerts WHERE kind = 'catchUpRefused'").all()).toHaveLength(1);
  });

  test("a refused gap stays refused until matt resumes it, and then the runner catches up again", async () => {
    openGap("twitter", "acct", "2026-11-04T01:00:00Z", "socketDropped");
    await catchUpRunner("twitter", "acct", async () => ({ appended: 0, refused: "xchatLocked: transient" })).run();
    expect(resumeGap("discord", "acct", "matt")).toBeNull();
    let calls = 0;
    await catchUpRunner("twitter", "acct", async () => (calls++, { appended: 1 })).run();
    expect(calls).toBe(0);
    expect(resumeGap("twitter", "acct", "matt")).toMatchObject({ status: "open", fromAt: "2026-11-04T01:00:00Z" });
    expect(String(behindOf("twitter", "acct")?.detail)).toContain("resumed by matt");
    expect(db().prepare("SELECT kind FROM alerts WHERE kind = 'gapResumed'").all()).toHaveLength(1);
    await catchUpRunner("twitter", "acct", async () => (calls++, { appended: 1 })).run();
    expect(calls).toBe(1);
    expect(behindOf("twitter", "acct")).toBeNull();
    expect(resumeGap("twitter", "acct", "matt")).toBeNull();
  });

  test("an X user id finds its handle from the notifications the owner stored, so the voice gate reads the right chat", () => {
    expect(handleOfUserId("twitter", "acct", "1987816842371743744")).toBeNull();
    appendEvent({ platform: "twitter", account: "acct", conversationId: "", type: "notification", with: "AjeetVermai", payload: { userId: "1987816842371743744", handle: "AjeetVermai" }, receivedAt: "2026-11-05T11:41:11Z" });
    expect(handleOfUserId("twitter", "acct", "1987816842371743744")).toBe("AjeetVermai");
    expect(handleOfUserId("twitter", "other", "1987816842371743744")).toBeNull();
  });

  test("only one catch-up runs at a time", async () => {
    openGap("slack", "acct", "2026-11-04T00:00:00Z", "socketDropped");
    let calls = 0;
    const runner = catchUpRunner("slack", "acct", async () => (calls++, await Bun.sleep(20), { appended: 0 }));
    await Promise.all([runner.run(), runner.run(), runner.run()]);
    expect(calls).toBe(1);
  });

  test("a send waits while the account is behind, goes once it caught up, and is refused when the catch-up was refused", async () => {
    expect(await waitCaughtUp("discord", "acct")).toMatchObject({ ok: true });
    const gap = openGap("discord", "acct", "2026-11-04T00:00:00Z", "socketDropped");
    let clock = 0;
    const waited = await waitCaughtUp("discord", "acct", { timeoutMs: 5000, now: () => clock, sleep: async () => { clock += 1000; if (clock === 2000) db().prepare("UPDATE gaps SET status = 'closed' WHERE id = ?").run(gap.id); } });
    expect(waited).toEqual({ ok: true, waitedMs: 2000 });
    const again = openGap("discord", "acct", "2026-11-04T01:00:00Z", "socketDropped");
    db().prepare("UPDATE gaps SET status = 'refused' WHERE id = ?").run(again.id);
    const refused = await waitCaughtUp("discord", "acct");
    expect(!refused.ok && refused.refused).toContain(">>> BEHIND");
  });

  test("Discord reads only after each chat's saved position, keeps going from the newest, and stops on a refusal", async () => {
    recordPosition("discord", "acct", "100", "D1");
    recordPosition("discord", "acct", "500", "D2");
    recordPosition("discord", "acct", "2026-11-07T05:30:00Z", "backfill:D1");
    const specs: Record<string, unknown>[] = [];
    const read: PlatformRead = (_a, spec) => {
      specs.push(spec);
      if (spec.channel === "D1") return { answer: { ok: true, messages: [{ id: "101", at: "2026-11-04T02:00:00Z", from: "x", text: "missed this" }, { id: "102", at: "2026-11-04T02:01:00Z", from: "me", fromMe: true, text: "and my answer" }] } } as unknown as ReturnType<PlatformRead>;
      return { answer: { ok: false, code: "rateLimited", detail: "429" } } as unknown as ReturnType<PlatformRead>;
    };
    const got = await discordCatchUp(account, openGap("discord", "acct", "2026-11-04T01:00:00Z", "socketDropped"), read, new Date(), noWait);
    expect(specs).toEqual([{ action: "read", channel: "D1", limit: 100, after: "100", catchUp: true }, { action: "read", channel: "D2", limit: 100, after: "500", catchUp: true }]);
    expect(got).toMatchObject({ appended: 2, refused: "reading D2: rateLimited: 429" });
    expect(positionsOf("discord", "acct").D1).toBe("102");
    expect(db().prepare("SELECT type, source FROM events ORDER BY seq").all()).toEqual([{ type: "message", source: "catchUp" }, { type: "ownMessage", source: "catchUp" }]);
  });

  test("a chat the account can't read is skipped, and the catch-up carries on with the others", async () => {
    recordPosition("discord", "acct", "100", "DEAD");
    recordPosition("discord", "acct", "100", "D1");
    const read: PlatformRead = (_a, spec) => {
      if (spec.channel === "DEAD") return { answer: { ok: false, code: "platformError", detail: 'Discord answered 403 to channel DEAD messages: {"message": "Missing Access", "code": 50001}' } } as unknown as ReturnType<PlatformRead>;
      return { answer: { ok: true, messages: [{ id: "101", at: "2026-11-04T02:00:00Z", from: "x", text: "still read" }] } } as unknown as ReturnType<PlatformRead>;
    };
    const got = await discordCatchUp(account, openGap("discord", "acct", "2026-11-04T01:00:00Z", "socketDropped"), read, new Date(), noWait);
    expect(got.refused).toBeUndefined();
    expect(got.appended).toBe(1);
    expect(got.skipped?.[0]).toContain("DEAD");
    expect(got.detail).toContain("skipped without access");
    expect(positionsOf("discord", "acct").DEAD).toBe("100");
  });

  test("Instagram reads only the threads active since its position", async () => {
    recordPosition("instagram", "acct", "2026-11-04T01:00:00Z");
    const specs: Record<string, unknown>[] = [];
    const read: PlatformRead = (_a, spec) => {
      specs.push(spec);
      if (spec.action === "inbox") return { answer: { ok: true, threads: [{ id: "t1", lastActivity: "2026-11-04T02:00:00Z" }, { id: "t2", lastActivity: "2026-11-03T00:00:00Z" }] } } as unknown as ReturnType<PlatformRead>;
      return { answer: { ok: true, messages: [{ id: "m1", at: "2026-11-04T02:00:00Z", from: "bob", text: "u there" }] } } as unknown as ReturnType<PlatformRead>;
    };
    const got = await instagramCatchUp(account, openGap("instagram", "acct", "2026-11-04T00:00:00Z", "ownerRestarted"), read, new Date(), noWait);
    expect(specs.map((s) => s.action === "thread" ? s.with : s.action)).toEqual(["inbox", "t1"]);
    expect(got.appended).toBe(1);
    expect(positionsOf("instagram", "acct")[""]).toBe("2026-11-04T02:00:00Z");
  });

  test("a socket that drops opens a gap, and one that opens again starts the catch-up", () => {
    expect(socketChange({ type: "socket", state: "closed" })).toBe("dropped");
    expect(socketChange({ type: "socket", state: "reconnecting" })).toBe("dropped");
    expect(socketChange({ type: "socket", state: "open" })).toBe("open");
    expect(socketChange({ type: "message", state: "closed" })).toBeNull();
    expect(socketChange({ kind: "closed", detail: "the gateway closed" })).toBe("dropped");
    expect(socketChange({ kind: "open" })).toBe("open");
  });
});

describe("a send catches up only its own chat, never waiting for the whole account", () => {
  test("an account that's current reads nothing", () => {
    let reads = 0;
    expect(catchUpOneChat("discord", "oneChatA", "c1", () => (reads++, { ok: true, messages: [] }))).toEqual({ ok: true, how: "current", stored: 0 });
    expect(reads).toBe(0);
  });

  test("while catching up, this one chat is read and stored at once", () => {
    openGap("discord", "oneChatB", "2026-11-07T11:00:00Z", "ownerRestarted");
    const got = catchUpOneChat("discord", "oneChatB", "c2", () => ({ ok: true, messages: [{ id: "1", at: "2026-11-07T11:01:00Z", from: "Kennedy", fromMe: false, text: "we gotta plan" }] }), new Date("2026-11-07T11:02:00Z"));
    expect(got).toEqual({ ok: true, how: "chatRead", stored: 1 });
  });

  test("a refused catch-up refuses the send and reads nothing (rule 94)", () => {
    const gap = openGap("discord", "oneChatC", "2026-11-07T11:00:00Z", "socketDropped");
    markGap(gap.id, "refused", "429");
    let reads = 0;
    const got = catchUpOneChat("discord", "oneChatC", "c3", () => (reads++, { ok: true, messages: [] }));
    expect(got.ok).toBe(false);
    expect(reads).toBe(0);
  });
});
