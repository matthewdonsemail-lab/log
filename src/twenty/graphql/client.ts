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
import type { AgencyListingGenqlSelection, Client, SocialAccountGenqlSelection } from './generated/index'
import { TwentyError } from './types'
import type { TwentyClient, TwentyObject, TwentyObjects } from './types'

const TIMEOUT_MS = 30_000
const PAGE = 60
/** Waits before retrying a dropped connection to Twenty (`guarded`): reads and updates only. */
export const RETRY_MS = [1000, 3000]
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
  profileSetAt: true
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
    const auth = error.errors.some((e) => /unauthenticated|forbidden|token/i.test(e.message))
    return new TwentyError(auth ? 'twentyAuthFailed' : 'twentyRequestFailed', `${what}: ${message}`.slice(0, 600))
  }
  const message = error instanceof Error ? error.message : String(error)
  if (/\b(401|403)\b/.test(message)) return new TwentyError('twentyAuthFailed', `${what}: ${message}`)
  if (/\b[45]\d\d\b/.test(message)) return new TwentyError('twentyRequestFailed', `${what}: ${message}`)
  return new TwentyError('twentyUnreachable', `${what}: ${message}`)
}

export function createTwentyClient(env: Record<string, string | undefined> = process.env, fetchImpl: typeof fetch = fetch): TwentyClient {
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
    for (let attempt = 0; ; attempt++) {
      try {
        return await run()
      } catch (error) {
        const failed = toTwentyError(error, what)
        if (failed.code !== 'twentyUnreachable' || attempt >= retries.length) throw failed
        await new Promise((resolve) => setTimeout(resolve, retries[attempt]))
      }
    }
  }

  async function listSocialAccounts(filter: TwentyObjects['socialAccounts']['filter'] | undefined) {
    const rows: TwentyObjects['socialAccounts']['row'][] = []
    let after: string | null = null
    do {
      const page = (await client().query({
        socialAccounts: { __args: { filter: filter ?? {}, first: PAGE, after }, edges: { node: SOCIAL_ACCOUNT_FIELDS }, pageInfo: PAGE_INFO }
      })) as { socialAccounts: Page<unknown> }
      rows.push(...(page.socialAccounts.edges.map((e) => e.node) as TwentyObjects['socialAccounts']['row'][]))
      after = page.socialAccounts.pageInfo.hasNextPage ? (page.socialAccounts.pageInfo.endCursor ?? null) : null
    } while (after)
    return rows
  }

  async function listAgencyListings(filter: TwentyObjects['agencyListings']['filter'] | undefined) {
    const rows: TwentyObjects['agencyListings']['row'][] = []
    let after: string | null = null
    do {
      const page = (await client().query({
        agencyListings: { __args: { filter: filter ?? {}, first: PAGE, after }, edges: { node: AGENCY_LISTING_FIELDS }, pageInfo: PAGE_INFO }
      })) as { agencyListings: Page<unknown> }
      rows.push(...(page.agencyListings.edges.map((e) => e.node) as TwentyObjects['agencyListings']['row'][]))
      after = page.agencyListings.pageInfo.hasNextPage ? (page.agencyListings.pageInfo.endCursor ?? null) : null
    } while (after)
    return rows
  }

  return {
    list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']) {
      return guarded(`list ${object}`, async () =>
        (object === 'socialAccounts'
          ? await listSocialAccounts(filter as TwentyObjects['socialAccounts']['filter'])
          : await listAgencyListings(filter as TwentyObjects['agencyListings']['filter'])) as TwentyObjects[K]['row'][]
      )
    },
    get<K extends TwentyObject>(object: K, id: string) {
      // Not a record id: nothing can match, and Twenty would reject the filter.
      if (!UUID.test(id)) return Promise.resolve(null)
      return guarded(`get ${object} ${id}`, async () => {
        const rows =
          object === 'socialAccounts'
            ? await listSocialAccounts({ id: { eq: id } })
            : await listAgencyListings({ id: { eq: id } })
        return (rows[0] ?? null) as TwentyObjects[K]['row'] | null
      })
    },
    create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']) {
      return guarded(`create ${object}`, async () => {
        if (object === 'socialAccounts') {
          const out = await client().mutation({
            createSocialAccount: { __args: { data: data as TwentyObjects['socialAccounts']['create'] }, ...SOCIAL_ACCOUNT_FIELDS }
          })
          return out.createSocialAccount as TwentyObjects[K]['row']
        }
        const out = await client().mutation({
          createAgencyListing: { __args: { data: data as TwentyObjects['agencyListings']['create'] }, ...AGENCY_LISTING_FIELDS }
        })
        return out.createAgencyListing as TwentyObjects[K]['row']
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
        if (object === 'socialAccounts') {
          const out = await client().mutation({
            updateSocialAccount: { __args: { id, data: data as TwentyObjects['socialAccounts']['update'] }, ...SOCIAL_ACCOUNT_FIELDS }
          })
          return out.updateSocialAccount as TwentyObjects[K]['row']
        }
        const out = await client().mutation({
          updateAgencyListing: { __args: { id, data: data as TwentyObjects['agencyListings']['update'] }, ...AGENCY_LISTING_FIELDS }
        })
        return out.updateAgencyListing as TwentyObjects[K]['row']
      })
    }
  }
}
