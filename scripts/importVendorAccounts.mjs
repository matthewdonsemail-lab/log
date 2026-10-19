// Imports docs/vendors/order_33923855504144.txt into Twenty's socialAccounts.
// Each line: <c_user id>|<label>|<cookies json>|<access token>|<2FA token>|<email>|<user agent>
// Credentials (cookies, tokens, email) go straight into Twenty and are never
// printed: this script only logs ids and counts.
//
//   node scripts/importVendorAccounts.mjs           dry run, print the plan
//   node scripts/importVendorAccounts.mjs --apply   create or update the records
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

const env = loadEnv()
const base = env.TWENTY_BASE_URL.replace(/\/rest\/?$/, '').replace(/\/$/, '')
const APPLY = process.argv.includes('--apply')

async function api(path, options = {}) {
  const res = await fetch(`${base}/rest${path}`, {
    method: options.method ?? 'GET',
    headers: { Authorization: `Bearer ${env.TWENTY_API_KEY}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {}
  if (!res.ok) throw new Error(`Twenty ${options.method ?? 'GET'} ${path} failed ${res.status}`)
  return json
}

const text = readFileSync(join(root, 'docs/vendors/order_33923855504144.txt'), 'utf8')
const accounts = []
for (const line of text.split(/\r?\n/)) {
  if (!line.trim()) continue
  const fields = line.split('|')
  if (fields.length < 4) throw new Error(`malformed line ${line.slice(0, 12)}...`)
  const [cUser, label, cookiesRaw, accessToken, twofaToken, email, userAgent, homeCity, homeCountry] = fields
  accounts.push({ cUser, label: label?.trim() || cUser, cookies: JSON.parse(cookiesRaw), accessToken, twofaToken, email, userAgent, homeCity: homeCity?.trim() || null, homeCountry: homeCountry?.trim() || null })
}

// Fallback when the .txt has no location fields: US, one Pennsylvania city
// per account (cities are in marketplace/home/types.ts so a launch can pin
// their timezone and coordinates).
const PA_CITIES = ['philadelphia', 'pittsburgh', 'allentown', 'erie', 'harrisburg', 'lancaster', 'reading', 'scranton', 'bethlehem', 'wilkes-barre']
const LOCATION = (index) => ({ homeCity: PA_CITIES[index % PA_CITIES.length], homeCountry: 'US' })

const existing = await api('/socialAccounts?limit=200&where[platform][eq]=FACEBOOK')
const rows = existing.data?.socialAccounts ?? existing.socialAccounts ?? []
const byName = new Map(rows.map((r) => [r.accountName, r]))
const byId = new Map(rows.map((r) => [r.id, r]))

const plan = []
for (const [index, account] of accounts.entries()) {
  const loc = account.homeCity || account.homeCountry ? { homeCity: account.homeCity, homeCountry: account.homeCountry } : LOCATION(index)
  const record = {
    platform: 'FACEBOOK',
    accountName: account.cUser,
    name: account.label,
    profileUrl: `https://www.facebook.com/${account.cUser}`,
    cookies: account.cookies,
    email: account.email,
    homeCity: loc.homeCity,
    homeCountry: loc.homeCountry,
    accountStatus: 'NEEDS_LOGIN',
    statusReason: 'importedFromVendor',
    statusChangedAt: new Date().toISOString(),
    vendor: 'vendorOrder33923855504144',
    vendorOrderId: '33923855504144',
    purchasedAt: '2026-10-19T00:00:00.000Z'
  }
  // The access token and the 2FA token are credentials: they live in Twenty
  // only (cookies carry the session), and never in any file or output.
  const existingRow = byName.get(account.cUser) ?? byId.get(account.cUser)
  if (existingRow) {
    plan.push({
      what: `update ${account.cUser} (${existingRow.id?.slice(0, 8)}) with cookies + ${loc.homeCity}, ${loc.homeCountry}`,
      run: () => api(`/socialAccounts/${existingRow.id}`, { method: 'PATCH', body: record })
    })
  } else {
    plan.push({
      what: `create ${account.cUser} in socialAccounts, homeCity ${loc.homeCity} (${loc.homeCountry})`,
      run: async () => {
        const created = await api('/socialAccounts', { method: 'POST', body: record })
        byId.set(created.id, created)
      }
    })
  }
}

for (const step of plan) console.log(`${APPLY ? 'write' : 'plan'}  ${step.what}`)
if (!APPLY) {
  console.log(`\n${accounts.length} accounts (US, Pennsylvania cities). Run with --apply to write them into Twenty.`)
  process.exit(0)
}
let failed = 0
for (const step of plan) {
  try {
    await step.run()
  } catch (error) {
    failed++
    console.log(`FAILED ${step.what}: ${error.message}`)
  }
}
console.log(failed ? `${failed} of ${plan.length} failed` : `done: ${plan.length} socialAccounts written`)
process.exit(failed ? 1 : 0)
