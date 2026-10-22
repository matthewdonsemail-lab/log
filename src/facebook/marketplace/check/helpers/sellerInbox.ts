import type { SellerInbox } from '../types.ts'
import { graphqlResponses } from './graphqlResponses.ts'

export function sellerInboxOf(har: unknown): SellerInbox | null {
  for (const body of graphqlResponses(har, 'CometMarketplaceInboxSellerTabThreadViewContainerQuery')) {
    const threads = (body as { data?: { viewer?: { marketplaceInboxSellerMessageThreads?: { edges?: unknown[]; page_info?: { has_next_page?: boolean } } } } }).data?.viewer?.marketplaceInboxSellerMessageThreads
    if (!threads) continue
    return { threads: threads.edges?.length ?? 0, hasNextPage: threads.page_info?.has_next_page === true, raw: threads.edges ?? [] }
  }
  return null
}
