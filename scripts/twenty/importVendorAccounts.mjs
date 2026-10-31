import { existsSync, readdirSync, readFileSync } from 'node:fs'
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
    const totpSecret = value.totpSecret ? value.totpSecret.replace(/\s+/g, '').toUpperCase() : null
    if (totpSecret && !/^[A-Z2-7]+=*$/.test(totpSecret)) throw new Error(`${where}: field 5 is not a base32 2FA secret`)
    accounts.push({ ...value, cookies, totpSecret, orderId, where })
  }
}

const PA_CITIES = ['philadelphia', 'pittsburgh', 'allentown', 'erie', 'harrisburg', 'lancaster', 'reading', 'scranton', 'bethlehem', 'wilkes-barre']
const LOCATION = (index) => ({ homeCity: PA_CITIES[index % PA_CITIES.length], homeCountry: 'US' })

const existing = await api('/socialAccounts?limit=200&where[platform][eq]=FACEBOOK')
const rows = existing.data?.socialAccounts ?? existing.socialAccounts ?? []
const byName = new Map(rows.map((r) => [r.accountName, r]))

const shape = (record) =>
  Object.entries(record)
    .map(([key, v]) => `${key}=${v === null || v === undefined || v === '' ? '<empty>' : '<set>'}`)
    .join(', ')

const plan = []
for (const [index, account] of accounts.entries()) {
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
