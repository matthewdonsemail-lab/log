import { describe, expect, test } from "bun:test";
import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { aiIndexStale } from "./helpers/voice.ts";

function aiIndexAt(builtAt: string): string {
  const dir = mkdtempSync(join(tmpdir(), "aiTells"));
  writeFileSync(join(dir, "index.json"), JSON.stringify({ model: "m", dimensions: 2, builtAt, phrases: [], baseline: { messages: 0, p50: 0, p99: 0, mutedRules: [] } }));
  writeFileSync(join(dir, "vectors.f32"), Buffer.alloc(0));
  return dir;
}

describe("log voice keeps its own AI tells index current (rule 112)", () => {
  test("a missing index is rebuilt by the gate itself", () => {
    expect(aiIndexStale(mkdtempSync(join(tmpdir(), "none")), join(tmpdir(), "noPairs.json"))).toBe(true);
  });

  test("an index older than matt's voice index is rebuilt, a newer one is kept", () => {
    const pairs = join(mkdtempSync(join(tmpdir(), "voice")), "pairs.json");
    writeFileSync(pairs, "[]");
    utimesSync(pairs, new Date("2026-11-02T04:00:00Z"), new Date("2026-11-02T04:00:00Z"));
    expect(aiIndexStale(aiIndexAt("2026-11-01T00:00:00Z"), pairs)).toBe(true);
    expect(aiIndexStale(aiIndexAt("2026-11-02T05:00:00Z"), pairs)).toBe(false);
  });
});
