import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InspectAction, InspectStepResult } from '../../../browser/inspect/index.ts'
import { AGENCY_LISTINGS, listListingsWhere, SYNCABLE } from '../../../marketplace/agencyListing/index.ts'
import { toTwentyEnum } from '../../../marketplace/socialAccount/helpers/index.ts'
import type { TwentyClient } from '../../../twenty/graphql/index.ts'
import { accessProblem, marketplaceAccessOf, sellerInboxOf, sellingListingsOf } from './helpers/index.ts'
import type { CheckReport, MarketplaceCheck } from './types.ts'

const FB = 'https://www.facebook.com'

export const CHECK_PAGES = {
  status: `${FB}/marketplace/status`,
  selling: `${FB}/marketplace/you/selling`,
  inbox: `${FB}/marketplace/inbox?targetTab=SELLER`
} as const

type Send = (action: InspectAction, args?: string[]) => Promise<InspectStepResult | null>

function harOf(reply: InspectStepResult | null): unknown {
  const path = reply?.folder ? join(reply.folder, 'network.har') : null
  try {
    return path && existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
  } catch {
    return null
  }
}

export async function readMarketplace(send: Send, log: (line: string) => void = () => {}): Promise<MarketplaceCheck> {
  log('  check: Marketplace status')
  const access = marketplaceAccessOf(harOf(await send('goto', [CHECK_PAGES.status])))
  log('  check: Selling')
  const listings = harOf(await send('goto', [CHECK_PAGES.selling]))
  log('  check: the seller inbox')
  const inbox = sellerInboxOf(harOf(await send('goto', [CHECK_PAGES.inbox])))
  return { access, listings: listings ? sellingListingsOf(listings) : null, inbox }
}

export async function keepCheck(twenty: TwentyClient, accountId: string, accountName: string, check: MarketplaceCheck, keepDir: string, now = new Date()): Promise<CheckReport> {
  const lines: string[] = []
  let issue: CheckReport['issue'] = null
  if (!check.access) lines.push(`${accountName}: Marketplace status didn't load`)
  else {
    const problem = accessProblem(check.access)
    lines.push(`${accountName}: ${check.access.title ?? 'Marketplace status'}${check.access.profileStatus ? ` (profile ${check.access.profileStatus})` : ''}`)
    if (problem) issue = { code: 'suspended', detail: problem }
  }
  if (!check.listings) lines.push(`${accountName}: Selling didn't load`)
  else {
    const rows = await listListingsWhere(twenty, { socialAccountId: { eq: accountId } })
    for (const listing of check.listings) {
      const row = rows.find((r) => r.listingId === listing.listingId)
      const said = `${listing.title} (${listing.listingId}): ${listing.status}${listing.notice ? `, "${listing.notice}"` : ''}${listing.clicks === null ? '' : `, ${listing.clicks} click${listing.clicks === 1 ? '' : 's'} in 14 days`}`
      if (!row) {
        lines.push(`  listing ${said}; not in Twenty`)
        continue
      }
      const moved = row.status !== listing.status
      if (!row.status || SYNCABLE.includes(row.status)) {
        await twenty.update(AGENCY_LISTINGS, row.id, { lastCheckedAt: now.toISOString(), ...(moved ? { status: toTwentyEnum(listing.status) } : {}), ...(listing.clicks === null ? {} : { clicksCount: listing.clicks }) } as never)
      }
      lines.push(`  listing ${said}${moved ? `; Twenty ${row.status ?? 'empty'} → ${listing.status}` : ''}${listing.clicks !== null && row.clicksCount !== listing.clicks ? `; clicks ${row.clicksCount ?? 'empty'} → ${listing.clicks}` : ''}`)
    }
    if (!check.listings.length) lines.push('  no listings on Selling')
  }
  const threads = check.inbox?.threads ?? 0
  if (!check.inbox) lines.push(`${accountName}: the seller inbox didn't load`)
  else if (!threads) lines.push(`${accountName}: the seller inbox has no chats`)
  else {
    mkdirSync(keepDir, { recursive: true })
    const file = join(keepDir, `sellerInbox_${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}.json`)
    writeFileSync(file, `${JSON.stringify(check.inbox.raw, null, 2)}\n`)
    lines.push(`${accountName}: ${threads}${check.inbox.hasNextPage ? '+' : ''} seller chat(s). A thread's fields aren't mapped yet: record one (rule 29); kept as sent: ${file}`)
  }
  return { lines, issue, threads }
}
