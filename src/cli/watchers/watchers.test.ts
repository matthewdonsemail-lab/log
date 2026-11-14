import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db } from "../../inbox/store/index.ts";
import { watcherHeld, watcherRows } from "../../platformKit/watcher/index.ts";
import type { WatcherPlatform } from "../../platformKit/watcher/index.ts";
import { runCli } from "../runner/index.ts";
import { watchersDeps } from "./index.ts";

const original = { ...watchersDeps };
const SIGNED_IN: Record<string, string[]> = { twitter: ["fakeBird"], discord: ["fakeGuild"] };
let killed: number[] = [];
let supervised: { platform?: WatcherPlatform; account?: string }[] = [];

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "watchers"));
  killed = [];
  supervised = [];
  watchersDeps.accounts = (platform) => SIGNED_IN[platform] ?? [];
  watchersDeps.alive = (pid) => pid === 5151;
  watchersDeps.kill = (pid) => void killed.push(pid);
  watchersDeps.rows = (filter) => watcherRows(filter, (pid) => pid === 5151);
  watchersDeps.supervise = (filter) => (supervised.push(filter), { replaced: [], stale: [], started: filter.platform === "discord" ? ["discord/fakeGuild"] : [], held: [] });
});

afterEach(() => Object.assign(watchersDeps, original));

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(["watchers", ...argv], { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

function owner(platform: string, account: string, pid: number, status: string): void {
  const now = new Date().toISOString();
  db().prepare("INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES (?, ?, ?, 'h', ?, ?, ?)").run(platform, account, pid, now, now, status);
}

describe("log watchers", () => {
  test("status reads each watcher's machine state, and a signed-in account with no watcher yet reads stopped", async () => {
    owner("twitter", "fakeBird", 5151, "reconnecting");
    const r = await run(["status", "--json"]);
    expect(r.code).toBe(0);
    const { watchers } = JSON.parse(r.out) as { watchers: { platform: string; account: string; state: string; code: string | null }[] };
    expect(watchers.map((w) => [w.platform, w.account, w.state, w.code])).toEqual([
      ["twitter", "fakeBird", "reconnecting", null],
      ["discord", "fakeGuild", "stopped", "watcherNeverStarted"],
    ]);
  });

  test("a platform with no push watcher is capabilityMissing, and nothing is started", async () => {
    const r = await run(["start", "--platform", "reddit"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("capabilityMissing");
    expect(supervised).toEqual([]);
  });

  test("stop ends the named watcher, holds it, and start lifts the hold and starts it through the one start", async () => {
    owner("discord", "fakeGuild", 5151, "live");
    const stopped = await run(["stop", "--account", "fakeGuild", "--json"]);
    expect(JSON.parse(stopped.out)).toEqual({ stopped: ["discord/fakeGuild"], held: ["discord/fakeGuild"], inProcess: [] });
    expect(killed).toEqual([5151]);
    expect(watcherHeld("discord", "fakeGuild")).toBe(true);
    expect(watcherRows({ platform: "discord" }, () => false)[0]).toMatchObject({ state: "stopped", code: "stoppedByOwner" });
    const started = await run(["start", "--platform", "discord", "--json"]);
    expect(JSON.parse(started.out)).toMatchObject({ started: ["discord/fakeGuild"], lifted: ["discord/fakeGuild"] });
    expect(watcherHeld("discord", "fakeGuild")).toBe(false);
    expect(supervised).toEqual([{ platform: "discord" }]);
  });

  test("stop needs a platform or an account, never stops this process's own watch, and an unknown account is accountNotFound", async () => {
    expect((await run(["stop"])).err).toContain("--platform or --account is needed");
    owner("twitter", "fakeBird", process.pid, "live");
    watchersDeps.alive = (pid) => pid === process.pid;
    watchersDeps.rows = (filter) => watcherRows(filter, (pid) => pid === process.pid);
    const own = await run(["stop", "--platform", "twitter", "--json"]);
    expect(JSON.parse(own.out)).toMatchObject({ stopped: [], inProcess: ["twitter/fakeBird"] });
    expect(killed).toEqual([]);
    expect((await run(["start", "--account", "nobody"])).err).toContain("accountNotFound");
  });
});
