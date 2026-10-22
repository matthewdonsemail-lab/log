import { assign, fromPromise, setup } from "xstate";
import { pageProblem } from "../../../browser/flow/index.ts";
import type { ErrorCode } from "../../../errors/catalog/index.ts";
import { addCounts, commentPagesOf, commentTargets, feedPagesOf, groupIdFromStep, mergeComments, mergePosts, NEWEST_COMMENTS, postDialogOf, postPageOf, reachedCursor } from "./helpers/index.ts";
import { newPosts } from "./helpers/extractPosts.ts";
import type { GroupReadContext, GroupReadInput, GroupReadOutput, ReadStepInput, ReadStepReply } from "./types.ts";

type Done = { output: ReadStepReply };
type Problem = { code: ErrorCode; detail: string };

const MAX_COMMENT_SCROLLS = 4;

function problemOf(step: ReadStepInput, reply: ReadStepReply, failed: ErrorCode): Problem | null {
  const landed = pageProblem({ action: step.action, url: step.action === "goto" ? step.args[0] : undefined }, reply);
  if (landed) return landed;
  return reply.ok === false ? { code: failed, detail: reply.error ?? `${step.action} failed` } : null;
}

const stopsRead = (problem: Problem) => problem.code === "checkpointed" || problem.code === "loginWall";

const noted = (context: GroupReadContext, step: string, reply: ReadStepReply, detail?: string) => [...context.steps, { step, ok: reply.ok !== false, folder: reply.folder, detail: detail ?? reply.error }];

const scrollStep: ReadStepInput = { action: "scroll", args: ["2", "700"] };

function readFeed(context: GroupReadContext, reply: ReadStepReply, name: string): Partial<GroupReadContext> {
  const groupId = context.groupId ?? groupIdFromStep(reply.har);
  if (!groupId) return { steps: noted(context, name, reply, "no group id on the page"), problem: { code: "groupIdUnknown", detail: `the page never gave ${context.group.key}'s numeric id` } };
  const pages = feedPagesOf(reply.har, groupId);
  let { seen, rejected, skipped, hasNextPage } = context;
  for (const page of pages) {
    seen = mergePosts(seen, page.posts);
    rejected = addCounts(rejected, page.rejected);
    skipped = addCounts(skipped, page.skipped) as Record<string, number>;
    if (page.hasNextPage !== null) hasNextPage = page.hasNextPage;
  }
  const got = pages.reduce((n, p) => n + p.posts.length, 0);
  const reached = context.reachedCursor || reachedCursor(seen, context.cursor);
  const rejects = Object.values(rejected).reduce((n, c) => n + (c ?? 0), 0);
  return {
    groupId,
    seen,
    rejected,
    skipped,
    hasNextPage,
    reachedCursor: reached,
    steps: noted(context, name, reply, `${got} post(s) in ${pages.length} answer(s), ${seen.length} so far${rejects ? `, ${rejects} rejected` : ""}${reached ? ", reached the last read" : ""}${hasNextPage === false ? ", the feed ended" : ""}`),
  };
}

function readComments(context: GroupReadContext, reply: ReadStepReply, name: string): Partial<GroupReadContext> {
  const before = context.pageComments.length;
  let { pageComments, commentHasNext } = context;
  for (const page of commentPagesOf(reply.har, context.groupId!)) {
    pageComments = mergeComments(pageComments, page.comments);
    if (page.hasNextPage !== null) commentHasNext = page.hasNextPage;
  }
  return { pageComments, commentHasNext, steps: noted(context, name, reply, `${pageComments.length - before} new comment(s), ${pageComments.length} on the post${commentHasNext ? ", more to load" : ""}`) };
}

function postFailed(context: GroupReadContext, reply: ReadStepReply, name: string, problem: Problem): Partial<GroupReadContext> {
  return stopsRead(problem) ? { steps: noted(context, name, reply, problem.detail), problem } : { steps: noted(context, name, reply, problem.detail), postProblem: `${name}: ${problem.detail}` };
}

const current = (context: GroupReadContext) => context.targets[context.index]!;

export const groupReadMachine = setup({
  types: {
    context: {} as GroupReadContext,
    input: {} as GroupReadInput,
    output: {} as GroupReadOutput,
  },
  actors: {
    step: fromPromise<ReadStepReply, ReadStepInput>(async () => {
      throw new Error("groupReadMachine: provide a `step` actor");
    }),
  },
  guards: {
    stopped: ({ context }) => context.problem !== null,
    feedSettled: ({ context }) => context.reachedCursor || context.hasNextPage === false || context.scrolls >= context.maxScrolls,
    postsLeft: ({ context }) => context.index < context.targets.length,
    postFailed: ({ context }) => context.postProblem !== null,
    moreComments: ({ context }) => context.commentHasNext === true && context.commentScrolls < MAX_COMMENT_SCROLLS,
  },
  actions: {
    finishPost: assign(({ context }) => {
      const post = current(context);
      return {
        comments: mergeComments(context.comments, context.pageComments),
        commentReads: [...context.commentReads, { postId: post.postId, commentCount: post.commentCount, comments: context.pageComments.length, problem: context.postProblem }],
        index: context.index + 1,
      };
    }),
  },
}).createMachine({
  id: "groupRead",
  context: ({ input }) => ({
    ...input,
    groupId: input.group.facebookGroupId && /^\d+$/.test(input.group.facebookGroupId) ? input.group.facebookGroupId : null,
    seen: [],
    rejected: {},
    skipped: {},
    scrolls: 0,
    hasNextPage: null,
    reachedCursor: false,
    feedDone: false,
    fresh: [],
    cursorAfter: input.cursor,
    targets: [],
    index: 0,
    commentScrolls: 0,
    pageComments: [],
    commentHasNext: null,
    postProblem: null,
    comments: [],
    commentReads: [],
    problem: null,
    steps: [],
  }),
  initial: "opening",
  states: {
    opening: {
      invoke: {
        src: "step",
        input: ({ context }) => ({ action: "goto", args: [context.group.url] }),
        onDone: {
          target: "opened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const problem = problemOf({ action: "goto", args: [context.group.url] }, reply, "groupPageNotOpened");
            if (problem) return { steps: noted(context, "opening", reply, problem.detail), problem };
            return readFeed(context, reply, "opening");
          }),
        },
        onError: { target: "stopped", actions: assign({ problem: ({ event }) => ({ code: "groupPageNotOpened" as const, detail: String(event.error) }) }) },
      },
    },
    opened: {
      always: [{ guard: "stopped", target: "stopped" }, { guard: "feedSettled", target: "settled" }, { target: "scrolling" }],
    },
    scrolling: {
      invoke: {
        src: "step",
        input: scrollStep,
        onDone: {
          target: "opened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const problem = problemOf(scrollStep, reply, "groupReadStepFailed");
            if (problem) return { steps: noted(context, "scrolling", reply, problem.detail), problem };
            return { ...readFeed(context, reply, `scroll ${context.scrolls + 1}`), scrolls: context.scrolls + 1 };
          }),
        },
        onError: { target: "stopped", actions: assign({ problem: ({ event }) => ({ code: "groupReadStepFailed" as const, detail: String(event.error) }) }) },
      },
    },
    settled: {
      always: {
        target: "nextPost",
        actions: assign(({ context }) => {
          const { posts, cursor } = newPosts(context.seen, context.cursor);
          return { fresh: posts, cursorAfter: cursor, feedDone: true, targets: commentTargets(posts, posts, context.commentsRead, context.maxCommentPosts) };
        }),
      },
    },
    nextPost: {
      always: [
        { guard: "stopped", target: "stopped" },
        { guard: "postsLeft", target: "openingPost", actions: assign({ commentScrolls: 0, pageComments: [], commentHasNext: null, postProblem: null }) },
        { target: "done" },
      ],
    },
    openingPost: {
      invoke: {
        src: "step",
        input: ({ context }) => ({ action: "goto", args: [postPageOf(context.groupId!, current(context).postId)] }),
        onDone: {
          target: "postOpened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const name = `post ${current(context).postId}`;
            const problem = problemOf({ action: "goto", args: [postPageOf(context.groupId!, current(context).postId)] }, reply, "groupReadStepFailed");
            return problem ? postFailed(context, reply, name, problem) : readComments(context, reply, name);
          }),
        },
        onError: { target: "postOpened", actions: assign({ postProblem: ({ event }) => `opening the post: ${String(event.error)}` }) },
      },
    },
    postOpened: {
      always: [
        { guard: "stopped", target: "stopped" },
        { guard: "postFailed", target: "postDone" },
        { guard: ({ context }) => context.live, target: "sorting" },
        { target: "scrollingComments" },
      ],
    },
    sorting: {
      invoke: {
        src: "step",
        input: { action: "clickRole", args: ["button", "Most relevant"] },
        onDone: {
          target: "sortOpened",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const problem = problemOf({ action: "clickRole", args: [] }, reply, "groupReadStepFailed");
            return problem ? postFailed(context, reply, "sort menu", problem) : { steps: noted(context, "sort menu", reply, 'opened "Most relevant"') };
          }),
        },
        onError: { target: "sortOpened", actions: assign({ postProblem: ({ event }) => `the sort menu: ${String(event.error)}` }) },
      },
    },
    sortOpened: {
      always: [{ guard: "stopped", target: "stopped" }, { guard: "postFailed", target: "postDone" }, { target: "newest" }],
    },
    newest: {
      invoke: {
        src: "step",
        input: { action: "clickRole", args: ["menuitem", NEWEST_COMMENTS] },
        onDone: {
          target: "sorted",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const problem = problemOf({ action: "clickRole", args: [] }, reply, "groupReadStepFailed");
            return problem ? postFailed(context, reply, "newest", problem) : readComments(context, reply, "newest");
          }),
        },
        onError: { target: "sorted", actions: assign({ postProblem: ({ event }) => `Newest: ${String(event.error)}` }) },
      },
    },
    sorted: {
      always: [{ guard: "stopped", target: "stopped" }, { guard: "postFailed", target: "postDone" }, { target: "commentsRead" }],
    },
    scrollingComments: {
      invoke: {
        src: "step",
        input: ({ context }) => ({ action: "scrollIn", args: ["dialog", postDialogOf(current(context)), "3", "800"] }),
        onDone: {
          target: "commentsRead",
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output;
            const name = `comments scroll ${context.commentScrolls + 1}`;
            const problem = problemOf({ action: "scrollIn", args: [] }, reply, "groupReadStepFailed");
            return { ...(problem ? postFailed(context, reply, name, problem) : readComments(context, reply, name)), commentScrolls: context.commentScrolls + 1 };
          }),
        },
        onError: { target: "commentsRead", actions: assign({ postProblem: ({ event }) => `scrolling the comments: ${String(event.error)}` }) },
      },
    },
    commentsRead: {
      always: [
        { guard: "stopped", target: "stopped" },
        { guard: "postFailed", target: "postDone" },
        { guard: ({ context }) => context.commentScrolls === 0, target: "scrollingComments" },
        { guard: "moreComments", target: "scrollingComments" },
        { target: "postDone" },
      ],
    },
    postDone: {
      always: { target: "nextPost", actions: "finishPost" },
    },
    done: { type: "final" },
    stopped: { type: "final" },
  },
  output: ({ context }) => {
    const inPost = context.problem && context.feedDone && context.index < context.targets.length && context.pageComments.length;
    return {
      account: context.account,
      groupId: context.groupId,
      result: context.problem ? "stopped" : "read",
      posts: context.fresh,
      seen: context.seen,
      comments: inPost ? mergeComments(context.comments, context.pageComments) : context.comments,
      commentReads: context.commentReads,
      cursor: context.feedDone ? context.cursorAfter : context.cursor,
      feedDone: context.feedDone,
      reachedCursor: context.reachedCursor,
      gap: context.feedDone && context.cursor.watermark !== null && !context.reachedCursor && context.hasNextPage !== false,
      rejected: context.rejected,
      skipped: context.skipped,
      problem: context.problem,
      steps: context.steps,
    };
  },
});
