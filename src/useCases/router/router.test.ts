import { afterAll, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hookAnswer } from '../../contextLayer/hook/index'
import { askAnswer } from '../../mcp/server/helpers/guideAnswer.ts'
import { clearActivePlay, playScope } from '../../mcp/server/helpers/activePlay.ts'
import { listUseCases } from '../../mcp/server/helpers/guides.ts'
import { askOf, buildMeaningIndex, playToolsOf, contentWords, folderOf, fuseSkills, fuseTools, isPlatformFolder, loadToolFacts, meaningWithin, openMeaningIndex, outcomeOf, phrasesOf, platformsOf, playMatchText, rankTools, route, routerCatalog, routerIndexState, routerSection, shippedSkills, toolMatchText } from './client'
import { asksToWrite, callOf, catalogHash, fillOf, meaningRanks, playSkipOf, reciprocalRankFusion, skillOf, stepRowsOf, writesToAccount } from './helpers'
import { GOLDEN_FILE, ROUTER_INDEX_NAME, ROUTER_MEANING_FILE, TOOL_GOLDEN_FILE, TOOL_TEXT_BUDGET } from './types'
import type { CatalogKind, GoldenPrompt, RouterGolden, RouterMeaning, RouterMeaningFixture, ToolFusion, ToolGolden } from './types'
import { hashEmbedder } from '../../search/conversations/helpers/embed.ts'
import { aiIndexOf } from '../../inbox/store/index'
import { openDatabase } from '../../storage/schema/client'
import { loadDenylist } from '../../privacy/scan/client.ts';
import { ownerNameIn } from '../../surface/scorecard/helpers/measure.ts';

const noNames = () => ''

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
      const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: g.prompt }, hookRoute, undefined, noNames)
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

  test("the owner's prompts from 2026-11-07 still land on the play he meant", () => {
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
    expect(ownerNameIn([{ path: 'router', text }], loadDenylist().filter((term) => /^[A-Za-z]+$/.test(term)))).toEqual([])
  })
})

const toolGolden = JSON.parse(readFileSync(join(import.meta.dir, 'fixtures', TOOL_GOLDEN_FILE), 'utf8')) as ToolGolden[]

describe('the tool ranking', () => {
  test('words alone rank the expected tool first in 30 of the 49 tool asks and in the top 3 in 32, and inject nothing for status questions or asks that are not about log', () => {
    const facts = loadToolFacts()
    const names = new Set(facts.map((f) => f.name))
    for (const g of toolGolden) for (const name of g.expect) expect(names.has(name)).toBe(true)
    const asks = toolGolden.filter((g) => g.expect.length)
    const shown = (prompt: string) => toolMatchText(prompt, useCases).tools
    const first = asks.filter((g) => g.expect.includes(shown(g.prompt)[0] ?? '')).length
    const three = asks.filter((g) => shown(g.prompt).slice(0, 3).some((name) => g.expect.includes(name))).length
    expect(asks.length).toBe(49)
    expect(first).toBe(30)
    expect(three).toBe(32)
    for (const g of (toolGolden as RouterGolden[]).filter((g) => !g.expect.length && !g.skills?.length)) expect(shown(g.prompt)).toEqual([])
  })

  test('the slow summary ask names discordRead, filling the person only when a stored chat is linked to them, inside the budget', () => {
    const prompt = 'can you summarise the discord convo with linus_k tell me about some opportunities on discord show me the stats'
    const plain = toolMatchText(prompt, useCases)
    expect(plain.tools[0]).toBe('discordRead')
    expect(plain.text).toContain('discordRead { account, channel }')
    expect(plain.text).not.toContain('linus_k')
    const { text } = toolMatchText(prompt, useCases, loadToolFacts(), (word) => (word === 'linus_k' ? 'linus_k' : null))
    expect(text).toContain('discordRead { account, channel: "linus_k" }')
    expect(text).toContain("Use these; don't parse log output with scripts.")
    expect(text.length).toBeLessThanOrEqual(TOOL_TEXT_BUDGET)
  })

  test('a named platform drops the tools of every other platform and a read ask names no write tool', () => {
    const facts = new Map(loadToolFacts().map((f) => [f.name, f]))
    for (const g of toolGolden) {
      const shown = toolMatchText(g.prompt, useCases).tools
      for (const name of g.never ?? []) expect(shown).not.toContain(name)
      const named = platformsOf(contentWords(g.prompt))
      for (const name of shown) {
        const platform = facts.get(name)?.platform
        if (named.length && platform) expect(named).toContain(platform)
        if (!asksToWrite(g.prompt)) expect(writesToAccount(facts.get(name)!)).toBe(false)
      }
    }
    expect(asksToWrite('reply to linus_k on discord')).toBe(true)
    expect(asksToWrite('summarise the discord convo with linus_k')).toBe(false)
  })

  test('a named platform filters tools, never adds one', () => {
    for (const name of rankTools('list my slack chats', useCases).map((m) => m.name)) expect(name.startsWith('discord') || name.startsWith('twitter')).toBe(false)
    expect(rankTools('how slow is log', useCases)[0]?.name).toBe('timing')
    expect(rankTools('ok', useCases)).toEqual([])
  })

  test('a call template fills the person, the server and the words from the ask', () => {
    const fill = fillOf('search the buildspace server for launch week with grace_ships', new Set(['search', 'launch']), ['discord'], (word) => (word === 'grace_ships' ? 'grace_ships' : null))
    expect(fill).toEqual({ platforms: ['discord'], server: 'buildspace', words: 'launch week with grace_ships', name: 'grace_ships' })
    expect(fillOf('go through what i said to bme in that chat', new Set(), []).name).toBeUndefined()
    expect(toolMatchText('go through what i said to bme in that chat and read it', useCases).text).not.toContain('bme')
    const facts = { name: 'discordSearch', platform: 'discord', summary: '', flags: ['account', 'server', 'query', 'from'], required: ['account', 'server', 'query'], notes: '', effect: 'read' }
    expect(callOf(facts, { platforms: [], server: 'buildspace', words: 'launch week' })).toBe('discordSearch { account, server: "buildspace", query: "launch week" }')
    expect(callOf({ ...facts, name: 'inboxWaiting', platform: null, flags: ['platform'], required: [] }, { platforms: ['discord'] })).toBe('inboxWaiting { platform: "discord" }')
  })

  test('a play page lends its asks to the tools its steps table names', () => {
    expect(stepRowsOf('| # | Step | Tool | Done when |\n| --- | --- |\n| 3 | Find the group | `discordChats` | found |\n| 4 | Read it | `discordRead` { account } | read |')).toEqual([
      { step: 'Find the group', tools: ['discordChats'] },
      { step: 'Read it', tools: ['discordRead'] },
    ])
  })

  test('a status question to the agent names no tool', async () => {
    const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: 'how much longer will it take here?' }, hookRoute, undefined, noNames)
    expect(hooked.tools).toBeUndefined()
    expect(hooked.text).not.toContain('Tools for this ask')
  })

  test('the prompt hook adds the tools section after the play text and keeps the play outcome', async () => {
    const prompt = 'summarise the discord convo with grace_ships'
    const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt }, hookRoute, undefined, noNames)
    expect(hooked.tools?.[0]).toBe('discordRead')
    expect(hooked.text).toContain('>>> Tools for this ask')
    expect(hooked.outcome).toBe(outcomeOf(decide(prompt)))
  })
})

const routerMeaningFixture = JSON.parse(readFileSync(join(import.meta.dir, 'fixtures', ROUTER_MEANING_FILE), 'utf8')) as RouterMeaningFixture
const routerGolden = toolGolden as RouterGolden[]
const recorded = (prompt: string): RouterMeaning | null => {
  const kinds = routerMeaningFixture.prompts[prompt]
  if (!kinds) return null
  const hits = (kind: CatalogKind) => (kinds[kind] ?? []).map(([id, score]) => ({ id, score }))
  return { model: routerMeaningFixture.model, play: hits('play'), tool: hits('tool'), skill: hits('skill'), ms: 0 }
}

describe('the meaning router', () => {
  test('the catalog holds every play, every tool and every shipped skill, and its hash moves with any text', () => {
    const facts = loadToolFacts()
    const skills = shippedSkills()
    const items = routerCatalog(useCases, facts, skills)
    expect(items.filter((i) => i.kind === 'play').length).toBe(useCases.length)
    expect(items.filter((i) => i.kind === 'tool').length).toBe(facts.length)
    expect(items.filter((i) => i.kind === 'skill').map((i) => i.id).sort()).toEqual(skills.map((s) => s.name).sort())
    expect(skills.some((s) => s.play === 'twitter/dmInbox')).toBe(true)
    expect(skills.some((s) => s.name === 'callTiming' && !s.play)).toBe(true)
    const changed = items.map((i, at) => (at === 0 ? { ...i, texts: [...i.texts, { text: 'one more way to ask', source: 'own' as const }] } : i))
    expect(catalogHash(changed, 'm')).not.toBe(catalogHash(items, 'm'))
    expect(catalogHash(items, 'm')).not.toBe(catalogHash(items, 'other'))
  })

  test('a skill page gives its name, its description, the asks it lists and the play it copies', () => {
    const skill = skillOf('---\nname: demoPlay\ndescription: "Reading things. A log play (docs/useCases/inbox/demoPlay.md): read it."\nwhen_to_use: "Use when the owner asks, in words like: \\"read the thing\\", \\"go over it\\"."\n---\n# body')
    expect(skill).toEqual({ name: 'demoPlay', description: 'Reading things. A log play (docs/useCases/inbox/demoPlay.md): read it.', asks: ['read the thing', 'go over it'], play: 'inbox/demoPlay' })
    expect(skillOf('# no front matter')).toBeNull()
  })

  test('the index is kept in log.db: vectors in embeddings under the model, the catalog hash in aiIndexes, and a changed catalog is not opened', async () => {
    const embedder = hashEmbedder(32)
    const items = routerCatalog(useCases.slice(0, 3), loadToolFacts().slice(0, 5), shippedSkills().slice(0, 2))
    const built = await buildMeaningIndex(items, embedder)
    expect(routerIndexState(items, 'hash').fresh).toBe(true)
    const opened = openMeaningIndex(items, 'hash', 32)
    expect(opened?.hash).toBe(built.hash)
    expect(opened?.vectors.flat().length).toBe(items.reduce((n, i) => n + i.texts.length, 0))
    expect(aiIndexOf(ROUTER_INDEX_NAME)?.model).toBe('hash')
    const fewer = items.slice(1)
    expect(openMeaningIndex(fewer, 'hash', 32)).toBeNull()
    expect(routerIndexState(fewer, 'hash')).toMatchObject({ built: true, fresh: false })
    const ranks = meaningRanks(await embedder.embed([items[0].texts[0].text]), built)
    expect(ranks[items[0].kind][0].id).toBe(items[0].id)
  })

  test('the meaning step falls back to words when the index is not loaded or the budget is blown', async () => {
    const embedder = hashEmbedder(32)
    const items = routerCatalog(useCases.slice(0, 3), loadToolFacts().slice(0, 5), [])
    const index = await buildMeaningIndex(items, embedder)
    expect(await meaningWithin('read my x dms', null, (t) => embedder.embed(t))).toEqual({ meaning: null, fallback: 'notLoaded', ms: 0 })
    const slow = (texts: string[]) => new Promise<Float32Array[]>((resolve) => setTimeout(() => resolve(embedder.embed(texts)), 80))
    expect((await meaningWithin('read my x dms', index, slow, 10)).fallback).toBe('overBudget')
    const ok = await meaningWithin('read my x dms', index, (t) => embedder.embed(t))
    expect(ok.fallback).toBeUndefined()
    expect(ok.meaning?.tool.length).toBeGreaterThan(0)
  })

  test('reciprocal rank fusion adds 1 / (60 + rank) from each list', () => {
    const fused = reciprocalRankFusion([['a', 'b'], ['b', 'c']])
    expect(fused.map((f) => f.id)).toEqual(['b', 'a', 'c'])
    expect(fused[0].score).toBeCloseTo(1 / 62 + 1 / 61, 10)
  })

  test('on the 49 tool asks, words alone rank the tool first in 30 and in the top 3 in 32; fused with the recorded local meaning, 29 and 34; skills 8 and 9 of 18; no status or chat question gets a line', () => {
    const facts = loadToolFacts()
    const skills = shippedSkills()
    const names = new Set(facts.map((f) => f.name))
    const skillNames = new Set(skills.map((s) => s.name))
    for (const g of routerGolden) {
      for (const name of g.expect) expect(names.has(name)).toBe(true)
      for (const name of g.skills ?? []) expect(skillNames.has(name)).toBe(true)
      expect(recorded(g.prompt)).not.toBeNull()
    }
    const asks = routerGolden.filter((g) => g.expect.length)
    const count = (fusion: ToolFusion) => {
      const shown = (g: RouterGolden) => fuseTools(g.prompt, useCases, fusion === 'lexical' ? null : recorded(g.prompt), fusion, facts).matches.map((m) => m.name)
      return { first: asks.filter((g) => g.expect.includes(shown(g)[0] ?? '')).length, three: asks.filter((g) => shown(g).slice(0, 3).some((n) => g.expect.includes(n))).length }
    }
    expect(asks.length).toBe(49)
    expect(count('lexical')).toEqual({ first: 30, three: 32 })
    expect(count('rrf')).toEqual({ first: 29, three: 34 })
    const skillAsks = routerGolden.filter((g) => g.skills?.length)
    const chosen = (g: RouterGolden) => fuseSkills(g.prompt, recorded(g.prompt), skills, 'rrf')
    expect(skillAsks.filter((g) => g.skills!.includes(chosen(g)[0] ?? '')).length).toBe(8)
    expect(skillAsks.filter((g) => chosen(g).some((s) => g.skills!.includes(s))).length).toBe(9)
    for (const g of routerGolden.filter((g) => !g.expect.length && !g.skills?.length)) expect(routerSection(g.prompt, useCases, recorded(g.prompt), { facts, skills }).text).toBe('')
  })

  test('the hook injects the fused section inside the budget and records it as the router span, falling back to words when the service sent no meaning', async () => {
    const prompt = 'send grace_ships a voice note on discord'
    const served = async (p: string) => ({ ...decide(p), meaning: { meaning: recorded(p), ms: 4 } })
    const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt }, served, undefined, noNames)
    expect(hooked.tools?.[0]).toBe('discordVoice')
    expect(hooked.text).toContain('>>> Tools for this ask')
    const section = hooked.text.slice(hooked.text.indexOf('>>> Tools for this ask'))
    expect(section.length).toBeLessThanOrEqual(TOOL_TEXT_BUDGET)
    const span = openDatabase().prepare("SELECT attrs FROM spans WHERE tool = 'hook:UserPromptSubmit:router' ORDER BY startedAt DESC LIMIT 1").get() as { attrs: string }
    expect(JSON.parse(span.attrs)).toMatchObject({ meaning: 'used', provider: 'router', outcome: 'fused' })
    await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt }, async (p) => ({ ...decide(p), meaning: { meaning: null, fallback: 'overBudget', ms: 151 } }), undefined, noNames)
    const late = openDatabase().prepare("SELECT attrs FROM spans WHERE tool = 'hook:UserPromptSubmit:router' ORDER BY rowid DESC LIMIT 1").get() as { attrs: string }
    expect(JSON.parse(late.attrs)).toMatchObject({ meaning: 'overBudget', outcome: 'lexical:overBudget' })
  })

  test("the owner's sign-in asks from a chat reach inbox/signIn through the prompt hook, with sessionsSignIn and browserView among its first tools", async () => {
    const asks = ['sign into discord', 'log me into discord here', 'show me the browser so i can sign in', 'open the browser in the chat so i can log in', 'sign me in in hermes']
    const wrong: string[] = []
    for (const prompt of asks) {
      const served = async (p: string) => ({ ...decide(p), meaning: { meaning: recorded(p), ms: 4 } })
      const hooked = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt }, served, undefined, noNames)
      if (hooked.outcome !== 'inbox/signIn') wrong.push(`${prompt}: ${hooked.outcome}`)
      if (!hooked.text.includes('getGuide({ useCase: "inbox/signIn" })')) wrong.push(`${prompt}: no getGuide`)
      for (const tool of ['sessionsSignIn', 'browserView']) if (!(hooked.tools ?? []).slice(0, 3).includes(tool)) wrong.push(`${prompt}: ${tool} not in ${hooked.tools}`)
    }
    expect(wrong).toEqual([])
  })

  test('a clear play puts the tools its steps name first, and adds nothing without one', () => {
    const prompt = 'log me into discord here'
    expect(playToolsOf(useCases, 'inbox/signIn')).toEqual(['sessionsCheck', 'sessionsSignIn', 'browserView'])
    expect(playToolsOf(useCases, null)).toEqual([])
    const led = routerSection(prompt, useCases, recorded(prompt), { play: 'inbox/signIn' }).tools
    expect(led.slice(0, 3).sort()).toEqual(['browserView', 'sessionsCheck', 'sessionsSignIn'])
    expect(routerSection(prompt, useCases, recorded(prompt)).tools).not.toContain('sessionsSignIn')
  })

  test('a play the words missed is named once, with its skill copy left out', () => {
    const prompt = 'who started following me on x'
    const section = routerSection(prompt, useCases, recorded(prompt), { decision: { ranked: [] } })
    if (section.play) expect(section.skills).not.toContain(shippedSkills().find((s) => s.play === section.play)?.name)
    expect(routerSection(prompt, useCases, recorded(prompt), { playShown: true }).play).toBeNull()
  })
})

describe('a long prompt is routed by its ask, not by every word pasted after it', () => {
  test('askOf keeps the first 120 and the last 40 words, and a short prompt whole', () => {
    expect(askOf('read the chat with grace_ships')).toBe('read the chat with grace_ships')
    const words = Array.from({ length: 2000 }, (_, i) => `w${i}`)
    const asked = askOf(words.join(' ')).split(' ')
    expect(asked).toHaveLength(160)
    expect(asked[0]).toBe('w0')
    expect(asked[119]).toBe('w119')
    expect(asked[120]).toBe('w1960')
    expect(asked.at(-1)).toBe('w1999')
  })
})

describe('a typo-heavy prompt or one about building log names no play', () => {
  test('playSkipOf reads typos and log building, and leaves a clean ask alone', () => {
    expect(playSkipOf('alright so tihs ehre is soemthign thawe nede ot ocnfigure ebcuase its nto wokring')).toBe('typos')
    expect(playSkipOf('open the pr, merge the branch and run the tests')).toBe('buildingLog')
    expect(playSkipOf('reply to grace_ships on discord')).toBeNull()
    expect(playSkipOf('ask linus_k')).toBeNull()
  })

  test('the prompt hook writes no play line for a skipped prompt but still records why', async () => {
    const result = await hookAnswer({ hook_event_name: 'UserPromptSubmit', prompt: 'i am tlaking abotu thsi hree we nede ot maek teh log thign betetr adn sign in' }, async () => null, listUseCases, () => '')
    expect(result.text).not.toContain('PLAY MATCH')
    expect(result.text).not.toContain('MAYBE A PLAY')
    expect(result.outcome).toBe('wordsOnly none')
  })
})
