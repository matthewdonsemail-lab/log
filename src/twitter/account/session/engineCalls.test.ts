import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const python = join(import.meta.dir, '..', '..', '..', '..', 'python')

function engine(script: string): unknown {
  const state = mkdtempSync(join(tmpdir(), 'logTwitterState'))
  const head = [
    'import asyncio, json, sys, time',
    "sys.path.insert(0, '.')",
    'from twitterApi import engine as e',
    'from twikit import Client',
    "KEY = __import__('base64').b64encode(bytes(range(48))).decode()",
    "STATE = {'key': KEY, 'animationKey': 'ab12cd34ef560000', 'rowIndex': 2, 'keyBytesIndices': [12, 14, 7]}",
  ].join('\n')
  const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', `${head}\n${script}`], {
    cwd: python,
    encoding: 'utf8',
    env: { ...process.env, LOG_TWITTER_STATE: state },
  })
  if (run.status !== 0) throw new Error(run.stderr)
  return JSON.parse(run.stdout)
}

describe('every X engine call on one account waits its turn, spaced like a person', () => {
  test('the first call on an account waits for nothing', () => {
    expect(engine("print(json.dumps(e.spacing_wait('acct')))")).toBe(0)
  })

  test('a call right after another waits out the drawn gap', () => {
    const wait = engine("e.mark_call('acct', now=1000.0)\nprint(json.dumps(e.spacing_wait('acct', now=1001.0, draw=lambda a, b: 7.0)))")
    expect(wait).toBe(6)
  })

  test('a call long after the last one waits for nothing', () => {
    expect(engine("e.mark_call('acct', now=1000.0)\nprint(json.dumps(e.spacing_wait('acct', now=1100.0, draw=lambda a, b: 7.0)))")).toBe(0)
  })

  test('the gap is drawn between 4 and 11 seconds', () => {
    expect(engine('print(json.dumps(list(e.SPACING_SECONDS)))')).toEqual([4, 11])
  })

  test('a second call on the same account waits until the first lets go', () => {
    const order = engine(`
order = []
async def call(name, hold):
    async with e.AccountLock('acct'):
        order.append(name + ' in')
        await asyncio.sleep(hold)
        order.append(name + ' out')
async def both():
    first = asyncio.create_task(call('first', 1.2))
    await asyncio.sleep(0.2)
    await call('second', 0)
    await first
asyncio.run(both())
print(json.dumps(order))`)
    expect(order).toEqual(['first in', 'first out', 'second in', 'second out'])
  })

  test('a call that waits too long for the account is refused, not run', () => {
    const answer = engine(`
async def blocked():
    async with e.AccountLock('acct'):
        try:
            async with e.AccountLock('acct', wait_seconds=0.6):
                return 'ran'
        except e.AccountBusy:
            return 'accountBusy'
print(json.dumps(asyncio.run(blocked())))`)
    expect(answer).toBe('accountBusy')
  })
})

describe('the transaction key is worked out once and kept, not by loading x.com before every call', () => {
  test('a kept key is restored on the next call, so the home page is not loaded again', () => {
    const restored = engine(`
first = Client()
first.client_transaction.restore(STATE)
e.keep_transaction(first, 'acct', now=1000.0)
second = Client()
print(json.dumps([e.restore_transaction(second, 'acct', now=2000.0), second.client_transaction.state() == STATE]))`)
    expect(restored).toEqual([true, true])
  })

  test('a key kept more than 3 hours ago is worked out again', () => {
    const restored = engine(`
first = Client()
first.client_transaction.restore(STATE)
e.keep_transaction(first, 'acct', now=1000.0)
print(json.dumps(e.restore_transaction(Client(), 'acct', now=1000.0 + 3 * 3600 + 1)))`)
    expect(restored).toBe(false)
  })

  test('an account with no kept key starts from the home page as before', () => {
    expect(engine("print(json.dumps(e.restore_transaction(Client(), 'acct')))")).toBe(false)
  })
})
