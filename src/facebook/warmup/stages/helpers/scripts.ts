import { WARMUP_ACTIVITIES } from '../../../../marketplace/lifecycle/types'
import type { ActivityScript, WarmupActivity } from '../types'

const FB = 'https://www.facebook.com'

export const ACTIVITY_SCRIPTS: Record<WarmupActivity, ActivityScript> = {
  feedBrowse: {
    activity: 'feedBrowse',
    flow: 'warmupFeedBrowse',
    source: 'runStage1, account-warmup.ts:92-130',
    steps: [
      { action: 'goto', args: [`${FB}/`], why: 'the home feed' },
      { action: 'dwell', args: ['3-5'], why: 'wait 3000-5000 ms' },
      { action: 'scroll', args: ['4-7', '300-600'], why: '4-7 scrolls of 300-600 px, 1.5-3.5 s apart' },
      { action: 'clickAny', args: ['button', '^Like$', '2-3'], why: '2-3 likes on posts not liked yet', live: true },
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'then Marketplace' },
      { action: 'dwell', args: ['3-5'], why: 'wait 3000-5000 ms' },
      { action: 'scroll', args: ['1', '400-800'], why: 'one scroll of 400-800 px' }
    ]
  },
  marketplaceBrowse: {
    activity: 'marketplaceBrowse',
    flow: 'warmupMarketplaceBrowse',
    source: 'runStage2, account-warmup.ts:135-174',
    steps: [
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'Marketplace' },
      { action: 'dwell', args: ['3-5'], why: 'wait 3000-5000 ms' },
      { action: 'scroll', args: ['3-5', '400-700'], why: '3-5 scrolls of 400-700 px' },
      { action: 'openAny', args: ['/marketplace/item/', '2-4'], why: 'open 2-4 listings, read each, come back' }
    ]
  },
  createAccessCheck: {
    activity: 'createAccessCheck',
    flow: 'warmupCreateAccessCheck',
    source: 'runStage3, account-warmup.ts:181-209',
    steps: [
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'Marketplace' },
      { action: 'dwell', args: ['2-4'], why: 'wait 2000-4000 ms' },
      { action: 'goto', args: [`${FB}/marketplace/create/item`], why: 'the create form: it stays there when posting is allowed' },
      { action: 'dwell', args: ['2-3'], why: 'wait 2000-3000 ms' },
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'back to Marketplace' },
      { action: 'scroll', args: ['1', '300-600'], why: 'one scroll of 300-600 px' }
    ]
  },
  sellingVisit: {
    activity: 'sellingVisit',
    flow: 'warmupSellingVisit',
    source: 'runStage4or5 (stage 4), account-warmup.ts:214-246',
    steps: [
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'Marketplace' },
      { action: 'scroll', args: ['4-7', '300-600'], why: '4-7 scrolls of 300-600 px, 1.5-3 s apart' },
      { action: 'goto', args: [`${FB}/marketplace/you/selling`], why: 'Marketplace > Selling' },
      { action: 'dwell', args: ['2-4'], why: 'wait 2000-3500 ms' }
    ]
  },
  messagesVisit: {
    activity: 'messagesVisit',
    flow: 'warmupMessagesVisit',
    source: 'runStage4or5 (stage 5), account-warmup.ts:214-246',
    steps: [
      { action: 'goto', args: [`${FB}/marketplace/`], why: 'Marketplace' },
      { action: 'scroll', args: ['4-7', '300-600'], why: '4-7 scrolls of 300-600 px' },
      { action: 'goto', args: [`${FB}/marketplace/you/selling`], why: 'Marketplace > Selling' },
      { action: 'dwell', args: ['2-4'], why: 'wait 2000-3500 ms' },
      { action: 'goto', args: [`${FB}/messages/`], why: 'Messages (stage 5 only)' },
      { action: 'dwell', args: ['2-3'], why: 'wait' },
      { action: 'scroll', args: ['1', '200-400'], why: 'one scroll of 200-400 px' }
    ]
  }
}

export const SCRIPTS_IN_ORDER: ActivityScript[] = WARMUP_ACTIVITIES.map((a) => ACTIVITY_SCRIPTS[a])

export function pickActivities(only: string | undefined): { ok: true; activities: WarmupActivity[] } | { ok: false; error: string } {
  if (!only) return { ok: true, activities: [...WARMUP_ACTIVITIES] }
  const asked = only.split(',').map((a) => a.trim()).filter(Boolean)
  const unknown = asked.filter((a) => !(WARMUP_ACTIVITIES as readonly string[]).includes(a))
  if (unknown.length) return { ok: false, error: `unknown activity ${unknown.join(', ')} (one of ${WARMUP_ACTIVITIES.join(', ')})` }
  return { ok: true, activities: WARMUP_ACTIVITIES.filter((a) => asked.includes(a)) }
}
