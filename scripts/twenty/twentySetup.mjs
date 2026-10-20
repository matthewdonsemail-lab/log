// Adds what log-cli needs to Twenty: new fields on socialAccount and
// agencyListing, the relations between them, the lifecycle values on
// agencyListing.status, and the Marketplace side of agencyConversation and
// agencyMessage (rule 34: a buyer's conversation about a listing), and the
// agencyGroup object with its relation to socialAccount. Additive only. It never renames, retypes or deletes a
// field, and existing SELECT options keep their ids, so the twitter-controller
// and the facebook-camofox-client sync keep working.
//
//   node scripts/twenty/twentySetup.mjs           print the plan and what's missing
//   node scripts/twenty/twentySetup.mjs --apply   create what's missing (idempotent)
//
// Reads TWENTY_BASE_URL and TWENTY_API_KEY from the env or .env.local.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function loadEnv() {
  const env = { ...process.env }
  const file = join(root, '.env.local')
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = /^(TWENTY_BASE_URL|TWENTY_API_KEY)=(.*)$/.exec(line)
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"|"$/g, '')
    }
  }
  if (!env.TWENTY_BASE_URL || !env.TWENTY_API_KEY) throw new Error('TWENTY_BASE_URL and TWENTY_API_KEY are required')
  return env
}

const option = (value, label, color, position) => ({ value, label, color, position })

/** Fields added to socialAccount. All nullable: other platforms never set them. */
const SOCIAL_ACCOUNT_FIELDS = [
  { name: 'homeCity', label: 'Home city', type: 'TEXT', description: 'log-cli: where the account lives, e.g. Galway' },
  { name: 'homeCountry', label: 'Home country', type: 'TEXT', description: 'log-cli: ISO 3166 alpha-2 (IE). The proxy exit and every listing must be in this country' },
  {
    name: 'accountStatus',
    label: 'Account status',
    type: 'SELECT',
    description: 'log-cli: usable are ACTIVE and WARMING. BANNED and DEAD are terminal and never cleared. Rows are never deleted',
    options: [
      option('ACTIVE', 'Active', 'green', 0),
      option('WARMING', 'Warming', 'turquoise', 1),
      option('LIMITED', 'Limited', 'yellow', 2),
      option('PAUSED', 'Paused', 'gray', 3),
      option('NEEDS_LOGIN', 'Needs login', 'orange', 4),
      option('CHECKPOINT', 'Checkpoint', 'orange', 5),
      option('RESTRICTED', 'Restricted', 'red', 6),
      option('BANNED', 'Banned', 'red', 7),
      option('DEAD', 'Dead', 'gray', 8)
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
  { name: 'profilePhoto', label: 'Profile photo', type: 'TEXT', description: 'log-cli: the profile picture `log profile setup` uploads (a URL or a local path). Real-looking, not a logo (rule 28)' },
  { name: 'coverPhoto', label: 'Cover photo', type: 'TEXT', description: 'log-cli: the cover (background) photo `log profile setup` uploads (a URL or a local path)' },
  { name: 'profileName', label: 'Profile name', type: 'TEXT', description: 'log-cli: the name `log profile setup` gives the profile, e.g. Allentown Trash (rule 28). Facebook reviews name changes and allows about one per 60 days' },
  { name: 'profileSetAt', label: 'Profile set', type: 'DATE_TIME', description: 'log-cli: when `log profile setup --live` last saved the profile and cover photo' },
  // rule 35: the account lifecycle (src/marketplace/lifecycle).
  { name: 'lifecycleState', label: 'Lifecycle state', type: 'TEXT', description: 'log-cli: where the lifecycle machine has the account, e.g. onboarding.warming or host.watching (rule 35)' },
  { name: 'profileNamedAt', label: 'Profile named', type: 'DATE_TIME', description: 'log-cli: when the profile was renamed to profileName' },
  { name: 'marketplaceLocationAt', label: 'Marketplace location set', type: 'DATE_TIME', description: "log-cli: when the account's Marketplace location was confirmed in its home city" },
  { name: 'warmupStartedAt', label: 'Warm-up started', type: 'DATE_TIME', description: "log-cli: when the account's day of warm-up began (rule 35)" },
  { name: 'warmedAt', label: 'Warmed', type: 'DATE_TIME', description: 'log-cli: when the warm-up ended and the account was attached to its host (rule 35)' },
  // rule 42: the browser is a driver (src/browser/driver); AdsPower profiles are linked here (src/adsPower/profile).
  { name: 'adsPowerProfileId', label: 'AdsPower profile', type: 'TEXT', description: "log-cli: the account's AdsPower profile id (`log adsPower sync`). The profile holds no proxy, password or cookies: those stay in Twenty" },
  { name: 'browserDriver', label: 'Browser driver', type: 'TEXT', description: 'log-cli: which browser runs this account: adsPower or camoufox (empty: camoufox, rule 42)' }
]

/** Fields added to agencyListing. The sync fields it already has stay as they are. */
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
  { name: 'replacementReason', label: 'Replacement reason', type: 'TEXT', description: 'log-cli: why this row replaced another' }
]

const CHANNEL = [option('SMS', 'SMS', 'blue', 0), option('FACEBOOK_MARKETPLACE', 'Facebook Marketplace', 'purple', 1)]

/**
 * Fields added to agencyConversation (rule 34). The object is blaster's SMS
 * thread record (peerPhone, blasterNumber, pairKey, latest*, messageCount,
 * status); those fields stay as they are and Marketplace rows reuse the
 * generic ones: pairKey = facebookMarketplace:<socialAccountId>:<facebookThreadId>,
 * latestDirection inbound|outbound, latestPreview, latestMessageAt,
 * latestMessageId, messageCount. Listaro's thread shape (its leads table),
 * keyed on Facebook's own ids instead of a hash of the buyer's name.
 */
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

/**
 * Fields added to agencyMessage (rule 34). blaster's direction, status, body,
 * errorCode and errorMessage are reused: direction inbound|outbound, status
 * received|queued|sent|delivered|failed (blaster's order: it only moves up).
 */
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

/** Objects log-cli creates when they're missing. The rest are blaster's and the sync's. */
const NEW_OBJECTS = [
  { nameSingular: 'agencyGroup', namePlural: 'agencyGroups', labelSingular: 'Agency group', labelPlural: 'Agency groups', description: 'log-cli: a Facebook group, on one socialAccount', icon: 'IconUsersGroup' }
]

/** Fields added to agencyGroup. Its name is Twenty's own name field. */
const AGENCY_GROUP_FIELDS = [
  { name: 'facebookGroupId', label: 'Facebook group id', type: 'TEXT', description: 'log-cli: the id in facebook.com/groups/<id>. With the account, the group key' },
  { name: 'groupUrl', label: 'Group URL', type: 'TEXT', description: 'logCli' },
  // rule 45: where the account stands with the group, as `log join group` last read it on the group page.
  {
    name: 'joinStatus',
    label: 'Join status',
    type: 'SELECT',
    description: 'log-cli: NOT_MEMBER (a Join button), REQUESTED (Join pressed, not a member yet), MEMBER (Joined), UNKNOWN (a page not recorded yet)',
    options: [option('NOT_MEMBER', 'Not a member', 'gray', 0), option('REQUESTED', 'Requested', 'orange', 1), option('MEMBER', 'Member', 'green', 2), option('UNKNOWN', 'Unknown', 'red', 3)]
  },
  { name: 'joinStatusReason', label: 'Join status reason', type: 'TEXT', description: 'log-cli: what the page showed, and the run folder it was read in' },
  { name: 'membersLabel', label: 'Members', type: 'TEXT', description: 'log-cli: the member count as the group page shows it (17.3K members)' },
  { name: 'joinRequestedAt', label: 'Join requested at', type: 'DATE_TIME', description: 'log-cli: when log join group --live pressed Join' },
  { name: 'lastCheckedAt', label: 'Last checked at', type: 'DATE_TIME', description: 'log-cli: when a run last read the group page' },
  // The hackathon's join submission (listeningkit-hackathon communities/types.ts StoredCommunityJoin and the
  // reportCommunityForm webhook), as one JSON patched after every step of a run and read back by `log join group`.
  { name: 'joinSubmission', label: 'Join submission', type: 'RAW_JSON', description: 'log-cli: { formPhase, questions, questionsHash, questionsScrapedAt, draftAnswers, answers, answersComplete, submittedAt, lastActivityAt, history[] }' }
]

/** Relations: [object, field, label, target object, inverse label, join column]. */
const RELATIONS = [
  { object: 'agencyListing', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Listings', icon: 'IconBrandFacebook' },
  { object: 'agencyListing', name: 'campaign', label: 'Campaign', target: 'agencyCampaign', targetFieldLabel: 'Agency Listings', icon: 'IconSpeakerphone' },
  { object: 'agencyListing', name: 'replaces', label: 'Replaces', target: 'agencyListing', targetFieldLabel: 'Replaced by', icon: 'IconReplace' },
  // rule 34: a buyer's conversation is about one listing, on one account; its messages belong to it.
  { object: 'agencyConversation', name: 'agencyListing', label: 'Agency listing', target: 'agencyListing', targetFieldLabel: 'Agency Conversations', icon: 'IconMessages' },
  { object: 'agencyConversation', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Conversations', icon: 'IconBrandFacebook' },
  { object: 'agencyMessage', name: 'agencyConversation', label: 'Conversation', target: 'agencyConversation', targetFieldLabel: 'Agency Messages', icon: 'IconMessage' },
  // A group row is one group on one account: the same group on two accounts is two rows.
  { object: 'agencyGroup', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Groups', icon: 'IconBrandFacebook' }
]

/** Lifecycle values added to agencyListing.status, next to the sync's health values. */
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
for (const name of ['socialAccount', 'agencyListing', 'agencyCampaign', 'agencyConversation', 'agencyMessage', 'agencyGroup']) {
  if (!objects.has(name)) throw new Error(`object ${name} not found in Twenty`)
}

const plan = []
for (const [objectName, specs] of [
  ['socialAccount', SOCIAL_ACCOUNT_FIELDS],
  ['agencyListing', AGENCY_LISTING_FIELDS],
  ['agencyConversation', AGENCY_CONVERSATION_FIELDS],
  ['agencyMessage', AGENCY_MESSAGE_FIELDS],
  ['agencyGroup', AGENCY_GROUP_FIELDS]
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
