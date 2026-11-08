import { readFileSync } from 'node:fs'
import { connect } from 'node:net'

export interface HostInfo {
  pid: number
  port: number
  token: string
}

export type HostCall = { reached: false; why: string } | { reached: true; answer: Record<string, unknown> }

export function readHostInfo(file: string): HostInfo | null {
  try {
    const info = JSON.parse(readFileSync(file, 'utf8')) as Partial<HostInfo>
    return info && typeof info.port === 'number' && info.port > 0 && typeof info.token === 'string' ? (info as HostInfo) : null
  } catch {
    return null
  }
}

export function callHost(info: HostInfo, spec: unknown, onLive?: (event: unknown) => void, connectTimeoutMs = 2000): Promise<HostCall> {
  return new Promise((resolve) => {
    let sent = false
    let settled = false
    let buffer = ''
    const socket = connect({ host: '127.0.0.1', port: info.port })
    const finish = (result: HostCall) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      socket.destroy()
      resolve(result)
    }
    const timer = setTimeout(() => {
      if (!sent) finish({ reached: false, why: `nothing answered on port ${info.port} in ${connectTimeoutMs} ms` })
    }, connectTimeoutMs)
    socket.setNoDelay(true)
    socket.setEncoding('utf8')
    socket.on('connect', () => {
      clearTimeout(timer)
      sent = true
      socket.write(`${JSON.stringify({ token: info.token, spec })}\n`)
    })
    socket.on('data', (chunk: string) => {
      buffer += chunk
      let cut = buffer.indexOf('\n')
      while (cut >= 0) {
        const line = buffer.slice(0, cut).trim()
        buffer = buffer.slice(cut + 1)
        cut = buffer.indexOf('\n')
        if (!line) continue
        let message: { liveEvent?: unknown; answer?: Record<string, unknown> }
        try {
          message = JSON.parse(line)
        } catch {
          continue
        }
        if (message.liveEvent !== undefined) {
          onLive?.(message.liveEvent)
          continue
        }
        if (message.answer !== undefined) {
          if (message.answer?.code === 'xSessionHostRefused') return finish({ reached: false, why: String(message.answer.detail ?? 'the session refused the token') })
          return finish({ reached: true, answer: message.answer })
        }
      }
    })
    socket.on('error', (error) => finish(sent ? { reached: true, answer: { ok: false, code: 'xSessionHostError', detail: `the connection to the X session dropped after the call was sent, so it is not sent again: ${error.message}` } } : { reached: false, why: error.message }))
    socket.on('close', () => finish(sent ? { reached: true, answer: { ok: false, code: 'xSessionHostError', detail: 'the X session closed without an answer, so the call is not sent again' } } : { reached: false, why: 'the port closed before it connected' }))
  })
}
