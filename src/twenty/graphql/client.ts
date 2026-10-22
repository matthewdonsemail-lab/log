/**
 * The live Twenty client: the generated genql client (`generated/`) against
 * `<TWENTY_BASE_URL>/graphql` with `TWENTY_API_KEY`, the same way the dialer's
 * backend uses `createClient` from `@dialer/shared/api`. Bun loads both from
 * log-cli's git-ignored `.env.local`. The key is never printed.
 *
 * Each object has a fixed field selection, checked against the generated
 * schema types at compile time. Credentials log-cli never needs (password,
 * email, totpSecret) are never selected, so they never leave Twenty.
 */
import { createClient, GenqlError } from './generated/index'
import type {
  AgencyConversationGenqlSelection,
  AgencyGroupCommentGenqlSelection,
  AgencyGroupGenqlSelection,
  AgencyGroupPostGenqlSelection,
  AgencyListingGenqlSelection,
  AgencyMessageGenqlSelection,
  Client,
  SocialAccountGenqlSelection
} from './generated/index'
import { TwentyError } from './types'
import type { TwentyClient, TwentyObject, TwentyObjects } from './types'

const TIMEOUT_MS = 30_000
const PAGE = 60
/** Waits before retrying a dropped connection to Twenty (`guarded`): reads and updates only. */
export const RETRY_MS = [1000, 3000]
/** Twenty's limit is 100 calls a minute: a refused call waits the window out, twice at most. */
export const RATE_LIMIT_RETRIES = 2
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const SOCIAL_ACCOUNT_FIELDS = {
  id: true,
  name: true,
  accountName: true,
  platform: true,
  proxy: true,
  cookies: true,
  homeCity: true,
  homeCountry: true,
  accountStatus: true,
  statusReason: true,
  statusDetail: true,
  statusChangedAt: true,
  proxyCheckedAt: true,
  proxyExitIp: true,
  proxyExitCountry: true,
  dailyListingCap: true,
  lastPostedAt: true,
  vendor: true,
  deviceProfile: true,
  activeHoursStart: true,
  activeHoursEnd: true,
  storageOrigins: true,
  profileName: true,
  profilePhoto: true,
  coverPhoto: true,
  profileSetAt: true,
  lifecycleState: true,
  profileNamedAt: true,
  marketplaceLocationAt: true,
  warmupStartedAt: true,
  warmedAt: true,
  adsPowerProfileId: true,
  browserDriver: true
} satisfies SocialAccountGenqlSelection

export const AGENCY_LISTING_FIELDS = {
  id: true,
  name: true,
  title: true,
  description: true,
  price: true,
  priceCurrency: true,
  category: true,
  condition: true,
  photos: true,
  locationQuery: true,
  locationCity: true,
  locationCountry: true,
  locationPostalCode: true,
  status: true,
  socialAccountId: true,
  campaignId: true,
  replacesId: true,
  generation: true,
  listingId: true,
  listingUrl: true,
  publishedAt: true,
  lastRunAt: true,
  lastRunResult: true,
  lastErrorCode: true,
  lastError: true,
  clicksCount: true,
  lastCheckedAt: true,
  createdAt: true
} satisfies AgencyListingGenqlSelection

/** rule 34: blaster's SMS fields are selected too, so an SMS row reads back whole. */
export const AGENCY_CONVERSATION_FIELDS = {
  id: true,
  name: true,
  channel: true,
  pairKey: true,
  status: true,
  peerPhone: true,
  blasterNumber: true,
  facebookThreadId: true,
  socialAccountId: true,
  agencyListingId: true,
  facebookListingId: true,
  listingTitle: true,
  buyerName: true,
  buyerFacebookId: true,
  buyerProfileUrl: true,
  buyerPhone: true,
  buyerEmail: true,
  leadStatus: true,
  latestDirection: true,
  latestPreview: true,
  latestMessageAt: true,
  latestMessageId: true,
  messageCount: true,
  unreadCount: true,
  lastReadAt: true,
  respondedAt: true,
  lastScannedAt: true,
  autoReplied: true,
  aiTookOver: true,
  createdAt: true
} satisfies AgencyConversationGenqlSelection

export const AGENCY_MESSAGE_FIELDS = {
  id: true,
  name: true,
  agencyConversationId: true,
  channel: true,
  direction: true,
  status: true,
  body: true,
  sentAt: true,
  senderName: true,
  facebookMessageId: true,
  messageKey: true,
  isRead: true,
  sentBy: true,
  aiStatus: true,
  aiOriginalText: true,
  media: true,
  errorCode: true,
  errorMessage: true,
  createdAt: true
} satisfies AgencyMessageGenqlSelection

/** rule 45: one group on one account, and where the account stands with it. */
export const AGENCY_GROUP_FIELDS = {
  id: true,
  name: true,
  socialAccountId: true,
  facebookGroupId: true,
  groupUrl: true,
  joinStatus: true,
  joinStatusReason: true,
  membersLabel: true,
  joinRequestedAt: true,
  lastCheckedAt: true,
  joinSubmission: true,
  readCursor: true,
  lastReadAt: true,
  lastReadReason: true,
  createdAt: true
} satisfies AgencyGroupGenqlSelection

/** #27: a post in a group row, as `log read group` read it. */
export const AGENCY_GROUP_POST_FIELDS = {
  id: true,
  name: true,
  agencyGroupId: true,
  facebookPostId: true,
  facebookGroupId: true,
  authorName: true,
  authorFacebookId: true,
  authorUrl: true,
  text: true,
  permalink: true,
  feedbackId: true,
  postedAt: true,
  commentCount: true,
  commentsReadAt: true,
  commentsReadCount: true,
  createdAt: true
} satisfies AgencyGroupPostGenqlSelection

/** #27: a comment or reply on a group post. */
export const AGENCY_GROUP_COMMENT_FIELDS = {
  id: true,
  name: true,
  agencyGroupPostId: true,
  facebookCommentId: true,
  facebookPostId: true,
  parentCommentId: true,
  depth: true,
  authorName: true,
  authorFacebookId: true,
  authorUrl: true,
  authorAnonymous: true,
  text: true,
  permalink: true,
  feedbackId: true,
  commentedAt: true,
  replyCount: true,
  createdAt: true
} satisfies AgencyGroupCommentGenqlSelection

const PAGE_INFO = { hasNextPage: true, endCursor: true } as const

interface Page<T> {
  edges: { node: T }[]
  pageInfo: { hasNextPage?: boolean | null; endCursor?: string | null }
}

export function twentyGraphqlUrl(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.TWENTY_BASE_URL?.trim()
  return raw ? `${raw.replace(/\/+$/, '').replace(/\/rest$/, '')}/graphql` : null
}

/** genql/transport failures → catalog codes. */
function toTwentyError(error: unknown, what: string): TwentyError {
  if (error instanceof TwentyError) return error
  if (error instanceof GenqlError) {
    const message = error.errors.map((e) => e.message).join('; ')
    // Before the auth test: "Limit reached (100 tokens per 60000 ms)" says "tokens" and is not a bad key
    // (Harrisburg's first sign-in, 2026-10-19, lost its cookies and device to that misreading).
    if (/limit reached|rate limit|too many requests/i.test(message)) return new TwentyError('twentyRateLimited', `${what}: ${message}`.slice(0, 600))
    const auth = error.errors.some((e) => /unauthenticated|forbidden|invalid token|token (?:is )?(?:invalid|expired)/i.test(e.message))
    return new TwentyError(auth ? 'twentyAuthFailed' : 'twentyRequestFailed', `${what}: ${message}`.slice(0, 600))
  }
  const message = error instanceof Error ? error.message : String(error)
  if (/\b429\b|limit reached/i.test(message)) return new TwentyError('twentyRateLimited', `${what}: ${message}`)
  if (/\b(401|403)\b/.test(message)) return new TwentyError('twentyAuthFailed', `${what}: ${message}`)
  if (/\b[45]\d\d\b/.test(message)) return new TwentyError('twentyRequestFailed', `${what}: ${message}`)
  return new TwentyError('twentyUnreachable', `${what}: ${message}`)
}

export function createTwentyClient(env: Record<string, string | undefined> = process.env, fetchImpl: typeof fetch = fetch, rateLimitWaitMs = 61_000): TwentyClient {
  const url = twentyGraphqlUrl(env)
  const key = env.TWENTY_API_KEY?.trim()
  let genql: Client | null = null
  const client = (): Client => {
    if (!url || !key) throw new TwentyError('twentyNotConfigured', 'set TWENTY_BASE_URL and TWENTY_API_KEY in log-cli/.env.local')
    genql ??= createClient({
      url,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      fetch: ((input: string | URL | Request, init?: RequestInit) =>
        fetchImpl(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })) as typeof fetch
    })
    return genql
  }

  async function guarded<T>(what: string, run: () => Promise<T>): Promise<T> {
    // A dropped socket ("connection was closed unexpectedly") is retried, 1 s then 3 s:
    // losing it cost a fresh sign-in's session on 2026-10-19. Reads and updates only:
    // a create retried after a drop could write the row twice, and rows are never deleted (rule 13).
    const retries = what.startsWith('create') ? [] : RETRY_MS
    let limited = 0
    for (let attempt = 0; ; attempt++) {
      try {
        return await run()
      } catch (error) {
        const failed = toTwentyError(error, what)
        // A rate-limited call was refused whole, so waiting out the window and trying again is safe, creates too.
        if (failed.code === 'twentyRateLimited' && limited < RATE_LIMIT_RETRIES) {
          limited++
          await new Promise((resolve) => setTimeout(resolve, rateLimitWaitMs))
          attempt--
          continue
        }
        if (failed.code !== 'twentyUnreachable' || attempt >= retries.length) throw failed
        await new Promise((resolve) => setTimeout(resolve, retries[attempt]))
      }
    }
  }

  /**
   * Each object's GraphQL names and fixed selection. genql's typed query
   * builder can't take the object as a variable, so the calls are built from
   * this table and typed by `TwentyObjects` at the seam.
   */
  const OBJECTS = {
    socialAccounts: { one: 'SocialAccount', fields: SOCIAL_ACCOUNT_FIELDS },
    agencyListings: { one: 'AgencyListing', fields: AGENCY_LISTING_FIELDS },
    agencyConversations: { one: 'AgencyConversation', fields: AGENCY_CONVERSATION_FIELDS },
    agencyMessages: { one: 'AgencyMessage', fields: AGENCY_MESSAGE_FIELDS },
    agencyGroups: { one: 'AgencyGroup', fields: AGENCY_GROUP_FIELDS },
    agencyGroupPosts: { one: 'AgencyGroupPost', fields: AGENCY_GROUP_POST_FIELDS },
    agencyGroupComments: { one: 'AgencyGroupComment', fields: AGENCY_GROUP_COMMENT_FIELDS }
  } as const satisfies Record<TwentyObject, { one: string; fields: Record<string, true> }>
  const untyped = () => client() as unknown as { query(q: unknown): Promise<any>; mutation(q: unknown): Promise<any> }

  async function listAll<K extends TwentyObject>(object: K, filter: TwentyObjects[K]['filter'] | undefined): Promise<TwentyObjects[K]['row'][]> {
    const rows: TwentyObjects[K]['row'][] = []
    let after: string | null = null
    do {
      const page = (await untyped().query({
        [object]: { __args: { filter: filter ?? {}, first: PAGE, after }, edges: { node: OBJECTS[object].fields }, pageInfo: PAGE_INFO }
      })) as Record<string, Page<unknown>>
      rows.push(...(page[object].edges.map((e) => e.node) as TwentyObjects[K]['row'][]))
      after = page[object].pageInfo.hasNextPage ? (page[object].pageInfo.endCursor ?? null) : null
    } while (after)
    return rows
  }

  return {
    list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']) {
      return guarded(`list ${object}`, () => listAll(object, filter))
    },
    get<K extends TwentyObject>(object: K, id: string) {
      // Not a record id: nothing can match, and Twenty would reject the filter.
      if (!UUID.test(id)) return Promise.resolve(null)
      return guarded(`get ${object} ${id}`, async () => {
        const rows = await listAll(object, { id: { eq: id } } as TwentyObjects[K]['filter'])
        return (rows[0] ?? null) as TwentyObjects[K]['row'] | null
      })
    },
    create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']) {
      return guarded(`create ${object}`, async () => {
        const name = `create${OBJECTS[object].one}`
        const out = await untyped().mutation({ [name]: { __args: { data }, ...OBJECTS[object].fields } })
        return out[name] as TwentyObjects[K]['row']
      })
    },
    loginSecrets(accountId: string) {
      if (!UUID.test(accountId)) return Promise.resolve(null)
      return guarded(`loginSecrets ${accountId}`, async () => {
        // Selected here and nowhere else (SOCIAL_ACCOUNT_FIELDS never has them).
        const page = (await client().query({
          socialAccounts: { __args: { filter: { id: { eq: accountId } }, first: 1 }, edges: { node: { email: true, password: true, totpSecret: true } } }
        })) as { socialAccounts: { edges: { node: { email?: string | null; password?: string | null; totpSecret?: string | null } }[] } }
        const node = page.socialAccounts.edges[0]?.node
        if (!node) return null
        return { email: node.email || null, password: node.password || null, totpSecret: node.totpSecret || null }
      })
    },
    update<K extends TwentyObject>(object: K, id: string, data: TwentyObjects[K]['update']) {
      return guarded(`update ${object} ${id}`, async () => {
        const name = `update${OBJECTS[object].one}`
        const out = await untyped().mutation({ [name]: { __args: { id, data }, ...OBJECTS[object].fields } })
        return out[name] as TwentyObjects[K]['row']
      })
    }
  }
}
