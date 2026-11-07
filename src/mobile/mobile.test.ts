import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mobileCommand, mobileDeps } from '../cli/mobile/index.ts'
import { bindDevice, bindingOf, connectAndroid, createGeeLarkClient, parseAdbDevices, readBindings, unbindDevice } from './index'
import type { AndroidDeps, GeeLarkFetch, MobileBinding } from './index'

const context = { err: () => {} } as never

describe('mobile devices (rule 167)', () => {
  test('adb devices -l is read into phones', () => {
    const phones = parseAdbDevices('List of devices attached\nR58N1234 device usb:1-1 product:a51 model:SM_A515F device:a51 transport_id:3\n10.0.0.5:5555 offline transport_id:4\n\n')
    expect(phones.map((p) => [p.id, p.state, p.name])).toEqual([['R58N1234', 'device', 'SM_A515F'], ['10.0.0.5:5555', 'offline', '10.0.0.5:5555']])
  })

  test('one phone per account and one account per phone, kept until unbound', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'mobile')), 'bindings.json')
    const base = { platform: 'snapchat', os: 'android' as const, provider: 'usb' as const, by: 'test' }
    expect(bindDevice({ ...base, account: 'a', deviceId: 'P1' }, file).ok).toBe(true)
    const again = bindDevice({ ...base, account: 'a', deviceId: 'P1' }, file)
    expect(again.ok && again.already).toBe(true)
    expect(bindDevice({ ...base, account: 'a', deviceId: 'P2' }, file)).toMatchObject({ ok: false, code: 'accountBound' })
    expect(bindDevice({ ...base, account: 'b', deviceId: 'P1' }, file)).toMatchObject({ ok: false, code: 'deviceTaken' })
    expect(unbindDevice('a', file)?.deviceId).toBe('P1')
    expect(readBindings(file)).toEqual([])
  })

  test('the GeeLark client sends the bearer token and a trace id, and reads its envelope', async () => {
    const seen: { url: string; headers: Record<string, string>; body: string }[] = []
    const fetcher: GeeLarkFetch = async (url, init) => {
      seen.push({ url, headers: init.headers, body: init.body })
      return { status: 200, json: async () => ({ code: 0, msg: 'success', data: { items: [{ id: '52', serialName: 'reddit01', status: 0 }] } }) }
    }
    const listed = await createGeeLarkClient('tok', fetcher).list()
    expect(listed).toEqual({ ok: true, data: [{ id: '52', serialName: 'reddit01', status: 'started', detail: '' }] })
    expect(seen[0]!.url).toBe('https://openapi.geelark.com/open/v1/phone/list')
    expect(seen[0]!.headers.Authorization).toBe('Bearer tok')
    expect(seen[0]!.headers.traceId).toMatch(/^[0-9A-F-]{36}$/)
    expect(await createGeeLarkClient(null, fetcher).list()).toMatchObject({ ok: false, code: 'geelarkKeyMissing' })
  })

  test('a GeeLark phone is started, ADB turned on, connected and logged in, then handed on', async () => {
    const adbCalls: string[][] = []
    let status = 1
    const deps: AndroidDeps = {
      adb: (args) => {
        adbCalls.push(args)
        return { ok: true, stdout: args[0] === 'connect' ? 'connected to 1.2.3.4:5555' : '', stderr: '' }
      },
      geelark: () => ({
        list: async () => ({ ok: true, data: [] }),
        start: async () => ({ ok: true, data: null }),
        stop: async () => ({ ok: true, data: null }),
        status: async () => ({ ok: true, data: [{ id: 'G1', serialName: '', status: status++ === 1 ? 'starting' : 'started', detail: '' }] }),
        setAdb: async () => ({ ok: true, data: null }),
        adbInfo: async () => ({ ok: true, data: [{ id: 'G1', ip: '1.2.3.4', port: '5555', pwd: 'abc', code: 0 }] }),
      }),
      wait: async () => {},
      python: () => ({ ok: true, stdout: '', stderr: '' }),
    }
    const binding: MobileBinding = { account: 'r1', platform: 'reddit', os: 'android', provider: 'geelark', deviceId: 'G1', boundAt: '', by: 'test' }
    const connected = await connectAndroid(binding, deps)
    expect(connected.ok && connected.connection.serial).toBe('1.2.3.4:5555')
    expect(adbCalls).toEqual([['connect', '1.2.3.4:5555'], ['-s', '1.2.3.4:5555', 'shell', 'glogin', 'abc']])
  })

  test('a USB phone that is not online is refused before anything is read', async () => {
    const deps = { adb: () => ({ ok: true, stdout: 'List of devices attached\nOTHER device\n', stderr: '' }) } as unknown as AndroidDeps
    const binding: MobileBinding = { account: 'a', platform: 'snapchat', os: 'android', provider: 'usb', deviceId: 'P1', boundAt: '', by: 't' }
    expect(await connectAndroid(binding, deps)).toMatchObject({ ok: false, code: 'phoneOffline' })
  })

  test('the command binds, refuses apple, and inspect needs a bound phone', async () => {
    const apple = await mobileCommand.run(context, ['apple', 'snapchat', 'inspect'])
    expect(apple.code).toBe(1)
    expect(apple.stderr).toContain('appleNotBuilt')
    const bound = await mobileCommand.run(context, ['android', 'snapchat', 'bind', '--account', 'cmdTest', '--device', 'SER1'])
    expect(bound.code).toBe(0)
    expect(bindingOf('cmdTest')?.deviceId).toBe('SER1')
    const none = await mobileCommand.run(context, ['android', 'snapchat', 'inspect', '--account', 'nobody'])
    expect(none.stderr).toContain('phoneNotBound')
    mobileDeps.listUsb = () => ({ ok: true, devices: parseAdbDevices('List of devices attached\nSER1 device model:Pixel_7\n') })
    mobileDeps.geelark = () => createGeeLarkClient(null)
    const listed = await mobileCommand.run(context, ['android', 'devices'])
    expect(listed.stdout).toContain('SER1')
    expect(listed.stdout).toContain('GEELARK_API_TOKEN')
  })
})
