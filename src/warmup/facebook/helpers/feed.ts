import type { PlatformActivity } from '../types'

const RUN = 'run 20261020T102133_61594131334566 (Reading, AdsPower, Byteful)'

/**
 * The Facebook home feed as a warm-up activity: Listaro's stage 1
 * (`Listaro_backup/src/lib/account-warmup.ts` runStage1, lines 92-130, day
 * 1-2): open the feed, read down it, like 2-3 posts, then a short look at
 * Marketplace. The next warm-up stage after Reels (matt, 2026-10-20). Each
 * step says what it must achieve, and `log warmup facebook feed record` checks
 * it after every step and lists what didn't happen (rule 49).
 *
 * What the first recording showed (Reading, 2026-10-20, every step as expected):
 *   the feed is `heading "Feed posts"`; each post has a level-4 heading (its
 *     author or group, "… Join" for a suggested group), Facebook's own image
 *     description ("May be an image of road and nature"), `button "Like"`,
 *     `button "React"`, and its count as a separate `button "Like: 311 people"`
 *     (`^Like$` never matches the count)
 *   the wheel moves the feed (Listaro used `window.scrollBy`): 4 scrolls of
 *     378-501 px, 9-12 wheel steps each, 86 requests as more posts loaded;
 *     3 posts on screen after them, mostly suggested groups
 *   Marketplace: 248 requests to load, one scroll of 783 px
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
      expect: { urlMatches: '^https://www\\.facebook\\.com/(\\?.*)?$' },
      recorded: `${RUN} step 01: the home feed, 296 requests, 24 s`
    },
    { id: 'settle', action: 'dwell', args: ['3-5'], why: "the feed loads; a person looks at the top before reading down (Listaro: 3-5 s)" },
    { id: 'readFeed', action: 'scroll', args: ['4-7', '300-600'], why: 'read down the feed: 4-7 wheel scrolls of 300-600 px (Listaro stage 1)', recorded: `${RUN} step 03: +378, +386, +411, +501 px, 86 requests, 3 posts on screen` },
    {
      id: 'like',
      action: 'clickAny',
      args: ['button', '^Like$', '1'],
      why: 'like a post they would (acts on Facebook)',
      expect: { shows: { role: 'button', name: 'Remove Like' } },
      clicks: true,
      likes: true,
      recorded: `${RUN}: skipped without --likes; step 03's snapshot has each post's button "Like" (3) beside its count, button "Like: N people"`
    },
    {
      id: 'openMarketplace',
      action: 'goto',
      args: ['https://www.facebook.com/marketplace/'],
      why: 'then a short look at Marketplace (Listaro stage 1)',
      expect: { urlMatches: '/marketplace/' },
      recorded: `${RUN} step 04: /marketplace/, 248 requests, 19 s`
    },
    { id: 'lookMarketplace', action: 'dwell', args: ['3-5'], why: 'Marketplace loads; a look at it (Listaro: 3-5 s)' },
    { id: 'scrollMarketplace', action: 'scroll', args: ['1', '400-800'], why: 'one scroll down Marketplace (Listaro: 400-800 px)', recorded: `${RUN} step 06: +783 px` }
  ],
  knownIssues: [
    "the like is a click on the first visible Like: which post the persona likes isn't chosen yet (on Reels SubQ reads each reel; the feed's posts would need the same), and it hasn't been recorded with --likes"
  ]
}
