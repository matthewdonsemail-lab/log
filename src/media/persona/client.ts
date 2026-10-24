import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createDecisionsClient } from '../../subq/decisions/client'
import type { DecisionImage, DecisionsClient } from '../../subq/decisions/types'
import { drawPersona } from '../../warmup/persona/helpers/drawPersona'
import type { DatasetFiles } from '../../warmup/persona/helpers/drawPersona'
import { characteristicsOf, checkTotal, PERSONA_AVOID, personaIdOf, personaPrompt, pictureCheckRequest, readPictureCheck, retryPrompt } from './helpers/index'
import { PERSONA_IMAGE_ENDPOINT, PERSONA_IMAGE_MODEL, PERSONA_MIN_AGE, PERSONA_IMAGE_RESOLUTION, PERSONA_IMAGE_SIZE, PERSONA_MAX_ATTEMPTS, PROFILE_PICTURE_FILE } from './types'
import type { GeneratedImage, PersonaRecord, PictureAttempt, PictureCheck, PictureDeps, PictureFacet } from './types'

export const personasDir = (repoRoot = fileURLToPath(new URL('../../../', import.meta.url))) => join(repoRoot, 'media', 'personas')
export const personasFile = (dir = personasDir()) => join(dir, 'personas.jsonl')

export function drawPersonas(files: DatasetFiles, country: string, seeds: number[]): PersonaRecord[] {
  const taken = new Set<string>()
  const adults = { ...files, doomscrolling: files.doomscrolling.filter((r) => Number(r.age) >= PERSONA_MIN_AGE) }
  return seeds.map((seed) => {
    const profile = drawPersona(adults, country, seed)
    const characteristics = characteristicsOf(profile)
    return {
      personaId: personaIdOf(characteristics, taken),
      seed,
      country,
      characteristics,
      sources: profile.rows.map((r) => r.source),
      prompt: personaPrompt(characteristics),
      avoid: PERSONA_AVOID,
      size: PERSONA_IMAGE_SIZE,
      resolution: PERSONA_IMAGE_RESOLUTION,
      generatedWith: `${PERSONA_IMAGE_ENDPOINT} (${PERSONA_IMAGE_MODEL}, ${PERSONA_IMAGE_RESOLUTION}, ${PERSONA_IMAGE_SIZE})`,
      attempts: [],
      profilePicture: null,
      matched: false
    }
  })
}

export async function makeProfilePicture(record: PersonaRecord, deps: PictureDeps, maxAttempts = PERSONA_MAX_ATTEMPTS, startFixes: PictureFacet[] = []): Promise<PersonaRecord> {
  let best: { png: Uint8Array; check: PictureCheck } | null = null
  const everFailed = new Set<PictureFacet>(startFixes)
  let prompt = retryPrompt(record, [...everFailed])
  const first = record.attempts.length
  for (let n = first + 1; n <= first + maxAttempts; n++) {
    deps.log(`${record.personaId} ${n}/${first + maxAttempts}: generating`)
    const image = await deps.generate(prompt, record.avoid)
    const png = await deps.toPng(await deps.download(image.url))
    deps.log(`${record.personaId} ${n}/${first + maxAttempts}: generated (${image.credits} credits), SubQ checking`)
    const check = await deps.check(record, png)
    const attempt: PictureAttempt = { n, task: image.task, url: image.url, credits: image.credits, prompt, check }
    record.attempts.push(attempt)
    deps.log(`${record.personaId} ${n}/${first + maxAttempts}: ${check.passed ? 'matches' : `low on ${check.failed.join(', ')}`} (${Object.entries(check.scores).map(([f, s]) => `${f} ${s}`).join(', ')})`)
    if (!best || checkTotal(check) > checkTotal(best.check)) best = { png, check }
    if (check.passed) {
      record.profilePicture = await deps.save(record, png)
      record.matched = true
      return record
    }
    for (const f of check.failed) everFailed.add(f)
    prompt = retryPrompt(record, [...everFailed])
  }
  if (best) record.profilePicture = await deps.save(record, best.png)
  deps.log(`${record.personaId}: no attempt matched in ${maxAttempts}, kept the closest`)
  return record
}

function tregJson(args: string[]): Record<string, unknown> {
  const out = spawnSync('treg', args, { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, shell: process.platform === 'win32' })
  if (out.status !== 0) throw Object.assign(new Error(`treg ${args[1]}: ${(out.stderr || out.stdout).slice(0, 300)}`), { code: 'tregFailed' })
  return JSON.parse(out.stdout) as Record<string, unknown>
}

export async function tregGenerate(prompt: string, avoid: string, wait = (ms: number) => new Promise((r) => setTimeout(r, ms))): Promise<GeneratedImage> {
  const body = { model: PERSONA_IMAGE_MODEL, prompt: `${prompt} Avoid: ${avoid}`, size: PERSONA_IMAGE_SIZE, resolution: PERSONA_IMAGE_RESOLUTION }
  const bodyFile = join(tmpdir(), `personaImage_${process.pid}_${Date.now()}.json`)
  writeFileSync(bodyFile, JSON.stringify(body))
  let task = ''
  try {
    task = String(tregJson(['call', PERSONA_IMAGE_ENDPOINT, '--method', 'POST', '--file', bodyFile, '--content-type', 'application/json']).id ?? '')
  } finally {
    rmSync(bodyFile, { force: true })
  }
  if (!task) throw Object.assign(new Error('image generation gave no task id'), { code: 'imageTaskMissing' })
  for (let i = 0; i < 60; i++) {
    await wait(10_000)
    const got = tregJson(['call', 'reapi.tasks.get', '--query', `id=${task}`]) as { status?: string; output?: { image_urls?: string[] }; usage?: { credits?: number }; error?: unknown }
    if (got.status === 'completed' && got.output?.image_urls?.[0]) return { task, url: got.output.image_urls[0], credits: got.usage?.credits ?? 0 }
    if (got.status === 'failed') throw Object.assign(new Error(`image task ${task} failed: ${JSON.stringify(got.error)}`), { code: 'imageTaskFailed' })
  }
  throw Object.assign(new Error(`image task ${task} took over 10 minutes`), { code: 'imageTaskTimeout' })
}

export function imageOf(path: string): DecisionImage {
  const bytes = readFileSync(path)
  const mediaType = bytes[0] === 0x89 ? 'image/png' : bytes[0] === 0x52 ? 'image/webp' : 'image/jpeg'
  return { mediaType, base64: bytes.toString('base64') }
}

export function liveDeps(options: { dir?: string; examples?: DecisionImage[]; subq?: DecisionsClient; log: (line: string) => void }): PictureDeps {
  const dir = options.dir ?? personasDir()
  const subq = options.subq ?? createDecisionsClient()
  return {
    generate: (prompt, avoid) => tregGenerate(prompt, avoid),
    download: async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw Object.assign(new Error(`download ${url}: HTTP ${res.status}`), { code: 'imageDownloadFailed' })
      return new Uint8Array(await res.arrayBuffer())
    },
    toPng: async (bytes) => new Uint8Array(await sharp(bytes).png().toBuffer()),
    check: async (record, png) => readPictureCheck(await subq(pictureCheckRequest(record, { mediaType: 'image/png', base64: Buffer.from(png).toString('base64') }, options.examples ?? []))),
    save: async (record, png) => {
      const folder = join(dir, record.personaId)
      mkdirSync(folder, { recursive: true })
      writeFileSync(join(folder, PROFILE_PICTURE_FILE), png)
      return `${record.personaId}/${PROFILE_PICTURE_FILE}`
    },
    log: options.log
  }
}

export function readPersonas(file = personasFile()): PersonaRecord[] {
  return readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as PersonaRecord)
}

export function rejectPicture(record: PersonaRecord, reason: string): PersonaRecord {
  record.rejected = [...(record.rejected ?? []), { at: new Date().toISOString(), by: 'matt', reason, tasks: record.attempts.filter((a) => !(record.rejected ?? []).some((r) => r.tasks.includes(a.task))).map((a) => a.task) }]
  record.matched = false
  record.profilePicture = null
  return record
}

export function refreshPrompt(record: PersonaRecord): PersonaRecord {
  record.prompt = personaPrompt(record.characteristics)
  record.avoid = PERSONA_AVOID
  return record
}

export async function recheckPicture(record: PersonaRecord, deps: PictureDeps, dir = personasDir()): Promise<PictureCheck | null> {
  if (!record.profilePicture) return null
  const check = await deps.check(record, new Uint8Array(readFileSync(join(dir, record.profilePicture))))
  record.rechecks = [...(record.rechecks ?? []), { at: new Date().toISOString(), check }]
  deps.log(`${record.personaId} recheck: ${check.passed ? 'still matches' : `low on ${check.failed.join(', ')}`} (${Object.entries(check.scores).map(([f, s]) => `${f} ${s}`).join(', ')})`)
  return check
}

export function writePersonas(records: PersonaRecord[], file = personasFile()): void {
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, records.map((r) => JSON.stringify(r)).join('\n') + '\n')
}
