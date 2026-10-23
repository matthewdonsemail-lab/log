import type { PlatformActivity } from '../types'

const RUN = 'run 20261020T102133_61594131334566 (Reading, AdsPower, Byteful)'
const INSPECT = 'inspect 20261020T103913_61594131334566 (Reading, by hand, timed)'

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
      expect: { urlMatches: '^https://www\\.facebook\\.com/(\\?.*)?$', answers: [{ call: 'MAWVerifyThreadCutover_ContactCapabilities2Query', says: [{ answer: 'data.user.id', home: 'uid' }] }] },
      recorded: `${RUN} step 01: the home feed, 296 requests, 24 s; MAWVerifyThreadCutover_ContactCapabilities2Query answers the signed-in account as data.user.id on every feed load recorded (FeedComposerCometRootQuery wasn't sent on warm-up 20261023T072846's first load)`
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
    { id: 'readFeed', action: 'scroll', args: ['4-7', '300-600'], why: 'read down the feed: 4-7 wheel scrolls of 300-600 px (Listaro stage 1)', expect: { answers: [{ call: 'CometNewsFeedPaginationQuery', says: [{ answer: 'first.data.viewer.news_feed', present: true }] }] }, recorded: `${RUN} step 03: +378, +386, +411, +501 px, 86 requests, 3 posts on screen; CometNewsFeedPaginationQuery answered more of the feed (its doc)` },
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
      expect: { answers: [{ call: 'CometUFIFeedbackReactMutation', says: [{ answer: 'data.feedback_react.feedback.viewer_feedback_reaction_info.id', sent: 'variables.input.feedback_reaction_id' }] }] },
      clicks: true,
      likes: true,
      recorded: `${RUN}: skipped without --likes; step 03's snapshot has each post's button "Like" (3) beside its count, button "Like: N people". Passes on Facebook's answer (rule 73): Bethlehem inspect 20261023T051540 steps 03 and 05, CometUFIFeedbackReactMutation answered 200 with the Like we sent saved`
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
      expect: { urlMatches: '/marketplace/', answers: [{ call: 'page /marketplace/', says: [{ answer: 'fields.buy_location.display_name', present: true }, { answer: 'fields.buy_location.display_name', home: 'city', code: 'marketplaceLocationWrong' }] }] },
      recorded: `${RUN} step 04: /marketplace/, 248 requests, 19 s; the page's own answer says buy_location ("Bethlehem, Pennsylvania" on 20261022T113536)`
    },
    { id: 'lookMarketplace', action: 'dwell', args: ['3-5'], why: 'Marketplace loads; a look at it (Listaro: 3-5 s)' },
    { id: 'scrollMarketplace', action: 'scroll', args: ['1', '400-800'], why: 'one scroll down Marketplace (Listaro: 400-800 px)', recorded: `${RUN} step 06: +783 px` },
    {
      id: 'openListings',
      action: 'openAny',
      args: ['/marketplace/item/', '1-3'],
      why: 'open 1-3 listings, read each and come back (Listaro stage 2: 2-4)',
      expect: { answers: [{ call: 'MarketplacePDPContainerQuery', says: [{ answer: 'data.viewer.marketplace_product_details_page', present: true }] }] },
      clicks: true
    }
  ],
  knownIssues: [
    'nextPost, likePost and openListings are new: not recorded yet (record with --live --likes)',
    "a post's comments are read, never written: Leave a comment only opens them (rule 8)"
  ]
}
