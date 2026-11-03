import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { NichePerson, TasteRating } from '../types'

export function nicheMapPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_NICHE_MAP || join(homedir(), '.buzz', 'REPOS', 'whop', 'research', 'nicheMap', 'data', 'nicheMap.json')
}

export interface NicheMapEntry extends NichePerson {
  bio: string
  followers: number
  tieStrength: number
  img: string | null
  posts: NichePost[]
}

export interface ThreadAuthor {
  handle: string
  name: string
  text: string
  img: string | null
}

export interface NichePost {
  text: string
  parents: ThreadAuthor[]
}

export const SEARCH_POST_CUT = 280

interface RawPost {
  id?: string
  text?: string
  lang?: string
  isReply?: boolean
  inReplyToId?: string | null
  authorUsername?: string
  author?: string
  authorName?: string
  authorImage?: string
}

interface RawPerson {
  handle?: string
  name?: string
  bio?: string
  followers?: number
  degree?: number
  followsYou?: boolean
  tieStrength?: number
  classification?: { role?: { value?: string | null } }
}

export function withoutReplyHandles(text: string): string {
  return text.replace(/^(\s*@\w+)+\s*/, '')
}

export function cleanPost(text: string): string | null {
  const t = text.replace(/https?:\/\/\S+/g, '').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (t.length < 40 || /^(RT )?@/.test(text.trim())) return null
  const letters = t.replace(/[^\p{L}]/gu, '')
  if (!letters.length) return null
  const latin = letters.replace(/[^a-zA-Z]/g, '').length / letters.length
  if (latin < 0.9 || !/\b(the|and|you|is|to|i|it|a|of|for|this)\b/i.test(t)) return null
  return t
}

export function readPictures(path: string): Map<string, string> {
  const out = new Map<string, string>()
  if (!existsSync(path)) return out
  const text = readFileSync(path, 'utf8')
  const data = JSON.parse(text.slice(text.indexOf('{'), text.trimEnd().replace(/;$/, '').lastIndexOf('}') + 1)) as { people?: { h?: string; img?: string }[] }
  for (const p of data.people ?? []) if (p.h && p.img) out.set(p.h.toLowerCase(), p.img)
  return out
}

export function readRawPosts(dir: string): { own: Map<string, RawPost[]>; byId: Map<string, RawPost> } {
  const own = new Map<string, RawPost[]>()
  const byId = new Map<string, RawPost>()
  if (!existsSync(dir)) return { own, byId }
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { handle?: string; ownPosts?: RawPost[]; tiePosts?: RawPost[] }
      for (const post of [...(raw.ownPosts ?? []), ...(raw.tiePosts ?? [])]) if (post?.id) byId.set(post.id, post)
      if (raw.handle) own.set(raw.handle.toLowerCase(), (raw.ownPosts ?? []).filter((p) => p?.text))
    } catch {}
  }
  return { own, byId }
}

export function threadOf(post: RawPost, byId: ReadonlyMap<string, RawPost>, pictures: ReadonlyMap<string, string>, depth = 3): ThreadAuthor[] | null {
  const parents: ThreadAuthor[] = []
  let at = post
  while (at.isReply) {
    const parent = at.inReplyToId ? byId.get(at.inReplyToId) : undefined
    if (!parent?.text || parents.length >= depth) return null
    const handle = parent.authorUsername ?? parent.author ?? ''
    const text = cleanPost(withoutReplyHandles(parent.text))
    if (!handle || !text) return null
    parents.unshift({ handle, name: parent.authorName ?? handle, text, img: parent.authorImage ?? pictures.get(handle.toLowerCase()) ?? null })
    at = parent
  }
  return parents
}

export function readNicheMap(path = nicheMapPath(), postsPath = join(dirname(path), 'search_posts.jsonl'), perPerson = 6, picturesPath = join(dirname(path), '..', 'app', 'data.js'), rawDir = join(dirname(path), 'raw')): NicheMapEntry[] {
  if (!existsSync(path)) return []
  const map = JSON.parse(readFileSync(path, 'utf8')) as { people?: RawPerson[] }
  const people = new Map<string, NicheMapEntry>()
  const pictures = readPictures(picturesPath)
  for (const p of map.people ?? []) {
    const role = p.classification?.role?.value ?? null
    if (!p.handle || !role || role === 'bot_or_spam') continue
    people.set(p.handle.toLowerCase(), { handle: p.handle, name: p.name ?? p.handle, role, degree: p.degree ?? 2, followsYou: !!p.followsYou, bio: p.bio ?? '', followers: p.followers ?? 0, tieStrength: p.tieStrength ?? 0, img: pictures.get(p.handle.toLowerCase()) ?? null, posts: [] })
  }
  const raw = readRawPosts(rawDir)
  for (const [handle, posts] of raw.own) {
    const person = people.get(handle)
    if (!person) continue
    const threads: NichePost[] = []
    const standalone: NichePost[] = []
    for (const post of posts) {
      if (post.lang && post.lang !== 'en') continue
      const parents = threadOf(post, raw.byId, pictures)
      const text = parents ? cleanPost(post.isReply ? withoutReplyHandles(post.text!) : post.text!) : null
      if (!parents || !text) continue
      ;(parents.length ? threads : standalone).push({ text, parents })
    }
    person.posts = [...threads.slice(0, 3), ...standalone].slice(0, perPerson)
  }
  if (existsSync(postsPath)) {
    for (const line of readFileSync(postsPath, 'utf8').split('\n')) {
      if (!line) continue
      const handle = /"h":\s*"([^"]+)"/.exec(line)?.[1]?.toLowerCase()
      const person = handle ? people.get(handle) : undefined
      if (!person || raw.own.has(handle!) || person.posts.length >= perPerson) continue
      try {
        const row = JSON.parse(line) as { posts?: unknown[] }
        for (const post of row.posts ?? []) {
          const clean = typeof post === 'string' && post.length < SEARCH_POST_CUT - 5 ? cleanPost(post) : null
          if (clean && person.posts.length < perPerson) person.posts.push({ text: clean, parents: [] })
        }
      } catch {}
    }
  }
  return [...people.values()].filter((p) => p.posts.length)
}

export interface RoleLean {
  role: string
  replied: number
  skipped: number
}

export interface ReplyProfile {
  rated: number
  replied: number
  skipped: number
  roles: RoleLean[]
  repliedTo: string[]
  skippedPast: string[]
}

export function replyProfile(ratings: readonly TasteRating[]): ReplyProfile {
  const roles = new Map<string, RoleLean>()
  const repliedTo: string[] = []
  const skippedPast: string[] = []
  for (const r of ratings) {
    const role = r.person?.role
    const lean = role ? roles.get(role) ?? { role, replied: 0, skipped: 0 } : null
    if (r.skipped) {
      if (lean) lean.skipped++
      skippedPast.push(r.word)
    } else {
      if (lean) lean.replied++
      repliedTo.push(r.word)
    }
    if (lean) roles.set(lean.role, lean)
  }
  const skipped = ratings.filter((r) => r.skipped).length
  return { rated: ratings.length, replied: ratings.length - skipped, skipped, roles: [...roles.values()].sort((a, b) => b.replied - b.skipped - (a.replied - a.skipped)), repliedTo: repliedTo.slice(-12), skippedPast: skippedPast.slice(-12) }
}

export function roleWeight(profile: ReplyProfile, role: string): number {
  const lean = profile.roles.find((r) => r.role === role)
  return lean ? (lean.replied + 1) / (lean.replied + lean.skipped + 2) * 2 : 1
}

export function closeness(person: NicheMapEntry): number {
  return (person.followsYou ? 3 : 0) + (person.degree <= 1 ? 2 : 1) + Math.log10(person.tieStrength + 1)
}

export function pickPerson(people: readonly NicheMapEntry[], ratings: readonly TasteRating[], random: () => number = Math.random, exclude: ReadonlySet<string> = new Set()): NicheMapEntry | null {
  const seen = new Set([...ratings.map((r) => r.person?.handle.toLowerCase()).filter(Boolean), ...exclude])
  const pool = people.filter((p) => !seen.has(p.handle.toLowerCase()))
  if (!pool.length) return null
  const profile = replyProfile(ratings)
  const weights = pool.map((p) => closeness(p) * roleWeight(profile, p.role))
  let at = random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < pool.length; i++) {
    at -= weights[i]!
    if (at <= 0) return pool[i]!
  }
  return pool.at(-1)!
}

export function replyProfileSummary(profile: ReplyProfile): string {
  if (!profile.rated) return 'what matt replies to: nothing rated yet'
  const lean = profile.roles.map((r) => `${r.role} ${r.replied} replied / ${r.skipped} skipped`).join(', ')
  return `what matt replies to (${profile.replied} replied, ${profile.skipped} skipped${lean ? `: ${lean}` : ''})`
}
