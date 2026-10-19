/**
 * Spawns `python/publishSession.py` and talks to it one step at a time.
 * Same interpreter as the worker (`LOG_PYTHON`, default `python`); it needs
 * camoufox, captchakraken and 2captcha-python installed. Every reply's codes
 * are checked against the error catalog here (`normalizeResult`).
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import type { ErrorCode } from '../../errors/catalog/index'
import { pipeProcessLog } from '../../observability/processLog/index'
import { normalizeResult, splitReplies } from './helpers/index'
import type { PublishSession, SessionConfig, SessionFactory, SessionReply, SessionStep } from './types'

export const SESSION_PATH = fileURLToPath(new URL('../../../python/publishSession.py', import.meta.url))

export const startSession: SessionFactory = (config: SessionConfig): PublishSession => {
  const python = process.env.LOG_PYTHON || 'python'
  // stderr goes through processLog: live on the terminal, and into the MCP
  // tool result and log file when run as a tool.
  const proc = spawn(python, [SESSION_PATH, JSON.stringify(config)], { stdio: ['pipe', 'pipe', 'pipe'] })
  pipeProcessLog(proc.stderr, 'session')
  let buffer = ''
  let nextId = 1
  let exited: { code: ErrorCode; detail: string } | null = null
  const waiting = new Map<number, (reply: SessionReply) => void>()

  const settleAll = (code: ErrorCode, detail: string) => {
    exited ??= { code, detail }
    for (const [id, resolve] of waiting) resolve({ id, result: { ok: false, ...exited } })
    waiting.clear()
  }
  proc.stdout.on('data', (chunk: Buffer) => {
    const { replies, rest } = splitReplies(buffer, chunk.toString())
    buffer = rest
    for (const reply of replies) {
      const resolve = reply.id === null ? undefined : waiting.get(reply.id)
      if (resolve && reply.id !== null) {
        waiting.delete(reply.id)
        resolve(reply)
      }
    }
  })
  proc.on('error', (error) => settleAll('workerNotStarted', `could not start ${python}: ${error.message}. Set LOG_PYTHON.`))
  proc.on('close', (code) => settleAll('sessionExited', `session exited with code ${code}`))

  return {
    call<T>(step: SessionStep, params: Record<string, unknown> = {}): Promise<T> {
      if (exited) return Promise.resolve({ ok: false, ...exited } as T)
      const id = nextId++
      return new Promise<T>((resolve) => {
        waiting.set(id, (reply) => resolve(normalizeResult(reply.result) as T))
        proc.stdin.write(`${JSON.stringify({ id, step, params })}\n`)
      })
    },
    async close() {
      if (exited) return
      const closed = new Promise<void>((resolve) => proc.once('close', () => resolve()))
      const id = nextId++
      proc.stdin.write(`${JSON.stringify({ id, step: 'close' })}\n`)
      proc.stdin.end()
      // The browser can take a few seconds to shut; don't hang forever on it.
      await Promise.race([closed, new Promise((r) => setTimeout(r, 15_000))])
      if (!exited) proc.kill()
    }
  }
}
