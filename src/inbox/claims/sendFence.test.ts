import { describe, expect, test } from "bun:test";
import { appendEvent, db, latestSeq } from "../store/index.ts";
import { guardSend, readActions } from "./index.ts";

const ref = (chat: string) => ({ platform: "discord", account: "fence", conversationId: chat });

describe("each part of a send is fenced by its claim", () => {
  test("a second send into the same chat from the same process is refused while the first is going out", () => {
    const first = guardSend(ref("busy"));
    expect(first.ok).toBe(true);
    const second = guardSend(ref("busy"));
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.refused).toContain("A SEND IS ALREADY GOING OUT");
    if (first.ok) first.done("sent");
    const third = guardSend(ref("busy"));
    expect(third.ok).toBe(true);
    if (third.ok) third.done("sent");
  });

  test("every part records its intent and its send under the claim, with one operation id", () => {
    const guard = guardSend(ref("parts"));
    if (!guard.ok) throw new Error("not claimed");
    expect(guard.part(0, "first line")).toBe("go");
    guard.partSent(0, "first line", "m1");
    expect(guard.part(1, "second line")).toBe("go");
    guard.partSent(1, "second line", "m2");
    guard.done("sent");
    const kinds = readActions({ platform: "discord", account: "fence", chat: "parts" }).map((a) => a.kind);
    expect(kinds.filter((k) => k === "intent")).toHaveLength(2);
    expect(kinds.filter((k) => k === "partSent")).toHaveLength(2);
    const ops = new Set(readActions({ platform: "discord", account: "fence", chat: "parts" }).filter((a) => a.kind === "intent").map((a) => JSON.parse(a.detail ?? "{}").op));
    expect(ops.size).toBe(1);
  });

  test("a part is held when the claim was taken over between parts", () => {
    const guard = guardSend(ref("taken"));
    if (!guard.ok) throw new Error("not claimed");
    expect(guard.part(0, "one")).toBe("go");
    db().prepare("UPDATE claims SET generation = generation + 1 WHERE platform = 'discord' AND account = 'fence' AND conversationId = 'taken'").run();
    expect(guard.part(1, "two")).toBe("lost");
    guard.done("failed");
  });

  test("a message that landed after the gate read the chat stops the send before its first part", () => {
    const readUpTo = latestSeq();
    appendEvent({ platform: "discord", account: "fence", conversationId: "late", type: "message", with: "jd", text: "wait one sec", payload: { id: "late1" } });
    const guard = guardSend(ref("late"), undefined, { readUpTo });
    if (!guard.ok) throw new Error("not claimed");
    expect(guard.part(0, "my answer")).toBe("movedOn");
    expect(guard.heard()).toEqual(["jd: wait one sec"]);
    guard.done("failed");
  });

  test("after a crash, a part whose echo is already in the chat is not sent again", () => {
    const crashed = guardSend(ref("echo"));
    if (!crashed.ok) throw new Error("not claimed");
    expect(crashed.part(0, "hello there")).toBe("go");
    db().prepare("UPDATE claims SET sendingOp = NULL WHERE platform = 'discord' AND account = 'fence' AND conversationId = 'echo'").run();
    appendEvent({ platform: "discord", account: "fence", conversationId: "echo", type: "ownMessage", with: "me", text: "hello there", payload: { id: "e1", fromMe: true } });
    const retry = guardSend(ref("echo"));
    if (!retry.ok) throw new Error("not claimed");
    expect(retry.part(0, "hello there")).toBe("alreadySent");
    expect(retry.part(1, "and this is new")).toBe("go");
    retry.done("sent");
  });
});
