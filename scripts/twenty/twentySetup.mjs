import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function loadEnv() {
  const env = { ...process.env }
  for (const file of [join(root, '.env.local'), join(root, '.env')]) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = /^((?:LOG_)?TWENTY_BASE_URL|(?:LOG_)?TWENTY_API_KEY)=(.*)$/.exec(line)
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"|"$/g, '')
    }
  }
  if (!env.TWENTY_BASE_URL || !env.TWENTY_API_KEY) throw new Error('TWENTY_BASE_URL and TWENTY_API_KEY are required')
  env.TWENTY_BASE_URL = env.LOG_TWENTY_BASE_URL || env.TWENTY_BASE_URL
  env.TWENTY_API_KEY = env.LOG_TWENTY_API_KEY || env.TWENTY_API_KEY
  return env
}

const option = (value, label, color, position) => ({ value, label, color, position })

const SOCIAL_ACCOUNT_FIELDS = [
  { name: 'homeCity', label: 'Home city', type: 'TEXT', description: 'log-cli: where the account lives, e.g. Galway' },
  { name: 'homeCountry', label: 'Home country', type: 'TEXT', description: 'log-cli: ISO 3166 alpha-2 (IE). The proxy exit and every listing must be in this country' },
  {
    name: 'accountStatus',
    label: 'Account status',
    type: 'SELECT',
    description: 'log-cli: usable are ACTIVE and WARMING. BANNED and DEAD are terminal and never cleared. DEACTIVATED is set by hand, takes the proxy off and is never used. Rows are never deleted',
    options: [
      option('ACTIVE', 'Active', 'green', 0),
      option('WARMING', 'Warming', 'turquoise', 1),
      option('LIMITED', 'Limited', 'yellow', 2),
      option('PAUSED', 'Paused', 'gray', 3),
      option('NEEDS_LOGIN', 'Needs login', 'orange', 4),
      option('CHECKPOINT', 'Checkpoint', 'orange', 5),
      option('RESTRICTED', 'Restricted', 'red', 6),
      option('BANNED', 'Banned', 'red', 7),
      option('DEAD', 'Dead', 'gray', 8),
      option('DEACTIVATED', 'Deactivated', 'gray', 9)
    ]
  },
  { name: 'statusReason', label: 'Status reason', type: 'TEXT', description: 'log-cli: error catalog code behind the status (log errors --code <code>)' },
  { name: 'statusDetail', label: 'Status detail', type: 'TEXT', description: 'log-cli: what the page said' },
  { name: 'statusChangedAt', label: 'Status changed', type: 'DATE_TIME', description: 'logCli' },
  { name: 'proxyCheckedAt', label: 'Proxy checked', type: 'DATE_TIME', description: 'log-cli: last proxy gate run' },
  { name: 'proxyExitIp', label: 'Proxy exit IP', type: 'TEXT', description: 'log-cli: exit IP seen through the proxy at the last check' },
  { name: 'proxyExitCountry', label: 'Proxy exit country', type: 'TEXT', description: 'log-cli: country of that exit IP. Must equal homeCountry' },
  { name: 'dailyListingCap', label: 'Daily listing cap', type: 'NUMBER', description: 'log-cli: listings per day (3 when empty)' },
  { name: 'totpSecret', label: '2FA secret', type: 'TEXT', description: 'log-cli: the TOTP (authenticator) secret the vendor delivered. A credential: never print it' },
  { name: 'messengerPin', label: 'Messenger PIN', type: 'TEXT', description: "log-cli: the 6-digit PIN for the account's encrypted chats (Messenger's Create a PIN), set by matt with log facebook messenger pin (a Clack prompt). A credential: never print it" },
  { name: 'accessToken', label: 'Access token', type: 'TEXT', description: 'log-cli: the Facebook access token the vendor delivered. A credential: never print it' },
  { name: 'vendorUserAgent', label: 'Vendor user agent', type: 'TEXT', description: 'log-cli: the browser the vendor used. Reference only: launches use deviceProfile (rule 15)' },
  { name: 'vendor', label: 'Vendor', type: 'TEXT', description: 'log-cli: who sold the account, as named in docs/vendors (e.g. NPPR Team Shop)' },
  { name: 'vendorOrderId', label: 'Vendor order', type: 'TEXT', description: 'log-cli: the vendor order or invoice id' },
  { name: 'vendorListingUrl', label: 'Vendor listing URL', type: 'TEXT', description: 'log-cli: the product page it was bought from' },
  { name: 'purchasedAt', label: 'Purchased', type: 'DATE_TIME', description: 'logCli' },
  { name: 'lastPostedAt', label: 'Last posted', type: 'DATE_TIME', description: 'log-cli: used to pick the least recently used replacement' },
  {
    name: 'deviceProfile',
    label: 'Device profile',
    type: 'RAW_JSON',
    description: 'log-cli: the one Camoufox device this account always launches as (made on its first launch). Never edit or print it'
  },
  { name: 'activeHoursStart', label: 'Active from (local hour)', type: 'NUMBER', description: 'log-cli: local hour runs may start, e.g. 8 or 8.5. Empty: 08:00' },
  { name: 'activeHoursEnd', label: 'Active until (local hour)', type: 'NUMBER', description: 'log-cli: local hour runs stop, e.g. 22. Empty: 22:00' },
  {
    name: 'storageOrigins',
    label: 'Browser storage',
    type: 'RAW_JSON',
    description: "log-cli: the browser's localStorage per origin after the last run (Playwright storage_state origins). A credential: never print it"
  },
  { name: 'profilePhoto', label: 'Profile photo', type: 'TEXT', description: 'log-cli: the profile picture `log facebook profile setup` uploads (a URL or a local path). Real-looking, not a logo (rule 28)' },
  { name: 'coverPhoto', label: 'Cover photo', type: 'TEXT', description: 'log-cli: the cover (background) photo `log facebook profile setup` uploads (a URL or a local path)' },
  { name: 'profileName', label: 'Profile name', type: 'TEXT', description: 'log-cli: the name `log facebook profile setup` gives the profile, e.g. Allentown Trash (rule 28). Facebook reviews name changes and allows about one per 60 days' },
  { name: 'profileSetAt', label: 'Profile set', type: 'DATE_TIME', description: 'log-cli: when `log facebook profile setup --live` last saved the profile and cover photo' },
  { name: 'lifecycleState', label: 'Lifecycle state', type: 'TEXT', description: 'log-cli: where the lifecycle machine has the account, e.g. onboarding.warming or host.watching (rule 35)' },
  { name: 'sessionState', label: 'Session state', type: 'TEXT', description: "log-cli: the login state Facebook's own page gave the saved session on the last direct-API call (fbk's bootstrap: loggedIn, loggedOut, checkpoint, unknown, accountWarning). accountStatus stays the browser lifecycle" },
  { name: 'copyStyle', label: 'Copy style', type: 'TEXT', description: "log-cli: the writing style the account's X copy is checked against before a send (COPY_STYLES in src/twitter/copy/style; empty: house). Set by log twitter cookies save --style or here" },
  { name: 'sessionCheckedAt', label: 'Session checked', type: 'DATE_TIME', description: 'log-cli: when sessionState was last read from Facebook by the direct-API engine' },
  { name: 'profileNamedAt', label: 'Profile named', type: 'DATE_TIME', description: 'log-cli: when the profile was renamed to profileName' },
  { name: 'marketplaceLocationAt', label: 'Marketplace location set', type: 'DATE_TIME', description: "log-cli: when the account's Marketplace location was confirmed in its home city" },
  { name: 'warmupStartedAt', label: 'Warm-up started', type: 'DATE_TIME', description: "log-cli: when the account's day of warm-up began (rule 35)" },
  { name: 'warmedAt', label: 'Warmed', type: 'DATE_TIME', description: 'log-cli: when the warm-up ended and the account was attached to its host (rule 35)' },
  { name: 'adsPowerProfileId', label: 'AdsPower profile', type: 'TEXT', description: "log-cli: the account's AdsPower profile id (`log adsPower sync`). The profile holds no proxy, password or cookies: those stay in Twenty" },
  { name: 'browserDriver', label: 'Browser driver', type: 'TEXT', description: 'log-cli: which browser runs this account: adsPower or camoufox (empty: camoufox, rule 42)' }
]

const AGENCY_LISTING_FIELDS = [
  { name: 'description', label: 'Description', type: 'TEXT', description: 'logCli' },
  { name: 'priceCurrency', label: 'Currency', type: 'TEXT', description: 'log-cli: e.g. EUR' },
  { name: 'category', label: 'Category', type: 'TEXT', description: "log-cli: one of the create form's categories" },
  {
    name: 'condition',
    label: 'Condition',
    type: 'SELECT',
    description: 'logCli',
    options: [
      option('NEW', 'New', 'green', 0),
      option('USED_LIKE_NEW', 'Used like new', 'turquoise', 1),
      option('USED_GOOD', 'Used good', 'blue', 2),
      option('USED_FAIR', 'Used fair', 'gray', 3)
    ]
  },
  { name: 'photos', label: 'Photos', type: 'RAW_JSON', description: 'log-cli: list of photo URLs or paths, 1 to 10, cover first' },
  { name: 'photoHashes', label: 'Photo hashes', type: 'RAW_JSON', description: 'log-cli: sha256 of the varied photos uploaded' },
  { name: 'locationCity', label: 'Location city', type: 'TEXT', description: 'log-cli: e.g. Galway' },
  { name: 'locationCountry', label: 'Location country', type: 'TEXT', description: "log-cli: ISO alpha-2. Must equal the account's homeCountry" },
  {
    name: 'locationPostalCode',
    label: 'Location postal code',
    type: 'TEXT',
    description: "log-cli: e.g. 19601. A --live publish sets the account's Marketplace location to it when the form would list elsewhere (Facebook finds Reading, PA by its zip, not its name)"
  },
  { name: 'listingUrl', label: 'Listing URL', type: 'TEXT', description: 'log-cli: facebook.com/marketplace/item/<listingId>' },
  { name: 'publishedAt', label: 'Published', type: 'DATE_TIME', description: 'logCli' },
  { name: 'lastRunAt', label: 'Last run', type: 'DATE_TIME', description: 'log-cli: every run, dry or live' },
  {
    name: 'lastRunResult',
    label: 'Last run result',
    type: 'SELECT',
    description: 'logCli',
    options: [
      option('DRY_RUN', 'Dry run', 'blue', 0),
      option('PUBLISHED', 'Published', 'green', 1),
      option('UNCONFIRMED', 'Unconfirmed', 'yellow', 2),
      option('BLOCKED', 'Blocked', 'orange', 3),
      option('NEEDS_PERSON', 'Needs person', 'orange', 4),
      option('FAILED', 'Failed', 'red', 5)
    ]
  },
  { name: 'lastErrorCode', label: 'Last error code', type: 'TEXT', description: 'log-cli: error catalog code (log errors --code <code>)' },
  { name: 'replacementReason', label: 'Replacement reason', type: 'TEXT', description: 'log-cli: why this row replaced another' },
  {
    name: 'copyVersions',
    label: 'Copy versions',
    type: 'RAW_JSON',
    description: 'log-cli: the ad\'s versions, each [{ id, title, description }] written by skills/listingCopy; each copy of the ad picks the one least like what is live in its city'
  },
  { name: 'copyVersionId', label: 'Copy version', type: 'TEXT', description: 'log-cli: the version this copy went out with (copyVersions id)' }
]

const CHANNEL = [option('SMS', 'SMS', 'blue', 0), option('FACEBOOK_MARKETPLACE', 'Facebook Marketplace', 'purple', 1)]

const AGENCY_CONVERSATION_FIELDS = [
  { name: 'channel', label: 'Channel', type: 'SELECT', description: 'log-cli: SMS (blaster) or FACEBOOK_MARKETPLACE. Empty on rows written before it: SMS', options: CHANNEL },
  { name: 'facebookThreadId', label: 'Facebook thread id', type: 'TEXT', description: 'log-cli: the thread id in facebook.com/messages/t/<id> (Marketplace inbox). With the account, the conversation key' },
  { name: 'buyerName', label: 'Buyer name', type: 'TEXT', description: 'log-cli: the buyer name as the thread shows it' },
  { name: 'buyerFacebookId', label: 'Buyer Facebook id', type: 'TEXT', description: 'log-cli: the buyer Facebook user id, when the thread links their profile' },
  { name: 'buyerProfileUrl', label: 'Buyer profile URL', type: 'TEXT', description: 'logCli' },
  { name: 'buyerPhone', label: 'Buyer phone', type: 'TEXT', description: 'log-cli: a phone number the buyer gave in the conversation' },
  { name: 'buyerEmail', label: 'Buyer email', type: 'TEXT', description: 'log-cli: an email the buyer gave in the conversation' },
  { name: 'listingTitle', label: 'Listing title', type: 'TEXT', description: 'log-cli: the listing title the thread header shows (Buyer · Title)' },
  { name: 'facebookListingId', label: 'Facebook listing id', type: 'TEXT', description: 'log-cli: the Marketplace item id the thread is about (marketplace/item/<id>), when shown' },
  {
    name: 'leadStatus',
    label: 'Lead status',
    type: 'SELECT',
    description: 'log-cli: where the buyer is (Listaro): NEW until we reply, CONTACTED, QUALIFIED once they give a phone, then BOOKED, LOST or SPAM by hand',
    options: [
      option('NEW', 'New', 'blue', 0),
      option('CONTACTED', 'Contacted', 'turquoise', 1),
      option('QUALIFIED', 'Qualified', 'green', 2),
      option('BOOKED', 'Booked', 'purple', 3),
      option('LOST', 'Lost', 'gray', 4),
      option('SPAM', 'Spam', 'red', 5)
    ]
  },
  { name: 'unreadCount', label: 'Unread', type: 'NUMBER', description: 'log-cli: buyer messages not yet read' },
  { name: 'lastReadAt', label: 'Last read', type: 'DATE_TIME', description: 'logCli' },
  { name: 'respondedAt', label: 'First replied', type: 'DATE_TIME', description: 'log-cli: our first reply in the thread' },
  { name: 'lastScannedAt', label: 'Last scanned', type: 'DATE_TIME', description: 'log-cli: the last time the inbox was read for this thread' },
  { name: 'autoReplied', label: 'Auto replied', type: 'BOOLEAN', description: 'log-cli: a reply went out without a person' },
  { name: 'aiTookOver', label: 'AI took over', type: 'BOOLEAN', description: 'log-cli: replies in this thread are drafted by AI' }
]

const AGENCY_MESSAGE_FIELDS = [
  { name: 'channel', label: 'Channel', type: 'SELECT', description: 'log-cli: SMS (blaster) or FACEBOOK_MARKETPLACE. Empty on rows written before it: SMS', options: CHANNEL },
  { name: 'sentAt', label: 'Sent', type: 'DATE_TIME', description: 'log-cli: when the message was sent, as the thread shows it' },
  { name: 'facebookMessageId', label: 'Facebook message id', type: 'TEXT', description: 'log-cli: the Facebook message id, when the page gives it' },
  { name: 'messageKey', label: 'Message key', type: 'TEXT', description: 'log-cli: unique per conversation: facebookMessageId, or a hash of sender, time and text. A message is stored once' },
  { name: 'senderName', label: 'Sender', type: 'TEXT', description: 'logCli' },
  { name: 'isRead', label: 'Read', type: 'BOOLEAN', description: 'log-cli: ours are read; a buyer message is unread until marked' },
  {
    name: 'sentBy',
    label: 'Sent by',
    type: 'SELECT',
    description: 'log-cli: who wrote an outbound message (Listaro): a person, a VA, AI, or the system',
    options: [option('PERSON', 'Person', 'blue', 0), option('VA', 'VA', 'turquoise', 1), option('AI', 'AI', 'purple', 2), option('SYSTEM', 'System', 'gray', 3)]
  },
  {
    name: 'aiStatus',
    label: 'AI status',
    type: 'SELECT',
    description: 'log-cli: an AI-drafted reply: DRAFT until a person approves, then SENT; or DISMISSED, FAILED',
    options: [
      option('DRAFT', 'Draft', 'gray', 0),
      option('APPROVED', 'Approved', 'blue', 1),
      option('SENT', 'Sent', 'green', 2),
      option('DISMISSED', 'Dismissed', 'gray', 3),
      option('FAILED', 'Failed', 'red', 4)
    ]
  },
  { name: 'aiOriginalText', label: 'AI original text', type: 'TEXT', description: 'log-cli: what AI drafted, before a person edited it' },
  { name: 'media', label: 'Media', type: 'RAW_JSON', description: 'log-cli: photos or files in the message: [{ url, kind }]' }
]

const NEW_OBJECTS = [
  { nameSingular: 'agencyGroup', namePlural: 'agencyGroups', labelSingular: 'Agency group', labelPlural: 'Agency groups', description: 'log-cli: a Facebook group, on one socialAccount', icon: 'IconUsersGroup' },
  { nameSingular: 'agencyGroupPost', namePlural: 'agencyGroupPosts', labelSingular: 'Agency group post', labelPlural: 'Agency group posts', description: 'log-cli: a post in a Facebook group, as log facebook read group read it', icon: 'IconNews' },
  { nameSingular: 'agencyGroupComment', namePlural: 'agencyGroupComments', labelSingular: 'Agency group comment', labelPlural: 'Agency group comments', description: 'log-cli: a comment or reply on a Facebook group post', icon: 'IconMessageCircle' }
]

const AGENCY_GROUP_FIELDS = [
  { name: 'facebookGroupId', label: 'Facebook group id', type: 'TEXT', description: 'log-cli: the id in facebook.com/groups/<id>. With the account, the group key' },
  { name: 'groupUrl', label: 'Group URL', type: 'TEXT', description: 'logCli' },
  {
    name: 'joinStatus',
    label: 'Join status',
    type: 'SELECT',
    description: 'log-cli: NOT_MEMBER (a Join button), REQUESTED (Join pressed, not a member yet), MEMBER (Joined), UNKNOWN (a page not recorded yet)',
    options: [option('NOT_MEMBER', 'Not a member', 'gray', 0), option('REQUESTED', 'Requested', 'orange', 1), option('MEMBER', 'Member', 'green', 2), option('UNKNOWN', 'Unknown', 'red', 3)]
  },
  { name: 'joinStatusReason', label: 'Join status reason', type: 'TEXT', description: 'log-cli: what the page showed, and the run folder it was read in' },
  { name: 'membersLabel', label: 'Members', type: 'TEXT', description: 'log-cli: the member count as the group page shows it (17.3K members)' },
  { name: 'joinRequestedAt', label: 'Join requested at', type: 'DATE_TIME', description: 'log-cli: when log facebook join group --live pressed Join' },
  { name: 'lastCheckedAt', label: 'Last checked at', type: 'DATE_TIME', description: 'log-cli: when a run last read the group page' },
  { name: 'joinSubmission', label: 'Join submission', type: 'RAW_JSON', description: 'log-cli: { formPhase, questions, questionsHash, questionsScrapedAt, draftAnswers, answers, answersComplete, submittedAt, lastActivityAt, history[] }' },
  { name: 'readCursor', label: 'Read cursor', type: 'RAW_JSON', description: 'log-cli: { lastPostId, watermark (unix s), idsAtWatermark[] }: the newest post read. It moves only after the posts are saved' },
  { name: 'lastReadAt', label: 'Last read at', type: 'DATE_TIME', description: 'log-cli: when log facebook read group last read the group' },
  { name: 'lastReadReason', label: 'Last read', type: 'TEXT', description: 'log-cli: what the last read found, and its run folder' }
]

const AGENCY_GROUP_POST_FIELDS = [
  { name: 'facebookPostId', label: 'Facebook post id', type: 'TEXT', description: 'log-cli: post_id. With the group row, the post key' },
  { name: 'facebookGroupId', label: 'Facebook group id', type: 'TEXT', description: 'logCli' },
  { name: 'authorName', label: 'Author', type: 'TEXT', description: 'logCli' },
  { name: 'authorFacebookId', label: 'Author Facebook id', type: 'TEXT', description: 'logCli' },
  { name: 'authorUrl', label: 'Author URL', type: 'TEXT', description: 'logCli' },
  { name: 'text', label: 'Text', type: 'TEXT', description: 'log-cli: message.text; empty for a photo or a share' },
  { name: 'permalink', label: 'Permalink', type: 'TEXT', description: 'logCli' },
  { name: 'feedbackId', label: 'Feedback id', type: 'TEXT', description: 'log-cli: what a comment or reaction on the post is sent to' },
  { name: 'postedAt', label: 'Posted at', type: 'DATE_TIME', description: 'log-cli: creation_time' },
  { name: 'commentCount', label: 'Comments', type: 'NUMBER', description: 'log-cli: the count the feed showed at the last read' },
  { name: 'commentsReadAt', label: 'Comments read at', type: 'DATE_TIME', description: 'log-cli: when its comments were last read' },
  { name: 'commentsReadCount', label: 'Comments at last read', type: 'NUMBER', description: 'log-cli: commentCount when its comments were last read: a read opens the post again only when it grew' }
]

const AGENCY_GROUP_COMMENT_FIELDS = [
  { name: 'facebookCommentId', label: 'Facebook comment id', type: 'TEXT', description: 'log-cli: legacy_fbid. With the post row, the comment key' },
  { name: 'facebookPostId', label: 'Facebook post id', type: 'TEXT', description: 'logCli' },
  { name: 'parentCommentId', label: 'Parent comment id', type: 'TEXT', description: "log-cli: a reply's comment (its Facebook id); empty on a comment" },
  { name: 'depth', label: 'Depth', type: 'NUMBER', description: 'log-cli: 0 a comment, 1 a reply' },
  { name: 'authorName', label: 'Author', type: 'TEXT', description: 'logCli' },
  { name: 'authorFacebookId', label: 'Author Facebook id', type: 'TEXT', description: 'logCli' },
  { name: 'authorUrl', label: 'Author URL', type: 'TEXT', description: 'logCli' },
  { name: 'authorAnonymous', label: 'Anonymous', type: 'BOOLEAN', description: 'log-cli: the group shows the author as an anonymous member' },
  { name: 'text', label: 'Text', type: 'TEXT', description: 'log-cli: body.text; empty for a photo or a sticker' },
  { name: 'permalink', label: 'Permalink', type: 'TEXT', description: 'logCli' },
  { name: 'feedbackId', label: 'Feedback id', type: 'TEXT', description: 'log-cli: what a reply or reaction to the comment is sent to' },
  { name: 'commentedAt', label: 'Commented at', type: 'DATE_TIME', description: 'log-cli: created_time' },
  { name: 'replyCount', label: 'Replies', type: 'NUMBER', description: 'logCli' }
]

const RELATIONS = [
  { object: 'agencyListing', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Listings', icon: 'IconBrandFacebook' },
  { object: 'agencyListing', name: 'campaign', label: 'Campaign', target: 'agencyCampaign', targetFieldLabel: 'Agency Listings', icon: 'IconSpeakerphone' },
  { object: 'agencyListing', name: 'replaces', label: 'Replaces', target: 'agencyListing', targetFieldLabel: 'Replaced by', icon: 'IconReplace' },
  { object: 'agencyConversation', name: 'agencyListing', label: 'Agency listing', target: 'agencyListing', targetFieldLabel: 'Agency Conversations', icon: 'IconMessages' },
  { object: 'agencyConversation', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Conversations', icon: 'IconBrandFacebook' },
  { object: 'agencyMessage', name: 'agencyConversation', label: 'Conversation', target: 'agencyConversation', targetFieldLabel: 'Agency Messages', icon: 'IconMessage' },
  { object: 'agencyGroup', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Groups', icon: 'IconBrandFacebook' },
  { object: 'agencyGroupPost', name: 'agencyGroup', label: 'Group', target: 'agencyGroup', targetFieldLabel: 'Posts', icon: 'IconUsersGroup' },
  { object: 'agencyGroupComment', name: 'agencyGroupPost', label: 'Post', target: 'agencyGroupPost', targetFieldLabel: 'Comments', icon: 'IconNews' }
]

const STATUS_ADDITIONS = [
  option('DRAFT', 'Draft', 'gray', 10),
  option('READY', 'Ready', 'blue', 11),
  option('PUBLISHING', 'Publishing', 'sky', 12),
  option('UNCONFIRMED', 'Unconfirmed', 'yellow', 13),
  option('FAILED', 'Failed', 'red', 14),
  option('BLOCKED', 'Blocked', 'orange', 15),
  option('REMOVED', 'Removed', 'gray', 16),
  option('ACCOUNT_LOST', 'Account lost', 'red', 17),
  option('REPLACED', 'Replaced', 'purple', 18)
]

const env = loadEnv()
const base = env.TWENTY_BASE_URL.replace(/\/rest\/?$/, '').replace(/\/$/, '')

async function gql(query, variables = {}) {
  const res = await fetch(`${base}/metadata`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TWENTY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors.map((e) => e.message + ' ' + JSON.stringify(e.extensions ?? {}).slice(0, 600)).join('; '))
  return json.data
}

async function loadObjects() {
  const data = await gql(`query { objects(paging: { first: 200 }) { edges { node { id nameSingular
    fields(paging: { first: 300 }) { edges { node { id name type options } } } } } } }`)
  const map = new Map()
  for (const { node } of data.objects.edges) {
    map.set(node.nameSingular, { id: node.id, fields: new Map(node.fields.edges.map(({ node: f }) => [f.name, f])) })
  }
  return map
}

const CREATE_OBJECT = `mutation ($input: CreateOneObjectInput!) { createOneObject(input: $input) { id nameSingular } }`
const CREATE_FIELD = `mutation ($input: CreateOneFieldMetadataInput!) { createOneField(input: $input) { id name } }`
const UPDATE_FIELD = `mutation ($input: UpdateOneFieldMetadataInput!) { updateOneField(input: $input) { id name options } }`

const apply = process.argv.includes('--apply')
let objects = await loadObjects()
const newObjects = NEW_OBJECTS.filter((o) => !objects.has(o.nameSingular))
for (const o of newObjects) console.log(`${apply ? 'create' : 'missing'}  object ${o.nameSingular} (${o.namePlural})`)
if (newObjects.length && !apply) {
  console.log('\nRun with --apply to create them, then their fields and relations.')
  process.exit(0)
}
for (const o of newObjects) {
  await gql(CREATE_OBJECT, { input: { object: { ...o, isLabelSyncedWithName: false } } })
  console.log(`ok      object ${o.nameSingular}`)
}
if (newObjects.length) objects = await loadObjects()
for (const name of ['socialAccount', 'agencyListing', 'agencyCampaign', 'agencyConversation', 'agencyMessage', 'agencyGroup', 'agencyGroupPost', 'agencyGroupComment']) {
  if (!objects.has(name)) throw new Error(`object ${name} not found in Twenty`)
}

const plan = []
for (const [objectName, specs] of [
  ['socialAccount', SOCIAL_ACCOUNT_FIELDS],
  ['agencyListing', AGENCY_LISTING_FIELDS],
  ['agencyConversation', AGENCY_CONVERSATION_FIELDS],
  ['agencyMessage', AGENCY_MESSAGE_FIELDS],
  ['agencyGroup', AGENCY_GROUP_FIELDS],
  ['agencyGroupPost', AGENCY_GROUP_POST_FIELDS],
  ['agencyGroupComment', AGENCY_GROUP_COMMENT_FIELDS]
]) {
  const object = objects.get(objectName)
  for (const spec of specs) {
    if (object.fields.has(spec.name)) continue
    plan.push({
      what: `${objectName}.${spec.name} ${spec.type}`,
      run: () => gql(CREATE_FIELD, { input: { field: { objectMetadataId: object.id, isNullable: true, ...spec } } })
    })
  }
}
for (const rel of RELATIONS) {
  const object = objects.get(rel.object)
  if (object.fields.has(rel.name)) continue
  plan.push({
    what: `${rel.object}.${rel.name} RELATION many to one → ${rel.target} (inverse "${rel.targetFieldLabel}")`,
    run: () =>
      gql(CREATE_FIELD, {
        input: {
          field: {
            objectMetadataId: object.id,
            type: 'RELATION',
            name: rel.name,
            label: rel.label,
            icon: rel.icon,
            isNullable: true,
            description: 'logCli',
            relationCreationPayload: {
              targetObjectMetadataId: objects.get(rel.target).id,
              targetFieldLabel: rel.targetFieldLabel,
              targetFieldIcon: rel.icon,
              type: 'MANY_TO_ONE'
            }
          }
        }
      })
  })
}
const status = objects.get('agencyListing').fields.get('status')
const existing = Array.isArray(status?.options) ? status.options : []
const missing = STATUS_ADDITIONS.filter((add) => !existing.some((o) => o.value === add.value))
if (missing.length) {
  plan.push({
    what: `agencyListing.status + ${missing.map((o) => o.value).join(', ')} (keeps ${existing.length} existing options and their ids)`,
    run: () => gql(UPDATE_FIELD, { input: { id: status.id, update: { options: [...existing, ...missing] } } })
  })
}

const accountStatus = objects.get('socialAccount').fields.get('accountStatus')
const accountStatusSpec = SOCIAL_ACCOUNT_FIELDS.find((f) => f.name === 'accountStatus')
const accountExisting = Array.isArray(accountStatus?.options) ? accountStatus.options : []
const accountMissing = accountStatus ? accountStatusSpec.options.filter((add) => !accountExisting.some((o) => o.value === add.value)) : []
if (accountMissing.length) {
  plan.push({
    what: `socialAccount.accountStatus + ${accountMissing.map((o) => o.value).join(', ')} (keeps ${accountExisting.length} existing options and their ids)`,
    run: () => gql(UPDATE_FIELD, { input: { id: accountStatus.id, update: { options: [...accountExisting, ...accountMissing.map((o, i) => ({ ...o, position: accountExisting.length + i }))] } } })
  })
}

const PLATFORM_ADDITIONS = [option('DISCORD', 'Discord', 'purple', 0), option('LINKEDIN', 'LinkedIn', 'blue', 0)]
const accountPlatform = objects.get('socialAccount').fields.get('platform')
const platformExisting = Array.isArray(accountPlatform?.options) ? accountPlatform.options : []
const platformMissing = accountPlatform ? PLATFORM_ADDITIONS.filter((add) => !platformExisting.some((o) => o.value === add.value)) : []
if (platformMissing.length) {
  plan.push({
    what: `socialAccount.platform + ${platformMissing.map((o) => o.value).join(', ')} (keeps ${platformExisting.length} existing options and their ids)`,
    run: () => gql(UPDATE_FIELD, { input: { id: accountPlatform.id, update: { options: [...platformExisting, ...platformMissing.map((o, i) => ({ ...o, position: platformExisting.length + i }))] } } })
  })
}

if (!plan.length) {
  console.log('Twenty already has everything log-cli needs.')
  process.exit(0)
}
for (const step of plan) console.log(`${apply ? 'create' : 'missing'}  ${step.what}`)
if (!apply) {
  console.log('\nRun with --apply to create them.')
  process.exit(0)
}
let failed = 0
for (const step of plan) {
  try {
    await step.run()
    console.log(`ok      ${step.what}`)
  } catch (error) {
    failed++
    console.log(`FAILED  ${step.what}: ${error.message}`)
  }
}
process.exit(failed ? 1 : 0)
