import { describe, expect, test } from 'bun:test'
import { appendFileSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LIVE_ACTIONS, parseInspectAction, renderInspectStep, sendInspectCommand } from './index'

describe('parseInspectAction', () => {
  test('knows each action and its arguments', () => {
    expect(parseInspectAction(['snapshot'])).toEqual({ ok: true, action: 'snapshot', args: [] })
    expect(parseInspectAction(['type', 'e12', 'Allentown', 'Trash'])).toEqual({ ok: true, action: 'type', args: ['e12', 'Allentown', 'Trash'] })
    expect(parseInspectAction(['click'])).toMatchObject({ ok: false })
    expect(parseInspectAction(['hover'])).toMatchObject({ ok: false })
    // Warm-up actions (rule 35): ranges are optional for scroll and dwell.
    expect(parseInspectAction(['scroll'])).toEqual({ ok: true, action: 'scroll', args: [] })
    expect(parseInspectAction(['scroll', '4-7', '300-600'])).toEqual({ ok: true, action: 'scroll', args: ['4-7', '300-600'] })
    expect(parseInspectAction(['openAny', '/marketplace/item/', '2-4'])).toMatchObject({ ok: true, action: 'openAny' })
    expect(parseInspectAction(['clickAny', 'button'])).toMatchObject({ ok: false })
    expect(parseInspectAction(['dwell', '2-4'])).toEqual({ ok: true, action: 'dwell', args: ['2-4'] })
  })

  test('goto only takes Facebook', () => {
    expect(parseInspectAction(['goto', 'https://www.facebook.com/me'])).toMatchObject({ ok: true })
    expect(parseInspectAction(['goto', 'https://accountscenter.facebook.com/profiles'])).toMatchObject({ ok: true })
    expect(parseInspectAction(['goto', 'https://evil.example/facebook.com'])).toMatchObject({ ok: false })
  })

  test('click, type, press, solve, signIn and code are the actions that act on Facebook (rule 8)', () => {
    expect([...LIVE_ACTIONS].sort()).toEqual(['click', 'clickAny', 'clickRole', 'code', 'fillRole', 'likePost', 'postButton', 'press', 'setLocation', 'signIn', 'solve', 'type', 'upload', 'uploadRole'])
  })
})

describe('sendInspectCommand', () => {
  test('appends the command and returns the reply with its id', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'logInspect'))
    const current = { account: 'a', runDir: dir, commandsPath: join(dir, 'commands.jsonl'), repliesPath: join(dir, 'replies.jsonl'), startedAt: '' }
    appendFileSync(current.commandsPath, '')
    const pending = sendInspectCommand(current, 'snapshot', [], 5000, 10)
    await new Promise((r) => setTimeout(r, 30))
    const sent = JSON.parse(readFileSync(current.commandsPath, 'utf8').trim()) as { id: string; action: string }
    expect(sent.action).toBe('snapshot')
    appendFileSync(current.repliesPath, `${JSON.stringify({ id: 'other', result: { ok: false } })}\n${JSON.stringify({ id: sent.id, result: { ok: true, step: '01_snapshot' } })}\n`)
    expect(await pending).toEqual({ ok: true, step: '01_snapshot' })
  })

  test('no reply in time is null', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'logInspect'))
    const current = { account: 'a', runDir: dir, commandsPath: join(dir, 'c.jsonl'), repliesPath: join(dir, 'r.jsonl'), startedAt: '' }
    expect(await sendInspectCommand(current, 'snapshot', [], 50, 10)).toBeNull()
  })
})

describe('renderInspectStep', () => {
  test('shows the page, the requests, rea and the refs to act on', () => {
    const text = renderInspectStep({
      ok: true,
      step: '02_gotoHttpsWwwFacebook',
      url: 'https://www.facebook.com/checkpoint/1/',
      title: 'Facebook',
      requests: 3,
      notable: ['GET 302 /me -> https://www.facebook.com/checkpoint/1/ (12 ms)'],
      rea: { code: 0, evidenceId: 'ev_1', records: 3 },
      interactive: ['- button "Continue" [ref=e5]'],
      folder: '/runs/x/steps/02'
    })
    expect(text).toContain('GET 302 /me')
    expect(text).toContain('ev_1')
    expect(text).toContain('[ref=e5]')
  })

  test('never shows what is typed in a field (rule 21)', () => {
    const text = renderInspectStep({ ok: true, step: '03_signin', url: 'u', interactive: ['- textbox "Password" [ref=e24]: secretValue', '- textbox "Email or phone" [ref=e21]: someone@example.com', '- button "Log In" [ref=e27]'] })
    expect(text).not.toContain('secretValue')
    expect(text).not.toContain('someone@example.com')
    expect(text).toContain('textbox "Password" [ref=e24]: <redacted>')
    expect(text).toContain('button "Log In"')
  })
})
