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
  }).index('by_owner', ['owner']),
  communities: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    externalId: v.string(), name: v.string(), url: v.string(),
    joinState: v.union(v.literal('none'), v.literal('pending'), v.literal('accepted')),
  }).index('by_owner', ['owner']).index('by_account_external', ['accountId', 'externalId']),
  keywords: defineTable({
    owner: v.string(), accountId: v.id('accounts'),
    communityId: v.optional(v.id('communities')), phrase: v.string(),
    status: v.union(v.literal('listening'), v.literal('paused')),
  }).index('by_owner', ['owner']).index('by_account', ['accountId']),
  posts: defineTable({
    owner: v.string(), accountId: v.id('accounts'), platform,
    ...postFields,
  }).index('by_owner', ['owner']).index('by_account_external', ['accountId', 'externalId']),
})
