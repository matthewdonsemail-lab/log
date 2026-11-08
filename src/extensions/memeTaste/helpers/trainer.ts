import { existsSync, readFileSync } from 'node:fs'
import { appendRecord, importRecordFile, readRecords } from '../../../storage/records/index'
import { homedir } from 'node:os'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MemelordClient, MemeTemplate } from '../../memelord/index'
import type { TasteIndex, TasteRating } from '../types'
import type { Llm } from './llm'
import { pickPerson, replyProfile, replyProfileSummary } from './nicheMap'
import type { NicheMapEntry } from './nicheMap'
import { learnedFrom, mixed, rankLearned, shownCounts, tasteLines, theirMemes } from './learn'
import { labelMemes, makeSituation, situationFromPerson, unlabelled } from './situation'
import type { LabelledMeme, Situation } from './situation'
import { trainerPage } from './trainerPage'
import { callMatched, gateFrom, makeCall, writeTrainingData } from './call'
import type { ModelCall } from '../types'

export function ratingsPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MEME_RATINGS || join(homedir(), '.logCli', 'memes', 'ratings.jsonl')
}

export function readRatings(path = ratingsPath()): TasteRating[] {
  importRecordFile('memeRating', path)
  return readRecords<TasteRating>('memeRating')
}

export function addRating(rating: TasteRating, path = ratingsPath()): void {
  importRecordFile('memeRating', path)
  appendRecord('memeRating', rating as unknown as Record<string, unknown>)
}

const BRAND_TYPES: Record<string, string> = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' }

export function siteDir(): string {
  return resolve(fileURLToPath(new URL('../../../../site/apps/web/public', import.meta.url)))
}

export function brandFile(brandDir: string, path: string): Response | null {
  const rel = normalize(decodeURIComponent(path.replace(/^\/(brand|site)\//, ''))).replace(/^([.][.][/\\])+/, '')
  const file = join(brandDir, rel)
  if (!file.startsWith(brandDir) || !existsSync(file)) return null
  return new Response(readFileSync(file), { headers: { 'content-type': BRAND_TYPES[extname(file)] ?? 'application/octet-stream' } })
}

export async function memesFor(client: MemelordClient, searches: readonly string[], perSearch = 4, max = 9, offset: () => number = () => 0): Promise<MemeTemplate[]> {
  const seen = new Map<string, MemeTemplate>()
  const answers = await Promise.all(searches.map((query) => client.searchMemes({ query, method: 'semantic_combined', limit: perSearch, offset: offset() }).catch(() => ({ data: [] as MemeTemplate[] }))))
  for (const answer of answers) for (const t of answer.data ?? []) if (!seen.has(t.id)) seen.set(t.id, t)
  return [...seen.values()].slice(0, max)
}

export function trainingDataPath(ratings = ratingsPath()): string {
  return join(dirname(ratings), 'trainingData.jsonl')
}

export const AHEAD = 5
export const MIN_MEMES = 9

export function startTrainer(opts: { port: number; client: MemelordClient; llm: Llm; taste: () => TasteIndex | null; people?: readonly NicheMapEntry[]; ratings?: string; brandDir?: string; log?: (line: string) => void }) {
  const ratings = opts.ratings ?? ratingsPath()
  const brandDir = opts.brandDir ?? join(homedir(), '.buzz', 'brand-kit')
  const log = opts.log ?? (() => {})
  const recentNames: string[] = []
  const recentSearches: string[] = []
  const recentMine: string[] = []
  const servedRounds: string[][] = []
  const makeRound = async (person: NicheMapEntry | null) => {
    const started = Date.now()
    const rated = readRatings(ratings)
    const taste = tasteLines(rated)
    const avoid = { searches: recentSearches.slice(-40), names: [...new Set(recentNames.slice(-60))] }
    const situation = person ? await situationFromPerson(opts.llm, opts.taste(), person, replyProfile(rated), Math.random, taste, avoid) : await makeSituation(opts.llm, opts.taste(), rated.map((r) => r.word))
    log(`taste trainer: ${person ? `@${person.handle} (${person.role}): ` : ''}${situation.moment} (searches: ${situation.searches.join(', ')})`)
    const used = new Set(recentSearches.map((q) => q.toLowerCase()))
    const unused = situation.searches.filter((q) => !used.has(q.toLowerCase()))
    if (unused.length >= 3) situation.searches = unused
    recentSearches.push(...situation.searches)
    const fresh = new Set(avoid.names.map((n) => n.toLowerCase()))
    let found = (await memesFor(opts.client, situation.searches, 8, 40, () => Math.floor(Math.random() * 3) * 8)).filter((t) => !fresh.has(t.name.toLowerCase())).slice(0, 18)
    if (found.length < MIN_MEMES) {
      const shorter = [...new Set(situation.searches.map((q) => q.split(/\s+/).slice(0, 2).join(' ')))]
      const more = (await memesFor(opts.client, shorter, 12, 40, () => Math.floor(Math.random() * 3) * 12)).filter((t) => !fresh.has(t.name.toLowerCase()) && !found.some((f) => f.id === t.id))
      found = [...found, ...more].slice(0, 18)
      log(`taste trainer: only a few memes for those searches, topped up with ${shorter.join(', ')}: ${found.length}`)
    }
    const mine = theirMemes(opts.taste(), new Set(recentMine.slice(-20)), 3)
    recentMine.push(...mine.map((m) => m.id))
    const memes = await labelMemes(opts.llm, situation, [...found, ...mine], taste)
    const call = await makeCall(opts.llm, situation, memes, taste).catch(() => null)
    log(`taste trainer: round for ${person ? `@${person.handle}` : 'a made-up thread'} ready in ${((Date.now() - started) / 1000).toFixed(1)}s${call ? `, the model's call: ${call.action === 'skip' ? 'skip' : call.name} (${call.confidence.toFixed(2)})` : ', the model made no call'}`)
    return { id: crypto.randomUUID(), situation, memes, call }
  }
  type Round = Awaited<ReturnType<typeof makeRound>>
  const queue: { handle: string | null; done: boolean; round: Promise<Round> }[] = []
  const fill = () => {
    const rated = readRatings(ratings)
    const ratedHandles = new Set(rated.map((r) => r.person?.handle.toLowerCase()).filter(Boolean))
    for (let i = queue.length - 1; i >= 0; i--) if (queue[i]!.handle && ratedHandles.has(queue[i]!.handle!)) queue.splice(i, 1)
    while (queue.length < AHEAD) {
      const person = pickPerson(opts.people ?? [], rated, Math.random, new Set(queue.map((q) => q.handle).filter((h): h is string => !!h)))
      const entry = { handle: person?.handle.toLowerCase() ?? null, done: false, round: makeRound(person) }
      entry.round.then(() => { entry.done = true }, () => { entry.done = true })
      queue.push(entry)
    }
  }
  const take = async (): Promise<Round> => {
    for (let tries = 0; tries < AHEAD + 1; tries++) {
      fill()
      const at = Math.max(0, queue.findIndex((q) => q.done))
      const [entry] = queue.splice(at, 1)
      fill()
      try {
        return await entry!.round
      } catch (error) {
        log(`taste trainer: a round failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    throw new Error('the trainer could not build a round, see its log')
  }
  const labelling = new Map<string, Promise<LabelledMeme[]>>()
  const calls = new Map<string, ModelCall>()
  const stats = () => {
    const all = readRatings(ratings)
    return { rated: all.length, profile: replyProfileSummary(replyProfile(all)), stats: replyProfile(all), taste: tasteLines(all), gate: gateFrom(all) }
  }
  fill()
  return Bun.serve({
    port: opts.port,
    hostname: '127.0.0.1',
    idleTimeout: 120,
    async fetch(request) {
      const url = new URL(request.url)
      if (url.pathname === '/') return new Response(trainerPage(), { headers: { 'content-type': 'text/html; charset=utf-8' } })
      if (url.pathname.startsWith('/brand/')) return brandFile(brandDir, url.pathname) ?? new Response('not found', { status: 404 })
      if (url.pathname.startsWith('/site/')) return brandFile(siteDir(), url.pathname) ?? new Response('not found', { status: 404 })
      if (url.pathname === '/api/floaters') return Response.json({ images: (opts.taste()?.memes ?? []).filter((m) => m.kind === 'photo').map((m) => m.imageUrl) })
      if (url.pathname === '/api/stats') return Response.json(stats())
      if (url.pathname === '/api/round') {
        try {
          const round = await take()
          const lately = new Set(servedRounds.slice(-6).flat())
          const rated = readRatings(ratings)
          let memes = mixed(rankLearned(round.memes.filter((m) => !lately.has(m.name.toLowerCase())), rated, 40), shownCounts(rated), 15)
          if (memes.length < MIN_MEMES) memes = [...memes, ...mixed(rankLearned(round.memes.filter((m) => !memes.includes(m)), rated, 40), shownCounts(rated), MIN_MEMES - memes.length)]
          const { call, ...shown } = round
          if (call?.action === 'reply' && !memes.some((m) => m.id === call.templateId)) {
            const called = round.memes.find((m) => m.id === call.templateId)
            if (called) memes.splice(Math.floor(Math.random() * (memes.length + 1)), memes.length >= 15 ? 1 : 0, called)
          }
          if (call) calls.set(round.id, call)
          servedRounds.push(memes.map((m) => m.name.toLowerCase()))
          recentNames.push(...memes.map((m) => m.name))
          return Response.json({ ...shown, memes, ...stats() })
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
        }
      }
      if (url.pathname === '/api/rate' && request.method === 'POST') {
        const body = (await request.json().catch(() => null)) as (Partial<TasteRating> & { roundId?: string }) | null
        if (!body?.word || typeof body.good !== 'boolean') return Response.json({ ok: false, error: 'word and good are needed' }, { status: 400 })
        const rating: TasteRating = { word: body.word, thread: body.thread ?? [], templateId: body.templateId ?? '', name: body.name ?? '', mediaUrl: body.mediaUrl ?? null, good: body.good, ...(body.skipped ? { skipped: true } : {}), ...(body.person?.handle ? { person: { handle: String(body.person.handle), name: String(body.person.name ?? body.person.handle), role: String(body.person.role ?? ''), degree: Number(body.person.degree ?? 2), followsYou: !!body.person.followsYou } } : {}), ...(body.fitsWhen ? { fitsWhen: body.fitsWhen } : {}), ...(body.other ? { other: body.other } : {}), ...(body.reply ? { reply: body.reply } : {}), ...(body.searched ? { searched: String(body.searched) } : {}), ...(body.fromSearch ? { fromSearch: true } : {}), shown: body.shown ?? [], at: new Date().toISOString() }
        const call = body.roundId ? calls.get(body.roundId) : undefined
        if (call) {
          rating.call = call
          rating.callMatched = callMatched(call, rating)
          calls.delete(body.roundId!)
        }
        addRating(rating, ratings)
        writeTrainingData(readRatings(ratings), trainingDataPath(ratings))
        log(`taste trainer: ${rating.skipped ? 'skipped, would not reply' : rating.good ? `${rating.fromSearch ? `searched "${rating.searched}", ` : ''}picked ${rating.name}${rating.reply ? `, captioned: ${rating.reply}` : ''}` : `none of these${rating.other ? `, would send: ${rating.other}` : ''}`} for "${rating.word}"`)
        if (call) log(`taste trainer: the model called ${call.action === 'skip' ? 'skip' : call.name} at ${call.confidence.toFixed(2)}: ${rating.callMatched ? 'right' : 'wrong'}`)
        return Response.json({ ok: true, learned: learnedFrom(rating), call: call ?? null, callMatched: rating.callMatched ?? null, ...stats() })
      }
      if (url.pathname === '/api/search' && request.method === 'POST') {
        const body = (await request.json().catch(() => null)) as { query?: string; situation?: Situation } | null
        const query = body?.query?.trim()
        if (!query || !body?.situation?.thread) return Response.json({ error: 'a search and its thread are needed' }, { status: 400 })
        try {
          const rated = readRatings(ratings)
          const found = await memesFor(opts.client, [query], 18, 18)
          const labelled = labelMemes(opts.llm, body.situation, found, tasteLines(rated))
          labelled.catch(() => {})
          labelling.set(query, labelled)
          const memes = rankLearned(found.map(unlabelled), rated, 15)
          log(`taste trainer: searched memes for "${query}": ${memes.length}, labelling them`)
          return Response.json({ query, memes })
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
        }
      }
      if (url.pathname === '/api/label') {
        const query = url.searchParams.get('query') ?? ''
        const labelled = labelling.get(query)
        if (!labelled) return Response.json({ error: 'nothing is being labelled for that search' }, { status: 404 })
        try {
          return Response.json({ query, memes: await labelled })
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
        }
      }
      return new Response('not found', { status: 404 })
    },
  })
}
