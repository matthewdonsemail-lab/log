import type { SellerInbox } from '../types.ts'
import { graphqlResponses } from './graphqlResponses.ts'

/**
 * The seller tab of the Marketplace inbox. Recorded on Bethlehem 2026-10-22 (inspect 20261022T113536 step 1)
 * with no chats: `marketplaceInboxSellerMessageThreads.edges` []. A thread's own fields aren't mapped until a
 * recording holds one (rule 29), so the threads are kept as Facebook sent them. Null when the step didn't load
 * it. Pure.
 */
export function sellerInboxOf(har: unknown): SellerInbox | null {
  for (const body of graphqlResponses(har, 'CometMarketplaceInboxSellerTabThreadViewContainerQuery')) {
    const threads = (body as { data?: { viewer?: { marketplaceInboxSellerMessageThreads?: { edges?: unknown[]; page_info?: { has_next_page?: boolean } } } } }).data?.viewer?.marketplaceInboxSellerMessageThreads
    if (!threads) continue
    return { threads: threads.edges?.length ?? 0, hasNextPage: threads.page_info?.has_next_page === true, raw: threads.edges ?? [] }
  }
  return null
}
