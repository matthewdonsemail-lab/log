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
  }).index('by_owner', ['owner']).index('by_keyword_and_post', ['keywordId', 'postId'])
    .index('by_scoredAt', ['scoredAt']),
  posts: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    ...postFields,
  }).index('by_owner', ['owner']).index('by_account_external', ['accountId', 'externalId']),
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
