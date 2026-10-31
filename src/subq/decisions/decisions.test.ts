import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { subqKey, subqKeyFile } from './index'

describe('the SubQ key', () => {
  test('the environment wins, then the key file in ~/.config/listeningkit', () => {
    const home = mkdtempSync(join(tmpdir(), 'subqKey'))
    expect(subqKeyFile(home)).toBe(join(home, '.config', 'listeningkit', 'subq-api-key.txt'))
    const keyFile = join(home, 'key.txt')
    writeFileSync(keyFile, '  fromFile\n')
    expect(subqKey({ SUBQ_API_KEY: 'fromEnv' }, keyFile)).toBe('fromEnv')
    expect(subqKey({}, keyFile)).toBe('fromFile')
  })

  test('a key file in NAME=value lines gives its SUBQ_API_KEY line only', () => {
    const keyFile = join(mkdtempSync(join(tmpdir(), 'subqKey')), 'key.txt')
    writeFileSync(keyFile, ['SUBQ_BASE_URL=https://api.subq.ai/v1/systemone', 'SUBQ_API_KEY=named', ''].join('\r\n'))
    expect(subqKey({}, keyFile)).toBe('named')
    writeFileSync(keyFile, 'SUBQ_BASE_URL=https://api.subq.ai/v1/systemone\n')
    expect(subqKey({}, keyFile)).not.toBe('SUBQ_BASE_URL=https://api.subq.ai/v1/systemone')
  })
})
