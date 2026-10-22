import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createActor, toPromise } from "xstate";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import { feedScroll, groupPage, unit } from "../../group/read/readMachine.test.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { createContext } from "../runner/index.ts";
import { dueGroups, hostActors } from "./index.ts";
import type { HostBrowser } from "./index.ts";

const GROUP_ID = "4191018610937243";
const T = 1_792_500_000;
const NOW = new Date("2026-10-22T14:00:00.000Z");

/** A step as the open session answers it: its folder holds the step's network.har. */
function step(reply: { ok: boolean; url?: string; har?: unknown }): InspectStepResult {
  const folder = mkdtempSync(join(tmpdir(), "logHostStep"));
  if (reply.har) writeFileSync(join(folder, "network.har"), JSON.stringify(reply.har));
  return { ok: reply.ok, url: reply.url, folder };
}

describe("the host's group firehose", () => {
  test("a group is due when the account is a member, its id is known, and it wasn't read in the last groupMinutes; the longest-unread first", () => {
    const rows = [
      { id: "a", joinStatus: "MEMBER", facebookGroupId: "1", lastReadAt: "2026-10-22T13:30:00.000Z" },
      { id: "b", joinStatus: "MEMBER", facebookGroupId: "2", lastReadAt: "2026-10-22T12:00:00.000Z" },
      { id: "c", joinStatus: "MEMBER", facebookGroupId: "3", lastReadAt: null },
      { id: "d", joinStatus: "REQUESTED", facebookGroupId: "4", lastReadAt: null },
      { id: "e", joinStatus: "MEMBER", facebookGroupId: "someName", lastReadAt: null },
    ];
    expect(dueGroups(rows, NOW, 60).map((r) => r.id)).toEqual(["c", "b"]);
    expect(dueGroups(rows, NOW, 10).map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  test("a watch check reads each due group in the host's own browser and saves its posts; a group read lately waits", async () => {
    const twenty = marketplaceFixture();
    twenty.rows.agencyGroups = [
      { id: "g1", name: "Recommendations of Bethlehem", socialAccountId: "galwayOne", facebookGroupId: GROUP_ID, groupUrl: `https://www.facebook.com/groups/${GROUP_ID}/`, joinStatus: "MEMBER", lastReadAt: null },
      { id: "g2", name: "Read lately", socialAccountId: "galwayOne", facebookGroupId: "999", joinStatus: "MEMBER", lastReadAt: new Date().toISOString() },
    ];
    const replies = [step({ ok: true, url: "https://www.facebook.com/marketplace/you/selling" }), step(groupPage([unit("2", T + 20), unit("1", T + 10)])), step(feedScroll([], false))];
    const sent: { action: InspectAction; args: string[] }[] = [];
    const lines: string[] = [];
    const context = createContext({
      twenty,
      err: (l) => lines.push(l),
      sendInspect: async (_current, action, args) => {
        sent.push({ action, args });
        return replies.shift() ?? null;
      },
    });
    const account = await findAccount(twenty, "galwayOne");
    const browser: HostBrowser = { run: null, session: { current: { account: "galwayOne", runDir: "/runs/host", commandsPath: "/c", repliesPath: "/r", startedAt: NOW.toISOString() }, session: new Promise(() => {}) } };
    const actors = hostActors(context, account, browser, { bypassHours: true, groupMinutes: 60, log: (l) => lines.push(l) });
    const outcome = await toPromise(createActor(actors.watchCheck, { input: { accountId: account.id } }).start());
    expect(outcome).toEqual({ kind: "ok", detail: "1 group(s) read, 2 new post(s)" });
    expect(sent.map((s) => s.action)).toEqual(["goto", "goto", "scroll"]);
    expect(sent[1]!.args[0]).toBe(`https://www.facebook.com/groups/${GROUP_ID}/`);
    expect(twenty.rows.agencyGroupPosts).toHaveLength(2);
    expect(twenty.rows.agencyGroups![0]!.lastReadAt).toBeTruthy();
    expect(lines.join("\n")).toContain("group 4191018610937243: 2 new post(s)");
  });

  test("a checkpoint on a group page is the account's issue", async () => {
    const twenty = marketplaceFixture();
    twenty.rows.agencyGroups = [{ id: "g1", socialAccountId: "galwayOne", facebookGroupId: GROUP_ID, joinStatus: "MEMBER", lastReadAt: null }];
    const replies = [step({ ok: true, url: "https://www.facebook.com/marketplace/you/selling" }), step({ ok: true, url: "https://www.facebook.com/checkpoint/1501092823525282/" })];
    const context = createContext({ twenty, err: () => {}, sendInspect: async () => replies.shift() ?? null });
    const account = await findAccount(twenty, "galwayOne");
    const browser: HostBrowser = { run: null, session: { current: { account: "galwayOne", runDir: "/runs/host", commandsPath: "/c", repliesPath: "/r", startedAt: NOW.toISOString() }, session: new Promise(() => {}) } };
    const outcome = await toPromise(createActor(hostActors(context, account, browser, { bypassHours: true, log: () => {} }).watchCheck, { input: { accountId: account.id } }).start());
    expect(outcome).toMatchObject({ kind: "issue", issue: "checkpointed" });
  });
});
