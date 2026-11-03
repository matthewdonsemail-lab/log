import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claimChat, claimContext, claimsOn, eventIdOf, guardSend, liveClaims, readActions, releaseChat } from "./index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "claims"));
});

const alive = (pid: number) => pid === 111 || pid === 222;
const ref = { platform: "discord", account: "acct", conversationId: "1481513072660185149" };

describe("only the session that claims a chat acts on it (rule 133)", () => {
  test("the first session claims the chat, a second is refused, and the holder can renew it", () => {
    expect(claimChat(ref, 111, new Date(), alive)).toMatchObject({ ok: true, renewed: false });
    const second = claimChat(ref, 222, new Date(), alive);
    expect(second.ok).toBe(false);
    expect(!second.ok && second.holder.by).toBe(111);
    expect(claimChat(ref, 111, new Date(), alive)).toMatchObject({ ok: true, renewed: true });
  });

  test("a claim from a session that ended, or one past its time, frees itself", () => {
    claimChat(ref, 333, new Date(), () => true);
    expect(claimChat(ref, 111, new Date(), alive)).toMatchObject({ ok: true });
    releaseChat(ref, 111);
    claimChat(ref, 222, new Date(Date.now() - 20 * 60_000), alive);
    expect(claimChat(ref, 111, new Date(), alive)).toMatchObject({ ok: true });
  });

  test("an X chat is one chat whether it is named by the person's id or the X Chat pair", () => {
    const pair = { platform: "twitter", account: "matthewsoldit", conversationId: "1270818113412612097:1974596626342686720" };
    expect(claimChat(pair, 111, new Date(), alive).ok).toBe(true);
    expect(claimsOn("twitter", "matthewsoldit", "1270818113412612097", new Date(), alive)).toHaveLength(1);
    expect(claimsOn("twitter", "matthewsoldit", "26043955", new Date(), alive)).toHaveLength(0);
    expect(claimsOn("twitter", "matthewsoldit", "26043955:1974596626342686720", new Date(), alive)).toHaveLength(0);
    expect(claimChat({ ...pair, conversationId: "1270818113412612097" }, 222, new Date(), alive).ok).toBe(false);
  });

  test("a send claims the chat, is refused while another session holds it, and releases it with what happened logged", () => {
    expect(claimChat(ref, process.ppid).ok).toBe(true);
    const refused = guardSend(ref, process.pid);
    expect(refused.ok).toBe(false);
    expect(!refused.ok && refused.refused).toContain("CLAIMED ELSEWHERE");
    releaseChat(ref, process.ppid);
    const guard = guardSend(ref, process.pid);
    expect(guard.ok).toBe(true);
    if (guard.ok) guard.done("sent", "1 of 1: yo");
    expect(liveClaims()).toEqual([]);
    const kinds = readActions({ chat: ref.conversationId }).map((a) => a.kind);
    expect(kinds).toEqual(["claimed", "refused", "released", "claimed", "sent", "released"]);
  });

  test("every pushed message gets a stable event id and its claim state goes in front of the agent", () => {
    const message = { platform: "discord", account: "acct", conversationId: ref.conversationId, with: "x", text: "is this ai", at: "2026-11-03T19:24:13.300Z", box: "dm", seenAt: "2026-11-03T19:24:13.865Z" };
    expect(eventIdOf(message)).toBe(eventIdOf({ ...message }));
    expect(claimContext([message], new Date(), alive)).toContain("unclaimed: `inboxClaim`");
    claimChat(ref, 111, new Date(), alive);
    expect(claimContext([message], new Date(), alive)).toContain("CLAIMED by pid 111");
  });
});
