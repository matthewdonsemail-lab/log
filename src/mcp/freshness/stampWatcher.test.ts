import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { codeStampWatcher } from "./index.ts";

function tree(): string {
  const root = mkdtempSync(join(tmpdir(), "stampWatcher"));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src", "a.ts"), "export const a = 1;\n");
  return root;
}

describe("codeStampWatcher", () => {
  test("reading the stamp never walks the tree; refresh walks only after a change or the backstop", () => {
    const root = tree();
    let walks = 0;
    let fire: (file: string | null) => void = () => {};
    let clock = 0;
    const watcher = codeStampWatcher(root, { walk: () => ++walks, watch: (_dir, onChange) => ((fire = onChange), { close() {} }), now: () => clock, backstopMs: 60_000 });
    expect(walks).toBe(1);
    for (let i = 0; i < 100; i++) watcher.current();
    expect(walks).toBe(1);
    expect(watcher.refresh()).toBe(false);
    expect(walks).toBe(1);
    fire("notes.md");
    expect(watcher.refresh()).toBe(false);
    expect(walks).toBe(1);
    fire("src/a.ts");
    expect(watcher.refresh()).toBe(true);
    expect(walks).toBe(2);
    expect(watcher.current()).toBe(2);
    clock = 60_000;
    expect(watcher.refresh()).toBe(true);
    expect(walks).toBe(3);
  });

  test("a watch that can't start falls back to walking on every refresh", () => {
    const root = tree();
    let walks = 0;
    const watcher = codeStampWatcher(root, { walk: () => ++walks, watch: () => null, now: () => 0 });
    watcher.refresh();
    watcher.refresh();
    expect(walks).toBe(3);
  });

  test("a real file change is seen through the real watcher", async () => {
    const root = tree();
    const watcher = codeStampWatcher(root);
    const before = watcher.current();
    await Bun.sleep(50);
    writeFileSync(join(root, "src", "a.ts"), "export const a = 2;\n");
    let seen = false;
    for (let i = 0; i < 40 && !seen; i++) {
      await Bun.sleep(50);
      seen = watcher.refresh() || watcher.current() > before;
    }
    watcher.close();
    expect(seen).toBe(true);
  });
});
