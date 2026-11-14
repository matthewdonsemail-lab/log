import { assign, fromPromise, setup } from 'xstate'
import type { TwitterEngineRun } from '../../account/session/index'
import { unrollCandidatesOf } from '../feed/index'
import type { EngagerKind } from '../feed/index'
import { UNROLL_CALL_PAGES } from './types'
import type { UnrollContext, UnrollDeps, UnrollInput, UnrollKindRead, UnrollPost, UnrollRun, UnrollStage } from './types'

const NOUNS: Record<EngagerKind, string> = { like: 'likers', repost: 'reposters' }

const runOf = ({ event }: { event: { output: TwitterEngineRun } }) => event.output

const postsOf = ({ event }: { event: { output: UnrollPost[] } }) => event.output

const errorOf = ({ event }: { event: { error: unknown } }) => event.error

const crash = { target: '#notificationUnroll.crashed', actions: { type: 'keepError' as const, params: errorOf } }

const kindRead = (wanted: boolean): UnrollKindRead => ({ wanted, done: false, pages: 0, newRows: 0 })

const postOf = (context: UnrollContext) => context.posts[context.index]!

const finished = (context: UnrollContext, kind: EngagerKind) => !postOf(context)[kind].wanted || postOf(context)[kind].done

export function choosePosts(deps: UnrollDeps, input: UnrollInput, storePath: string): UnrollPost[] {
  const store = deps.readStore(storePath)
  const candidates = input.everyPost ? unrollCandidatesOf(store, input.account, input.since) : []
  const posts: UnrollPost[] = candidates.filter((c) => c.postId !== input.postId).map((c) => ({ postId: c.postId, like: kindRead(c.kinds.includes('like')), repost: kindRead(c.kinds.includes('repost')) }))
  return input.postId ? [{ postId: input.postId, like: kindRead(true), repost: kindRead(true) }, ...posts] : posts
}

async function readEngagers(deps: UnrollDeps, context: UnrollContext, kind: EngagerKind): Promise<TwitterEngineRun> {
  const run = await deps.engine({ action: 'postEngagers', screenName: context.input.account, postId: postOf(context).postId, kind, pages: Math.min(UNROLL_CALL_PAGES, context.pagesLeft) })
  const sync = run.answer.engagerSync
  if (run.answer.ok && (!sync || (!sync.done && sync.pages < 1))) throw new Error(`the engine answered the ${NOUNS[kind]} read of post ${postOf(context).postId} without a page read`)
  return run
}

function keepPage(context: UnrollContext, run: TwitterEngineRun, kind: EngagerKind): Partial<UnrollContext> {
  const sync = run.answer.engagerSync!
  const posts = context.posts.map((post, at) => (at === context.index ? { ...post, [kind]: { ...post[kind], done: sync.done, pages: post[kind].pages + sync.pages, newRows: post[kind].newRows + sync.newRows } } : post))
  return { posts, lastRun: run, pagesLeft: context.pagesLeft - sync.pages, pagesRead: context.pagesRead + sync.pages }
}

function keepRefusal(context: UnrollContext, run: TwitterEngineRun, stage: UnrollStage): Partial<UnrollContext> {
  const answer = run.answer
  return { lastRun: run, refusal: answer, stop: { stage, code: answer.code ?? 'uncatalogued', detail: answer.detail ?? '', postId: stage === 'feed' ? null : postOf(context).postId } }
}

export function notificationUnrollMachine(deps: UnrollDeps) {
  return setup({
    types: { context: {} as UnrollContext, input: {} as UnrollInput, output: {} as UnrollRun },
    actors: {
      syncFeed: fromPromise(async ({ input }: { input: UnrollInput }): Promise<TwitterEngineRun> => deps.engine({ action: 'notifications', screenName: input.account, ...(input.full ? { full: true } : {}), ...(input.pages ? { pages: input.pages } : {}) })),
      choosePosts: fromPromise(async ({ input }: { input: UnrollContext }): Promise<UnrollPost[]> => choosePosts(deps, input.input, input.storePath)),
      readLikers: fromPromise(async ({ input }: { input: UnrollContext }): Promise<TwitterEngineRun> => readEngagers(deps, input, 'like')),
      readReposters: fromPromise(async ({ input }: { input: UnrollContext }): Promise<TwitterEngineRun> => readEngagers(deps, input, 'repost')),
    },
    guards: {
      refused: (_, run: TwitterEngineRun) => !run.answer.ok,
      noPostLeft: ({ context }) => context.index >= context.posts.length,
      likersFinished: ({ context }) => finished(context, 'like'),
      repostersFinished: ({ context }) => finished(context, 'repost'),
      pagesSpent: ({ context }) => context.pagesLeft < 1,
    },
    actions: {
      keepFeed: assign((_, run: TwitterEngineRun) => ({ feed: run.answer, lastRun: run, ...(run.answer.storePath ? { storePath: run.answer.storePath } : {}) })),
      keepFeedRefusal: assign(({ context }, run: TwitterEngineRun) => ({ feed: run.answer, ...keepRefusal(context, run, 'feed') })),
      keepPosts: assign((_, posts: UnrollPost[]) => ({ posts, index: 0 })),
      logPosts: ({ context }) => {
        if (context.posts.length) deps.log(`${context.input.account}: unrolling ${context.posts.length} post${context.posts.length === 1 ? '' : 's'} (${context.posts.map((p) => p.postId).join(', ')}), at most ${context.pagesLeft} pages this run`)
      },
      keepLikers: assign(({ context }, run: TwitterEngineRun) => keepPage(context, run, 'like')),
      keepReposters: assign(({ context }, run: TwitterEngineRun) => keepPage(context, run, 'repost')),
      keepLikersRefusal: assign(({ context }, run: TwitterEngineRun) => keepRefusal(context, run, 'likers')),
      keepRepostersRefusal: assign(({ context }, run: TwitterEngineRun) => keepRefusal(context, run, 'reposters')),
      logPage: ({ context }, kind: EngagerKind) => {
        const post = postOf(context)
        deps.log(`${context.input.account}: post ${post.postId} ${NOUNS[kind]}: ${post[kind].pages} page${post[kind].pages === 1 ? '' : 's'} read, ${post[kind].newRows} added${post[kind].done ? ', read to the end' : ''}`)
      },
      notePageCap: assign(({ context }) => ({ stop: { stage: 'pageCap' as const, code: null, detail: `the run's ${context.input.unrollPages} unroll pages are used: the place is held, run it again to go on`, postId: postOf(context).postId } })),
      logStop: ({ context }) => {
        if (context.stop) deps.log(`${context.input.account}: stopped before the end (${context.stop.stage}${context.stop.postId ? `, post ${context.stop.postId}` : ''}): ${[context.stop.code, context.stop.detail].filter(Boolean).join(': ')}`)
      },
      nextPost: assign(({ context }) => ({ index: context.index + 1 })),
      keepError: assign((_, error: unknown) => ({ error })),
      settle: assign((_, outcome: UnrollRun['outcome']) => ({ outcome })),
    },
  }).createMachine({
    id: 'notificationUnroll',
    initial: 'syncingFeed',
    context: ({ input }) => ({ input, storePath: input.storePath, feed: null, lastRun: null, refusal: null, posts: [], index: 0, pagesLeft: input.unrollPages, pagesRead: 0, stop: null, outcome: null, error: null }),
    states: {
      syncingFeed: {
        invoke: {
          src: 'syncFeed',
          input: ({ context }) => context.input,
          onDone: [
            { guard: { type: 'refused', params: runOf }, target: 'stopped', actions: { type: 'keepFeedRefusal', params: runOf } },
            { target: 'choosingPosts', actions: { type: 'keepFeed', params: runOf } },
          ],
          onError: crash,
        },
      },
      choosingPosts: {
        invoke: {
          src: 'choosePosts',
          input: ({ context }) => context,
          onDone: { target: 'pickingPost', actions: [{ type: 'keepPosts', params: postsOf }, 'logPosts'] },
          onError: crash,
        },
      },
      pickingPost: {
        always: [{ guard: 'noPostLeft', target: 'done' }, { target: 'likersGate' }],
      },
      likersGate: {
        always: [{ guard: 'likersFinished', target: 'repostersGate' }, { guard: 'pagesSpent', target: 'stopped', actions: 'notePageCap' }, { target: 'readingLikers' }],
      },
      readingLikers: {
        invoke: {
          src: 'readLikers',
          input: ({ context }) => context,
          onDone: [
            { guard: { type: 'refused', params: runOf }, target: 'stopped', actions: { type: 'keepLikersRefusal', params: runOf } },
            { target: 'likersGate', actions: [{ type: 'keepLikers', params: runOf }, { type: 'logPage', params: 'like' }] },
          ],
          onError: crash,
        },
      },
      repostersGate: {
        always: [{ guard: 'repostersFinished', target: 'pickingPost', actions: 'nextPost' }, { guard: 'pagesSpent', target: 'stopped', actions: 'notePageCap' }, { target: 'readingReposters' }],
      },
      readingReposters: {
        invoke: {
          src: 'readReposters',
          input: ({ context }) => context,
          onDone: [
            { guard: { type: 'refused', params: runOf }, target: 'stopped', actions: { type: 'keepRepostersRefusal', params: runOf } },
            { target: 'repostersGate', actions: [{ type: 'keepReposters', params: runOf }, { type: 'logPage', params: 'repost' }] },
          ],
          onError: crash,
        },
      },
      done: { type: 'final', entry: { type: 'settle', params: 'done' } },
      stopped: { type: 'final', entry: ['logStop', { type: 'settle', params: 'stopped' }] },
      crashed: { type: 'final', entry: { type: 'settle', params: 'crashed' } },
    },
    output: ({ context }) => ({ outcome: context.outcome ?? 'crashed', storePath: context.storePath, feed: context.feed, lastRun: context.lastRun, refusal: context.refusal, stop: context.stop, posts: context.posts, pagesRead: context.pagesRead, error: context.error }),
  })
}
