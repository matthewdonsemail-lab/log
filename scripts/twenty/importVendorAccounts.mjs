// Imports every vendor order in docs/vendors/*.txt into Twenty's socialAccounts.
// Each line: <c_user id>|<password>|<cookies json>|<access token>|<2FA secret>|<email>|<user agent>[|<homeCity>|<homeCountry>]
// Every field goes into Twenty (password, totpSecret, accessToken,
// vendorUserAgent, email, cookies) and nothing is printed: the plan shows
// each field as <set> or <empty>. Re-running refreshes the credentials and
// never touches the proxy, home, device or status log-cli has set since.
//
//   node scripts/twenty/importVendorAccounts.mjs           dry run, print the plan
//   node scripts/twenty/importVendorAccounts.mjs --apply   create or update the records
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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

// Every vendor order in docs/vendors (git-ignored *.txt). One account per line:
//   <c_user>|<password>|<cookies json>|<access token>|<2FA secret>|<email>|<user agent>[|<homeCity>|<homeCountry>]
const VENDORS = join(root, 'docs/vendors')
const FIELDS = ['cUser', 'password', 'cookies', 'accessToken', 'totpSecret', 'email', 'userAgent', 'homeCity', 'homeCountry']
const files = readdirSync(VENDORS).filter((f) => f.endsWith('.txt')).sort()
if (files.length === 0) {
  console.log('No docs/vendors/*.txt order files.')
  process.exit(0)
}

const accounts = []
for (const file of files) {
  const orderId = /order_(\w+)\.txt$/.exec(file)?.[1] ?? file.replace(/\.txt$/, '')
  const lines = readFileSync(join(VENDORS, file), 'utf8').replace(/^﻿/, '').split(/\r?\n/)
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue
    const parts = line.split('|')
    const value = Object.fromEntries(FIELDS.map((name, i) => [name, parts[i]?.trim() || null]))
    const where = `${file}:${index + 1}`
    if (!/^\d{5,}$/.test(value.cUser ?? '')) throw new Error(`${where}: field 1 is not a c_user id`)
    let cookies = null
    try {
      cookies = value.cookies ? JSON.parse(value.cookies) : null
    } catch {
      throw new Error(`${where}: field 3 is not cookie JSON`)
    }
    // Authenticator apps show base32 with spaces; TOTP needs it bare and upper case.
    const totpSecret = value.totpSecret ? value.totpSecret.replace(/\s+/g, '').toUpperCase() : null
    if (totpSecret && !/^[A-Z2-7]+=*$/.test(totpSecret)) throw new Error(`${where}: field 5 is not a base32 2FA secret`)
    accounts.push({ ...value, cookies, totpSecret, orderId, where })
  }
}

// Fallback when a line has no location fields: US, one Pennsylvania city
// per account (cities are in marketplace/home/types.ts so a launch can pin
// their timezone and coordinates).
const PA_CITIES = ['philadelphia', 'pittsburgh', 'allentown', 'erie', 'harrisburg', 'lancaster', 'reading', 'scranton', 'bethlehem', 'wilkes-barre']
const LOCATION = (index) => ({ homeCity: PA_CITIES[index % PA_CITIES.length], homeCountry: 'US' })

const existing = await api('/socialAccounts?limit=200&where[platform][eq]=FACEBOOK')
const rows = existing.data?.socialAccounts ?? existing.socialAccounts ?? []
const byName = new Map(rows.map((r) => [r.accountName, r]))

/** `password=<set>, totpSecret=<empty>…`: what a write holds, never the values. */
const shape = (record) =>
  Object.entries(record)
    .map(([key, v]) => `${key}=${v === null || v === undefined || v === '' ? '<empty>' : '<set>'}`)
    .join(', ')

const plan = []
for (const [index, account] of accounts.entries()) {
  // Credentials and vendor facts: always refreshed from the order.
  const credentials = {
    name: account.cUser,
    profileUrl: `https://www.facebook.com/${account.cUser}`,
    email: account.email,
    password: account.password,
    totpSecret: account.totpSecret,
    accessToken: account.accessToken,
    vendorUserAgent: account.userAgent,
    vendor: `vendorOrder${account.orderId}`,
    vendorOrderId: account.orderId
  }
  const row = byName.get(account.cUser)
  if (row) {
    // Never touch what log-cli set since: proxy, home, device, status. The
    // vendor cookies only go back while the account has never signed in here.
    const update = { ...credentials }
    if (row.accountStatus === 'NEEDS_LOGIN' && account.cookies) update.cookies = account.cookies
    if (!row.homeCountry && (account.homeCountry || !account.homeCity)) Object.assign(update, account.homeCountry ? { homeCity: account.homeCity, homeCountry: account.homeCountry } : LOCATION(index))
    plan.push({ what: `update ${account.cUser} (${account.where}): ${shape(update)}`, run: () => api(`/socialAccounts/${row.id}`, { method: 'PATCH', body: update }) })
  } else {
    const loc = account.homeCountry ? { homeCity: account.homeCity, homeCountry: account.homeCountry } : LOCATION(index)
    const record = {
      platform: 'FACEBOOK',
      accountName: account.cUser,
      ...credentials,
      cookies: account.cookies,
      ...loc,
      accountStatus: 'NEEDS_LOGIN',
      statusReason: 'importedFromVendor',
      statusChangedAt: new Date().toISOString(),
      purchasedAt: new Date().toISOString()
    }
    plan.push({ what: `create ${account.cUser} (${account.where}): ${shape(record)}`, run: () => api('/socialAccounts', { method: 'POST', body: record }) })
  }
}

for (const step of plan) console.log(`${APPLY ? 'write' : 'plan'}  ${step.what}`)
if (!APPLY) {
  console.log(`\n${accounts.length} accounts from ${files.length} order file(s). Run with --apply to write them into Twenty.`)
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
