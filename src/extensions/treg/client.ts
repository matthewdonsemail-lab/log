import { execFile } from 'node:child_process'
import { timed } from '../../observability/timing/index'
import { callArgs } from './helpers/index'
import { TREG_MAX_OUTPUT, TREG_TIMEOUT_MS } from './types'
import type { TregClient, TregRun, TregRunner } from './types'

export function tregBin(): string {
  return process.env.TREG_BIN || 'treg'
}

export const runTreg: TregRunner = (args, timeoutMs) =>
  new Promise((resolve) => {
    execFile(tregBin(), args, { encoding: 'utf8', timeout: timeoutMs, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, (error, stdout, stderr) => {
      const code = error ? (typeof (error as { code?: unknown }).code === 'number' ? ((error as { code: number }).code) : 1) : 0
      const missing = (error as { code?: unknown } | null)?.code === 'ENOENT'
      resolve({
        ok: !error,
        code,
        stdout: String(stdout ?? '').slice(0, TREG_MAX_OUTPUT),
        stderr: missing ? `treg isn't installed or isn't on the PATH (set TREG_BIN to its path)` : String(stderr ?? '').slice(-4000),
      })
    })
  })

function timedRun(run: TregRunner, name: string, args: string[], attrs: Record<string, unknown>): Promise<TregRun> {
  return timed(name, async (span) => {
    const result = await run(args, TREG_TIMEOUT_MS)
    span.attrs.exit = result.code
    return result
  }, attrs)
}

export function createTregClient(run: TregRunner = runTreg): TregClient {
  return {
    search: (query, limit) => timedRun(run, 'treg.search', ['catalog', 'search', ...query.split(/\s+/).filter(Boolean), '--limit', String(limit)], {}),
    get: (id) => timedRun(run, 'treg.get', ['catalog', 'get', id], { endpoint: id }),
    call: (input) => timedRun(run, 'treg.call', callArgs(input), { endpoint: input.id }),
  }
}
