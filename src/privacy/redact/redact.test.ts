import { describe, expect, test } from 'bun:test'
import { scanText } from '../scan/index.ts'
import { createRedactor, keyKindOf, redactDoc, redactPatterns } from './index.ts'

const j = (...parts: string[]) => parts.join('')
const tail = 'Q7f3K9m2P8x4R6t1W5y0Z2b4N8c6V3d1'

describe('redactDoc', () => {
  test('tokens, cookies, csrf values and passwords become typed placeholders', () => {
    const doc = [
      j('token ', 'xo', 'xc-', '1234-5678-', tail),
      j('"enc', '_password": "#PWD_BROWSER:5:1700000000:', tail, '"'),
      j('"fb_dtsg": "', tail, '"'),
      j('"password": "', 'hunter', '2hunter2"'),
      j('Cookie: c_user=', '100089', '123456789; xs=', tail),
      j('Authorization: Bear', 'er ', tail, tail),
    ].join('\n')
    const out = redactDoc(doc)
    expect(out).toContain('token <slackToken>')
    expect(out).toContain('"enc_password": "<password>"')
    expect(out).toContain('"fb_dtsg": "<csrfToken>"')
    expect(out).toContain('"password": "<password>"')
    expect(out).toContain('Cookie: <cookie>')
    expect(out).toContain('Authorization: <token>')
    expect(out).not.toContain(tail)
  })

  test('emails, phones and IPs inside free text are replaced', () => {
    const out = redactDoc(j('reach ', 'alice', '@', 'gmail', '.com', ' or ', '+44', '7700', '912345', ' from ', '84.', '17.', '43.', '9', ' or ', '100.', '101.', '2.3'))
    expect(out).toBe('reach <email> or <phone> from <ip> or <ip>')
  })

  test('user ids, names, usernames and message text are numbered consistently within one doc', () => {
    const sent = JSON.stringify({ actorID: '1000891', userID: '1000892', username: 'zorblax', name: 'Zorblax Q', message: { text: 'meet at 5?' } }, null, 2)
    const answer = JSON.stringify({ author_id: '1000892', sender_name: 'Zorblax Q', screen_name: 'zorblax', snippet: 'see you' }, null, 2)
    const out = redactDoc(`Sent:\n${sent}\nAnswered:\n${answer}`)
    expect(out).toContain('"actorID": "<actorId:1>"')
    expect(out).toContain('"userID": "<userId:1>"')
    expect(out).toContain('"author_id": "<userId:1>"')
    expect(out).toContain('"name": "<name:1>"')
    expect(out).toContain('"sender_name": "<name:1>"')
    expect(out).toContain('"username": "<username:1>"')
    expect(out).toContain('"screen_name": "<username:1>"')
    expect(out).toContain('"text": "<messageText>"')
    expect(out).toContain('"snippet": "<messageText>"')
    expect(out).not.toMatch(/Zorblax|zorblax|meet at|1000891/)
  })

  test('numbering restarts per doc and a second redactor keeps its own numbering', () => {
    const a = createRedactor()
    expect(a.redact('"user_id": "11"')).toBe('"user_id": "<userId:1>"')
    expect(a.redact('"user_id": "22"')).toBe('"user_id": "<userId:2>"')
    expect(a.redact('"user_id": "11"')).toBe('"user_id": "<userId:1>"')
    expect(redactDoc('"user_id": "22"')).toBe('"user_id": "<userId:1>"')
  })

  test('JSON escaped inside a string and form-encoded bodies are redacted', () => {
    expect(redactDoc('"variables": "{\\"userID\\":\\"1000891\\",\\"scale\\":1}"')).toBe('"variables": "{\\"userID\\":\\"<userId:1>\\",\\"scale\\":1}"')
    expect(redactDoc(j('av=1000891&__user=1000891&fb_dtsg=', tail, '&doc_id=123'))).toBe('av=<userId:1>&__user=<userId:1>&fb_dtsg=<csrfToken>&doc_id=123')
    expect(redactDoc('https://x.example/profile.php?id=1000891&sk=about')).toBe('https://x.example/profile.php?id=<id:1>&sk=about')
  })

  test('already redacted docs stay the same, and the facts the docs rely on are kept', () => {
    const doc = ['| doc_id | `37551561817767907` |', '"user_id": "<userId:1>"', '"text": "<messageText>"', 'Bearer <token>', '"scale": 2'].join('\n')
    expect(redactDoc(doc)).toBe(doc)
    expect(redactDoc(redactDoc('"user_id": "11"'))).toBe('"user_id": "<userId:1>"')
  })

  test('a redacted doc passes the privacy scan', () => {
    const doc = [j('"c', '_user": "', '1000891', '23456789"'), j('alice', '@', 'gmail', '.com'), j('/ho', 'me/', 'alice', '/x'), j('http://bob:', 'Hx7q9Lm', '@proxy.internal:8080')].join('\n')
    expect(scanText('docs/platforms/x/a.md', doc).length).toBeGreaterThan(0)
    expect(scanText('docs/platforms/x/a.md', redactDoc(doc))).toEqual([])
  })

  test('redactPatterns leaves keys alone and only takes out secret and PII shapes', () => {
    expect(redactPatterns(j('"name": "Zorblax" ', 'alice', '@', 'gmail', '.com'))).toBe('"name": "Zorblax" <email>')
  })

  test('keys are matched whatever their case or separators', () => {
    expect(keyKindOf('X-CSRF-Token')).toBe('csrfToken')
    expect(keyKindOf('actor_id')).toBe('actorId')
    expect(keyKindOf('doc_id')).toBeUndefined()
  })
})

describe('the private denylist', () => {
  const name = ['qu', 'iet', 'sparrow', '77'].join('')
  const id = ['6159', '4000', '000', '001'].join('')
  test('names, ids and emails on it become placeholders, even inside a run folder name', () => {
    const out = redactDoc(`runs/inspect/20261113T044840_${name}/script0.js and ${id} and ${name}x`, [name, id])
    expect(out).toContain('runs/inspect/20261113T044840_<name:1>/script0.js')
    expect(out).toContain('<id:1>')
    expect(out).toContain(`${name}x`)
  })
  test('no denylist leaves the text to the other rules', () => {
    expect(redactDoc(`hello ${name}`)).toBe(`hello ${name}`)
  })
})
