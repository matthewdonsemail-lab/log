import { describe, expect, test } from "bun:test";
import { confirmParts, runAction } from "./index.ts";
import type { ActionStage } from "./index.ts";

interface FakeAnswer {
  ok: boolean;
  code?: string;
}

function recorder() {
  const stages: ActionStage[] = [];
  return { stages, onStage: (stage: ActionStage) => stages.push(stage) };
}

describe("the shared action machine", () => {
  test("a passed gate acts and the platform's answer confirms it: done", async () => {
    const seen = recorder();
    const acted: string[] = [];
    const result = await runAction<string, FakeAnswer>(
      {
        gate: async () => ({ ok: true, held: "claim-fakeBird" }),
        act: async (held) => {
          acted.push(held);
          return { ok: true };
        },
        confirm: (answer) => (answer.ok ? { ok: true } : { ok: false, code: String(answer.code), detail: "" }),
      },
      { onStage: seen.onStage },
    );
    expect(result.outcome).toBe("done");
    expect(result.stage).toBe("confirming");
    expect(result.held).toBe("claim-fakeBird");
    expect(result.answer).toEqual({ ok: true });
    expect(acted).toEqual(["claim-fakeBird"]);
    expect(seen.stages).toEqual(["gating", "acting", "confirming"]);
  });

  test("a refused gate never acts: refused at gating, with its code", async () => {
    const seen = recorder();
    let acted = false;
    const result = await runAction<string, FakeAnswer>(
      {
        gate: async () => ({ ok: false, code: "chatClaimedElsewhere", detail: "fakeGuild holds it" }),
        act: async () => {
          acted = true;
          return { ok: true };
        },
        confirm: () => ({ ok: true }),
      },
      { onStage: seen.onStage },
    );
    expect(acted).toBe(false);
    expect(result).toMatchObject({ outcome: "refused", stage: "gating", code: "chatClaimedElsewhere", detail: "fakeGuild holds it" });
    expect(seen.stages).toEqual(["gating"]);
  });

  test("a gate that throws is refused at gating with the error, and nothing acts", async () => {
    let acted = false;
    const boom = new Error("gate down");
    const result = await runAction<string, FakeAnswer>({
      gate: async () => {
        throw boom;
      },
      act: async () => {
        acted = true;
        return { ok: true };
      },
      confirm: () => ({ ok: true }),
    });
    expect(acted).toBe(false);
    expect(result.outcome).toBe("refused");
    expect(result.stage).toBe("gating");
    expect(result.error).toBe(boom);
  });

  test("the platform refusing is refused at confirming, keeping its answer", async () => {
    const result = await runAction<string, FakeAnswer>({
      gate: async () => ({ ok: true, held: "claim" }),
      act: async () => ({ ok: false, code: "rateLimited" }),
      confirm: (answer) => (answer.ok ? { ok: true } : { ok: false, code: String(answer.code), detail: "429" }),
    });
    expect(result).toMatchObject({ outcome: "refused", stage: "confirming", code: "rateLimited", detail: "429", answer: { ok: false, code: "rateLimited" }, held: "claim" });
  });

  test("acting that throws is uncertain: the platform may have got it", async () => {
    const boom = new Error("socket closed");
    let confirmed = false;
    const result = await runAction<string, FakeAnswer>({
      gate: async () => ({ ok: true, held: "claim" }),
      act: async () => {
        throw boom;
      },
      confirm: () => {
        confirmed = true;
        return { ok: true };
      },
    });
    expect(confirmed).toBe(false);
    expect(result).toMatchObject({ outcome: "uncertain", stage: "acting", held: "claim", error: boom });
  });

  test("a confirm that throws is uncertain at confirming", async () => {
    const result = await runAction<string, FakeAnswer>({
      gate: async () => ({ ok: true, held: "claim" }),
      act: async () => ({ ok: true }),
      confirm: () => {
        throw new Error("unreadable answer");
      },
    });
    expect(result.outcome).toBe("uncertain");
    expect(result.stage).toBe("confirming");
    expect(result.answer).toEqual({ ok: true });
  });
});

describe("confirmParts: a multi-part send is confirmed only when every part went out", () => {
  test("all parts sent is done; they wrote, a lost claim or a refused part is not", () => {
    expect(confirmParts({ sent: 3, total: 3 })).toEqual({ ok: true });
    expect(confirmParts({ sent: 1, total: 3, interrupted: true })).toMatchObject({ ok: false, code: "chatMovedOn" });
    expect(confirmParts({ sent: 0, total: 3, movedOn: true })).toMatchObject({ ok: false, code: "chatMovedOn" });
    expect(confirmParts({ sent: 1, total: 3, lost: true })).toMatchObject({ ok: false, code: "chatClaimLost" });
    expect(confirmParts({ sent: 1, total: 3, last: { ok: false, code: "rateLimited", detail: "429" } })).toEqual({ ok: false, code: "rateLimited", detail: "429" });
    expect(confirmParts({ sent: 1, total: 3 })).toMatchObject({ ok: false, code: "platformRefused" });
  });
});
