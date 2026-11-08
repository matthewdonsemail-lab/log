import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, minReaderVersionOf, schemaVersionOf } from "./client.ts";
import { SCHEMA_VERSION, SchemaTooNewError } from "./index.ts";
import { MIN_READER_VERSION, sweepUntyped } from "./helpers/index.ts";
import { importOldLedgers } from "../ledger/client.ts";
import { CONVERSATION_BATCH_MESSAGES, saveConversationRows } from "../platform/index.ts";

describe("old code and new code share the file", () => {
  test("a newer database that only added things is opened as it is", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    expect(minReaderVersionOf(handle)).toBe(MIN_READER_VERSION);
    handle.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 3}`);
    expect(migrate(handle)).toEqual([]);
    expect(schemaVersionOf(handle)).toBe(SCHEMA_VERSION + 3);
  });

  test("a database whose readers must be newer than this code is refused", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    handle.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`);
    handle.prepare("UPDATE meta SET value = ? WHERE key = 'minReaderVersion'").run(String(SCHEMA_VERSION + 1));
    expect(() => migrate(handle)).toThrow(SchemaTooNewError);
  });

  test("the owner's sweep types events older code left untyped", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    handle.prepare("INSERT INTO events (eventId, platform, account, conversationId, type, payload, sourceAt, receivedAt, appendedAt, source) VALUES ('old1', 'discord', 'a', 'c1', 'message', ?, '2026-11-08T01:00:00Z', '2026-11-08T01:00:00Z', '2026-11-08T01:00:00Z', 'live')").run(JSON.stringify({ id: "1" }));
    expect(sweepUntyped(handle)).toBe(1);
    expect((handle.prepare("SELECT COUNT(*) n FROM messages").get() as { n: number }).n).toBe(1);
    expect(sweepUntyped(handle)).toBe(0);
  });
});

describe("transactions are short", () => {
  test("a ledger import resumes after the lines it already wrote", () => {
    const dir = mkdtempSync(join(tmpdir(), "ledgerResume"));
    const file = join(dir, "launchResets.jsonl");
    writeFileSync(file, ["a", "b", "c"].map((account) => JSON.stringify({ at: "2026-11-08T01:00:00Z", account, reason: "test" })).join("\n"));
    const handle = new Database(":memory:");
    migrate(handle);
    handle.prepare("INSERT INTO imports (store, state, rows, startedAt) VALUES ('launchResets', 'importing', 2, '2026-11-08T00:00:00Z')").run();
    importOldLedgers(handle, { LOG_LAUNCH_RESETS: file, LOG_PROXY_TRAFFIC: join(dir, "none.jsonl") }, dir);
    expect((handle.prepare("SELECT account FROM ledger").all() as { account: string }[]).map((r) => r.account)).toEqual(["c"]);
    expect(handle.prepare("SELECT state, rows FROM imports WHERE store = 'launchResets'").get()).toEqual({ state: "done", rows: 3 });
  });

  test("a large conversation import commits in batches rather than one long transaction", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    const commits: number[] = [];
    const exec = handle.exec.bind(handle);
    handle.exec = ((sql: string) => {
      if (sql === "COMMIT") commits.push(1);
      return exec(sql);
    }) as typeof handle.exec;
    const conversations = Array.from({ length: 3 }, (_, c) => ({ platform: "slack", account: "a", conversationId: `D${c}`, box: "dm", with: ["kim"], messages: Array.from({ length: CONVERSATION_BATCH_MESSAGES }, (_, m) => ({ id: `${c}.${m}`, at: "2026-11-08T01:00:00Z", from: "kim", fromMe: false, text: `m${m}` })) }));
    expect(saveConversationRows(handle, conversations)).toBe(3 * CONVERSATION_BATCH_MESSAGES);
    expect(commits.length).toBe(3);
  });
});
