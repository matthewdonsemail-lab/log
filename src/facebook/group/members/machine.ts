import { assign, fromPromise, setup } from "xstate";
import { pageProblem } from "../../../browser/flow/index.ts";
import type { ErrorCode } from "../../../errors/catalog/index.ts";
import { memberPagesOf, mergeMembers, stopOf } from "./helpers/index.ts";
import type { MembersReadContext, MembersReadInput, MembersReadOutput, MembersStepInput, MembersStepReply } from "./types.ts";

type Done = { output: MembersStepReply };
type Problem = { code: ErrorCode; detail: string };

export const MEMBERS_SCROLL_STEP: MembersStepInput = { action: "scroll", args: [] };

function problemOf(step: MembersStepInput, reply: MembersStepReply, failed: ErrorCode): Problem | null {
  const landed = pageProblem({ action: step.action, url: step.action === "goto" ? step.args[0] : undefined }, reply);
  if (landed) return landed;
  return reply.ok === false ? { code: failed, detail: reply.error ?? `${step.action} failed` } : null;
}

const noted = (context: MembersReadContext, step: string, reply: MembersStepReply, detail?: string) => [...context.steps, { step, ok: reply.ok !== false, folder: reply.folder, detail: detail ?? reply.error }];

function readMembers(context: MembersReadContext, reply: MembersStepReply, name: string, scrolls: number): Partial<MembersReadContext> {
  let { groupId, members, skipped, endCursor, hasNextPage } = context;
  const pages = memberPagesOf(reply.har);
  const before = members.length;
  let wrongGroup = 0;
  for (const page of pages) {
    if (groupId && page.groupId && page.groupId !== groupId) {
      wrongGroup += page.members.length;
      continue;
    }
    groupId = groupId ?? page.groupId;
    members = mergeMembers(members, page.members);
    for (const [type, n] of Object.entries(page.skipped)) skipped = { ...skipped, [type]: (skipped[type] ?? 0) + n };
    if (page.endCursor) endCursor = page.endCursor;
    if (page.hasNextPage !== null) hasNextPage = page.hasNextPage;
  }
  const stop = stopOf({ members: members.length, hasNextPage, scrolls }, context.plan);
  const detail = `${members.length - before} new member(s) in ${pages.length} answer(s), ${members.length} so far${wrongGroup ? `, ${wrongGroup} from another group ignored` : ""}${hasNextPage === false ? ", the list ended" : ""}`;
  return { groupId, members, skipped, endCursor, hasNextPage, scrolls, stop, steps: noted(context, name, reply, detail) };
}

export const membersReadMachine = setup({
  types: {
    context: {} as MembersReadContext,
    input: {} as MembersReadInput,
    output: {} as MembersReadOutput,
  },
  actors: {
    step: fromPromise<MembersStepReply, MembersStepInput>(async () => {
      throw new Error("membersReadMachine: provide a `step` actor");
    }),
  },
  delays: {
    betweenScrolls: ({ context }) => Math.max(0, context.plan.secondsPerScroll) * 1000,
  },
  guards: {
    stopped: ({ context }) => context.problem !== null,
    settled: ({ context }) => context.stop !== null,
  },
}).createMachine({
  id: "membersRead",
  context: ({ input }) => ({
    ...input,
    groupId: null,
    members: [],
    skipped: {},
    endCursor: null,
    hasNextPage: null,
    scrolls: 0,
    stop: null,
    problem: null,
    steps: [],
  }),
  initial: "opening",
  states: {
    opening: {
      invoke: {
        src: "step",
        input: ({ context }) => ({ action: "goto", args: [context.group.membersUrl] }),
        onDone: {
          target: "opened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const step: MembersStepInput = { action: "goto", args: [context.group.membersUrl] };
            const problem = problemOf(step, reply, "groupPageNotOpened");
            if (problem) return { steps: noted(context, "opening", reply, problem.detail), problem };
            const read = readMembers(context, reply, "opening", 0);
            if (!read.members?.length && read.hasNextPage === null) {
              const detail = `the members page showed no new members list (${reply.url ?? context.group.membersUrl})`;
              return { ...read, steps: noted(context, "opening", reply, detail), problem: { code: "groupPageNotOpened" as const, detail } };
            }
            return read;
          }),
        },
        onError: { target: "stopped", actions: assign({ problem: ({ event }) => ({ code: "groupPageNotOpened" as const, detail: String(event.error) }) }) },
      },
    },
    opened: {
      always: [{ guard: "stopped", target: "stopped" }, { guard: "settled", target: "done" }, { target: "waiting" }],
    },
    waiting: {
      after: { betweenScrolls: { target: "scrolling" } },
    },
    scrolling: {
      invoke: {
        src: "step",
        input: MEMBERS_SCROLL_STEP,
        onDone: {
          target: "opened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const name = `scroll ${context.scrolls + 1}`;
            const problem = problemOf(MEMBERS_SCROLL_STEP, reply, "groupReadStepFailed");
            if (problem) return { steps: noted(context, name, reply, problem.detail), problem, scrolls: context.scrolls + 1 };
            return readMembers(context, reply, name, context.scrolls + 1);
          }),
        },
        onError: { target: "stopped", actions: assign({ problem: ({ event }) => ({ code: "groupReadStepFailed" as const, detail: String(event.error) }) }) },
      },
    },
    done: { type: "final" },
    stopped: { type: "final" },
  },
  output: ({ context }) => ({
    account: context.account,
    groupKey: context.group.key,
    groupId: context.groupId,
    result: context.problem ? "stopped" : "read",
    stop: context.stop,
    members: context.members.slice(0, context.plan.count),
    scrolls: context.scrolls,
    hasNextPage: context.hasNextPage,
    endCursor: context.endCursor,
    skipped: context.skipped,
    problem: context.problem,
    steps: context.steps,
  }),
});
