import { describe, expect, test } from "bun:test";
import { platformMachines } from "../platformClient/index.ts";
import { FACTS_START, factsFromDoc, NEUTRAL_REASONING, renderOperationDoc, requestDocPrompts, TO_WRITE } from "./index.ts";
import type { ClientOperation } from "./index.ts";

const OLD_FACTS_START = "<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->";

const operation: ClientOperation = {
  name: "fakeGuildQuery",
  domain: "guilds",
  kind: "query",
  docId: null,
  path: "/api/v9/guilds",
  sends: ["guildId"],
  reads: ["name"],
  calledFrom: ["fakeModule"],
  sightings: [{ run: "r1", action: "inspect", step: "step 1: goto /channels", status: 200, ms: 120, afterStepMs: 300, errors: [] }],
  reaEvidenceId: "ev_1",
} as unknown as ClientOperation;

describe("the request-doc template takes the platform's name and its own machines", () => {
  test("a platform's doc names that platform, never Facebook", () => {
    const doc = renderOperationDoc(operation, null, undefined, requestDocPrompts({ name: "Discord", evidence: "rea's reading of the code that sends it", machines: platformMachines("discord") }));
    expect(doc).toContain("on Discord's side");
    expect(doc).not.toMatch(/Facebook|marketplace/);
    expect(doc.split(TO_WRITE)).toHaveLength(4);
  });

  test("Facebook's machines are read from src/facebook/, not written by hand", () => {
    const machines = platformMachines("facebook");
    expect(machines).toContain("facebook/marketplace/publish");
    expect(machines.every((m) => m.startsWith("facebook/"))).toBe(true);
    const [, ours] = requestDocPrompts({ name: "Facebook", evidence: "its definition", machines });
    expect(ours[1]).toContain("`facebook/marketplace/publish`");
  });

  test("with no platform given the template names none", () => {
    expect(NEUTRAL_REASONING.map(([, prompt]) => prompt).join(" ")).not.toMatch(/Facebook|marketplace/);
    expect(platformMachines("noSuchPlatform")).toEqual([]);
  });
});

describe("docs written under the old marker still read", () => {
  const written = (marker: string) => renderOperationDoc(operation, null).replace(FACTS_START, marker).replaceAll(`${TO_WRITE} `, "Written by hand. ");

  test("a rebuild keeps the reasoning and writes the new marker", () => {
    const rebuilt = renderOperationDoc({ ...operation, reaEvidenceId: "ev_2" }, written(OLD_FACTS_START));
    expect(rebuilt).toContain("Written by hand.");
    expect(rebuilt).toContain(FACTS_START);
    expect(rebuilt).not.toContain(OLD_FACTS_START);
    expect(rebuilt).toContain("`ev_2`");
    expect(rebuilt.match(/facts:start/g)).toHaveLength(1);
  });

  test("the facts store reads a doc under either marker the same way", () => {
    expect(factsFromDoc(written(OLD_FACTS_START))).toEqual(factsFromDoc(written(FACTS_START)));
    expect(factsFromDoc(written(OLD_FACTS_START))?.reaEvidenceId).toBe("ev_1");
  });
});
