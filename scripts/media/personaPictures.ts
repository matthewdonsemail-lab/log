#!/usr/bin/env bun
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { backgroundOf, drawPersonas, imageOf, liveDeps, makeProfilePicture, personasDir, personasFile, readPersonas, recheckPicture, refreshPrompt, rejectPicture, writePersonas } from '../../src/media/persona/index'
import type { PersonaRecord, PictureFacet } from '../../src/media/persona/index'
import { readDatasets } from '../../src/warmup/persona/index'

const { values } = parseArgs({
  options: {
    count: { type: 'string', default: '5' },
    country: { type: 'string', default: 'US' },
    examples: { type: 'string', default: join(homedir(), '.logCli', 'personaExamples') },
    redo: { type: 'string' },
    recheck: { type: 'boolean', default: false },
    approve: { type: 'string' },
    styleFrom: { type: 'string' },
    reason: { type: 'string', default: 'matt said it is bad' }
  }
})
const log = (line: string) => console.error(`${new Date().toISOString().slice(11, 19)} ${line}`)
const ALWAYS_FIX: PictureFacet[] = ['selfieStyle', 'noText', 'armHidden', 'lowAngle', 'unflattering', 'backgroundDistinct', 'likeReference']
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
const othersOf = (record: PersonaRecord) => records.filter((r) => r !== record && r.profilePicture && existsSync(join(personasDir(), r.profilePicture))).map((r) => imageOf(join(personasDir(), r.profilePicture!)))
const deps = liveDeps({ examples: mattExamples.map(imageOf), reference: referenceRecord ? imageOf(join(personasDir(), referenceRecord.profilePicture!)) : null, others: othersOf, log })

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

if (values.recheck) {

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
