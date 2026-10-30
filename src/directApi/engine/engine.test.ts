import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { toolsFromCommands } from '../../mcp/server/helpers/toolsFromCommands'
import { COMMANDS } from '../../cli/runner/index'
import { commandEngine, directGate, engineContext, engineLine, localEngineStates, outcomeOf, writeLocalSession, writesPerDayOf } from './index'
import type { FacebookAccount } from '../../marketplace/socialAccount/index'

const account = {
  accountName: 'a1',
  platform: 'FACEBOOK',
  status: 'needsLogin',
  cookies: [{ name: 'c_user', value: '1' }, { name: 'xs', value: '2' }],
  proxy: 'http://u:p@h.example:8080',
  homeCountry: 'US',
  homeCity: 'Plymouth',
  proxyExitCountry: 'US',
  activeHoursStart: null,
  activeHoursEnd: null
} as unknown as FacebookAccount

describe('the engine is declared in code', () => {
  test('read runs on the direct API first, a browser command on the browser, and the rest on none', () => {
    expect(commandEngine('read')).toBe('directApiFirst')
    expect(commandEngine('join')).toBe('browser')
    expect(commandEngine('errors')).toBe('none')
    expect(engineLine('join')).toBeNull()
  })

  test("no MCP description carries the engine line: the library behind a call gives the agent nothing to act on", () => {
    const tools = toolsFromCommands(COMMANDS.filter((c) => c.name === 'read'))
    for (const name of ['readGroup', 'readGroupLive']) expect(tools.find((t) => t.name === name)!.description).not.toContain('Engine: the direct-API engine')
  })
})

describe('the direct gate is not accountStatus', () => {
  test('a needsLogin account with a session and a proxy in its country passes; deactivated, no session or a foreign exit does not', () => {
    const now = new Date('2026-10-25T16:00:00Z')
    expect(directGate(account, { bypass: true, now })).toEqual({ ok: true })
    expect(directGate({ ...account, status: 'deactivated' } as FacebookAccount, { bypass: true, now }).ok).toBe(false)
    expect(directGate({ ...account, cookies: [] } as unknown as FacebookAccount, { bypass: true, now }).ok).toBe(false)
    expect(directGate({ ...account, proxyExitCountry: 'VN' } as FacebookAccount, { bypass: true, now }).ok).toBe(false)
  })

  test("Facebook's answer decides: checkpoint and a governor block stop, loggedOut hands over", () => {
    expect(outcomeOf({ ok: true, loginState: 'loggedIn', rows: [1] })).toMatchObject({ ok: true, sessionState: 'loggedIn', rows: [1] })
    expect(outcomeOf({ ok: false, code: 'loginCheckpoint', loginState: 'checkpoint' })).toMatchObject({ ok: false, stop: true, sessionState: 'checkpoint' })
    expect(outcomeOf({ ok: false, code: 'governorBlocked', loginState: 'loggedIn' })).toMatchObject({ stop: true })
    expect(outcomeOf({ ok: false, code: 'loginLoggedOut', loginState: 'loggedOut' })).toMatchObject({ stop: false, sessionState: 'loggedOut' })
    expect(outcomeOf({ ok: false, code: 'accountWarning', accountWarnings: ['unusual activity'], loginState: 'loggedIn' })).toMatchObject({ stop: false, sessionState: 'accountWarning' })
  })
})

describe('the hook context comes from each account folder', () => {
  test('session state and governor use per account, a pause said loudly', () => {
    const root = mkdtempSync(join(tmpdir(), 'fbkState'))
    const now = new Date('2026-10-25T10:00:00Z')
    writeLocalSession('a1', 'loggedIn', now, root)
    mkdirSync(join(root, 'a2'))
    writeFileSync(join(root, 'a2', 'governor_state.json'), JSON.stringify({ day: '2026-10-25', hour_count: 3, day_count: 12, mutation_count: 1, cooldown_until: now.getTime() / 1000 + 600, soft_blocks_seen: 1 }))
    const states = localEngineStates(root, now)
    const text = engineContext(states, now)
    expect(text).not.toContain('fbk')
    expect(text).not.toContain('twikit')
    expect(text).toContain('a1: session loggedIn')
    expect(text).toContain('a2: session not read yet, 12/500 requests, 1/40 writes today, PAUSED 10 min')
  })

  test('discord gets 60 writes a day, every other platform 40, and the hook says each one', () => {
    expect(writesPerDayOf('discord')).toBe(60)
    expect(writesPerDayOf('reddit')).toBe(40)
    const now = new Date('2026-10-25T10:00:00Z')
    const text = engineContext([{ account: 'discord d1', writesPerDay: writesPerDayOf('discord'), sessionState: 'loggedIn', checkedAt: null, day: '2026-10-25', today: 50, mutations: 45, cooldownSeconds: 0, softBlocks: 0 }], now)
    expect(text).toContain('discord d1: session loggedIn, 50/500 requests, 45/60 writes today')
  })
})
