import { afterAll, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const python = join(import.meta.dir, '..', '..', '..', '..', 'python')
const engine = join(python, 'twitterApi', 'engine.py')
const host = join(python, 'twitterApi', 'host.py')
const state = mkdtempSync(join(tmpdir(), 'logTwitterHost'))
const account = 'hostTestAccount'
const env = { ...process.env, LOG_TWITTER_STATE: state, LOG_TWITTER_HOST: '' }

function call(action: string): Record<string, unknown> {
  const dir = mkdtempSync(join(tmpdir(), 'logTwitterHostCall'))
  const cookiesPath = join(dir, 'cookies.json')
  writeFileSync(cookiesPath, JSON.stringify({ auth_token: 'a'.repeat(40), ct0: 'b'.repeat(40), twid: 'u%3D1' }))
  const spec = join(dir, 'spec.json')
  writeFileSync(spec, JSON.stringify({ action, account, cookiesPath, text: 'hello', userId: '1' }))
  const run = spawnSync(process.env.LOG_PYTHON || 'python', [engine, spec], { encoding: 'utf8', env, timeout: 60_000 })
  return JSON.parse(run.stdout.trim().split('\n').pop() || '{}')
}

function hostInfo(): { pid: number; port: number } {
  return JSON.parse(readFileSync(join(state, account, 'host.json'), 'utf8'))
}

afterAll(() => {
  try {
    process.kill(hostInfo().pid)
  } catch {}
})

describe('one X session per account: every call goes through the same host', () => {
  test('a call starts the account\'s session and is answered there', () => {
    const answer = call('dm')
    expect(answer.code).toBe('notLive')
    expect((answer.xSession as { pid: number }).pid).toBe(hostInfo().pid)
  })

  test('the next call is answered by the same session, not a new one', () => {
    const first = hostInfo().pid
    const answer = call('dm')
    expect((answer.xSession as { pid: number; calls: number }).pid).toBe(first)
    expect((answer.xSession as { calls: number }).calls).toBeGreaterThanOrEqual(2)
  })

  test('a second session for the same account refuses to start', () => {
    const second = spawnSync(process.env.LOG_PYTHON || 'python', [host, account], { encoding: 'utf8', env, timeout: 30_000 })
    expect(second.status).toBe(1)
    expect(second.stdout).toContain('another X session already holds')
  })
})
