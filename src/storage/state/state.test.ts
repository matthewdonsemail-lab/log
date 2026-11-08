import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { claimState, deleteState, getState, pruneState, putState } from './index'

describe('small shared state lives in log.db', () => {
  test('a value is put, read back and replaced by its scope and key', () => {
    const key = `k${Date.now()}`
    expect(getState('voicePasses', key)).toBeNull()
    putState('voicePasses', key, [{ a: 1 }], 1000)
    putState('voicePasses', key, [{ a: 2 }], 2000)
    expect(getState('voicePasses', key)).toEqual({ body: [{ a: 2 }], updatedAt: 2000 })
    deleteState('voicePasses', key)
    expect(getState('voicePasses', key)).toBeNull()
  })

  test('the old file is imported once, and never again after the row changes', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'state')), 'taste.json')
    writeFileSync(file, JSON.stringify({ memes: 3 }))
    expect(getState('memeTaste', file, { legacyFile: file })?.body).toEqual({ memes: 3 })
    deleteState('memeTaste', file)
    expect(getState('memeTaste', file, { legacyFile: file })).toBeNull()
  })

  test('a claim is held for its grace and can be taken after it', () => {
    const key = `c${Date.now()}`
    expect(claimState('contextServiceStarting', key, { pid: 1 }, 1000, 10_000)).toBe(true)
    expect(claimState('contextServiceStarting', key, { pid: 2 }, 1000, 10_500)).toBe(false)
    expect(claimState('contextServiceStarting', key, { pid: 3 }, 1000, 11_500)).toBe(true)
  })

  test('pruning drops only old rows under the key prefix', () => {
    const dir = `d${Date.now()}`
    putState('hookOffsets', `${dir}|old`, {}, 100)
    putState('hookOffsets', `${dir}|new`, {}, 5000)
    putState('hookOffsets', `other${dir}|old`, {}, 100)
    expect(pruneState('hookOffsets', `${dir}|`, 1000)).toBe(1)
    expect(getState('hookOffsets', `${dir}|new`)).not.toBeNull()
    expect(getState('hookOffsets', `other${dir}|old`)).not.toBeNull()
  })
})
