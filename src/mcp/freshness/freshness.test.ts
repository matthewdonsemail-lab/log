import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recordServerStart, staleServerLine } from "./index.ts";

describe("the MCP server says when it runs older code than the checkout", () => {
  test("fresh at start, stale once a source file changes after it", () => {
    const root = mkdtempSync(join(tmpdir(), "logFresh"));
    mkdirSync(join(root, "src"));
    const file = join(root, "src", "a.ts");
    writeFileSync(file, "export const a = 1\n");
    const old = new Date(Date.now() - 60_000);
    utimesSync(file, old, old);
    const stamp = join(root, "server.json");
    recordServerStart(root, stamp);
    expect(staleServerLine(root, stamp)).toBeNull();
    writeFileSync(file, "export const a = 2\n");
    expect(staleServerLine(root, stamp)).toContain("running older code than the checkout");
  });
});
