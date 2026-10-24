#!/usr/bin/env bun
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { assignPersonas, backgroundOf, drawPersonas, nextBackground, imageOf, liveDeps, makeProfilePicture, personasDir, personasFile, readPersonas, recheckPicture, refreshPrompt, rejectPicture, writePersonas } from '../../src/media/persona/index'
import type { PersonaRecord, PictureFacet } from '../../src/media/persona/index'
import { readDatasets } from '../../src/warmup/persona/index'
import { listFacebookAccounts, saveProfilePhoto } from '../../src/marketplace/socialAccount/index'
import { createTwentyClient } from '../../src/twenty/graphql/client'
import { personaPath, seedOf } from '../../src/cli/warmup/helpers/personaRun'

const { values } = parseArgs({
  options: {
    count: { type: 'string', default: '5' },
    country: { type: 'string', default: 'US' },
    examples: { type: 'string', default: join(homedir(), '.logCli', 'personaExamples') },
    redo: { type: 'string' },
    recheck: { type: 'boolean', default: false },
    approve: { type: 'string' },
    styleFrom: { type: 'string' },
    accounts: { type: 'boolean', default: false },
    accountsRedo: { type: 'boolean', default: false },
    reason: { type: 'string', default: 'matt said it is bad' }
  }
})
const log = (line: string) => console.error(`${new Date().toISOString().slice(11, 19)} ${line}`)
const ALWAYS_FIX: PictureFacet[] = ['selfieStyle', 'noText', 'armHidden', 'lowAngle', 'unflattering', 'backgroundDistinct', 'likeReference', 'noStonewashedHoodie', 'clothingFits']
const saved = existsSync(personasFile()) ? readPersonas() : []

if (values.styleFrom) {
  const record = saved.find((r) => r.personaId === values.styleFrom)
  if (!record?.profilePicture) throw new Error(`no picture for persona ${values.styleFrom} in ${personasFile()}`)
  for (const r of saved) delete r.styleReference
  record.styleReference = true
  log(`${record.personaId} is the style reference SubQ judges every picture against`)
  writePersonas(saved)
  process.exit(0)
}

if (values.approve) {
  for (const id of values.approve.split(',')) {
    const record = saved.find((r) => r.personaId === id.trim())
    if (!record?.profilePicture) throw new Error(`no picture for persona ${id} in ${personasFile()}`)
    record.approved = { at: new Date().toISOString(), by: 'matt' }
    log(`approved ${record.personaId}: locked, never regenerated`)
  }
  writePersonas(saved)
  process.exit(0)
}

const mattExamples = existsSync(values.examples) ? readdirSync(values.examples).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).slice(0, 2).map((f) => join(values.examples, f)) : []
const referenceRecord = saved.find((r) => r.styleReference && r.profilePicture) ?? null
log(`style examples for SubQ: ${mattExamples.length} of matt's${referenceRecord ? `, ${referenceRecord.personaId} as the best one` : ''}`)
let records: PersonaRecord[] = saved
let todo: PersonaRecord[]
const othersOf = (record: PersonaRecord) => {
  const withPicture = records.filter((r) => r !== record && r.profilePicture && existsSync(join(personasDir(), r.profilePicture)))
  const near = record.account ? withPicture.filter((r) => r.account?.homeCountry === record.account!.homeCountry).slice(-3) : withPicture
  return near.map((r) => imageOf(join(personasDir(), r.profilePicture!)))
}
const deps = { ...liveDeps({ examples: mattExamples.map(imageOf), reference: referenceRecord ? imageOf(join(personasDir(), referenceRecord.profilePicture!)) : null, others: othersOf, log }), usedBackgrounds: (record: PersonaRecord) => records.filter((r) => r !== record).map((r) => r.characteristics.background).filter((b): b is string => Boolean(b)) }

async function linkInTwenty(twenty: ReturnType<typeof createTwentyClient>, accountId: string, record: PersonaRecord) {
  if (!record.matched || !record.profilePicture) {
    log(`${record.account!.homeCity}: no picture passed every check, so socialAccounts.profilePhoto is left as it is`)
    return
  }
  const source = join(personasDir(), record.profilePicture).replace(/\\/g, '/')
  await saveProfilePhoto(twenty, accountId, source)
  log(`${record.account!.homeCity}: socialAccounts.profilePhoto set to ${source}`)
}

async function regenerate(record: PersonaRecord, fixes: PictureFacet[]) {
  if (!record.characteristics.background) {
    const used = new Set(records.filter((r) => r !== record).map((r) => r.characteristics.background).filter((b): b is string => Boolean(b)))
    record.characteristics.background = backgroundOf(record.characteristics, record.seed, used)
  }
  refreshPrompt(record)
  log(`regenerating ${record.personaId} with fixes for ${fixes.join(', ')}`)
  await makeProfilePicture(record, deps, undefined, fixes)
  writePersonas(records)
}

if (values.accounts) {
  const twenty = createTwentyClient()
  const all = await listFacebookAccounts(twenty)
  const wanted = all.filter((a) => a.status === 'needsLogin' && !a.profilePhoto && a.homeCity && a.homeCountry && !records.some((r) => r.account?.accountName === a.accountName))
  log(`accounts with no persona yet: ${wanted.length} (${wanted.map((a) => `${a.homeCity} ${a.homeCountry}`).join(', ')})`)
  const assigned = assignPersonas(readDatasets(), wanted.map((a) => ({ accountName: a.accountName, homeCity: a.homeCity!, homeCountry: a.homeCountry! })), seedOf, records)
  for (const { record, profile } of assigned) {
    const warmup = personaPath(record.account!.accountName)
    if (!existsSync(warmup)) {
      mkdirSync(join(warmup, '..'), { recursive: true })
      writeFileSync(warmup, `${JSON.stringify(profile, null, 2)}\n`)
    }
    log(`persona ${record.personaId} for ${record.account!.homeCity} (${record.account!.accountName}): ${record.characteristics.age} ${record.characteristics.gender} ${record.characteristics.profession ?? record.characteristics.occupation}, ${record.characteristics.background}`)
    records.push(record)
  }
  writePersonas(records)
  todo = []
  for (const [i, { record }] of assigned.entries()) {
    log(`account ${i + 1}/${assigned.length} ${record.account!.homeCity}: ${record.personaId}`)
    await makeProfilePicture(record, deps, undefined, ALWAYS_FIX)
    writePersonas(records)
    const account = wanted.find((a) => a.accountName === record.account!.accountName)!
    await linkInTwenty(twenty, account.id, record)
    todo.push(record)
  }
} else if (values.accountsRedo) {
  const twenty = createTwentyClient()
  const all = await listFacebookAccounts(twenty)
  todo = []
  const accountRecords = records.filter((r) => r.account && !r.approved)
  for (const [i, record] of accountRecords.entries()) {
    const account = all.find((a) => a.accountName === record.account!.accountName)
    if (!account) continue
    log(`account ${i + 1}/${accountRecords.length} ${record.account!.homeCity}: ${record.personaId}`)
    if (record.matched && record.profilePicture) {
      const check = await recheckPicture(record, deps)
      writePersonas(records)
      if (check?.passed) continue
      rejectPicture(record, `recheck low on ${check?.failed.join(', ')}`)
      await regenerate(record, [...new Set<PictureFacet>([...ALWAYS_FIX, ...(check?.failed ?? [])])])
    } else if (record.attempts.length) {
      rejectPicture(record, 'no attempt matched every check')
      if (record.characteristics.background) {
        record.backgroundsTried = [...new Set([...(record.backgroundsTried ?? []), record.characteristics.background])]
        record.characteristics.background = nextBackground(record.characteristics, [...record.backgroundsTried, ...deps.usedBackgrounds(record)]) ?? record.characteristics.background
      }
      log(`redo ${record.account!.homeCity} in ${record.characteristics.background}`)
      writePersonas(records)
      await regenerate(record, [...ALWAYS_FIX, 'ageFits'])
    } else {
      await regenerate(record, ALWAYS_FIX)
    }
    await linkInTwenty(twenty, account.id, record)
    todo.push(record)
  }
} else if (values.recheck) {

  todo = []
  for (const record of records) {
    if (record.approved) {
      log(`${record.personaId}: approved by matt, left as it is`)
      continue
    }
    const check = await recheckPicture(record, deps)
    writePersonas(records)
    if (check?.passed) continue
    if (check) rejectPicture(record, `recheck low on ${check.failed.join(', ')}`)
    await regenerate(record, [...new Set<PictureFacet>([...ALWAYS_FIX, ...(check?.failed ?? ['ageFits'])])])
    todo.push(record)
  }
} else if (values.redo) {

  const record = records.find((r) => r.personaId === values.redo)
  if (!record) throw new Error(`no persona ${values.redo} in ${personasFile()}`)
  if (record.approved) throw new Error(`${record.personaId} is approved by matt: it is never regenerated`)
  rejectPicture(record, values.reason)
  log(`redo ${record.personaId}: earlier picture rejected (${values.reason})`)
  writePersonas(records)
  await regenerate(record, ['ageFits', ...ALWAYS_FIX])
  todo = [record]
} else {
  const seeds = Array.from({ length: Number(values.count) }, () => Math.floor(Math.random() * 2 ** 31))
  records = drawPersonas(readDatasets(), values.country, seeds)
  for (const r of records) log(`persona ${r.personaId}: ${r.characteristics.age} ${r.characteristics.gender} ${r.characteristics.occupation}, ${r.characteristics.whenTheyScroll}`)
  writePersonas(records)
  for (const [i, record] of records.entries()) {
    log(`persona ${i + 1}/${records.length} ${record.personaId}`)
    await makeProfilePicture(record, deps, undefined, ALWAYS_FIX)
    writePersonas(records)
  }
  todo = records
}
const spent = todo.flatMap((r) => r.attempts).reduce((n, a) => n + a.credits, 0)
log(`done: ${todo.filter((r) => r.matched).length}/${todo.length} matched, ${todo.reduce((n, r) => n + r.attempts.length, 0)} images on record, ${spent} credits ($${(spent / 1000).toFixed(3)}), ${personasFile()}`)
