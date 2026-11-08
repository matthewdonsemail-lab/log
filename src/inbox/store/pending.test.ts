import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent, db, retirePendingFile } from "./index.ts";

describe("pending.jsonl is retired once every row is in events", () => {
  test("rows missing from events are added first, then the file is renamed, never deleted", () => {
    const dir = mkdtempSync(join(tmpdir(), "pending"));
    const path = join(dir, "pending.jsonl");
    const account = `pending${Date.now()}`;
    const row = (text: string) => JSON.stringify({ platform: "discord", account, conversationId: "c1", with: "jd", text, at: "2026-11-01T01:00:00Z", box: "dm", seenAt: "2026-11-01T01:00:01Z" });
    appendEvent({ platform: "discord", account, conversationId: "c1", type: "message", with: "jd", text: "already here", sourceAt: "2026-11-01T01:00:00Z" });
    writeFileSync(path, [row("already here"), row("only in the file")].join("\n") + "\n");
    expect(retirePendingFile(path)).toEqual({ retired: true, rows: 2, added: 1, unreadable: 0 });
    expect(existsSync(path)).toBe(false);
    expect(existsSync(`${path}.imported`)).toBe(true);
    expect((db().prepare("SELECT text FROM events WHERE account = ? ORDER BY seq").all(account) as { text: string }[]).map((r) => r.text)).toEqual(["already here", "only in the file"]);
  });

  test("a file with an unreadable line is kept where it is", () => {
    const dir = mkdtempSync(join(tmpdir(), "pendingBad"));
    const path = join(dir, "pending.jsonl");
    writeFileSync(path, "{not json\n");
    expect(retirePendingFile(path).retired).toBe(false);
    expect(existsSync(path)).toBe(true);
  });
});
