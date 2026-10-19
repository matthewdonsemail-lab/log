// Adds what log-cli needs to Twenty: new fields on socialAccount and
// agencyListing, the relations between them, and the lifecycle values on
// agencyListing.status. Additive only. It never renames, retypes or deletes a
// field, and existing SELECT options keep their ids, so the twitter-controller
// and the facebook-camofox-client sync keep working.
//
//   node scripts/twentySetup.mjs           print the plan and what's missing
//   node scripts/twentySetup.mjs --apply   create what's missing (idempotent)
//
// Reads TWENTY_BASE_URL and TWENTY_API_KEY from the env or .env.local.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

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
  }
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

/** Relations: [object, field, label, target object, inverse label, join column]. */
const RELATIONS = [
  { object: 'agencyListing', name: 'socialAccount', label: 'Social account', target: 'socialAccount', targetFieldLabel: 'Agency Listings', icon: 'IconBrandFacebook' },
  { object: 'agencyListing', name: 'campaign', label: 'Campaign', target: 'agencyCampaign', targetFieldLabel: 'Agency Listings', icon: 'IconSpeakerphone' },
  { object: 'agencyListing', name: 'replaces', label: 'Replaces', target: 'agencyListing', targetFieldLabel: 'Replaced by', icon: 'IconReplace' }
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

const CREATE_FIELD = `mutation ($input: CreateOneFieldMetadataInput!) { createOneField(input: $input) { id name } }`
const UPDATE_FIELD = `mutation ($input: UpdateOneFieldMetadataInput!) { updateOneField(input: $input) { id name options } }`

const apply = process.argv.includes('--apply')
const objects = await loadObjects()
for (const name of ['socialAccount', 'agencyListing', 'agencyCampaign']) {
  if (!objects.has(name)) throw new Error(`object ${name} not found in Twenty`)
}

const plan = []
for (const [objectName, specs] of [['socialAccount', SOCIAL_ACCOUNT_FIELDS], ['agencyListing', AGENCY_LISTING_FIELDS]]) {
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
