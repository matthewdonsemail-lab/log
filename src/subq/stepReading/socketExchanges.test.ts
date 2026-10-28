import { describe, expect, test } from 'bun:test'
import { exchangesOf, frameNameOf } from './helpers/exchangesOf'

const at = (iso: string) => Date.parse(iso) / 1000

const har = {
  log: {
    entries: [
      {
        startedDateTime: '2026-10-28T06:44:23.000Z',
        time: 3140,
        request: { method: 'POST', url: 'https://discord.com/api/v9/channels/1555254123148873869/messages', headers: [{ name: 'sec-fetch-dest', value: 'empty' }], postData: { text: '{"content":"yo jilly"}' } },
        response: { status: 200, content: { mimeType: 'application/json', text: '{"id":"1564892578162147328"}' } },
      },
      {
        startedDateTime: '2026-10-28T06:44:23.500Z',
        time: 0,
        request: { method: 'GET', url: 'wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream', headers: [] },
        response: { status: 101, content: { mimeType: 'x-websocket' } },
        _webSocketMessages: [
          { type: 'receive', time: at('2026-10-28T06:45:10.000Z'), opcode: 2, data: JSON.stringify({ op: 0, t: 'MESSAGE_CREATE', s: 42, d: { id: '1564892766478008361', content: 'deepseek-v4.1-flash', author: { username: 'Jilly' } } }) },
          { type: 'send', time: at('2026-10-28T06:44:30.000Z'), opcode: 1, data: JSON.stringify({ op: 1, d: 41 }) },
          { type: 'receive', time: at('2026-10-28T06:44:31.000Z'), opcode: 2, data: 'AAAA', _encoding: 'base64' },
        ],
      },
    ],
  },
}

describe('socket frames in a step', () => {
  test('each frame is an exchange named for its event, in time order with the http calls', () => {
    const ex = exchangesOf(har, new Set(), [])
    expect(ex.map((e) => `${e.method} ${e.name}`)).toEqual([
      'POST apiV9Channels1555254123148873869Messages',
      'SEND ws op1',
      'RECV ws gateway.discord.gg',
      'RECV ws MESSAGE_CREATE',
    ])
    const pushed = ex.find((e) => e.name === 'ws MESSAGE_CREATE')!
    expect(pushed.kind).toBe('socket')
    expect(pushed.offsetMs).toBe(47_000)
    expect((pushed.answer as { d: { content: string } }).d.content).toBe('deepseek-v4.1-flash')
  })

  test('a frame that could not be decoded says so instead of pretending', () => {
    const encoded = exchangesOf(har, new Set(), []).find((e) => e.name === 'ws gateway.discord.gg')!
    expect(encoded.answer).toBe('(base64 frame, 4 chars)')
  })

  test('a frame is named by t, then type, then op', () => {
    expect(frameNameOf({ t: 'TYPING_START', op: 0 }, 'h')).toBe('ws TYPING_START')
    expect(frameNameOf({ type: 'ping' }, 'h')).toBe('ws ping')
    expect(frameNameOf({ op: 11 }, 'h')).toBe('ws op11')
    expect(frameNameOf('text', 'gateway.discord.gg')).toBe('ws gateway.discord.gg')
  })
})
