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

// --- Messaging: normalized multi-account threads + messages -----------
// The chat types mirror the platform-native payloads (X dm_events with
// dm_conversation_id, Facebook conversation objects with mid ids, Reddit
// inbox/outbox listings grouped by first_message_name) — each schema pins
// the platform literal and describes its native id shape.
export const ParticipantSchema = z
  .object({
    name: z.string(),
    handle: z.string().optional().describe('Platform handle when one exists: @handle (X), u/name (Reddit); absent on Facebook.'),
    initials: z.string(),
    color: z.string()
  })
  .describe('Participant — how the other side of a thread renders in the UI.')

export const ReplyToSchema = z
  .object({
    platformMessageId: z.string(),
    isSelfReply: z.boolean().optional().describe('Facebook is_self_reply: the message replies to one of my own. Absent elsewhere.')
  })
  .describe('ReplyTo — an earlier platform-native message this one replies to.')

function threadSchema(platform: 'facebook' | 'x' | 'reddit', platformThreadId: string, subjectDescription?: string) {
  return z.object({
    id: z.string().describe('Normalized thread id (internal).'),
    platform: z.literal(platform),
    accountId: z.string().describe('FK to /accounts — the connected account that owns this thread; every message in it is from or to that account.'),
    platformThreadId: z.string().describe(platformThreadId),
    platformParticipantId: z.string().describe('The other participant platform-native id (X user id / Facebook user id / Reddit username).'),
    participant: ParticipantSchema,
    ...(subjectDescription ? { subject: z.string().describe(subjectDescription) } : {}),
    preview: z.string().describe('Latest message body (Photo when the tail is an image).'),
    updatedAt: z.string().datetime().describe('ISO 8601 — normalized from the native clock (X created_at / Facebook created_time / Reddit created_utc x 1000). The client formats it.'),
    unread: z.number().int().min(0)
  })
}

export const FacebookThreadSchema = threadSchema('facebook', 'Numeric conversation id — the thread_key the Messenger payloads carry.')
export const XThreadSchema = threadSchema('x', 'The dm_conversation_id — for 1:1 conversations, senderId-participantId (the two user ids joined with a dash).')
export const RedditThreadSchema = threadSchema('reddit', 'The first_message_name — the t4_ fullname of the thread first message; the client groups inbox/outbox listings by it.', 'Reddit PM subject line; absent on X and Facebook.')

function messageSchema(platformMessageId: string, replyTo?: string) {
  return z.object({
    id: z.string().describe('Normalized message id (internal).'),
    threadId: z.string().describe('FK to the normalized thread id.'),
    from: z.enum(['me', 'them']).describe('me is the calling account side; them is the participant.'),
    platformMessageId: z.string().describe(platformMessageId),
    body: z.string(),
    sentAt: z.string().datetime().describe('ISO 8601, same normalization as Thread.updatedAt.'),
    image: z.string().url().optional(),
    replyTo: ReplyToSchema.optional().describe(replyTo ?? 'Reply to an earlier message in this thread.')
  })
}

export const FacebookMessageSchema = messageSchema('The mid — the Facebook message id.', 'A Facebook reply_to: the replied mid, plus is_self_reply when it replies to my own message.')
export const XMessageSchema = messageSchema('The dm event id — a 19-digit base36-lookalike event identifier from the dm_events stream.')
export const RedditMessageSchema = messageSchema('The t4_ fullname — the postbase id of the message in the inbox/outbox listing.')

export const SendMessageInputSchema = z.object({
  body: z.string().min(1).describe('Plain text; empty after trimming is 400.'),
  image: z.string().url().optional().describe('Image URL. The native client uploads media through the platform first (X attachments[].media_id, Facebook attachment upload) and passes the result here — this endpoint stays a chat-message endpoint, not an upload endpoint.'),
  replyToPlatformMessageId: z.string().optional().describe('Reply to this message in the thread; unknown platform ids are 400.')
})

export const StartThreadInputSchema = z.object({
  platformParticipantId: z.string().min(1).describe('The recipient platform-native id: X user id / Facebook user id / Reddit username (no u/ prefix).'),
  body: z.string().min(1).describe('The first message — the compose body. None of the platforms allow an empty conversation, so composing always sends the first message with it.'),
  image: z.string().url().optional(),
  name: z.string().optional().describe('Participant display name, when the client has it open (DM list, profile, comment page). The mock renders the id itself when absent.'),
  handle: z.string().optional(),
  subject: z.string().optional().describe('Reddit PM subject line; ignored on X and Facebook (they have none).')
})

export const AckSchema = z
  .object({
    threadId: z.string(),
    acknowledged: z.number().int().min(0).describe('Unread messages that were cleared.')
  })
  .describe('Ack — read state cleared for the account session (what opening a conversation does natively).')

function threadsJson(threads: z.ZodType) {
  return json(z.object({ threads: z.array(threads) }))
}
function messagesJson(thread: z.ZodType, message: z.ZodType) {
  return json(z.object({ threadId: z.string(), accountId: z.string(), thread, messages: z.array(message) }))
}
function sendResultJson(message: z.ZodType, thread: z.ZodType) {
  return json(z.object({ message, thread }))
}

export const FacebookThreadsJson = threadsJson(FacebookThreadSchema)
export const XThreadsJson = threadsJson(XThreadSchema)
export const RedditThreadsJson = threadsJson(RedditThreadSchema)
export const FacebookMessagesJson = messagesJson(FacebookThreadSchema, FacebookMessageSchema)
export const XMessagesJson = messagesJson(XThreadSchema, XMessageSchema)
export const RedditMessagesJson = messagesJson(RedditThreadSchema, RedditMessageSchema)
export const FacebookSendResultJson = sendResultJson(FacebookMessageSchema, FacebookThreadSchema)
export const XSendResultJson = sendResultJson(XMessageSchema, XThreadSchema)
export const RedditSendResultJson = sendResultJson(RedditMessageSchema, RedditThreadSchema)
export const SendMessageInputJson = json(SendMessageInputSchema)
export const StartThreadInputJson = json(StartThreadInputSchema)
export const AckJson = json(AckSchema)

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
    AccountIssueInfo: z.toJSONSchema(AccountIssueInfoSchema),
    Participant: z.toJSONSchema(ParticipantSchema),
    ReplyTo: z.toJSONSchema(ReplyToSchema),
    Ack: z.toJSONSchema(AckSchema)
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
    { name: 'Messaging', 'x-displayName': 'Messaging', description: 'Multi-account chat: threads + messages per connected account on facebook / x / reddit (send, start, mark read).' }
  ],
  components: {
    schemas: contractComponents()
  }
}
