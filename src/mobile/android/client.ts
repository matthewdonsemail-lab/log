import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adbRun } from '../devices/client'
import type { AdbRun } from '../devices/client'
import type { MobileBinding } from '../devices/types'
import { createGeeLarkClient } from '../geelark/client'
import type { GeeLarkClient } from '../geelark/client'
import { DRIVER } from './types'
import type { ConnectAnswer, InspectAnswer } from './types'

export interface AndroidDeps {
  adb: AdbRun
  geelark: () => GeeLarkClient
  wait: (ms: number) => Promise<void>
  python: (args: string[]) => { ok: boolean; stdout: string; stderr: string }
}

const repo = resolve(fileURLToPath(new URL('../../..', import.meta.url)))

export const androidDeps: AndroidDeps = {
  adb: adbRun,
  geelark: () => createGeeLarkClient(),
  wait: (ms) => new Promise((done) => setTimeout(done, ms)),
  python: (args) => {
    const run = spawnSync(process.env.LOG_PYTHON || 'python', [join(repo, DRIVER), ...args], { encoding: 'utf8', windowsHide: true, timeout: 120_000, maxBuffer: 16 * 1024 * 1024 })
    if (run.error) return { ok: false, stdout: '', stderr: (run.error as Error).message }
    return { ok: run.status === 0, stdout: run.stdout ?? '', stderr: run.stderr ?? '' }
  },
}

export async function connectAndroid(binding: MobileBinding, deps: AndroidDeps = androidDeps, progress: (line: string) => void = () => {}): Promise<ConnectAnswer> {
  const steps: string[] = []
  const say = (line: string) => {
    steps.push(line)
    progress(line)
  }
  if (binding.provider === 'usb') {
    const listed = deps.adb(['devices'])
    if (!listed.ok) return { ok: false, code: 'adbMissing', error: listed.stderr.trim() || 'adb did not answer', steps }
    const online = listed.stdout.split(/\r?\n/).some((line) => line.split(/\s+/)[0] === binding.deviceId && /\sdevice\b/.test(line))
    if (!online) return { ok: false, code: 'phoneOffline', error: `${binding.deviceId} isn't online over USB (adb devices): plug it in, unlock it and allow USB debugging for this computer`, steps }
    say(`usb ${binding.deviceId}: online`)
    return { ok: true, connection: { serial: binding.deviceId, provider: 'usb', steps } }
  }
  const geelark = deps.geelark()
  const start = await geelark.start([binding.deviceId])
  if (!start.ok) return { ok: false, code: start.code, error: `GeeLark start: ${start.error}`, steps }
  say(`geelark ${binding.deviceId}: start asked`)
  for (let tries = 0; ; tries++) {
    const status = await geelark.status([binding.deviceId])
    if (!status.ok) return { ok: false, code: status.code, error: `GeeLark status: ${status.error}`, steps }
    const state = status.data[0]?.status ?? 'missing'
    if (state === 'started') break
    if (state === 'missing' || state === 'expired' || tries >= 30) return { ok: false, code: 'phoneNotStarted', error: `GeeLark phone ${binding.deviceId} is ${state} after ${tries * 4} s`, steps }
    await deps.wait(4000)
  }
  say(`geelark ${binding.deviceId}: started`)
  const adbOn = await geelark.setAdb([binding.deviceId], true)
  if (!adbOn.ok) return { ok: false, code: adbOn.code, error: `GeeLark ADB on: ${adbOn.error}`, steps }
  let info = await geelark.adbInfo([binding.deviceId])
  for (let tries = 0; info.ok && !(info.data[0]?.code === 0 && info.data[0].ip) && tries < 10; tries++) {
    await deps.wait(3000)
    info = await geelark.adbInfo([binding.deviceId])
  }
  if (!info.ok) return { ok: false, code: info.code, error: `GeeLark ADB info: ${info.error}`, steps }
  const adb = info.data[0]
  if (!adb || adb.code !== 0 || !adb.ip) return { ok: false, code: 'adbNotReady', error: `GeeLark gave no ADB address for ${binding.deviceId} (code ${adb?.code ?? 'none'})`, steps }
  const serial = `${adb.ip}:${adb.port}`
  const connected = deps.adb(['connect', serial])
  if (!connected.ok || /failed|unable|refused/i.test(connected.stdout)) return { ok: false, code: 'adbConnectFailed', error: `adb connect ${serial}: ${(connected.stdout + connected.stderr).trim()}`, steps }
  say(`adb connect ${serial}: ${connected.stdout.trim()}`)
  const login = deps.adb(['-s', serial, 'shell', 'glogin', adb.pwd])
  if (!login.ok) return { ok: false, code: 'adbLoginFailed', error: `glogin on ${serial}: ${(login.stdout + login.stderr).trim()}`, steps }
  say(`glogin on ${serial}: ok`)
  return { ok: true, connection: { serial, provider: 'geelark', steps } }
}

export function inspectFolder(account: string, now = new Date(), root = process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs')): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..*/, '')
  const folder = join(root, 'mobile', `${stamp}_${account.replace(/\W/g, '')}`)
  mkdirSync(folder, { recursive: true })
  return folder
}

export function inspectAndroid(serial: string, folder: string, open: string | null, deps: AndroidDeps = androidDeps): InspectAnswer {
  const args = ['inspect', '--serial', serial, '--out', folder, ...(open ? ['--open', open] : [])]
  const run = deps.python(args)
  const last = run.stdout.trim().split(/\r?\n/).pop() ?? ''
  let read: Record<string, unknown> | null = null
  try {
    read = JSON.parse(last) as Record<string, unknown>
  } catch {
  }
  if (!run.ok || !read || read.ok !== true) {
    const code = typeof read?.code === 'string' ? read.code : 'inspectFailed'
    const error = typeof read?.error === 'string' ? read.error : run.stderr.trim().split(/\r?\n/).slice(-3).join(' ') || 'the Android driver gave no answer'
    return { ok: false, code, error }
  }
  return { ok: true, result: { serial, folder, hierarchy: String(read.hierarchy ?? ''), screenshot: String(read.screenshot ?? ''), currentApp: String(read.currentApp ?? ''), elements: Number(read.elements ?? 0), opened: open } }
}
