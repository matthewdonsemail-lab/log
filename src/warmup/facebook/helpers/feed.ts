import type { PlatformActivity } from '../types'

/**
 * The Facebook home feed as a warm-up activity: Listaro's stage 1
 * (`Listaro_backup/src/lib/account-warmup.ts` runStage1, lines 92-130, day
 * 1-2): open the feed, read down it, like 2-3 posts, then a short look at
 * Marketplace. The next warm-up stage after Reels (matt, 2026-10-20). Not
 * recorded yet: each step says what it must achieve, and `log warmup facebook
 * feed record` checks it after every step and lists what didn't happen
 * (rule 49); the steps are fixed from that recording before any run (rules
 * 25, 29).
 *
 * From Listaro's code, to check against the recording:
 *   it found likes as `div[aria-label="Like"][role="button"]:not([aria-pressed="true"])`,
 *     here `button "Like"` by role (a liked post shows `button "Remove Like"`,
 *     as on Reels)
 *   it scrolled with `window.scrollBy`, here the wheel (`scroll`, rule 32)
 *   Marketplace was a goto, 3-5 s, one scroll of 400-800 px
 */
export const FEED: PlatformActivity = {
  platform: 'facebook',
  activity: 'feed',
  summary: 'The Facebook home feed read as a person does: open it, read down it, like a couple of posts, then a short look at Marketplace (Listaro stage 1).',
  steps: [
    {
      id: 'openFeed',
      action: 'goto',
      args: ['https://www.facebook.com/'],
      why: 'the home feed, signed in',
      expect: { urlMatches: '^https://www\\.facebook\\.com/(\\?.*)?$' }
    },
    { id: 'settle', action: 'dwell', args: ['3-5'], why: "the feed loads; a person looks at the top before reading down (Listaro: 3-5 s)" },
    { id: 'readFeed', action: 'scroll', args: ['4-7', '300-600'], why: 'read down the feed: 4-7 wheel scrolls of 300-600 px (Listaro stage 1)' },
    {
      id: 'like',
      action: 'clickAny',
      args: ['button', '^Like$', '1'],
      why: 'like a post they would (acts on Facebook)',
      expect: { shows: { role: 'button', name: 'Remove Like' } },
      clicks: true,
      likes: true
    },
    {
      id: 'openMarketplace',
      action: 'goto',
      args: ['https://www.facebook.com/marketplace/'],
      why: 'then a short look at Marketplace (Listaro stage 1)',
      expect: { urlMatches: '/marketplace/' }
    },
    { id: 'lookMarketplace', action: 'dwell', args: ['3-5'], why: 'Marketplace loads; a look at it (Listaro: 3-5 s)' },
    { id: 'scrollMarketplace', action: 'scroll', args: ['1', '400-800'], why: 'one scroll down Marketplace (Listaro: 400-800 px)' }
  ],
  knownIssues: [
    'not recorded yet: record it with `log warmup facebook feed record --account <a> --live` (proxy traffic needed, rule 51), then fix the steps from its outline',
    "the like is a click on the first visible Like: which post the persona likes isn't chosen yet (on Reels SubQ reads each reel; the feed's posts would need the same)"
  ]
}
