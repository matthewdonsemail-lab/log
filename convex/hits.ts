import { query, requireOwner, type MutationCtx } from './lib/server'
import { phraseMatches, subredditOf } from './lib/match'
import type { Doc, Id } from './_generated/dataModel'

const MAX_LISTENING = 100

/** The account's listening keywords, loaded once per ingest batch. */
export async function listeningKeywords(ctx: MutationCtx, account: Doc<'accounts'>): Promise<Doc<'keywords'>[]> {
  const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', account.owner)).take(MAX_LISTENING)
  return rows.filter(row => row.status === 'listening' && row.accountId === account._id)
}

/**
 * Match one stored post against the keywords and record each new (keyword, post) pair.
 * Returns each new hit with its keyword so the caller can bump counters once per batch and schedule scoring.
 */
export async function recordHits(
  ctx: MutationCtx,
  keywords: Doc<'keywords'>[],
  post: Pick<Doc<'posts'>, 'owner' | 'platform' | 'title' | 'body' | 'url'> & { _id: Id<'posts'> },
): Promise<{ keywordId: Id<'keywords'>; hitId: Id<'hits'> }[]> {
  const text = [post.title ?? '', ...post.body].join('\n')
  const subreddit = post.platform === 'reddit' ? subredditOf(post.url) : null
  const gained: { keywordId: Id<'keywords'>; hitId: Id<'hits'> }[] = []
  for (const keyword of keywords) {
    if (keyword.subreddit && keyword.subreddit !== subreddit) continue
    if (!phraseMatches(keyword.phrase, text)) continue
    const seen = await ctx.db.query('hits')
      .withIndex('by_keyword_and_post', q => q.eq('keywordId', keyword._id).eq('postId', post._id)).first()
    if (seen) continue
    const hitId = await ctx.db.insert('hits', {
      owner: post.owner, keywordId: keyword._id, postId: post._id, phrase: keyword.phrase, platform: post.platform,
    })
    gained.push({ keywordId: keyword._id, hitId })
  }
  return gained
}

/** Newest matches first, each with the post that matched. */
export const list = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('hits').withIndex('by_owner', q => q.eq('owner', owner)).order('desc').take(100)
    const hits = []
    for (const row of rows) {
      const post = await ctx.db.get(row.postId)
      if (!post) continue
      hits.push({
        id: row._id, phrase: row.phrase, platform: row.platform, matchedAt: row._creationTime,
        score: row.score ?? null, intent: row.intent ?? null, reason: row.reason ?? null,
        post: {
          id: post._id, title: post.title ?? null, authorName: post.authorName, url: post.url,
          snippet: post.body[0]?.slice(0, 280) ?? null, timestamp: post.timestamp ?? null,
        },
      })
    }
    return { hits }
  },
})
