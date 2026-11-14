import { describe, expect, test } from "bun:test";
import { COMMANDS } from "../../cli/runner/index.ts";
import { commandKey } from "../../cli/runner/helpers/platforms.ts";
import type { CommandResult } from "../../cli/runner/types.ts";
import { asksLive, liveActionOf, runLive } from "./index.ts";
import type { ActionStage } from "./index.ts";

const CONVERTED = ["adsPower", "facebookPreflight", "facebookLifecycle", "facebookListing", "runs", "storage", "new", "clone", "facebookCampaign", "chats", "messages", "voiceNotes"];

const liveFlagsOf = (key: string): string[] => {
  const command = COMMANDS.find((c) => commandKey(c) === key)!;
  return [...new Set((command.input?.forms ?? []).flatMap((form) => form.flags.filter((f) => f.live).map((f) => f.name)))];
};

const silent = { out: () => {}, err: () => {} } as never;

describe("runLive: a live run goes gating, acting, confirming", () => {
  test("a run that worked passes every stage and comes back as it was", async () => {
    const stages: ActionStage[] = [];
    const done = await runLive(async () => ({ code: 0, stdout: "fine" }), undefined, { onStage: (s) => stages.push(s) });
    expect(done).toEqual({ code: 0, stdout: "fine" });
    expect(stages).toEqual(["gating", "acting", "confirming"]);
  });

  test("a gate refusal does nothing", async () => {
    let acted = false;
    const done = await runLive(async () => {
      acted = true;
      return { code: 0 };
    }, async () => ({ ok: false, code: "fakeRefused", detail: "no" }));
    expect(acted).toBe(false);
    expect(done).toEqual({ ok: false, code: "fakeRefused", detail: "no" });
  });

  test("an act that throws is uncertain and the error comes back out", async () => {
    await expect(runLive(async () => {
      throw new Error("fakeEngineBroke");
    })).rejects.toThrow("fakeEngineBroke");
  });

  test("a run that failed is refused at confirming and its own result is returned", async () => {
    expect(await runLive(async () => ({ code: 1, error: "fakeFailed", stderr: "it failed" }))).toEqual({ code: 1, error: "fakeFailed", stderr: "it failed" });
  });

  test("only a live flag asks for a live run", () => {
    expect(asksLive(["sync", "--apply"], ["apply"])).toBe(true);
    expect(asksLive(["sync", "--apply=false"], ["apply"])).toBe(false);
    expect(asksLive(["sync"], ["apply"])).toBe(false);
  });
});

describe("every live command with a new live flag runs its live path through runAction", () => {
  for (const key of CONVERTED) {
    test(`${key}: every live flag goes through, and a gate refusal, a throw and a run that worked behave`, async () => {
      const command = COMMANDS.find((c) => commandKey(c) === key)!;
      const holder = liveActionOf(command)!;
      expect(holder).not.toBeNull();
      for (const flag of liveFlagsOf(key)) expect(holder.flags).toContain(flag);
      const flag = liveFlagsOf(key)[0] ?? "live";
      const held = { ...holder };
      const calls: string[][] = [];
      try {
        holder.inner = { run: async (_context, argv) => (calls.push(argv), { code: 0, stdout: "fakeDone" }) };
        expect(await command.run(silent, ["x", `--${flag}`])).toEqual({ code: 0, stdout: "fakeDone" } as CommandResult);
        expect(await command.run(silent, ["x"])).toEqual({ code: 0, stdout: "fakeDone" } as CommandResult);
        expect(calls.length).toBe(2);
        holder.gate = async () => ({ ok: false, code: "fakeRefused", detail: "held" });
        expect(await command.run(silent, ["x", `--${flag}`])).toEqual({ code: 1, error: "fakeRefused", stderr: "held" } as unknown as CommandResult);
        expect(calls.length).toBe(2);
        holder.gate = held.gate;
        holder.inner = { run: async () => { throw new Error("fakeThrow"); } };
        await expect(Promise.resolve(command.run(silent, ["x", `--${flag}`]))).rejects.toThrow("fakeThrow");
      } finally {
        holder.inner = held.inner;
        holder.gate = held.gate;
      }
    });
  }
});
