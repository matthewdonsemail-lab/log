import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const platform = v.union(v.literal('facebook'), v.literal('x'), v.literal('reddit'))
export const postFields = {
  externalId: v.string(),
  authorName: v.string(),
  body: v.array(v.string()),
  title: v.optional(v.string()),
  url: v.string(),
  timestamp: v.optional(v.string()),
  likes: v.number(),
  comments: v.number(),
}

// Owner is the verified identity's tokenIdentifier, never a client-supplied tenant ID.
// Credentials intentionally do not belong in these public metadata tables.
export default defineSchema({
  accounts: defineTable({
    owner: v.string(), platform, label: v.string(),
    connectedAt: v.union(v.string(), v.null()),
  }).index('by_owner', ['owner']).index('by_owner_and_platform', ['owner', 'platform']),
  communities: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    externalId: v.string(), name: v.string(), url: v.string(),
    joinState: v.union(v.literal('none'), v.literal('pending'), v.literal('accepted')),
  }).index('by_owner', ['owner']).index('by_account_external', ['accountId', 'externalId']),
  keywords: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    communityId: v.optional(v.id('communities')), phrase: v.string(),
    status: v.union(v.literal('listening'), v.literal('paused')),
    // Reddit scope: lowercase subreddit name without "r/". Unset = listen everywhere the account reads.
    subreddit: v.optional(v.string()),
    signalsCount: v.optional(v.number()),
    // Freshness, shown to the person: when this phrase's community was last read, and from where.
    lastCheckedAt: v.optional(v.number()),
    lastSource: v.optional(v.union(v.literal('reddit'), v.literal('mirror'), v.literal('helper'))),
  }).index('by_owner', ['owner']).index('by_account', ['accountId'])
    .index('by_status_and_platform', ['status', 'platform']),
  // One row per (keyword, post) match; the pair is unique.
  hits: defineTable({
    owner: v.string(), keywordId: v.id('keywords'), postId: v.id('posts'),
    phrase: v.string(), platform,
    // AI judgement of how likely the author wants help or is ready to buy. Unset until scored.
    score: v.optional(v.number()),
    intent: v.optional(v.string()),
    reason: v.optional(v.string()),
    scoredAt: v.optional(v.number()),
    scoreModel: v.optional(v.string()),
    scoreAttempts: v.optional(v.number()),
    // When this match went out in an email alert. Unset until then.
    alertedAt: v.optional(v.number()),
  }).index('by_owner', ['owner']).index('by_keyword_and_post', ['keywordId', 'postId'])
    .index('by_scoredAt', ['scoredAt']),
  posts: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    ...postFields,
  }).index('by_owner', ['owner']).index('by_account_external', ['accountId', 'externalId']),
  // Keys for the public read API (/api/v1). Only the SHA-256 of the secret is stored; the plaintext exists once, in the create response.
  apiKeys: defineTable({
    owner: v.string(), label: v.string(), prefix: v.string(), keyHash: v.string(),
    // What the key may do (see lib/scopes.ts). Unset on keys made before scopes existed, which means read only.
    scopes: v.optional(v.array(v.string())),
    lastUsedAt: v.optional(v.number()),
    // A per-minute request counter, so one key cannot hammer the deployment.
    windowStart: v.optional(v.number()), windowCount: v.optional(v.number()),
  }).index('by_owner', ['owner']).index('by_hash', ['keyHash']),
  // A webhook: ListeningKit POSTs a signed event to this address when a match is scored high enough. The secret is sealed (it is needed to sign).
  webhooks: defineTable({
    owner: v.string(), url: v.string(), secretIv: v.string(), secretData: v.string(),
    minScore: v.number(), platforms: v.optional(v.array(platform)),
    active: v.boolean(),
    failureStreak: v.number(),
    disabledReason: v.optional(v.string()),
    lastDeliveryAt: v.optional(v.number()),
  }).index('by_owner', ['owner']),
  // One attempt series for one event to one webhook. Plain metadata: never the response body, never the secret.
  webhookDeliveries: defineTable({
    owner: v.string(), webhookId: v.id('webhooks'), hitId: v.optional(v.id('hits')),
    event: v.union(v.literal('match.created'), v.literal('ping')),
    status: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
    attempts: v.number(), statusCode: v.optional(v.number()), error: v.optional(v.string()), updatedAt: v.number(),
  }).index('by_webhook', ['webhookId']).index('by_webhook_and_hit', ['webhookId', 'hitId']),
  // Lets a program retry POST /api/v1/keywords without creating the phrase twice.
  apiIdempotency: defineTable({
    owner: v.string(), key: v.string(), keywordId: v.id('keywords'), createdAt: v.number(),
  }).index('by_owner_and_key', ['owner', 'key']),
  // What Firecrawl read from the person's own website. Facts only: nothing here is a credential.
  brands: defineTable({
    owner: v.string(), sourceUrl: v.string(), name: v.string(), tagline: v.string(),
    offerings: v.array(v.object({ name: v.string(), detail: v.string() })),
    tone: v.optional(v.string()),
    formality: v.optional(v.union(v.literal('casual'), v.literal('professional'), v.literal('formal'))),
    locationLabel: v.optional(v.string()), logoUrl: v.optional(v.string()),
    fetchedAt: v.number(),
    // Set when a read starts, so repeated presses cannot spend the Firecrawl account's credits.
    lastAttemptAt: v.number(),
  }).index('by_owner', ['owner']),
  // Email alerts for strong matches, sent through AgentMail. One row per person.
  emailAlerts: defineTable({
    owner: v.string(), email: v.string(), enabled: v.boolean(), minScore: v.number(),
    lastSentAt: v.optional(v.number()), lastTestAt: v.optional(v.number()),
  }).index('by_owner', ['owner']).index('by_enabled', ['enabled']),
  // A connected login: the cookie jar sealed with AES-GCM. Plain metadata only beside it; no query returns the jar to a browser.
  sessions: defineTable({
    owner: v.string(), platform, iv: v.string(), data: v.string(),
    cookieCount: v.number(), expiresAt: v.union(v.number(), v.null()), updatedAt: v.number(),
  }).index('by_owner_and_platform', ['owner', 'platform']),
  // Only the SHA-256 of the secret is stored; the plaintext exists once, in the create response.
  ingestKeys: defineTable({
    owner: v.string(), label: v.string(), prefix: v.string(), keyHash: v.string(),
    lastUsedAt: v.optional(v.number()),
  }).index('by_owner', ['owner']).index('by_hash', ['keyHash']),
})
