/**
 * Spawns `python/publishSession.py` and talks to it one step at a time.
 * Same interpreter as the worker (`LOG_PYTHON`, default `python`); it needs
 * camoufox, captchakraken and 2captcha-python installed.
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { splitReplies } from './helpers/index'
import type { PublishSession, SessionConfig, SessionFactory, SessionReply, SessionStep } from './types'

export const SESSION_PATH = fileURLToPath(new URL('../../../python/publishSession.py', import.meta.url))

export const startSession: SessionFactory = (config: SessionConfig): PublishSession => {
  const python = process.env.LOG_PYTHON || 'python'
  // stderr is inherited so browser progress shows live next to the trace.
  const proc = spawn(python, [SESSION_PATH, JSON.stringify(config)], { stdio: ['pipe', 'pipe', 'inherit'] })
  let buffer = ''
  let nextId = 1
  let exited: string | null = null
  const waiting = new Map<number, (reply: SessionReply) => void>()

  const settleAll = (why: string) => {
    exited = why
    for (const [id, resolve] of waiting) resolve({ id, result: { ok: false, code: 'sessionExited', detail: why } })
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
  proc.on('error', (error) => settleAll(`could not start ${python}: ${error.message}. Set LOG_PYTHON.`))
  proc.on('close', (code) => settleAll(`session exited with code ${code}`))

  return {
    call<T>(step: SessionStep, params: Record<string, unknown> = {}): Promise<T> {
      if (exited) return Promise.resolve({ ok: false, code: 'sessionExited', detail: exited } as T)
      const id = nextId++
      return new Promise<T>((resolve) => {
        waiting.set(id, (reply) => resolve(reply.result as T))
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
