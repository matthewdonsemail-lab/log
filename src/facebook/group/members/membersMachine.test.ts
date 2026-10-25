import { describe, expect, test } from "bun:test";
import { createActor, fromPromise, toPromise } from "xstate";
import gotoHar from "./fixtures/membersPageGoto.json";
import scrollOneHar from "./fixtures/membersScrollOne.json";
import scrollTwoHar from "./fixtures/membersScrollTwo.json";
import { MEMBERS_REFETCH_QUERY, membersReadMachine, planMembers } from "./index.ts";
import type { MembersReadOutput, MembersStepInput, MembersStepReply } from "./index.ts";

const MEMBERS_URL = "https://www.facebook.com/groups/junkremovalwinners/members";

export const membersGoto = (): MembersStepReply => ({ ok: true, url: MEMBERS_URL, har: gotoHar });
export const membersScroll = (har: MembersStepReply["har"]): MembersStepReply => ({ ok: true, url: MEMBERS_URL, har });

export const listEnd = (): MembersStepReply => {
  const text = JSON.stringify({ data: { node: { __typename: "Group", id: "3549906855288164", new_members: { edges: [{ node: { __typename: "User", id: "77", name: "Last One", url: "https://www.facebook.com/last" } }], page_info: { has_next_page: false, end_cursor: null } } } } });
  return membersScroll({ log: { entries: [{ request: { postData: { params: [{ name: "fb_api_req_friendly_name", value: MEMBERS_REFETCH_QUERY }] } }, response: { content: { text } } }] } });
};

async function run(replies: MembersStepReply[], count: number, maxScrolls: number | null = null): Promise<{ output: MembersReadOutput; sent: MembersStepInput[]; at: number[] }> {
  const sent: MembersStepInput[] = [];
  const at: number[] = [];
  const machine = membersReadMachine.provide({
    actors: {
      step: fromPromise<MembersStepReply, MembersStepInput>(async ({ input: step }) => {
        sent.push(step);
        at.push(Date.now());
        const reply = replies.shift();
        if (!reply) throw new Error(`no scripted reply for ${step.action}`);
        return reply;
      }),
    },
  });
  const output = await toPromise(createActor(machine, { input: { account: "61594063207669", group: { key: "junkremovalwinners", membersUrl: MEMBERS_URL }, plan: planMembers(count, 0, maxScrolls) } }).start());
  return { output, sent, at };
}

describe("members read machine", () => {
  test("goto the members page, then scroll until --count: 30 members from the page and two scrolls, never a click", async () => {
    const { output, sent } = await run([membersGoto(), membersScroll(scrollOneHar), membersScroll(scrollTwoHar)], 30);
    expect(sent).toEqual([{ action: "goto", args: [MEMBERS_URL] }, { action: "scroll", args: [] }, { action: "scroll", args: [] }]);
    expect(output.result).toBe("read");
    expect(output.stop).toBe("count");
    expect(output.groupId).toBe("3549906855288164");
    expect(output.members).toHaveLength(30);
    expect(new Set(output.members.map((m) => m.id)).size).toBe(30);
    expect(output.scrolls).toBe(2);
    expect(output.steps.map((s) => s.step)).toEqual(["opening", "scroll 1", "scroll 2"]);
    expect(output.steps[1]!.detail).toBe("10 new member(s) in 1 answer(s), 20 so far");
  });

  test("--count at or under the page's 10 needs no scroll, and the output is cut to the count", async () => {
    const { output, sent } = await run([membersGoto()], 4);
    expect(sent.map((s) => s.action)).toEqual(["goto"]);
    expect(output.members).toHaveLength(4);
    expect(output.stop).toBe("count");
  });

  test("stops when the list ends (has_next_page false)", async () => {
    const { output, sent } = await run([membersGoto(), listEnd()], 100);
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    expect(output.stop).toBe("end");
    expect(output.members).toHaveLength(11);
    expect(output.hasNextPage).toBe(false);
  });

  test("stops at --maxScrolls", async () => {
    const { output, sent } = await run([membersGoto(), membersScroll(scrollOneHar)], 100, 1);
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    expect(output.stop).toBe("maxScrolls");
    expect(output.members).toHaveLength(20);
  });

  test("a scroll that brings the same members again adds nothing", async () => {
    const { output } = await run([membersGoto(), membersScroll(scrollOneHar), membersScroll(scrollOneHar)], 100, 2);
    expect(output.members).toHaveLength(20);
    expect(output.steps[2]!.detail).toBe("0 new member(s) in 1 answer(s), 20 so far");
  });

  test("waits secondsPerScroll before each scroll", async () => {
    const sent: number[] = [];
    const machine = membersReadMachine.provide({
      actors: {
        step: fromPromise<MembersStepReply, MembersStepInput>(async ({ input }) => {
          sent.push(Date.now());
          return input.action === "goto" ? membersGoto() : membersScroll(scrollOneHar);
        }),
      },
      delays: { betweenScrolls: 60 },
    });
    await toPromise(createActor(machine, { input: { account: "a", group: { key: "g", membersUrl: MEMBERS_URL }, plan: planMembers(20, 0) } }).start());
    expect(sent).toHaveLength(2);
    expect(sent[1]! - sent[0]!).toBeGreaterThanOrEqual(55);
  });

  test("a checkpoint stops it, and a members page with no list is not read as an empty group", async () => {
    const checkpoint = await run([{ ok: true, url: "https://www.facebook.com/checkpoint/1/" }], 30);
    expect(checkpoint.output).toMatchObject({ result: "stopped", problem: { code: "checkpointed" } });
    const empty = await run([{ ok: true, url: MEMBERS_URL, har: { log: { entries: [] } } }], 30);
    expect(empty.output.result).toBe("stopped");
    expect(empty.output.problem?.code).toBe("groupPageNotOpened");
    expect(empty.sent).toHaveLength(1);
  });

  test("a failed scroll stops with what was read so far", async () => {
    const { output } = await run([membersGoto(), { ok: false, error: "timeout" }], 30);
    expect(output.result).toBe("stopped");
    expect(output.problem).toEqual({ code: "groupReadStepFailed", detail: "timeout" });
    expect(output.members).toHaveLength(10);
  });
});
