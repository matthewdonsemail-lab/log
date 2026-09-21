import { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'

export type Platform = 'facebook' | 'x' | 'reddit'
export interface Account {
  id: string
  platform: Platform
  label: string
  connectedAt: string | null
}
export interface FeedSyncResult {
  accountId: string
  fetched: number
  ingested: number
  skipped: number
}
export interface Backend {
  listAccounts(): Promise<{ accounts: Account[] }>
  createAccount(input: { platform: Platform; label: string }): Promise<{ account: Account; accounts: Account[] }>
  feed(input: { platform?: Platform; search?: string }): Promise<{ items: unknown[] }>
  syncReddit(input: { subreddit: string; limit: number }): Promise<FeedSyncResult>
}

/** Per-request client: never share mutable authentication between users. */
export function convexBackend(url: string, token: string): Backend {
  const client = new ConvexHttpClient(url)
  client.setAuth(token)
  return {
    listAccounts: () => client.query(makeFunctionReference<'query', Record<string, never>, { accounts: Account[] }>('accounts:list'), {}),
    createAccount: input => client.mutation(makeFunctionReference<'mutation', typeof input, { account: Account; accounts: Account[] }>('accounts:createWithResponse'), input),
    feed: input => client.query(makeFunctionReference<'query', typeof input, { items: unknown[] }>('feed:list'), input),
    syncReddit: input => client.action(makeFunctionReference<'action', typeof input, FeedSyncResult>('reddit:syncSubreddit'), input),
  }
}
