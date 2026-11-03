import { describe, expect, test } from 'bun:test'
import type { TwitterSessionAnswer } from '../../account/session/index'
import { approveQueue, buildQueue, seededRandom } from '../plan/index'
import type { Queue } from '../plan/index'
import { failureOf, runQueue } from './index'
import type { RunDeps } from './types'

const START = Date.parse('2026-11-02T16:00:00Z')

function queueOf(): Queue {
  const queue = buildQueue({ account: 'matthewsoldit', action: 'dm', targets: [{ handle: 'a', userId: '1', text: 'yo a' }, { handle: 'b', userId: '2', text: 'yo b' }], lines: [], sources: [], seed: 1, now: new Date(START) })
  queue.randomRun = { planned: new Date(START).toISOString(), window: '1h', minGap: 300, events: [{ n: 1, kind: 'reply', at: new Date(START + 600_000).toISOString() }, { n: 2, kind: 'reply', at: new Date(START + 1_200_000).toISOString() }] }
  return approveQueue(queue, 'matt', new Date(START))
}

function depsOf(answers: TwitterSessionAnswer[], sent: string[], alerts: string[], logs: string[]): RunDeps {
  let clock = START
  return {
    send: async (item) => (sent.push(item.handle ?? '?'), answers.shift() ?? { ok: true, event: 'sent', conversationId: 'c' }),
    nowMs: () => clock,
    sleep: async (ms) => {
      clock += ms
    },
    rng: seededRandom(5),
    log: (line) => logs.push(line),
    alert: (message) => alerts.push(message),
    takeNudge: () => 0,
    contextChanged: async () => [],
    save: () => {},
  }
}

const refusals: [string, TwitterSessionAnswer][] = [
  ['a 429', { ok: false, code: 'rateLimited', event: 'throttled', detail: 'status: 429, Rate limit exceeded', rateLimitReset: 1 }],
  ["X's 226 looks automated", { ok: false, code: 'CouldNotTweet', event: 'automated', detail: '(226) This request looks like it might be automated' }],
  ['the 344 daily limit', { ok: false, code: 'CouldNotTweet', event: 'dailyLimit', detail: '(344) You have reached your daily limit' }],
  ['a soft block', { ok: false, code: 'cloudflareBlocked', event: 'throttled', detail: 'you have been blocked' }],
  ['the governor', { ok: false, code: 'governorBlocked', detail: 'cooldown active for 660s' }],
  ['a dead session', { ok: false, code: 'sessionDead', event: 'sessionDead', detail: 'X answered HTTP 401' }],
]

describe('a refusal from X stops the run (rule 94)', () => {
  for (const [name, answer] of refusals) {
    test(`${name} stops the run at once, the item stays pending and nothing more is sent`, async () => {
      const queue = queueOf()
      const sent: string[] = []
      const alerts: string[] = []
      const result = await runQueue(queue, depsOf([answer], sent, alerts, []))
      expect(result.state).toBe('halted')
      expect(sent).toEqual(['a'])
      expect(queue.items.map((i) => i.status)).toEqual(['pending', 'pending'])
      expect(queue.randomRun!.events.every((e) => !e.done && !e.skipped)).toBe(true)
      expect(result.refusal).toEqual({ code: answer.code!, detail: answer.detail!, at: expect.stringMatching(/^2026-11-02T16:1\d:\d{2}/) })
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toContain(`REFUSED reply #1 @a: x answered at 2026-11-02 16:1`)
      expect(alerts[0]).toContain(`${answer.code}: ${answer.detail}`)
      expect(alerts[0]).toContain('Nothing goes out on @matthewsoldit until matt starts a run again')
    })
  }

  test('an author over the follower cap is skipped, not a refusal, and the run goes on (rule 121)', async () => {
    const queue = queueOf()
    const sent: string[] = []
    const alerts: string[] = []
    const logs: string[] = []
    const tooBig: TwitterSessionAnswer = { ok: false, code: 'authorTooBig', event: 'tooBig', detail: '@a has 974212 followers, over 1500: too big to reply to yet, so nothing was liked, followed or sent' }
    expect(failureOf(tooBig)).toBe('tooBig')
    const result = await runQueue(queue, depsOf([tooBig], sent, alerts, logs))
    expect(result.state).toBe('finished')
    expect(sent).toEqual(['a', 'b'])
    expect(queue.items.map((i) => i.status)).toEqual(['skipped', 'sent'])
    expect(queue.randomRun!.events[0].skipped).toBe('tooBig')
    expect(alerts).toHaveLength(0)
    expect(logs.join('\n')).toContain('TOO BIG reply #1 @a: @a has 974212 followers, over 1500')
  })

  test('a network drop is not a refusal: it is tried again and the run goes on', async () => {
    const queue = queueOf()
    const sent: string[] = []
    const logs: string[] = []
    const result = await runQueue(queue, depsOf([{ ok: false, code: 'RequestsError', event: 'failed', detail: 'curl: (28) Operation timed out after 30000 milliseconds' }], sent, [], logs))
    expect(result.state).toBe('finished')
    expect(sent).toEqual(['a', 'a', 'b'])
    expect(queue.items.map((i) => i.status)).toEqual(['sent', 'sent'])
    expect(logs.join('\n')).toContain('[retrying] reply #1 @a: the connection dropped with no answer from x')
  })

  test('a connection that keeps dropping stops after its own limit, the item still pending', async () => {
    const queue = queueOf()
    const drop: TwitterSessionAnswer = { ok: false, code: 'RequestsError', event: 'failed', detail: 'curl: (56) Recv failure: Connection was reset' }
    const sent: string[] = []
    const alerts: string[] = []
    const result = await runQueue(queue, depsOf([drop, drop, drop, drop, drop], sent, alerts, []))
    expect(result.state).toBe('halted')
    expect(sent).toEqual(['a', 'a', 'a', 'a'])
    expect(queue.items.map((i) => i.status)).toEqual(['pending', 'pending'])
    expect(alerts[0]).toContain('dropped 4 times in a row')
  })

  test('a 429 that names curl is still a refusal, never a network drop', () => {
    expect(failureOf({ ok: false, code: 'RequestsError', event: 'failed', detail: 'curl: (22) The requested URL returned error: 429' })).toBe('refused')
    expect(failureOf({ ok: false, code: 'RequestsError', event: 'failed', detail: 'curl: (35) Connection reset' })).toBe('network')
  })
})
