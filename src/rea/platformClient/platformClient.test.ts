import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildPlatformClientMap, needlesOf, operationOf, readsOf, requestNameOf, slicesFor, stablePath } from './index'

const bundle = [
  'function ai(e){return ni({operation:`ExposeVariant`,variables:{input:e}})}',
  'function oi(e){return ni({operation:`ExposeVariantBatch`,variables:{inputs:e}})}',
  'var ops={};ops.ExposeVariant=`ExposeVariant`;',
  'async function ln(){let t=document.cookie,n=await fetch(`/svc/shreddit/token`,{method:`POST`,body:JSON.stringify({csrf_token:t})});return n.ok?await n.json():null}'
].join('\n')

describe('reading a platform client', () => {
  test('a request is named by its GraphQL operation, else by its path without ids, subreddits or hashes', () => {
    expect(stablePath('/svc/shreddit/more-comments/r/AskReddit/t3_1x8sr8s')).toBe('/svc/shreddit/more-comments')
    expect(stablePath('/svc/shreddit/partial/XpstDl/crosspost-dialog')).toBe('/svc/shreddit/partial/crosspost-dialog')
    expect(stablePath('/svc/shreddit/partial/kvBblQ/mod-content-actions')).toBe('/svc/shreddit/partial/mod-content-actions')
    expect(requestNameOf('www.reddit.com', '/svc/shreddit/notifications-inbox-content/20/route', null)).toBe('svcShredditNotificationsInboxContentRoute')
    expect(requestNameOf('w3-reporting.reddit.com', '/reports', null)).toBe('w3ReportingReports')
    expect(stablePath('/svc/shreddit/community-hover-card/iphone')).toBe('/svc/shreddit/community-hover-card')
    expect(needlesOf('w3-reporting.reddit.com', '/reports', null)).toEqual(['w3-reporting.reddit.com/reports', 'w3-reporting.reddit.com'])
    expect(operationOf({ operation: 'ExposeVariant', variables: {} }, '/svc/shreddit/graphql')).toBe('ExposeVariant')
    expect(operationOf({ query: { a: 1 }, body: { operationName: 'ChatRedditors' } }, '/svc/shreddit/graphql')).toBe('ChatRedditors')
    expect(operationOf({ operation: 'X' }, '/svc/shreddit/events')).toBeNull()
  })

  test('an operation is found where it is sent, never in a lookalike or an enum of names', () => {
    const slices = slicesFor(needlesOf('www.reddit.com', '/svc/shreddit/graphql', 'ExposeVariant'), [{ file: 'b.js', text: bundle }], { exact: true })
    expect(slices.map((s) => s.text)).toEqual(['function ai(e){return ni({operation:`ExposeVariant`,variables:{input:e}})}'])
  })

  test('an endpoint is found where its path is fetched', () => {
    const slices = slicesFor(needlesOf('www.reddit.com', '/svc/shreddit/token', null), [{ file: 'b.js', text: bundle }])
    expect(slices[0].text).toStartWith('async function ln()')
    expect(slices[0].calledFrom).toBe('b.js:4 ln')
  })

  test("what an answer reads is its fields two levels down", () => {
    expect(readsOf({ data: { user: { id: 1 }, ok: true }, errors: null })).toEqual(['data.user', 'data.ok', 'errors'])
  })

  test("a run's platform calls become docs, each with its code and rea's reading", async () => {
    const root = mkdtempSync(join(tmpdir(), 'platformClient'))
    const run = join(root, 'runs', 'inspect', '20261025T000000_probe', 'adsPower')
    mkdirSync(join(run, 'scripts'), { recursive: true })
    writeFileSync(join(run, 'scripts', 'script0.js'), bundle)
    writeFileSync(join(run, 'steps.jsonl'), `${JSON.stringify({ at: '2026-10-25T00:00:00.000Z', step: 'step 1: goto https://www.reddit.com/' })}\n`)
    const entry = (url: string, body: string, answer: string) => ({ startedDateTime: '2026-10-25T00:00:01.000Z', time: 80, request: { method: 'POST', url, headers: [{ name: 'sec-fetch-dest', value: 'empty' }], postData: { mimeType: 'application/json', text: body } }, response: { status: 200, content: { mimeType: 'application/json', text: answer } } })
    writeFileSync(join(run, 'session.har'), JSON.stringify({ log: { entries: [
      entry('https://www.reddit.com/svc/shreddit/graphql', '{"operation":"ExposeVariant","variables":{"input":{}}}', '{"data":{"exposeVariant":{"ok":true}}}'),
      entry('https://www.facebook.com/api/graphql/', 'a=1', '{}')
    ] } }))
    const reads: string[] = []
    const note = await buildPlatformClientMap({
      platform: 'reddit',
      capturesRoot: root,
      outDir: join(root, 'rea'),
      docsDir: join(root, 'docs'),
      storePath: join(root, 'facts.json'),
      log: () => {},
      runner: async (args) => {
        reads.push(readFileSync(join(args[1], 'slice1.js'), 'utf8'))
        return { code: 0, stdout: JSON.stringify({ evidence_id: 'ev_probe' }), stderr: '' }
      }
    })
    expect(note).toContain('1 requests from 1 runs')
    expect(reads).toEqual(['function ai(e){return ni({operation:`ExposeVariant`,variables:{input:e}})}'])
    const doc = readFileSync(join(root, 'docs', 'experiments', 'ExposeVariant.md'), 'utf8')
    expect(doc).toContain('`ev_probe`')
    expect(doc).toContain('| Kind | mutation |')
    expect(doc).toContain('`input`')
    expect(doc).toContain('script0.js:1 ai')
  })
})
