import { describe, expect, test } from 'bun:test'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkAnchors, sliceOf } from './index'
import type { RequirementAnchors } from './index'

const root = join(import.meta.dir, '..', '..', '..')

const anchors: RequirementAnchors = {
  'REQ-BUDGET-01': [
    { kind: 'value', file: 'src/directApi/engine/types.ts', name: 'WRITES_PER_DAY', path: ['twitter'], equals: 240 },
    { kind: 'value', file: 'src/directApi/engine/types.ts', name: 'WRITES_PER_DAY_DEFAULT', equals: 40 },
  ],
  'REQ-XSESSION-04': [
    { kind: 'value', file: 'python/twitterApi/engine.py', name: 'SPACING_SECONDS', equals: [4, 11] },
    { kind: 'value', file: 'python/twitterApi/engine.py', name: 'TRANSACTION_SECONDS', equals: 10800 },
    { kind: 'symbol', file: 'python/twitterApi/engine.py', name: 'spacing_wait' },
    { kind: 'string', file: 'python/twitterApi/engine.py', includes: 'accountBusy' },
  ],
}

function copyOf(files: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'anchors'))
  for (const f of files) {
    mkdirSync(join(dir, f, '..'), { recursive: true })
    cpSync(join(root, f), join(dir, f))
  }
  mkdirSync(join(dir, 'python', 'checks'), { recursive: true })
  cpSync(join(root, 'python', 'checks', 'symbols.py'), join(dir, 'python', 'checks', 'symbols.py'))
  return dir
}

describe('anchors: what a rule names is proved by the syntax tree (rule 117)', () => {
  test('the real code meets its anchors', () => {
    const report = checkAnchors(root, 'pilot', anchors)
    expect(report.checked).toBe(6)
    expect(report.findings).toEqual([])
  })

  test('a drifted number is found, healed in place, and then passes', () => {
    const dir = copyOf(['src/directApi/engine/types.ts', 'python/twitterApi/engine.py'])
    const ts = join(dir, 'src/directApi/engine/types.ts')
    const py = join(dir, 'python/twitterApi/engine.py')
    writeFileSync(ts, readFileSync(ts, 'utf8').replace('twitter: 240', 'twitter: 90'))
    writeFileSync(py, readFileSync(py, 'utf8').replace('SPACING_SECONDS = (4.0, 11.0)', 'SPACING_SECONDS = (1.0, 2.0)'))
    const broken = checkAnchors(dir, 'pilot', anchors)
    expect(broken.findings.map((f) => f.problem)).toEqual(['WRITES_PER_DAY.twitter is 90, the rule says 240', 'SPACING_SECONDS is [1,2], the rule says [4,11]'])
    expect(broken.findings.every((f) => f.healable)).toBe(true)
    expect(checkAnchors(dir, 'pilot', anchors, true).healed).toHaveLength(2)
    expect(checkAnchors(dir, 'pilot', anchors).findings).toEqual([])
    expect(readFileSync(py, 'utf8')).toContain('SPACING_SECONDS = (4, 11)')
  })

  test('a missing function or error code is found and is not healable', () => {
    const dir = copyOf(['src/directApi/engine/types.ts', 'python/twitterApi/engine.py'])
    const py = join(dir, 'python/twitterApi/engine.py')
    writeFileSync(py, readFileSync(py, 'utf8').replace(/def spacing_wait/g, 'def spacing_gone').replace(/accountBusy/g, 'busy'))
    const problems = checkAnchors(dir, 'pilot', anchors).findings
    expect(problems.map((f) => f.problem)).toEqual(['spacing_wait is not defined in python/twitterApi/engine.py', 'no string "accountBusy" in python/twitterApi/engine.py'])
    expect(problems.some((f) => f.healable)).toBe(false)
  })

  test('the slice holds only the declarations the requirement names', () => {
    const slice = sliceOf(root, anchors)
    expect(slice).toContain('WRITES_PER_DAY')
    expect(slice).toContain('def spacing_wait')
    expect(slice.length).toBeLessThan(5000)
  })
})
