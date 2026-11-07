import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { ADB_ENV, bindingsFile } from './types'
import type { MobileBinding, MobileDevice, MobileOs, MobileProvider } from './types'

export type AdbRun = (args: string[]) => { ok: boolean; stdout: string; stderr: string }

export function adbPath(env: Record<string, string | undefined> = process.env): string {
  return env[ADB_ENV]?.trim() || 'adb'
}

export const adbRun: AdbRun = (args) => {
  const run = spawnSync(adbPath(), args, { encoding: 'utf8', windowsHide: true, timeout: 30_000 })
  if (run.error) return { ok: false, stdout: '', stderr: (run.error as Error).message }
  return { ok: run.status === 0, stdout: run.stdout ?? '', stderr: run.stderr ?? '' }
}

export function parseAdbDevices(text: string): MobileDevice[] {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('*'))
    .map((line) => {
      const [id = '', state = '', ...rest] = line.split(/\s+/)
      const fields = Object.fromEntries(rest.filter((part) => part.includes(':')).map((part) => [part.slice(0, part.indexOf(':')), part.slice(part.indexOf(':') + 1)]))
      return { os: 'android' as MobileOs, provider: 'usb' as MobileProvider, id, state, name: fields.model ?? fields.device ?? id, detail: [fields.product, fields.transport_id ? `transport ${fields.transport_id}` : ''].filter(Boolean).join(', ') }
    })
    .filter((device) => device.id)
}

export function listUsbAndroid(run: AdbRun = adbRun): { ok: true; devices: MobileDevice[] } | { ok: false; error: string } {
  const answer = run(['devices', '-l'])
  if (!answer.ok) return { ok: false, error: `adb didn't answer (${answer.stderr.trim() || 'not installed or not on PATH'}): install Android platform-tools, or set LOG_ADB to adb's path` }
  return { ok: true, devices: parseAdbDevices(answer.stdout) }
}

export function readBindings(file = bindingsFile()): MobileBinding[] {
  if (!existsSync(file)) return []
  try {
    const read = JSON.parse(readFileSync(file, 'utf8')) as { bindings?: MobileBinding[] }
    return Array.isArray(read.bindings) ? read.bindings : []
  } catch {
    return []
  }
}

function writeBindings(bindings: MobileBinding[], file: string): void {
  mkdirSync(dirname(file), { recursive: true })
  const temp = `${file}.tmp`
  writeFileSync(temp, `${JSON.stringify({ bindings }, null, 2)}\n`)
  renameSync(temp, file)
}

export function bindingOf(account: string, bindings: MobileBinding[] = readBindings()): MobileBinding | null {
  return bindings.find((b) => b.account === account) ?? null
}

export type BindAnswer = { ok: true; binding: MobileBinding; already: boolean } | { ok: false; code: 'accountBound' | 'deviceTaken'; error: string }

export function bindDevice(want: Omit<MobileBinding, 'boundAt'>, file = bindingsFile(), now = new Date()): BindAnswer {
  const bindings = readBindings(file)
  const mine = bindings.find((b) => b.account === want.account)
  if (mine && mine.provider === want.provider && mine.deviceId === want.deviceId) return { ok: true, binding: mine, already: true }
  if (mine) return { ok: false, code: 'accountBound', error: `${want.account} already has its phone (${mine.provider} ${mine.deviceId}, bound ${mine.boundAt}); one account keeps one phone, so unbind it first only if the phone is gone` }
  const holder = bindings.find((b) => b.provider === want.provider && b.deviceId === want.deviceId)
  if (holder) return { ok: false, code: 'deviceTaken', error: `${want.provider} ${want.deviceId} is ${holder.account}'s phone; one phone holds one account` }
  const binding: MobileBinding = { ...want, boundAt: now.toISOString() }
  writeBindings([...bindings, binding], file)
  return { ok: true, binding, already: false }
}

export function unbindDevice(account: string, file = bindingsFile()): MobileBinding | null {
  const bindings = readBindings(file)
  const mine = bindings.find((b) => b.account === account) ?? null
  if (mine) writeBindings(bindings.filter((b) => b !== mine), file)
  return mine
}
