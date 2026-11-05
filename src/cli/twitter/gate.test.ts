import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent } from "../../inbox/store/index.ts";
import { chatIdFor, momentAnswered, failedParts, rankedContext, voiceDeps } from "./helpers/voice.ts";
import type { GateReading } from "./helpers/voice.ts";

const passing: GateReading = { to: "@x", voice: 0.95, inContext: 0.9, friendLike: 0.9, openerOnly: 1, toThem: null, buildsOn: null, neverSays: [], watermark: { level: "clean", findings: [] } as unknown as GateReading["watermark"], pass: true, model: "m", notHere: [], scrambler: { ran: true, suspicious: 0, hits: [] } as unknown as GateReading["scrambler"], ranked: [] };

describe("the voice gate inside every send (rule 137)", () => {
  test("a pass names nothing, and a fail names only what failed", () => {
    expect(failedParts(passing)).toEqual([]);
    const failing = { ...passing, voice: 0.4, neverSays: ["spot on"], pass: false };
    const parts = failedParts(failing);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain("spot on");
    expect(parts[1]).toContain("voice 0.40");
  });

  test("a voice note that repeats what matt already said names it (rule 149)", () => {
    const parts = failedParts({ ...passing, buildsOn: 0.3, pass: false });
    expect(parts).toHaveLength(1);
    expect(parts[0]).toContain("buildsOn 0.30");
  });

  test("the chat's context is ranked against the moment being answered, from the .db, in full", async () => {
    process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "gate"));
    const before = voiceDeps.aiEmbedder;
    const words = ["camera", "video", "tax", "weather"];
    voiceDeps.aiEmbedder = () => ({ model: "fake", dimensions: 4, embed: async (texts: string[]) => texts.map((t) => words.map((w) => (t.toLowerCase().includes(w) ? 1 : 0))), rerank: async (query: string, docs: string[]) => docs.map((d) => (d.toLowerCase().includes(query.split(" ")[0].toLowerCase()) ? 1 : 0)) });
    try {
      for (const [i, text] of ["the weather is grim", "camera arrived today, sent you the video", "tax return done"].entries()) appendEvent({ platform: "discord", account: "acct", conversationId: "D1", type: "message", with: "abel", text, sourceAt: `2026-11-04T0${i}:00:00Z`, receivedAt: `2026-11-04T0${i}:00:01Z` });
      const ranked = await rankedContext("discord", "acct", { conversationId: "D1" }, "camera ok?", 1);
      expect(ranked).toEqual([{ from: "abel", text: "camera arrived today, sent you the video", at: "2026-11-04T01:00:00Z" }]);
    } finally {
      voiceDeps.aiEmbedder = before;
    }
  });
});

describe("the gate inside a send finds the chat's real replies by what the send knows", () => {
  const conversations = [
    { platform: "twitter", account: "matthewsoldit", conversationId: "1491032180553920513:1974596626342686720", with: ["SalesPsych0"], box: "xchat", messages: [] },
    { platform: "twitter", account: "matthewsoldit", conversationId: "1663390258099101696-1974596626342686720", with: ["shaw_gtm"], box: "dm", messages: [] },
    { platform: "discord", account: "sourcedandsoldtothehighestbidder", conversationId: "1565734133609668780", with: ["rvaclassic"], box: "dm", messages: [] },
  ] as never[];

  test("an X send with only the user id finds the person's chat, whichever pair names it", () => {
    expect(chatIdFor(conversations, { platform: "twitter", userId: "1491032180553920513" })).toBe("twitter:salespsych0");
    expect(chatIdFor(conversations, { platform: "twitter", userId: "1663390258099101696" })).toBe("twitter:shaw_gtm");
  });

  test("another platform's send finds its chat by the conversation id, never another platform's chat of the same name", () => {
    expect(chatIdFor(conversations, { platform: "discord", conversationId: "1565734133609668780" })).toBe("discord:1565734133609668780");
    expect(chatIdFor(conversations, { platform: "slack", handle: "rvaclassic" })).toBeNull();
  });
});

describe("the gate inside a send only grades an answer when there is something to answer", () => {
  test("their newest message is what is being answered", () => {
    expect(momentAnswered([{ fromMe: true, text: "you there", time: "2026-11-05T00:24:58Z" }, { fromMe: false, text: "Not me", time: "2026-11-05T00:26:44Z" }])).toBe("Not me");
  });

  test("when matt's own message is the newest, the send is new news, not a reply", () => {
    expect(momentAnswered([{ fromMe: false, text: "Not me", time: "2026-11-05T00:26:44Z" }, { fromMe: true, text: "(voice note: look at my screen)", time: "2026-11-05T06:27:57Z" }])).toBe("");
    expect(momentAnswered([])).toBe("");
    expect(momentAnswered([{ fromMe: true, text: "how you gonna get people on it", time: "2026-11-05T17:47:00Z" }, { fromMe: false, text: "just put on earning sites", time: "2026-11-05T17:47:30Z" }, { fromMe: false, text: "will take a while", time: "2026-11-05T17:49:06Z" }])).toBe("just put on earning sites\nwill take a while");
  });
});
