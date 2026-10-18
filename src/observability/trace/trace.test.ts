import { describe, expect, test } from "bun:test";
import { createActor, setup } from "xstate";
import { createInspector, formatTraceLine, stateToPath } from "./index.ts";
import type { TraceLine } from "./index.ts";

describe("trace", () => {
  test("stateToPath flattens nested state values", () => {
    expect(stateToPath("idle")).toBe("idle");
    expect(stateToPath({ watching: "cooldown" })).toBe("watching.cooldown");
  });

  test("inspector reports actor start, events and state changes once each", () => {
    const machine = setup({ types: { events: {} as { type: "GO" } } }).createMachine({
      initial: "a",
      states: { a: { on: { GO: "b" } }, b: {} },
    });
    const lines: TraceLine[] = [];
    const actor = createActor(machine, { id: "demo", inspect: createInspector((line) => lines.push(line)) });
    actor.start();
    actor.send({ type: "GO" });
    expect(lines.map((l) => `${l.kind}:${l.event ?? l.state ?? ""}`)).toEqual(["actor:", "state:a", "event:GO", "state:b"]);
    expect(formatTraceLine(lines[1])).toContain("demo");
  });
});
