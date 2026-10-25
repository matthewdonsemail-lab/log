import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const repo = join(import.meta.dir, '..', '..')
const py = process.env.LOG_PYTHON || 'python'

function resolve(friendly: string) {
  const script = ['import sys, json', 'sys.path.insert(0, "python")', 'from directApi.engine import resolve', `print(json.dumps(resolve(${JSON.stringify(friendly)})))`].join('\n')
  const run = spawnSync(py, ['-c', script], { cwd: repo, encoding: 'utf8' })
  return JSON.parse(run.stdout.trim())
}

describe('the direct-API engine resolves a mapped operation to its fbk triple', () => {
  test('a mapped Marketplace mutation resolves to its doc_id + variables', () => {
    const r = resolve('useCometMarketplaceListingCreateMutation')
    expect(r.ok).toBe(true)
    expect(r.docId).toBe('9551550371629242')
    expect(r.variables).toBeDefined()
  })
  test('an unmapped operation is reported, not guessed', () => {
    const r = resolve('TotallyMadeUpQuery')
    expect(r.ok).toBe(false)
    expect(r.code).toBe('notMapped')
  })
})
