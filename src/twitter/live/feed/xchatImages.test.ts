import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const python = join(import.meta.dir, '..', '..', '..', '..', 'python')

function watch(event: string): { lines: { liveEvent: Record<string, unknown> }[]; state: string } {
  const state = mkdtempSync(join(tmpdir(), 'logTwitterState'))
  const script = [
    'import asyncio, json, sys',
    "sys.path.insert(0, '.')",
    'from twitterApi import engine as e',
    'async def no_keys(client, spec):',
    '    return None',
    'e.xchat_read_keys = no_keys',
    'class Client:',
    '    async def watch_xchat(self, seconds=None):',
    `        yield ${event}`,
    '    async def get_xchat_media(self, conversation_id, media_hash_key, key_version):',
    "        return b'picture bytes'",
    '    async def get_user_by_id(self, user_id):',
    "        return type('U', (), {'screen_name': 'HandleA1'})()",
    "spec = {'account': 'matt', 'pinPath': 'pin.json'}",
    "asyncio.run(e.xchat_stream(Client(), {'twid': 'u%3D1'}, spec))",
  ].join('\n')
  const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script], { cwd: python, encoding: 'utf8', env: { ...process.env, LOG_TWITTER_STATE: state } })
  if (run.status !== 0) throw new Error(run.stderr)
  return { lines: run.stdout.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)), state }
}

describe('an image someone sends in X Chat is saved the moment it arrives (rule 139)', () => {
  test('the live message carries the saved file, so the describer has it at once', () => {
    const { lines } = watch("{'type': 'Message', 'conversation_id': '1:2', 'event_id': '9', 'sender_id': '2', 'time_ms': 1, 'text': 'running it', 'key_version': 'k1', 'media': [{'type': 'image', 'filename': 'shot.jpg', 'media_hash_key': 'abc123'}]}")
    const message = lines.map((l) => l.liveEvent).find((l) => l.box === 'xchat')!
    const media = (message.media as { path?: string }[])[0]!
    expect(media.path).toBeTruthy()
    expect(existsSync(media.path!)).toBe(true)
    expect(readFileSync(media.path!, 'utf8')).toBe('picture bytes')
    expect(String(message.text)).toContain('image saved:')
  })

  test('a message with no picture fetches nothing', () => {
    const { lines } = watch("{'type': 'Message', 'conversation_id': '1:2', 'event_id': '9', 'sender_id': '2', 'time_ms': 1, 'text': 'yo'}")
    const message = lines.map((l) => l.liveEvent).find((l) => l.box === 'xchat')!
    expect(message.media).toBeUndefined()
    expect(message.text).toBe('yo')
  })
})
