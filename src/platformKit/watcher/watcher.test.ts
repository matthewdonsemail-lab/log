import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ownOrAttach } from "../../inbox/relay/index.ts";
import { db, openGap } from "../../inbox/store/index.ts";
import { claimWatcher } from "../../inbox/watch/index.ts";
import { holdWatcher, reconcileWatchers, recordWatcherEnd, startAccountWatcher, superviseWatchers, watchArgvOf, watchEndOf, watcherHeld, watcherRows, watcherStateOf } from "./index.ts";
import type { SuperviseDeps, WatcherActors, WatcherEnd, WatcherPlatform, WatcherState } from "./index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "watcher"));
  delete process.env.LOG_INBOX_POLL;
});

function socket() {
  let finish: (answer: { ok: boolean; code?: string }) => void = () => {};
  let fail: (error: Error) => void = () => {};
  const ended = new Promise<{ answer: { ok: boolean; code?: string } }>((done, failed) => {
    finish = (answer) => done({ answer });
    fail = failed;
  });
  return { ended, end: (answer: { ok: boolean; code?: string } = { ok: true }) => finish(answer), crash: (error: Error) => fail(error) };
}

function stubActors(overrides: Partial<WatcherActors<{ answer: { ok: boolean; code?: string } }>> = {}) {
  const fake = socket();
  const released: { end: WatcherEnd; code: string | null }[] = [];
  let behind = false;
  let catchUps = 0;
  const actors: WatcherActors<{ answer: { ok: boolean; code?: string } }> = {
    claim: () => ({ ok: true, generation: 3 }),
    connect: () => fake.ended,
    catchUp: async () => {
      catchUps++;
    },
    release: async (end, code) => {
      released.push({ end, code });
    },
    endOf: watchEndOf,
    behind: () => behind,
    ...overrides,
  };
  return { actors, fake, released, setBehind: (value: boolean) => (behind = value), catchUps: () => catchUps };
}

const settle = () => Bun.sleep(5);

describe("one machine per account watcher", () => {
  test("it claims, catches up, goes live, reconnects on a drop and catches up again when the socket opens", async () => {
    const seen: WatcherState[] = [];
    const { actors, fake, released, catchUps } = stubActors();
    const watcher = startAccountWatcher(actors, { onState: (state) => seen.push(state) });
    await settle();
    expect(watcher.state()).toBe("live");
    watcher.send({ type: "dropped" });
    expect(watcher.state()).toBe("reconnecting");
    watcher.send({ type: "opened" });
    await settle();
    expect(watcher.state()).toBe("live");
    expect(catchUps()).toBe(2);
    fake.end();
    const run = await watcher.done;
    expect(run).toMatchObject({ state: "stopped", code: null, generation: 3 });
    expect(seen).toEqual(["starting", "catchingUp", "live", "reconnecting", "catchingUp", "live", "stopped"]);
    expect(released).toEqual([{ end: "stopped", code: null }]);
  });

  test("a second watcher is refused by a state, busy with the holder, and nothing connects or is released", async () => {
    let connected = false;
    const { actors, released } = stubActors({ claim: () => ({ ok: false, holder: 4242 }), connect: async () => ((connected = true), { answer: { ok: true } }) });
    const run = await startAccountWatcher(actors).done;
    expect(run).toMatchObject({ state: "busy", holder: 4242 });
    expect(connected).toBe(false);
    expect(released).toEqual([]);
  });

  test("anything heard while reconnecting means the socket is back, and a recheck catches up only while behind", async () => {
    const { actors, fake, setBehind, catchUps } = stubActors();
    const watcher = startAccountWatcher(actors);
    await settle();
    watcher.send({ type: "recheck" });
    await settle();
    expect(catchUps()).toBe(1);
    setBehind(true);
    watcher.send({ type: "recheck" });
    await settle();
    expect(catchUps()).toBe(2);
    watcher.send({ type: "dropped" });
    watcher.send({ type: "heard" });
    await settle();
    expect(watcher.state()).toBe("live");
    expect(catchUps()).toBe(3);
    fake.end();
    await watcher.done;
  });

  test("how the socket ended names the end: a dead session is signInNeeded, a rate limit coolingDown, any other refusal failed", async () => {
    const ends: [{ ok: boolean; code?: string }, WatcherState, string | null][] = [
      [{ ok: false, code: "sessionDead" }, "signInNeeded", "sessionDead"],
      [{ ok: false, code: "noPlatformSession" }, "signInNeeded", "noPlatformSession"],
      [{ ok: false, code: "rateLimited" }, "coolingDown", "rateLimited"],
      [{ ok: false, code: "platformError" }, "failed", "platformError"],
      [{ ok: true }, "stopped", null],
    ];
    for (const [answer, state, code] of ends) {
      const { actors, fake, released } = stubActors();
      const watcher = startAccountWatcher(actors);
      await settle();
      fake.end(answer);
      expect(await watcher.done).toMatchObject({ state, code });
      expect(released).toEqual([{ end: state as WatcherEnd, code }]);
    }
  });

  test("a socket that throws is released, then failed with the error; a claim that throws is failed with nothing released", async () => {
    const { actors, fake, released } = stubActors();
    const watcher = startAccountWatcher(actors);
    await settle();
    fake.crash(new Error("the fake socket broke"));
    const run = await watcher.done;
    expect(run.state).toBe("failed");
    expect((run.error as Error).message).toBe("the fake socket broke");
    expect(released).toEqual([{ end: "failed", code: "watcherFailed" }]);
    const claimBroke = stubActors({ claim: () => Promise.reject(new Error("log.db is locked")) });
    const broken = await startAccountWatcher(claimBroke.actors).done;
    expect(broken.state).toBe("failed");
    expect(claimBroke.released).toEqual([]);
  });

  test("a release that throws still ends failed, never stuck", async () => {
    const { actors, fake } = stubActors({ release: () => Promise.reject(new Error("relay close failed")) });
    const watcher = startAccountWatcher(actors);
    await settle();
    fake.end();
    const run = await watcher.done;
    expect(run.state).toBe("failed");
    expect((run.error as Error).message).toBe("relay close failed");
  });
});

describe("the watch command drives the machine through ownOrAttach", () => {
  test("the owners row carries the machine's state, a drop opens a gap, and the end is kept in log.db", async () => {
    const statuses: string[] = [];
    const status = () => (db().prepare("SELECT status FROM owners WHERE platform = 'discord' AND account = 'fakeGuild'").get() as { status: string }).status;
    const owned = await ownOrAttach("discord", "fakeGuild", {
      inbox: true,
      onAttached: () => {},
      onState: (state) => statuses.push(state),
      run: async (emit) => {
        await Bun.sleep(5);
        statuses.push(`row:${status()}`);
        emit({ type: "socket", state: "closed" });
        statuses.push(`row:${status()}`);
        emit({ type: "socket", state: "open" });
        await Bun.sleep(5);
        emit({ kind: "message", text: "hey", channelId: "1" });
        return { answer: { ok: false, code: "sessionDead" } };
      },
    });
    expect(owned).toEqual({ owner: true, result: { answer: { ok: false, code: "sessionDead" } } });
    expect(statuses).toEqual(["starting", "catchingUp", "live", "row:live", "reconnecting", "row:reconnecting", "catchingUp", "live", "signInNeeded"]);
    expect(db().prepare("SELECT reason FROM gaps WHERE platform = 'discord' AND account = 'fakeGuild'").get()).toEqual({ reason: "socketDropped" });
    expect(status()).toBe("stopped");
    const [row] = watcherRows({ platform: "discord" });
    expect(row).toMatchObject({ account: "fakeGuild", state: "signInNeeded", code: "sessionDead", pid: null });
  });

  test("a second inbox watch is refused while the first holds the account", async () => {
    const fresh = new Date().toISOString();
    db().prepare("INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES ('slack', 'fakeTwin', ?, 'h', ?, ?, 'live')").run(process.ppid, fresh, fresh);
    let ran = false;
    const lost = await ownOrAttach("slack", "fakeTwin", { inbox: true, onAttached: () => {}, run: async () => ((ran = true), 0) });
    expect("refused" in lost && lost.refused).toContain(`pid ${process.ppid} already owns`);
    expect(ran).toBe(false);
  });

  test("a recheck catches up only an account that is behind", async () => {
    openGap("instagram", "fakeTwin", new Date(Date.now() - 60_000).toISOString(), "noOwner");
    let caught = 0;
    await ownOrAttach("instagram", "fakeTwin", { inbox: true, onAttached: () => {}, catchUp: async () => ((caught++), { appended: 0 }), run: async () => (await Bun.sleep(5), 0) });
    expect(caught).toBe(1);
  });
});

describe("the watcher's state in log.db", () => {
  test("a running row whose process is gone is reconciled to stopped, and legacy statuses read as the machine's", () => {
    const now = new Date().toISOString();
    db().prepare("INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES ('twitter', 'fakeBird', 999999, 'h', ?, ?, 'streaming')").run(now, now);
    expect(watcherRows({}, () => true)[0]).toMatchObject({ state: "live", pid: 999999 });
    expect(reconcileWatchers(() => false)).toEqual(["twitter/fakeBird"]);
    expect(watcherRows({}, () => false)[0]).toMatchObject({ state: "stopped", code: "watcherGone", pid: null });
    expect(watcherStateOf("connecting")).toBe("starting");
    expect(watcherStateOf("nonsense")).toBeNull();
  });

  test("the end a watcher recorded is what status shows once it is gone", () => {
    expect(claimWatcher("instagram", "fakeTwin", 4545, () => false)).toMatchObject({ ok: true });
    recordWatcherEnd("instagram", "fakeTwin", "coolingDown", "rateLimited", 4545);
    db().prepare("UPDATE owners SET status = 'stopped' WHERE platform = 'instagram'").run();
    expect(watcherRows({ account: "FAKETWIN" }, () => false)).toMatchObject([{ platform: "instagram", state: "coolingDown", code: "rateLimited" }]);
  });
});

describe("one start for every harness", () => {
  function stubSupervise(signedIn: Record<string, string[]>, extra: Partial<SuperviseDeps> = {}) {
    const started: string[] = [];
    const deps: SuperviseDeps = {
      accounts: (platform) => signedIn[platform] ?? [],
      coolingDown: (_platform, account) => account === "fakeCold",
      start: (platform, account) => (started.push(`${platform}/${account}`), 4000 + started.length),
      replaceHung: () => [],
      stopStale: () => [],
      ensure: (_platform, accounts, start) => accounts.filter((a) => start(a) !== null),
      held: (platform, account) => watcherHeld(platform, account),
      ...extra,
    };
    return { deps, started };
  }

  test("it starts every signed-in account's watcher, leaving out one cooling down and one the owner held", () => {
    holdWatcher("discord", "fakeHeld", "owner");
    const { deps, started } = stubSupervise({ twitter: ["fakeBird"], discord: ["fakeGuild", "fakeHeld"], slack: ["fakeCold"] });
    const done = superviseWatchers(deps);
    expect(started).toEqual(["twitter/fakeBird", "discord/fakeGuild"]);
    expect(done).toMatchObject({ started: ["twitter/fakeBird", "discord/fakeGuild"], held: ["discord/fakeHeld"] });
  });

  test("it can be narrowed to one platform or one account", () => {
    const { deps, started } = stubSupervise({ twitter: ["fakeBird"], discord: ["fakeGuild"] });
    superviseWatchers(deps, { account: "FAKEGUILD" });
    superviseWatchers(deps, { platform: "twitter" as WatcherPlatform });
    expect(started).toEqual(["discord/fakeGuild", "twitter/fakeBird"]);
  });

  test("each platform's watch runs its own command with --inbox, from one table", () => {
    expect(watchArgvOf("twitter", "fakeBird")).toEqual(["twitter", "chat", "watch", "--account", "fakeBird", "--inbox"]);
    expect(watchArgvOf("discord", "fakeGuild")).toEqual(["discord", "watch", "--account", "fakeGuild", "--inbox"]);
  });
});

afterEach(() => {
  delete process.env.LOG_INBOX_POLL;
});
