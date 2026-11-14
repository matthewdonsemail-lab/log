import { afterAll, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hookAnswer } from '../../contextLayer/hook/index'
import { askAnswer } from '../../mcp/server/helpers/guideAnswer.ts'
import { clearActivePlay, playScope } from '../../mcp/server/helpers/activePlay.ts'
import { listUseCases } from '../../mcp/server/helpers/guides.ts'
import { contentWords, folderOf, isPlatformFolder, outcomeOf, phrasesOf, platformsOf, playMatchText, route } from './client'
import { GOLDEN_FILE } from './types'
import type { GoldenPrompt } from './types'

const useCases = listUseCases()
const golden = JSON.parse(readFileSync(join(import.meta.dir, 'fixtures', GOLDEN_FILE), 'utf8')) as GoldenPrompt[]
const decide = (prompt: string) => route(prompt, { useCases })
const top = (prompt: string) => decide(prompt).play?.id ?? null
const hookRoute = async (prompt: string) => decide(prompt)

afterAll(() => clearActivePlay())

describe('one router for the ask path and the prompt hook', () => {
  test('the golden set covers every platform, every play folder and prompts with no platform', () => {
    expect(golden.length).toBeGreaterThanOrEqual(80)
    const folders = new Set(useCases.map((u) => folderOf(u.id)))
    const named = new Set(golden.flatMap((g) => platformsOf(contentWords(g.prompt))))
    for (const folder of folders) if (isPlatformFolder(`${folder}/x`)) expect(named.has(folder)).toBe(true)
    expect(named.has('linkedin')).toBe(true)
    expect(golden.filter((g) => !platformsOf(contentWords(g.prompt)).length).length).toBeGreaterThan(20)
    for (const g of golden) if (!['menu', 'none'].includes(g.expect)) expect(useCases.some((u) => u.id === g.expect)).toBe(true)
  })

  test('every golden prompt routes to its expected play, menu or none, the same on both entry points', async () => {
    const wrong: string[] = []
    for (const [i, g] of golden.entries()) {
      const scope = playScope(`golden:${i}`)
      const asked = askAnswer(g.prompt, scope)
      const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: g.prompt }, hookRoute)
      const hookOutcome = ['notAPrompt', 'trivial'].includes(hooked.outcome) ? 'none' : hooked.outcome
      if (asked.routed !== g.expect || hookOutcome !== g.expect) wrong.push(`${g.prompt}: expected ${g.expect}, ask ${asked.routed}, hook ${hookOutcome}`)
      if (g.menu && !(hooked.menu ?? []).includes(g.menu)) wrong.push(`${g.prompt}: the menu lacks ${g.menu}`)
      const loaded = asked.play?.id ?? null
      if (loaded !== (['menu', 'none'].includes(g.expect) ? null : g.expect)) wrong.push(`${g.prompt}: ask loaded ${loaded}`)
    }
    expect(wrong).toEqual([])
  }, 60_000)

  test('no prompt naming one platform activates a play filed under another platform', () => {
    for (const g of golden) {
      const named = platformsOf(contentWords(g.prompt))
      const play = top(g.prompt)
      if (named.length !== 1 || !play || !isPlatformFolder(play)) continue
      expect(folderOf(play)).toBe(named[0])
    }
    for (const platform of ['discord', 'slack', 'instagram', 'reddit', 'facebook', 'linkedin', 'twitter']) {
      for (const verb of ['reply to my dms on', 'read the chat on', 'send a message on', 'react to that on', 'post on']) {
        const play = top(`${verb} ${platform}`)
        if (play && isPlatformFolder(play)) expect(folderOf(play)).toBe(platform)
      }
    }
  })
})

describe('the scoring', () => {
  test('a placeholder is not a word', () => {
    expect(contentWords('reply in the <server> server')).toEqual(['reply', 'server'])
    const serverReply = useCases.find((u) => u.id === 'discord/serverReply')!
    expect(phrasesOf(serverReply).some((p) => p === 'reply to <someone> in <server>')).toBe(false)
  })

  test('platform synonyms name their platform', () => {
    expect(platformsOf(contentWords('quote that tweet'))).toEqual(['twitter'])
    expect(platformsOf(contentWords('dm him on x'))).toEqual(['twitter'])
    expect(platformsOf(contentWords('post in the subreddit'))).toEqual(['reddit'])
    expect(platformsOf(contentWords('the guild and the server'))).toEqual(['discord'])
    expect(platformsOf(contentWords('the workspace'))).toEqual(['slack'])
    expect(platformsOf(contentWords('the marketplace listing'))).toEqual(['facebook'])
    expect(platformsOf(contentWords('fix the typecheck error'))).toEqual([])
  })

  test('a tie activates nothing and is never broken by folder order', () => {
    const tied = decide('reply to her')
    expect(tied.outcome).toBe('menu')
    expect(tied.play).toBeNull()
    const ids = tied.menu.map((m) => m.id)
    expect(new Set(ids.map(folderOf)).size).toBeGreaterThan(1)
    const reversed = route('reply to her', { useCases: [...useCases].reverse() })
    expect(reversed.outcome).toBe('menu')
    expect(reversed.menu.map((m) => m.id)).toEqual(ids)
  })

  test('a short prompt that matches a phrase is routed, not dropped as trivial', () => {
    expect(top('bossmaxxing')).toBe('inbox/bossMaxxing')
    expect(top('triage this')).toBe('inbox/triage')
    expect(decide('ok').skipped).toBeUndefined()
    expect(decide('ok').outcome).toBe('none')
  })

  test("matt's prompts from 2026-11-07 still land on the play he meant", () => {
    expect(top('message the people who are new to following me')).toBe('twitter/replyGuyFunnel')
    expect(top('you are meant to reply guy them first and foremost, send a meme to the tweet')).toBe('twitter/replyGuyFunnel')
    expect(top('read my instagram dms')).toBe('instagram/dmReply')
    expect(top('send a vn to the group saying we are live')).toBe('inbox/voiceNote')
  })

  test('dense scores are an optional signal the same router takes', () => {
    const dense = new Map([['twitter/dmInbox', { score: 0.95, text: 'who is waiting on me' }]])
    const decision = route('go through who wrote to me', { useCases, dense, thresholds: { default: 0.6 } })
    expect(decision.play?.id).toBe('twitter/dmInbox')
    expect(route('go through who wrote to me on discord', { useCases, dense }).play).toBeNull()
  })

  test('outcomeOf names the play, a menu or none', () => {
    expect(outcomeOf(decide('bossmaxxing'))).toBe('inbox/bossMaxxing')
    expect(outcomeOf(decide('reply to her'))).toBe('menu')
    expect(outcomeOf(decide('what is the weather in lisbon'))).toBe('none')
  })
})

describe('the router text', () => {
  test('is written as statements, names getGuide for a clear match and lists a menu otherwise', () => {
    const decision = decide('message the people who are new to following me')
    const text = playMatchText(decision.matches)
    expect(text).toContain('>>> PLAY MATCH')
    expect(text).toContain('getGuide({ useCase: "twitter/replyGuyFunnel" })')
    expect(text).not.toMatch(/\b(load it|follow its steps|decide in one line|before any tool)\b/i)
    const menu = playMatchText([], decide('reply to her').menu)
    expect(menu).toContain('>>> MAYBE A PLAY')
    expect(menu).toContain('none of them is a clear match')
    expect(text).not.toContain('matt')
  })
})
