import { describe, expect, test } from "bun:test";
import { cacheKey, main } from "./cachedCheck.ts";

const files: Record<string, string> = { "docs/a.md": "one", ".env.local": "LOG_PYTHON=x" };
const read = (path: string) => (path in files ? Buffer.from(files[path]) : null);
const inputs = { index: "100644 abc 0\tsrc/a.ts\n", worktree: ["docs/a.md", ".env.local"] };

describe("a slow check is skipped only when it already passed on exactly the same files", () => {
  test("the same command on the same files gives the same key", () => {
    expect(cacheKey(["bun", "run", "check:specs"], inputs, read, "1")).toBe(cacheKey(["bun", "run", "check:specs"], inputs, read, "1"));
  });

  test("any change to a staged file, a file being edited, a deleted file, the runtime or the command gives a new key", () => {
    const base = cacheKey(["bun", "run", "check:specs"], inputs, read, "1");
    expect(cacheKey(["bun", "run", "check:specs"], { ...inputs, index: "100644 abd 0\tsrc/a.ts\n" }, read, "1")).not.toBe(base);
    expect(cacheKey(["bun", "run", "check:specs"], inputs, (p) => (p === "docs/a.md" ? Buffer.from("two") : read(p)), "1")).not.toBe(base);
    expect(cacheKey(["bun", "run", "check:specs"], inputs, (p) => (p === "docs/a.md" ? null : read(p)), "1")).not.toBe(base);
    expect(cacheKey(["bun", "run", "check:specs"], inputs, read, "2")).not.toBe(base);
    expect(cacheKey(["bun", "run", "check:specs", "--staged"], inputs, read, "1")).not.toBe(base);
  });

  test("with no script it refuses with its usage", () => {
    expect(main([], {})).toBe(2);
  });
});
