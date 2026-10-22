import type { PlatformActivity } from '../types'

const RUN = 'run 20261020T102133_61594131334566 (Reading, AdsPower, Byteful)'
const INSPECT = 'inspect 20261020T103913_61594131334566 (Reading, by hand, timed)'

/**
 * The Facebook home feed as a warm-up activity: Listaro's stage 1
 * (`Listaro_backup/src/lib/account-warmup.ts` runStage1, lines 92-130, day
 * 1-2): open the feed, read down it, like 2-3 posts, then a short look at
 * Marketplace. The next warm-up stage after Reels (matt, 2026-10-20). Each
 * step says what it must achieve, and `log facebook warmup feed record` checks
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
 *
 * With --persona (`log facebook warmup feed run --persona`) the feed is read
 * post by post as the persona would (`feedPersonaMachine`, `planPost`): each
 * post SubQ reads, a glance or a read, a like where they would; then
 * Marketplace and a few listings.
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
    {
      id: 'dismissPrompt',
      action: 'clickRole',
      args: ['button', 'Not now'],
      why: 'the "Remember password" prompt over the feed: not now, as a person would',
      clicks: true,
      optional: true,
      recorded: `${INSPECT} step 27: heading "Remember password" with button "OK", button "Not now" and button "Close", over the feed`
    },
    { id: 'settle', action: 'dwell', args: ['3-5'], why: "the feed loads; a person looks at the top before reading down (Listaro: 3-5 s)" },
    { id: 'readFeed', action: 'scroll', args: ['4-7', '300-600'], why: 'read down the feed: 4-7 wheel scrolls of 300-600 px (Listaro stage 1)', recorded: `${RUN} step 03: +378, +386, +411, +501 px, 86 requests, 3 posts on screen` },
    {
      id: 'nextPost',
      action: 'nextPost',
      args: [],
      why: 'the next post not read yet, into view by the wheel, with its heading, text and image descriptions',
      recorded: `new, from ${RUN} step 03's snapshot: a post is a level-4 heading and the block around it holding one button "Like"`
    },
    {
      id: 'likePost',
      action: 'likePost',
      args: [],
      why: "like the post in view: its own Like, not the first on the page (acts on Facebook)",
      expect: { shows: { role: 'button', name: 'Remove Like' } },
      clicks: true,
      likes: true,
      recorded: `${RUN}: skipped without --likes; step 03's snapshot has each post's button "Like" (3) beside its count, button "Like: N people"`
    },
    {
      id: 'seeMore',
      action: 'postButton',
      args: ['See more'],
      why: "the post's full text, when it is theirs and cut short",
      clicks: true,
      optional: true,
      recorded: `${INSPECT} step 29: button "See more" in Backstage with Brad's post, clicked`
    },
    {
      id: 'openComments',
      action: 'postButton',
      args: ['Leave a comment'],
      why: "open the post's comments: it opens in a dialog, its comments listed",
      expect: { urlChanges: true },
      clicks: true,
      recorded: `${INSPECT} step 30: dialog "Karen's post", the URL to the post's permalink, button "Most relevant", article "Comment by …" for each comment`
    },
    { id: 'scrollComments', action: 'scroll', args: ['1-2', '300-500'], why: 'read down the comments in the dialog' },
    {
      id: 'closeComments',
      action: 'clickRole',
      args: ['button', 'Close'],
      why: "close the post's dialog: back to the feed",
      expect: { urlMatches: '^https://www\\.facebook\\.com/(\\?.*)?$' },
      clicks: true,
      recorded: `${INSPECT} step 31: the dialog closed, back on https://www.facebook.com/`
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
    { id: 'scrollMarketplace', action: 'scroll', args: ['1', '400-800'], why: 'one scroll down Marketplace (Listaro: 400-800 px)', recorded: `${RUN} step 06: +783 px` },
    {
      id: 'openListings',
      action: 'openAny',
      args: ['/marketplace/item/', '1-3'],
      why: 'open 1-3 listings, read each and come back (Listaro stage 2: 2-4)',
      clicks: true
    }
  ],
  knownIssues: [
    'nextPost, likePost and openListings are new: not recorded yet (record with --live --likes)',
    "a post's comments are read, never written: Leave a comment only opens them (rule 8)"
  ]
}
