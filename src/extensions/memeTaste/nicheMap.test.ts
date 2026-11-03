import { describe, expect, test } from 'bun:test'
import { cleanPost, pickPerson, replyProfile, replyProfileSummary, roleWeight, threadOf, withoutReplyHandles } from './helpers/nicheMap'
import type { NicheMapEntry } from './helpers/nicheMap'
import type { TasteRating } from './types'

const person = (handle: string, role: string, extra: Partial<NicheMapEntry> = {}): NicheMapEntry => ({ handle, name: handle, role, degree: 1, followsYou: false, bio: '', followers: 0, tieStrength: 0, img: null, posts: [{ text: 'shipped the thing today and the first customer paid for it', parents: [] }], ...extra })
const rating = (handle: string, role: string, skipped: boolean): TasteRating => ({ word: `${handle} moment`, person: { handle, name: handle, role, degree: 1, followsYou: false }, templateId: '', name: '', mediaUrl: null, good: !skipped, ...(skipped ? { skipped: true } : {}), at: '2026-11-02T00:00:00Z' })

describe('niche map trainer', () => {
  test('a post is kept only when it stands on its own in English', () => {
    expect(cleanPost('shipped the thing today and the first customer paid for it https://t.co/x')).toBe('shipped the thing today and the first customer paid for it')
    expect(cleanPost('@nateherk why does this fit so well for life in general lol')).toBeNull()
    expect(cleanPost('RT @someone: shipped the thing today and the first customer paid')).toBeNull()
    expect(cleanPost('Historias de un azafato con Robert de El Cuido, dale pa que vean')).toBeNull()
  })

  test('a reply is kept only with the posts above it, and its leading handles go', () => {
    const byId = new Map([['1', { id: '1', text: 'what is the one tool you could not run your agency without', authorUsername: 'root', authorName: 'Root', isReply: false }]])
    expect(threadOf({ id: '2', text: '@root twenty, it runs every client we have', isReply: true, inReplyToId: '1' }, byId, new Map([['root', 'pic']]))).toEqual([{ handle: 'root', name: 'Root', text: 'what is the one tool you could not run your agency without', img: 'pic' }])
    expect(threadOf({ id: '3', text: '@gone agreed', isReply: true, inReplyToId: '9' }, byId, new Map())).toBeNull()
    expect(withoutReplyHandles('@a @b agreed with both of you')).toBe('agreed with both of you')
  })

  test('a skip counts as content he would not reply to', () => {
    const profile = replyProfile([rating('a', 'saas_founder', false), rating('b', 'beginner', true), rating('c', 'beginner', true)])
    expect(profile).toMatchObject({ rated: 3, replied: 1, skipped: 2 })
    expect(roleWeight(profile, 'saas_founder')).toBeGreaterThan(roleWeight(profile, 'beginner'))
    expect(replyProfileSummary(profile)).toContain('beginner 0 replied / 2 skipped')
  })

  test('a person already rated is not picked again, and a skipped role comes up less', () => {
    const people = [person('a', 'saas_founder'), person('b', 'beginner'), person('c', 'beginner')]
    expect(pickPerson(people, [rating('a', 'saas_founder', false), rating('b', 'beginner', true), rating('c', 'beginner', true)])).toBeNull()
    const ratings = [rating('x', 'beginner', true), rating('y', 'beginner', true), rating('z', 'saas_founder', false)]
    const picks = Array.from({ length: 200 }, (_, i) => pickPerson(people, ratings, () => (i + 0.5) / 200)!.role)
    expect(picks.filter((r) => r === 'saas_founder').length).toBeGreaterThan(picks.filter((r) => r === 'beginner').length / 2)
  })
})
