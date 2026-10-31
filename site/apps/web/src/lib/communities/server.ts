import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { MOCK_CONNECTIONS } from '../connections/mock'
import type { ConnectionPlatform } from '../connections'
import type { AccountIssue } from '../account-issues'
import {
  COMMUNITIES_BASE,
  communityFromGroupUrl,
  communityFromSubreddit,
  parseFacebookGroupUrl,
  parseSubredditName,
  resolveAccountLabel,
  SEED_JOINED,
} from './mock'
import { driveMachine } from './actors'
import { hashQuestionSet } from './transition'
import {
  bootstrapFacebookEvents,
  deriveFacebookValue,
  facebookInputFromRow,
  facebookMachine,
  facebookNotice,
  facebookToJoinState,
  facebookUserVerdict,
  type FacebookContext,
  type FacebookEvent,
  type FacebookStateValue
} from './facebook/machine'
import {
  bootstrapRedditEvents,
  deriveRedditValue,
  normalizeSubredditType,
  redditInputFromRow,
  redditMachine,
  redditNotice,
  redditToJoinState,
  redditUserVerdict,
  type RedditContext,
  type RedditEvent,
  type RedditStateValue
} from './reddit/machine'
import type {
  Community,
  StoredCommunityJoin
} from './types'
import { COMMUNITY_JOIN_STATES } from './types'
import { isArray, isRecord, loadPersistedState, savePersistedState } from '../persist'
import { CommunitiesResponseJson, CommunityResponseJson, CommunitySingleResponseJson, errorResponse } from '../openapi'
import { requestLogger } from '../request-log'

/**
 * In-memory join relation for the communities API. Membership is the only
 * mutable state; the seed catalog never changes, but pasted group links can
 * register new rows (the stand-in for the client resolving an unknown URL).
 *
 * Every mutation dispatches by platform to its xstate machine
 * (`facebook/`, `reddit/`) — never to hand-rolled transitions. Actors
 * are ephemeral per request: the flat row below is replayed through the
 * platform bootstrap events, the new events are sent, and the snapshot is
 * written back to flat fields. User intents run a verdict pre-check first
 * and 409 with the machine reason on refusal, so the store and the row menu
 * can never disagree about which moves are legal.
 *
 * Store version: `communities.joins.v2`. A key bump resets rows to seeds
 * instead of running lossy migrations (locked decision).
 */
type BaseCommunity = (typeof COMMUNITIES_BASE)[number]

type JoinState = StoredCommunityJoin

const CATALOG_KEY = 'communities.catalog'
const JOINS_KEY = 'communities.joins.v2'

const FORM_PHASES: readonly string[] = ['idle', 'rendered', 'incomplete', 'submitting', 'abandoned']

function isBaseCommunityArray(value: unknown): value is BaseCommunity[] {
  return (
    isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        typeof row.id === 'string' &&
        typeof row.platform === 'string' &&
        typeof row.name === 'string'
    )
  )
}

function isJoinStateRecord(value: unknown): value is Record<string, JoinState> {
  if (!isRecord(value)) return false
  return Object.values(value).every(
    (row) =>
      isRecord(row) &&
      (typeof row.state === 'string' && (COMMUNITY_JOIN_STATES as readonly string[]).includes(row.state)) &&
      (row.accountId === null || typeof row.accountId === 'string') &&
      isArray(row.answers) &&
      row.answers.every((answer) => typeof answer === 'string') &&
      typeof row.answersComplete === 'boolean' &&
      (row.questionsHash === null || typeof row.questionsHash === 'string') &&
      (row.questionsScrapedAt === null || typeof row.questionsScrapedAt === 'string') &&
      (row.scrapedQuestions === null || (isArray(row.scrapedQuestions) && row.scrapedQuestions.every((q) => typeof q === 'string'))) &&
      isArray(row.draftAnswers) &&
      row.draftAnswers.every((answer) => typeof answer === 'string') &&
      (row.submittedAt === null || typeof row.submittedAt === 'string') &&
      (row.removedBy === undefined || row.removedBy === 'user' || row.removedBy === 'platform') &&
      (typeof row.formPhase === 'string' && FORM_PHASES.includes(row.formPhase)) &&
      (row.priorJoinState === null || (typeof row.priorJoinState === 'string' && (COMMUNITY_JOIN_STATES as readonly string[]).includes(row.priorJoinState))) &&
      (row.subredditType === null || typeof row.subredditType === 'string') &&
      typeof row.userIsContributor === 'boolean' &&
      typeof row.quarantineOptIn === 'boolean' &&
      typeof row.karmaGated === 'boolean' &&
      (row.karmaEvidence === null || typeof row.karmaEvidence === 'string') &&
      typeof row.accessRequested === 'boolean'
  )
}

function defaultJoin(): JoinState {
  return {
    state: 'none',
    accountId: null,
    answers: [],
    answersComplete: false,
    questionsHash: null,
    questionsScrapedAt: null,
    scrapedQuestions: null,
    draftAnswers: [],
    submittedAt: null,
    formPhase: 'idle',
    priorJoinState: null,
    subredditType: null,
    userIsContributor: false,
    quarantineOptIn: false,
    karmaGated: false,
    karmaEvidence: null,
    accessRequested: false
  }
}

/**
 * The catalog starts with the seeds plus any client-resolved rows from a
 * previous session; the joins map likewise rehydrates. Both persist on
 * every mutation below, so joins, answers and resolved groups survive a
 * refresh instead of resetting to seeds.
 */
const catalog: BaseCommunity[] =
  (loadPersistedState(CATALOG_KEY, isBaseCommunityArray) ?? [...COMMUNITIES_BASE])
    // X search scopes are keywords, not communities — drop any X rows a
    // previous session persisted before the X catalog was removed.
    .filter((row) => row.platform !== 'x')

function createJoinState(): Record<string, JoinState> {
  const state: Record<string, JoinState> = {}
  for (const community of catalog) state[community.id] = defaultJoin()
  for (const seed of SEED_JOINED) {
    if (state[seed.id]) {
      state[seed.id] = {
        ...defaultJoin(),
        state: seed.state,
        accountId: seed.accountId,
        ...(seed.state === 'accepted' && communityPlatformOf(seed.id) === 'reddit'
          ? { subredditType: 'public' }
          : {})
      }
    }
  }
  return state
}

function communityPlatformOf(id: string): ConnectionPlatform | undefined {
  return catalog.find((row) => row.id === id)?.platform as ConnectionPlatform | undefined
}

const joins: Record<string, JoinState> =
  loadPersistedState(JOINS_KEY, isJoinStateRecord) ?? createJoinState()

// Drop orphaned join rows (e.g. X rows persisted before the X catalog was
// removed) — materialize only walks the catalog, so these never render;
// the next mutation persists the cleaned map.
for (const id of Object.keys(joins)) {
  if (!catalog.some((row) => row.id === id)) delete joins[id]
}

function persistCommunities(): void {
  savePersistedState(CATALOG_KEY, catalog)
  savePersistedState(JOINS_KEY, joins)
}

function findBaseById(id: string): BaseCommunity | undefined {
  return catalog.find((row) => row.id === id)
}

function findBaseByUrl(url: string): BaseCommunity | undefined {
  return catalog.find((row) => row.url === url)
}

/** Register a client-resolved row (pasted link, typed subreddit, …). */
function registerRow(row: BaseCommunity): BaseCommunity {
  let id = row.id
  let suffix = 2
  while (catalog.some((existing) => existing.id === id)) {
    id = `${row.id}-${suffix}`
    suffix += 1
  }
  const registered: BaseCommunity = { ...row, id }
  catalog.push(registered)
  joins[registered.id] = defaultJoin()
  return registered
}

/** Register a pasted group link as a tracked community (mock resolution). */
function registerBase(parsed: { slug: string; url: string }): BaseCommunity {
  return registerRow(communityFromGroupUrl(parsed))
}

function findRedditBase(key: string, url: string): BaseCommunity | undefined {
  const lowerUrl = url.toLowerCase()
  return catalog.find(
    (row) =>
      row.platform === 'reddit' &&
      (row.url?.toLowerCase() === lowerUrl || row.handle.toLowerCase() === `r/${key}`)
  )
}

function liveAccountIssue(accountId: string | null | undefined): AccountIssue | undefined {
  if (!accountId) return undefined
  return MOCK_CONNECTIONS.find((row) => row.id === accountId)?.lastIssue ?? undefined
}

/** Effective question set: last scrape wins, catalog fallback otherwise. */
function effectiveQuestions(base: BaseCommunity, row: JoinState): string[] {
  return row.scrapedQuestions ?? base.entryQuestions
}

function rowNotice(base: BaseCommunity, row: JoinState): string | null {
  if (base.platform === 'facebook') {
    return facebookNotice(deriveFacebookValue(row), {
      answers: row.answers,
      answersComplete: row.answersComplete,
      questions: effectiveQuestions(base, row)
    })
  }
  if (base.platform === 'reddit') {
    return redditNotice(deriveRedditValue(row), {
      userIsContributor: row.userIsContributor,
      karmaGated: row.karmaGated,
      accessRequested: row.accessRequested,
      subredditType: normalizeSubredditType(row.subredditType ?? 'public')
    })
  }
  return null
}

function materialize(id?: string): Community | Community[] {
  const all: Community[] = catalog.map((base) => {
    const state = joins[base.id]
    // The account relation only exists for facebook — subreddits are joined
    // without an account.
    const accountId =
      base.platform === 'facebook' && state?.state !== 'none' ? (state.accountId ?? null) : null
    const questions = state ? effectiveQuestions(base, state) : base.entryQuestions
    return {
      ...base,
      entryQuestions: questions,
      questionsHash: state?.questionsHash ?? (state ? hashQuestionSet(questions) : null),
      questionsScrapedAt: state?.questionsScrapedAt ?? null,
      joinState: state?.state ?? 'none',
      accountId,
      accountLabel: resolveAccountLabel(accountId),
      answers: state?.answers ?? [],
      answersComplete: state?.answersComplete ?? false,
      draftAnswers: state?.draftAnswers ?? [],
      formPhase: state?.formPhase ?? 'idle',
      subredditType: state?.subredditType ?? null,
      userIsContributor: state?.userIsContributor ?? false,
      quarantineOptIn: state?.quarantineOptIn ?? false,
      karmaGated: state?.karmaGated ?? false,
      accessRequested: state?.accessRequested ?? false,
      notice: state ? rowNotice(base, state) : null,
      ...(state?.state === 'removed' && state.removedBy ? { removedBy: state.removedBy } : {}),
    }
  })
  return id ? (all.find((community) => community.id === id) ?? []) : all
}

// ---------------------------------------------------------------------------
// Platform drives: replay flat row → send new events → write snapshot back.
// ---------------------------------------------------------------------------

function writeFacebookBack(id: string, value: FacebookStateValue, context: FacebookContext): void {
  const row = joins[id]
  row.state = facebookToJoinState(value, context.wallType)
  row.accountId = context.accountId ?? row.accountId
  row.answers = context.answers
  row.answersComplete = context.answersComplete
  row.draftAnswers = context.draftAnswers
  row.submittedAt = context.submittedAt
  if (context.removedBy) row.removedBy = context.removedBy
  else delete row.removedBy
  row.formPhase =
    value === 'formRendered' ? 'rendered'
    : value === 'formIncomplete' ? 'incomplete'
    : value === 'formSubmitting' ? 'submitting'
    : value === 'formAbandoned' ? 'abandoned'
    : 'idle'
}

function driveFacebook(
  id: string,
  extra: FacebookEvent[],
  accountIssue: AccountIssue | undefined,
  questions: string[]
): { value: FacebookStateValue; context: FacebookContext } {
  const row = joins[id]
  const prev = row.state
  const input = facebookInputFromRow(row, questions)
  input.accountIssue = accountIssue
  const boot = bootstrapFacebookEvents(row, questions, row.accountId, accountIssue, new Date().toISOString())
  const snapshot = driveMachine<FacebookStateValue, FacebookContext>(facebookMachine, input, [...boot, ...extra])
  writeFacebookBack(id, snapshot.value, snapshot.context)
  const after = joins[id]
  const walled = after.state === 'login-wall' || after.state === 'unknown'
  const wasWalled = prev === 'login-wall' || prev === 'unknown'
  after.priorJoinState = walled ? (wasWalled ? after.priorJoinState : prev) : null
  persistCommunities()
  return snapshot
}

function writeRedditBack(id: string, value: RedditStateValue, context: RedditContext): void {
  const row = joins[id]
  row.state = redditToJoinState(value, context.wallType)
  row.subredditType = context.subredditType
  row.userIsContributor = context.userIsContributor
  row.quarantineOptIn = context.quarantineOptIn
  row.karmaGated = context.karmaGated
  row.karmaEvidence = context.karmaEvidence ?? null
  row.accessRequested = context.accessRequested
}

function driveReddit(id: string, extra: RedditEvent[]): { value: RedditStateValue; context: RedditContext } {
  const row = joins[id]
  const prev = row.state
  const input = redditInputFromRow(row)
  const boot = bootstrapRedditEvents(row)
  const snapshot = driveMachine<RedditStateValue, RedditContext>(redditMachine, input, [...boot, ...extra])
  writeRedditBack(id, snapshot.value, snapshot.context)
  const after = joins[id]
  const walled = after.state === 'login-wall' || after.state === 'unknown'
  const wasWalled = prev === 'login-wall' || prev === 'unknown'
  after.priorJoinState = walled ? (wasWalled ? after.priorJoinState : prev) : null
  persistCommunities()
  return snapshot
}

/**
 * Hono-shaped communities API. Mock-backed for now — the real endpoints come
 * from the platform clients (facebook group joins via connected accounts,
 * reddit subscriptions). X listening is keyword-scoped, not a community, so
 * it lives in the keywords domain. Routes and response shapes stay the same
 * when the backends land; each route dispatches to its platform machine.
 */
export const communitiesApp = new Hono()
  .use('*', requestLogger())
  .get('/communities', describeRoute({ operationId: 'listCommunities', tags: ['Communities'], summary: 'List communities', description: 'Lists the full catalog plus any client-resolved rows (from pasted Facebook links or typed subreddits) materialized with current `joinState` (none/pending/accepted), `accountId` for Facebook joins, and `accountLabel`. Optional `?platform=facebook|reddit` filters server-side. This is the source for the Groups page and every keyword/listings scope picker. Code: apps/web/src/lib/communities/server.ts:180', parameters: [{ name: 'platform', in: 'query', required: false, schema: { type: 'string', enum: ['facebook','reddit'], description: 'Platform filter.' } }], responses: { 200: { description: 'Community list.', content: { 'application/json': { schema: CommunitiesResponseJson } } } } }), (c) => {
    const platform = c.req.query('platform') as ConnectionPlatform | undefined
    const all = materialize() as Community[]
    const communities = platform ? all.filter((community) => community.platform === platform) : all
    return c.json({ communities })
  })
  .post('/communities/:id/join', describeRoute({ operationId: 'joinCommunity', tags: ['Communities'], summary: 'Join community', description: 'Attempts to join `:id` through its platform machine. Facebook requires `accountId` of a connected Facebook account; `answers` ride along and partial submits are accepted with `answersComplete: false` (Facebook lets requests through unanswered). Facebook transitions to `pending`, reddit to `accepted` (restricted subreddits land `limited`). A refused user move 409s with the machine reason. Already in-flight/member rows are a no-op 200. Persists to localStorage. Code: apps/web/src/lib/communities/server.ts:join', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { accountId: { type: 'string', description: 'Facebook account id (facebook only).' }, answers: { type: 'array', items: { type: 'string' }, description: 'Answers to entryQuestions; partial accepted and flagged.' } } } } } }, responses: { 201: { description: 'Joined (now pending/accepted).', content: { 'application/json': { schema: CommunityResponseJson } } }, 200: { description: 'Already joined.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Facebook groups must be joined with a connected Facebook account'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), async (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    const row = joins[id]
    const body = await c.req.json<{ accountId?: string; answers?: string[] }>().catch(() => null)
    if (base.platform === 'facebook') {
      if (row && (row.state === 'pending' || row.state === 'accepted' || row.state === 'limited')) {
        return c.json({ community: materialize(id) as Community, communities: materialize() as Community[] })
      }
      const account =
        (body?.accountId ? MOCK_CONNECTIONS.find((a) => a.id === body.accountId) : undefined) ?? null
      if (!account || account.platform !== 'facebook') {
        return c.json({ error: 'Facebook groups must be joined with a connected Facebook account' }, 400)
      }
      const issue = account.lastIssue ?? undefined
      const formValue = deriveFacebookValue(row)
      // A row with an open/abandoned modal submits from it instead of
      // restarting the join — the bootstrap rebuilds the form node and the
      // fresh answers ride SUBMIT.
      const intent = formValue === 'formRendered' || formValue === 'formIncomplete' || formValue === 'formAbandoned' ? 'submit' : 'join'
      const verdict = facebookUserVerdict(
        formValue,
        { accountIssue: issue, removedBy: row.removedBy },
        intent
      )
      if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Join refused.' }, 409)
      const now = new Date().toISOString()
      const questions = effectiveQuestions(base, row)
      const hash = hashQuestionSet(questions)
      const answers = Array.isArray(body?.answers) ? body.answers.map(String) : []
      row.accountId = account.id
      driveFacebook(
        id,
        intent === 'submit'
          ? [
              { type: 'SUBMIT', answers, at: now } as FacebookEvent,
              { type: 'SUBMIT_CONFIRMED', at: now } as FacebookEvent
            ]
          : [
              { type: 'INITIATE_JOIN', accountId: account.id, accountIssue: issue },
              {
                type: 'GATE_INSPECTED',
                requiresQuestions: questions.length > 0,
                questions,
                questionsHash: hash,
                scrapedAt: now
              },
              ...(questions.length > 0
                ? [
                    { type: 'FORM_RENDERED', questions, questionsHash: hash, scrapedAt: now } as FacebookEvent,
                    { type: 'SUBMIT', answers, at: now } as FacebookEvent,
                    { type: 'SUBMIT_CONFIRMED', at: now } as FacebookEvent
                  ]
                : [])
            ],
        issue,
        questions
      )
      row.scrapedQuestions = questions
      row.questionsHash = hash
      row.questionsScrapedAt = now
      persistCommunities()
      const communities = materialize() as Community[]
      return c.json({ community: communities.find((community) => community.id === id)!, communities }, 201)
    }
    if (base.platform === 'reddit') {
      const value = deriveRedditValue(row)
      if (value === 'subscribed' || value === 'restrictedReadOnly') {
        return c.json({ community: materialize(id) as Community, communities: materialize() as Community[] })
      }
      const verdict = redditUserVerdict(value, {}, 'subscribe')
      if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Join refused.' }, 409)
      driveReddit(id, [{ type: 'SUBSCRIBE' }])
      const communities = materialize() as Community[]
      return c.json({ community: communities.find((community) => community.id === id)!, communities }, 201)
    }
    return c.json({ error: 'Unknown platform — communities only track facebook groups and subreddits' }, 400)
  })
  .post('/communities/join-by-url', describeRoute({ operationId: 'joinCommunityByUrl', tags: ['Communities'], summary: 'Join community by URL', description: 'Parses a `facebook.com/groups/…` URL via `parseFacebookGroupUrl`, registers it as a new catalog row if unseen (`registerBase`), then runs the same Facebook join transition (account + answers, partial accepted and flagged). Dedupes by URL — already tracked rows return 200. Registers unknown URLs before joining so pasted links become first-class communities. Code: apps/web/src/lib/communities/server.ts:join-by-url', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Facebook group URL.' }, accountId: { type: 'string' }, answers: { type: 'array', items: { type: 'string' } } }, required: ['url'] } } } }, responses: { 201: { description: 'Joined.', content: { 'application/json': { schema: CommunityResponseJson } } }, 200: { description: 'Already tracked.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('That does not look like a Facebook group link') } }), async (c) => {
    const body = await c.req.json<{ url?: string; accountId?: string; answers?: string[] }>().catch(() => null)
    const parsed = body?.url ? parseFacebookGroupUrl(body.url) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a Facebook group link (facebook.com/groups/…)' }, 400)
    }
    const base = findBaseByUrl(parsed.url) ?? registerBase(parsed)
    const row = joins[base.id]
    if (row && (row.state === 'pending' || row.state === 'accepted' || row.state === 'limited')) {
      // Already tracked and requested — surface it instead of duplicating.
      return c.json({ community: materialize(base.id) as Community, communities: materialize() as Community[] })
    }
    const account =
      (body?.accountId ? MOCK_CONNECTIONS.find((a) => a.id === body.accountId) : undefined) ?? null
    if (!account || account.platform !== 'facebook') {
      return c.json({ error: 'Facebook groups must be joined with a connected Facebook account' }, 400)
    }
    const issue = account.lastIssue ?? undefined
    const urlFormValue = deriveFacebookValue(row)
    const urlIntent = urlFormValue === 'formRendered' || urlFormValue === 'formIncomplete' || urlFormValue === 'formAbandoned' ? 'submit' : 'join'
    const verdict = facebookUserVerdict(
      urlFormValue,
      { accountIssue: issue, removedBy: row.removedBy },
      urlIntent
    )
    if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Join refused.' }, 409)
    const now = new Date().toISOString()
    const questions = effectiveQuestions(base, row)
    const hash = hashQuestionSet(questions)
    const answers = Array.isArray(body?.answers) ? body.answers.map(String) : []
    row.accountId = account.id
    driveFacebook(
      base.id,
      urlIntent === 'submit'
        ? [
            { type: 'SUBMIT', answers, at: now } as FacebookEvent,
            { type: 'SUBMIT_CONFIRMED', at: now } as FacebookEvent
          ]
        : [
            { type: 'INITIATE_JOIN', accountId: account.id, accountIssue: issue },
            {
              type: 'GATE_INSPECTED',
              requiresQuestions: questions.length > 0,
              questions,
              questionsHash: hash,
              scrapedAt: now
            },
            ...(questions.length > 0
              ? [
                  { type: 'FORM_RENDERED', questions, questionsHash: hash, scrapedAt: now } as FacebookEvent,
                  { type: 'SUBMIT', answers, at: now } as FacebookEvent,
                  { type: 'SUBMIT_CONFIRMED', at: now } as FacebookEvent
                ]
              : [])
          ],
      issue,
      questions
    )
    row.scrapedQuestions = questions
    row.questionsHash = hash
    row.questionsScrapedAt = now
    persistCommunities()
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === base.id)!, communities }, 201)
  })
  .post('/communities/resolve', describeRoute({ operationId: 'resolveCommunity', tags: ['Communities'], summary: 'Resolve community URL', description: 'Resolves a pasted Facebook group URL into its `Community` without changing `joinState`. Registers unknown URLs as new rows and stamps the scrape read-ahead (`scrapedQuestions`, `questionsHash`, `questionsScrapedAt`) so the form reads the entry questions before the user answers. Persists the catalog even though no join occurs — it\'s a read-ahead for the join form. Code: apps/web/src/lib/communities/server.ts:resolve', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Facebook group URL.' } }, required: ['url'] } } } }, responses: { 200: { description: 'Resolved.', content: { 'application/json': { schema: CommunitySingleResponseJson } } }, 400: errorResponse('That does not look like a Facebook group link') } }), async (c) => {
    // Resolve a pasted group link into its catalog row (registering it when
    // unseen) WITHOUT changing join state — the form reads the entry
    // questions off this before the user answers and joins. Stamps the
    // mock scrape provenance (the live client reports the real scrape).
    const body = await c.req.json<{ url?: string }>().catch(() => null)
    const parsed = body?.url ? parseFacebookGroupUrl(body.url) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a Facebook group link (facebook.com/groups/…)' }, 400)
    }
    const base = findBaseByUrl(parsed.url) ?? registerBase(parsed)
    const row = joins[base.id]
    const now = new Date().toISOString()
    row.scrapedQuestions = [...base.entryQuestions]
    row.questionsHash = hashQuestionSet(row.scrapedQuestions)
    row.questionsScrapedAt = now
    persistCommunities()
    return c.json({ community: materialize(base.id) as Community })
  })
  .post('/communities/resolve-reddit', describeRoute({ operationId: 'resolveRedditCommunity', tags: ['Communities'], summary: 'Resolve Reddit community', description: 'Resolves a typed `r/name` (via `parseSubredditName`) into its `Community` and immediately marks it `accepted` — public subreddits have no entry gate, so a resolved row is instantly usable as a keyword scope. Creates a new row via `communityFromSubreddit` if unseen. Code: apps/web/src/lib/communities/server.ts:resolve-reddit', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', description: 'Subreddit name, e.g. r/test or test.' } }, required: ['name'] } } } }, responses: { 200: { description: 'Resolved + joined (accepted).', content: { 'application/json': { schema: CommunitySingleResponseJson } } }, 400: errorResponse('That does not look like a subreddit') } }), async (c) => {
    // Resolve a typed subreddit into its community and join it on the spot:
    // public subreddits don't gate entry, so a resolved row is immediately
    // accepted and usable as a keyword scope. Already-tracked rows are a no-op.
    const body = await c.req.json<{ name?: string }>().catch(() => null)
    const parsed = body?.name ? parseSubredditName(body.name) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a subreddit (r/name)' }, 400)
    }
    const base =
      findRedditBase(parsed.key, parsed.url) ?? registerRow(communityFromSubreddit(parsed))
    const row = joins[base.id]
    if (deriveRedditValue(row) === 'unsubscribed') {
      driveReddit(base.id, [
        {
          type: 'METADATA_OBSERVED',
          subredditType: 'public',
          subscribed: true,
          contributor: false,
          quarantineOptIn: false
        }
      ])
    } else {
      persistCommunities()
    }
    return c.json({ community: materialize(base.id) as Community })
  })
  .post('/communities/:id/accept', describeRoute({ operationId: 'acceptCommunityJoin', tags: ['Communities'], summary: 'Accept pending join', description: 'Mock admin accept — transitions a Facebook `:id` from `pending` → `accepted` (and `limited` → `accepted` on promotion). Simulates the group admin approving the join request in the Groups page \'Approve\' action and tests. Facebook rows only — other platforms 400. Refused moves 409. Code: apps/web/src/lib/communities/server.ts:accept', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Accepted.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('No join request to accept'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'facebook') {
      return c.json({ error: 'Only Facebook groups have an admin approval queue' }, 400)
    }
    const row = joins[id]
    if (!row || row.state === 'none') {
      return c.json({ error: 'No join request to accept' }, 400)
    }
    const before = deriveFacebookValue(row)
    const snapshot = driveFacebook(id, [{ type: 'APPROVED' }], undefined, effectiveQuestions(base, row))
    if (snapshot.value === before) {
      return c.json({ error: 'Only a pending or limited request can be accepted.' }, 409)
    }
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/decline', describeRoute({ operationId: 'declineCommunityJoin', tags: ['Communities'], summary: 'Decline pending join', description: 'Mock admin decline. Machines `pending` -> `declined` platform-side, standing in for the group admin rejecting the request. The declined row keeps its answers (edit + re-ask is the re-join path). Facebook rows only. Code: apps/web/src/lib/communities/server.ts:decline', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Declined.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('No join request to decline'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'facebook') {
      return c.json({ error: 'Only Facebook groups have an admin approval queue' }, 400)
    }
    const row = joins[id]
    if (!row || row.state === 'none') {
      return c.json({ error: 'No join request to decline' }, 400)
    }
    const before = deriveFacebookValue(row)
    const snapshot = driveFacebook(id, [{ type: 'DECLINED' }], undefined, effectiveQuestions(base, row))
    if (snapshot.value === before) {
      return c.json({ error: 'Only a pending request can be declined.' }, 409)
    }
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/remove', describeRoute({ operationId: 'removeCommunityMember', tags: ['Communities'], summary: 'Admin-remove member', description: 'Mock platform removal. The group removes its Facebook member (`accepted`/`limited` -> `removed`, stamped `removedBy: "platform"`). This is what the poller observes when a group kicks the account; the user cannot rejoin a platform-removed group at will (the machine gates it). Facebook rows only. Code: apps/web/src/lib/communities/server.ts:remove', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Removed.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Not a member'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'facebook') {
      return c.json({ error: 'Only Facebook groups have admin removals — reddit leaves via DELETE' }, 400)
    }
    const row = joins[id]
    if (!row || (row.state !== 'accepted' && row.state !== 'limited')) {
      return c.json({ error: 'Not a member - nothing to remove' }, 400)
    }
    driveFacebook(id, [{ type: 'ADMIN_REMOVED' }], undefined, effectiveQuestions(base, row))
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/form', describeRoute({ operationId: 'reportCommunityForm', tags: ['Communities'], summary: 'Client form webhook', description: 'Camoufox client webhook (platform source): the browser intercepted the Facebook entry-question modal. Reports the modal phase — `rendered` (with scraped `questions`), `incomplete` (with `draftAnswers`), or `abandoned` (idle past the lease). The row stays `none` until submit; drafts survive abandon for resume. Facebook rows only. Code: apps/web/src/lib/communities/server.ts:form', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { accountId: { type: 'string' }, phase: { type: 'string' }, questions: { type: 'array', items: { type: 'string' } }, questionsHash: { type: 'string' }, draftAnswers: { type: 'array', items: { type: 'string' } } }, required: ['accountId', 'phase'] } } } }, responses: { 200: { description: 'Form phase recorded.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Facebook rows only / bad phase'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), async (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'facebook') {
      return c.json({ error: 'Only Facebook groups render entry-question modals' }, 400)
    }
    const body = await c.req
      .json<{
        accountId?: string
        phase?: string
        questions?: string[]
        questionsHash?: string
        draftAnswers?: string[]
      }>()
      .catch(() => null)
    const account =
      (body?.accountId ? MOCK_CONNECTIONS.find((a) => a.id === body.accountId) : undefined) ?? null
    if (!account || account.platform !== 'facebook') {
      return c.json({ error: 'Form webhooks must name the connected Facebook account driving the modal' }, 400)
    }
    if (body?.phase !== 'rendered' && body?.phase !== 'incomplete' && body?.phase !== 'abandoned') {
      return c.json({ error: "phase must be 'rendered', 'incomplete', or 'abandoned'" }, 400)
    }
    const row = joins[id]
    const now = new Date().toISOString()
    const questions =
      Array.isArray(body?.questions) && body.questions.length > 0
        ? body.questions.map(String)
        : effectiveQuestions(base, row)
    const hash = body?.questionsHash ?? hashQuestionSet(questions)
    const drafts = Array.isArray(body?.draftAnswers) ? body.draftAnswers.map(String) : []
    // A re-scrape that changes the set resets the modal to a fresh render —
    // answers keyed to the old set must not carry over silently.
    const sameSet = row.questionsHash === null || row.questionsHash === hash
    const value = deriveFacebookValue(row)
    if (value !== 'notMember' && value !== 'formRendered' && value !== 'formIncomplete' && value !== 'formAbandoned') {
      return c.json({ error: 'The join is already past the form — the modal is gone.' }, 409)
    }
    row.accountId = account.id
    row.scrapedQuestions = questions
    row.questionsHash = hash
    row.questionsScrapedAt = now
    row.draftAnswers = sameSet ? drafts : []
    persistCommunities()
    const events: FacebookEvent[] = [
      { type: 'INITIATE_JOIN', accountId: account.id, accountIssue: undefined },
      { type: 'GATE_INSPECTED', requiresQuestions: true, questions, questionsHash: hash, scrapedAt: now },
      { type: 'FORM_RENDERED', questions, questionsHash: hash, scrapedAt: now }
    ]
    if (body.phase === 'incomplete' || drafts.length > 0) {
      events.push({ type: 'ANSWERS_UPDATED', draftAnswers: row.draftAnswers, at: now })
    }
    if (body.phase === 'abandoned') events.push({ type: 'FORM_IDLE_TIMEOUT' })
    // Rebuild the modal node from scratch: the webhook is the client's full
    // report, so replay from notMember instead of layering onto stale phase.
    row.state = 'none'
    row.formPhase = 'idle'
    row.answers = []
    row.answersComplete = false
    row.submittedAt = null
    delete row.removedBy
    driveFacebook(id, events, undefined, questions)
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/resume', describeRoute({ operationId: 'resumeCommunityForm', tags: ['Communities'], summary: 'Resume abandoned form', description: 'User resumes an abandoned Facebook entry-question form — the modal reopens with the preserved drafts. Refuses when there is no abandoned form or the joining account cannot write. Facebook rows only. Code: apps/web/src/lib/communities/server.ts:resume', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Resumed.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Facebook rows only'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'facebook') {
      return c.json({ error: 'Only Facebook groups have resumable entry forms' }, 400)
    }
    const row = joins[id]
    const issue = liveAccountIssue(row.accountId)
    const verdict = facebookUserVerdict(
      deriveFacebookValue(row),
      { accountIssue: issue, removedBy: row.removedBy },
      'resume'
    )
    if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Resume refused.' }, 409)
    driveFacebook(
      id,
      [{ type: 'RESUME_FORM', at: new Date().toISOString() }],
      issue,
      effectiveQuestions(base, row)
    )
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/observe', describeRoute({ operationId: 'observeCommunity', tags: ['Communities'], summary: 'Client observation webhook', description: 'Camoufox poller webhook (platform source): report what the client actually saw. Reddit accepts `subredditType`, `subscribed`, `contributor`, `quarantineOptIn`, `karmaGated` (+`karmaEvidence`); any platform accepts `wallType` (`login`, `challenge`, `unclassified`) and `cleared: true` to resolve a wall back to the prior state. Observations always land — the poller reports regardless of session health. Code: apps/web/src/lib/communities/server.ts:observe', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { subredditType: { type: 'string' }, subscribed: { type: 'boolean' }, contributor: { type: 'boolean' }, quarantineOptIn: { type: 'boolean' }, karmaGated: { type: 'boolean' }, karmaEvidence: { type: 'string' }, wallType: { type: 'string' }, cleared: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Observed.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Nothing observable in the payload'), 404: errorResponse('Community not found') } }), async (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    const row = joins[id]
    const body = await c.req
      .json<{
        subredditType?: string
        subscribed?: boolean
        contributor?: boolean
        quarantineOptIn?: boolean
        karmaGated?: boolean
        karmaEvidence?: string
        wallType?: string
        cleared?: boolean
      }>()
      .catch(() => null)
    if (body?.cleared === true) {
      // Restore replays the pre-wall flat state — the wall overwrote the
      // row, and `priorJoinState` is the only record of what it covered.
      const prior = row.priorJoinState ?? 'none'
      joins[id] = { ...row, state: prior }
      if (base.platform === 'facebook') {
        const questions = effectiveQuestions(base, joins[id])
        const input = facebookInputFromRow(joins[id], questions)
        const boot = bootstrapFacebookEvents(joins[id], questions, joins[id].accountId, undefined, new Date().toISOString())
        const snapshot = driveMachine<FacebookStateValue, FacebookContext>(facebookMachine, input, boot)
        writeFacebookBack(id, snapshot.value, snapshot.context)
        joins[id].priorJoinState = null
        persistCommunities()
      } else {
        const input = redditInputFromRow(joins[id])
        const snapshot = driveMachine<RedditStateValue, RedditContext>(redditMachine, input, bootstrapRedditEvents(joins[id]))
        writeRedditBack(id, snapshot.value, snapshot.context)
        joins[id].priorJoinState = null
        persistCommunities()
      }
      const communities = materialize() as Community[]
      return c.json({ community: communities.find((community) => community.id === id)!, communities })
    }
    if (typeof body?.wallType === 'string') {
      if (body.wallType !== 'login' && body.wallType !== 'challenge' && body.wallType !== 'unclassified') {
        return c.json({ error: "wallType must be 'login', 'challenge', or 'unclassified'" }, 400)
      }
      if (base.platform === 'facebook') {
        driveFacebook(
          id,
          [{ type: 'OBSERVE_WALL', wallType: body.wallType === 'challenge' ? 'checkpoint' : body.wallType }],
          undefined,
          effectiveQuestions(base, row)
        )
      } else {
        driveReddit(id, [{ type: 'OBSERVE_WALL', wallType: body.wallType }])
      }
      const communities = materialize() as Community[]
      return c.json({ community: communities.find((community) => community.id === id)!, communities })
    }
    if (base.platform !== 'reddit') {
      return c.json({ error: 'Subscription observations only apply to reddit rows' }, 400)
    }
    if (typeof body?.karmaGated === 'boolean') {
      driveReddit(
        id,
        body.karmaGated
          ? [{ type: 'MARK_KARMA_GATED', evidence: body.karmaEvidence ?? 'submit invisible to others' }]
          : [{ type: 'KARMA_CLEARED' }]
      )
      const communities = materialize() as Community[]
      return c.json({ community: communities.find((community) => community.id === id)!, communities })
    }
    if (typeof body?.subredditType !== 'string' && typeof body?.subscribed !== 'boolean') {
      return c.json({ error: 'Observe needs subredditType/subscribed, karmaGated, wallType, or cleared' }, 400)
    }
    driveReddit(id, [
      {
        type: 'METADATA_OBSERVED',
        subredditType: normalizeSubredditType(body?.subredditType ?? row.subredditType ?? 'public'),
        subscribed: body?.subscribed ?? true,
        contributor: body?.contributor ?? row.userIsContributor,
        quarantineOptIn: body?.quarantineOptIn ?? row.quarantineOptIn
      }
    ])
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/request-access', describeRoute({ operationId: 'requestCommunityAccess', tags: ['Communities'], summary: 'Request private access', description: 'User dispatches a modmail access request for a private-gated subreddit. Records the request; the approval itself arrives later through the observe webhook. Reddit rows only. Code: apps/web/src/lib/communities/server.ts:request-access', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Requested.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Reddit rows only'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'reddit') {
      return c.json({ error: 'Access requests only apply to private subreddits' }, 400)
    }
    const row = joins[id]
    const verdict = redditUserVerdict(deriveRedditValue(row), {}, 'requestAccess')
    if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Request refused.' }, 409)
    driveReddit(id, [{ type: 'REQUEST_ACCESS' }])
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .post('/communities/:id/quarantine-opt-in', describeRoute({ operationId: 'optInCommunityQuarantine', tags: ['Communities'], summary: 'Opt in to quarantine', description: 'User opts in to a quarantined subreddit — records the intent; the unlocked read stream is confirmed when the poller observes the subscription through the observe webhook. Reddit rows only. Code: apps/web/src/lib/communities/server.ts:quarantine-opt-in', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Opted in.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Reddit rows only'), 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    if (base.platform !== 'reddit') {
      return c.json({ error: 'Quarantine opt-in only applies to subreddits' }, 400)
    }
    const row = joins[id]
    const verdict = redditUserVerdict(deriveRedditValue(row), {}, 'optIn')
    if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Opt-in refused.' }, 409)
    driveReddit(id, [{ type: 'OPT_IN_QUARANTINE' }])
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .delete('/communities/:id', describeRoute({ operationId: 'leaveCommunity', tags: ['Communities'], summary: 'Leave community', description: 'Leaves `:id` through its platform machine: Facebook `pending` withdraws to `none` (account + answers kept for the re-join prefill), `accepted`/`limited` become `removed` stamped `removedBy: "user"`; reddit subscriptions end back to `none`. `none`/`declined`/`removed`/walled rows are a no-op 200. Persists. Code: apps/web/src/lib/communities/server.ts:leave', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Remaining communities.', content: { 'application/json': { schema: CommunitiesResponseJson } } }, 404: errorResponse('Community not found'), 409: errorResponse('Refused by the platform machine') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    const row = joins[id]
    if (base.platform === 'facebook') {
      const value = deriveFacebookValue(row)
      if (value === 'pendingApproval') {
        const verdict = facebookUserVerdict(value, { accountIssue: liveAccountIssue(row.accountId), removedBy: row.removedBy }, 'withdraw')
        if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Withdraw refused.' }, 409)
        driveFacebook(id, [{ type: 'WITHDRAW' }], liveAccountIssue(row.accountId), effectiveQuestions(base, row))
      } else if (value === 'fullMember' || value === 'limitedMember') {
        const verdict = facebookUserVerdict(value, { accountIssue: liveAccountIssue(row.accountId), removedBy: row.removedBy }, 'leave')
        if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Leave refused.' }, 409)
        driveFacebook(id, [{ type: 'LEAVE' }], liveAccountIssue(row.accountId), effectiveQuestions(base, row))
      }
    } else {
      const value = deriveRedditValue(row)
      if (value === 'subscribed' || value === 'restrictedReadOnly' || value === 'quarantineGate') {
        const verdict = redditUserVerdict(value, {}, 'unsubscribe')
        if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Leave refused.' }, 409)
        driveReddit(id, [{ type: 'UNSUBSCRIBE' }])
      }
    }
    persistCommunities()
    return c.json({ communities: materialize() as Community[] })
  })

export type CommunitiesApp = typeof communitiesApp
