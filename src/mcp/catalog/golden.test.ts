import { describe, expect, test } from "bun:test";
import { COMMANDS } from "../../cli/runner/index.ts";
import golden from "./fixtures/golden.json";
import { capabilityOfEntry, catalog, searchCatalog } from "./index.ts";

const entries = catalog(COMMANDS);

describe("logSearch golden set", () => {
  for (const { query, within, id } of golden.queries) {
    test(`"${query}" finds ${id}${within > 1 ? ` in its first ${within}` : " first"}`, () => {
      const result = searchCatalog(entries, query, 8);
      expect(result.hits.slice(0, within).map((h) => h.entry.id)).toContain(id);
    });
  }

  test("a terminal-only entry is never strong, and ranks below a callable one that matches as much", () => {
    for (const { query } of golden.queries) {
      const result = searchCatalog(entries, query, 8);
      if (result.verdict === "strong") expect(result.hits[0].entry.terminalOnly).toBeNull();
    }
    const terminal = entries.filter((e) => e.terminalOnly);
    for (const entry of terminal) {
      const result = searchCatalog(terminal, entry.summary, 3);
      expect(result.verdict).not.toBe("strong");
    }
  });

  test("a who question puts reads before writes, and a platform word or synonym keeps other platforms out", () => {
    const who = searchCatalog(entries, "who liked my post on x", 8);
    expect(who.hits[0].entry.effect).toBe("read");
    for (const hit of searchCatalog(entries, "post a tweet", 8).hits) expect(["twitter", "any", "byArgument"]).toContain(hit.entry.platform);
    for (const hit of searchCatalog(entries, "upvote a post", 8).hits) expect(["reddit", "any", "byArgument"]).toContain(hit.entry.platform);
  });

  test("results are grouped by capability", () => {
    const hits = searchCatalog(entries, "send a message", 8).hits;
    const seen: string[] = [];
    for (const hit of hits) {
      const capability = capabilityOfEntry(hit.entry);
      if (seen.length && seen[seen.length - 1] !== capability && seen.includes(capability)) throw new Error(`${capability} is split in ${hits.map((h) => h.entry.id).join(", ")}`);
      seen.push(capability);
    }
  });
});
