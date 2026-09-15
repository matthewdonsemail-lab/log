import { z } from 'zod'
import { FIX_LABELS, ISSUE_CATALOG } from './account-issues'
import type { AccountIssue, IssueFix } from './account-issues'

/**
 * The machine-readable API contract, co-located with the mock. Zod schemas
 * here do double duty: they describe routes for `hono-openapi`
 * (`describeRoute`) and they serialize into the committed `openapi.json`
 * the docs render. The error vocabulary is derived from `ISSUE_CATALOG` /
 * `FIX_LABELS`, so adding a code to the dashboard catalog flows into the
 * contract — nothing is authored twice.
 */

export const MOCK_SERVER_PORT = 5174

/** `{ error: string }` — the envelope every mock failure returns. */
export const ErrorEnvelopeSchema = z
  .object({
    error: z.string().describe('Human-readable failure reason, e.g. "A key needs a name".')
  })
  .describe('Failure envelope returned with 4xx statuses.')

const ACCOUNT_ISSUE_VALUES = Object.keys(ISSUE_CATALOG) as AccountIssue[]

/** All 27 normalized codes — generated from the catalog keys, cannot drift. */
export const AccountIssueSchema = z
  .enum(ACCOUNT_ISSUE_VALUES as [AccountIssue, ...AccountIssue[]])
  .describe('Normalized account issue code (see docs: Errors).')

const ISSUE_FIX_VALUES = Object.keys(FIX_LABELS) as IssueFix[]

export const IssueFixSchema = z
  .enum(ISSUE_FIX_VALUES as [IssueFix, ...IssueFix[]])
  .describe('Remediation verb for the issue.')

export const RawSignalSchema = z
  .object({
    status: z.number().optional().describe('HTTP status the client saw (200 for false-success cases).'),
    code: z.number().optional().describe('Platform error code, e.g. Facebook Graph 190.'),
    subcode: z.number().optional().describe('Platform error subcode, e.g. Facebook 459 (checkpointed).'),
    type: z.string().optional().describe('Machine error type, e.g. X rate-limit-exceeded.'),
    marker: z.string().optional().describe('Lowercased phrase matched against the body/URL.'),
    url: z.string().optional().describe('URL that produced the response.')
  })
  .describe('Raw platform signal normalized into the issue.')

export const AccountIssueInfoSchema = z
  .object({
    issue: AccountIssueSchema,
    label: z.string().describe('Human label, e.g. "Session expired".'),
    severity: z.enum(['healthy', 'degraded', 'unhealthy']).describe('Badge band the issue maps to.'),
    transient: z.boolean().describe('True when it typically clears without action.'),
    detail: z.string().describe('One-line platform-agnostic explanation.'),
    signal: RawSignalSchema.describe('Observed signal (canonical detector signature when unobserved).'),
    fix: IssueFixSchema,
    remediation: z.string().describe('Platform-specific remediation copy.'),
    platforms: z.array(z.enum(['facebook', 'x', 'reddit'])).describe('Platforms that can emit this.')
  })
  .describe('Fully-resolved issue descriptor (see docs: Errors).')

export const ApiKeyScopeSchema = z.object({
  accountId: z.string().nullable().describe('Act-as account id, or null for all accounts.'),
  groupIds: z.array(z.string()).describe('Scoped groups; empty means all groups.'),
  canSendMessages: z.boolean(),
  canReceiveMessages: z.boolean()
})

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string().describe('Public prefix; the full secret is never stored.'),
  secretHash: z.string(),
  scopes: ApiKeyScopeSchema,
  createdAt: z.string(),
  lastUsedAt: z.string().nullable()
})

export const CreateApiKeyInputSchema = z.object({
  name: z.string().describe('Key name; unique case-insensitively.'),
  scopes: ApiKeyScopeSchema
})

export const ApiKeyListSchema = z.object({ apiKeys: z.array(ApiKeySchema) })

export const ApiKeyCreateSchema = z.object({
  apiKey: ApiKeySchema,
  apiKeys: z.array(ApiKeySchema),
  key: z.string().describe('Full secret — returned exactly once, never again.')
})

// ---- Shared generic helpers for still-mocked domains -----------------
// These are intentionally loose (z.any / passthrough) so the contract can be
// emitted before every domain migrates to strict Zod validation. The live
// backend will tighten them; the route table already stays the same.

export const BrandSchema: z.ZodTypeAny = z.object({}).passthrough().describe('BrandEntity — single workspace brand record (see docs: Brand).')
export const BrandPageSchema: z.ZodTypeAny = z.object({}).passthrough()
export const ConnectionRecordSchema: z.ZodTypeAny = z.object({}).passthrough().describe('ConnectionRecord — connected platform account.')
export const CommunitySchema: z.ZodTypeAny = z.object({}).passthrough().describe('Community — joinable group / subreddit.')
export const ListingRecordSchema: z.ZodTypeAny = z.object({}).passthrough().describe('ListingRecord — Marketplace listing.')
export const KeywordSchema: z.ZodTypeAny = z.object({}).passthrough().describe('Keyword — tracked phrase + scope.')
export const FeedItemSchema: z.ZodTypeAny = z.object({}).passthrough().describe('FeedItem — one signal in the feed.')

export const BrandResponseSchema = z.object({ brand: BrandSchema.nullable() })
export const BrandWithSourcesSchema = z.object({ brand: BrandSchema, sources: z.array(BrandPageSchema) })
export const SourcesResponseSchema = z.object({ sources: z.array(BrandPageSchema) })
export const AccountsResponseSchema = z.object({ accounts: z.array(ConnectionRecordSchema) })
export const AccountCreateResponseSchema = z.object({ account: ConnectionRecordSchema, accounts: z.array(ConnectionRecordSchema) })
export const CommunitiesResponseSchema = z.object({ communities: z.array(CommunitySchema) })
export const CommunityResponseSchema = z.object({ community: CommunitySchema, communities: z.array(CommunitySchema) })
export const CommunitySingleResponseSchema = z.object({ community: CommunitySchema })
export const ListingsResponseSchema = z.object({ listings: z.array(ListingRecordSchema) })
export const ListingResponseSchema = z.object({ listing: ListingRecordSchema, listings: z.array(ListingRecordSchema) })
export const ListingStatusResponseSchema = z.object({ listingId: z.string(), status: z.string(), title: z.string() })
export const KeywordsResponseSchema = z.object({ keywords: z.array(KeywordSchema) })
export const KeywordResponseSchema = z.object({ keyword: KeywordSchema, keywords: z.array(KeywordSchema) })
export const FeedResponseSchema = z.object({ items: z.array(FeedItemSchema) })
export const ThreadsResponseSchema = z.object({ threads: z.array(z.object({}).passthrough()) })
export const MessagesResponseSchema = z.object({ messages: z.array(z.object({}).passthrough()) })

/** Standard `{ error }` failure response for `describeRoute` maps. */
export function errorResponse(description: string) {
  return {
    description,
    content: { 'application/json': { schema: ErrorEnvelopeJson } }
  }
}

/**
 * Plain JSON Schema snapshots of the Zod contracts, for `describeRoute`
 * `schema:` positions. hono-openapi's resolver passes Zod v4 instances
 * through unresolved, so routes take the converted form; the Zod originals
 * stay as the single source for future validation.
 */
function json(schema: z.ZodType) {
  return z.toJSONSchema(schema) as Record<string, unknown>
}

export const ErrorEnvelopeJson = json(ErrorEnvelopeSchema)
export const ApiKeyScopeJson = json(ApiKeyScopeSchema)
export const ApiKeyJson = json(ApiKeySchema)
export const CreateApiKeyInputJson = json(CreateApiKeyInputSchema)
export const ApiKeyListJson = json(ApiKeyListSchema)
export const ApiKeyCreateJson = json(ApiKeyCreateSchema)

export const BrandJson = json(BrandSchema)
export const BrandResponseJson = json(BrandResponseSchema)
export const BrandWithSourcesJson = json(BrandWithSourcesSchema)
export const SourcesResponseJson = json(SourcesResponseSchema)
export const AccountsResponseJson = json(AccountsResponseSchema)
export const AccountCreateResponseJson = json(AccountCreateResponseSchema)
export const CommunitiesResponseJson = json(CommunitiesResponseSchema)
export const CommunityResponseJson = json(CommunityResponseSchema)
export const CommunitySingleResponseJson = json(CommunitySingleResponseSchema)
export const ListingsResponseJson = json(ListingsResponseSchema)
export const ListingResponseJson = json(ListingResponseSchema)
export const ListingStatusResponseJson = json(ListingStatusResponseSchema)
export const KeywordsResponseJson = json(KeywordsResponseSchema)
export const KeywordResponseJson = json(KeywordResponseSchema)
export const FeedResponseJson = json(FeedResponseSchema)
export const ThreadsResponseJson = json(ThreadsResponseSchema)
export const MessagesResponseJson = json(MessagesResponseSchema)

/**
 * Contract schemas serialized to plain JSON Schema for the document's
 * `components.schemas` — these are referenced by prose/routes but owned by
 * no single route, so they are injected rather than discovered.
 */
function contractComponents() {
  return {
    ErrorEnvelope: z.toJSONSchema(ErrorEnvelopeSchema),
    AccountIssue: z.toJSONSchema(AccountIssueSchema),
    IssueFix: z.toJSONSchema(IssueFixSchema),
    RawSignal: z.toJSONSchema(RawSignalSchema),
    AccountIssueInfo: z.toJSONSchema(AccountIssueInfoSchema)
  }
}

export const openApiDocumentation = {
  openapi: '3.1.0' as const,
  info: {
    title: 'ListeningKit Mock API',
    version: '0.0.0',
    description:
      'In-browser mock backing the dashboard; the live platform client exposes the same route table. Error vocabulary: docs /getting-started/errors.'
  },
  servers: [
    {
      url: `http://localhost:${MOCK_SERVER_PORT}`,
      description: 'Local mock server (pnpm --filter web mock:server).'
    }
  ],
  tags: [
    {
      name: 'API keys',
      // fumadocs title-cases the tag name ("A P I keys") unless told otherwise.
      'x-displayName': 'API keys',
      description: 'Private keys: list, create (secret shown once), revoke.'
    },
    { name: 'Brand', 'x-displayName': 'Brand', description: 'Onboarding record: identity, voice, offerings, sources & intelligence.' },
    { name: 'Accounts', 'x-displayName': 'Accounts', description: 'Connected platform accounts (facebook, x, reddit).' },
    { name: 'Communities', 'x-displayName': 'Communities', description: 'Joinable groups / subreddits + join lifecycle.' },
    { name: 'Listings', 'x-displayName': 'Listings', description: 'Facebook Marketplace listings (mock of facebook-camofox-client).' },
    { name: 'Keywords', 'x-displayName': 'Keywords', description: 'Tracked phrases scoped to joined groups (or word-based on X).' },
    { name: 'Feed', 'x-displayName': 'Feed', description: 'Signal feed — filterable by platform and search.' },
    { name: 'Messaging', 'x-displayName': 'Messaging', description: 'Threads + messages per platform (facebook / x / reddit).' }
  ],
  components: {
    schemas: contractComponents()
  }
}
