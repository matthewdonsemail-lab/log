import { describe, expect, test } from 'bun:test'
import { ensureKernel, ensureProfileKernel, kernelOfUserAgent, profileKernels } from './index'
import type { AdsPowerClient, AdsPowerKernel } from './index'

const ua = (version: number) => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.8037.98 Safari/537.36`

function kernelClient(agents: Record<string, string>, kernels: AdsPowerKernel[]) {
  const asked: string[][] = []
  const downloads: string[] = []
  const client = {
    profileUserAgents: async (ids: string[]) => (asked.push(ids), Object.fromEntries(ids.filter((id) => id in agents).map((id) => [id, agents[id]]))),
    kernels: async () => kernels,
    downloadKernel: async (version: string) => {
      downloads.push(version)
      const kernel = kernels.find((k) => k.version === version)
      if (downloads.length >= 2 && kernel) kernel.downloaded = true
      return { status: downloads.length >= 2 ? 'completed' : 'downloading', progress: downloads.length >= 2 ? null : 40 }
    }
  } as unknown as AdsPowerClient
  return { client, asked, downloads }
}

const LOCAL: AdsPowerKernel[] = [{ version: '154', downloaded: true }, { version: '155', downloaded: true }, { version: '156', downloaded: true }]

describe("each profile starts the kernel its user agent names (ua_auto)", () => {
  test('the Chrome major version is read from the user agent', () => {
    expect(kernelOfUserAgent(ua(154))).toBe('154')
    expect(kernelOfUserAgent('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.167 Mobile Safari/537.36')).toBe('148')
    expect(kernelOfUserAgent('')).toBeNull()
    expect(kernelOfUserAgent(null)).toBeNull()
  })

  test("the Pennsylvania profiles as AdsPower answered on 2026-10-24, read 10 at a time", async () => {
    const agents: Record<string, string> = { k1ib8m0k: ua(156), k1ib8m28: ua(154), k1ib8m3j: ua(154), k1ib91gs: ua(155), k1ib91hl: ua(155), k1ib91h0: ua(154) }
    const ids = [...Object.keys(agents), 'p7', 'p8', 'p9', 'p10', 'p11']
    const { client, asked } = kernelClient(agents, LOCAL)
    const versions = await profileKernels(client, ids)
    expect(asked.map((batch) => batch.length)).toEqual([10, 1])
    expect(versions).toMatchObject({ k1ib8m0k: '156', k1ib8m28: '154', k1ib91gs: '155', p11: null })
  })

  test("a profile on 154 waits for 154, not the newest kernel, and a ready one downloads nothing", async () => {
    const kernels: AdsPowerKernel[] = [{ version: '154', downloaded: false }, { version: '156', downloaded: true }]
    const missing = kernelClient({ k1ib8m28: ua(154) }, kernels)
    const lines: string[] = []
    expect(await ensureProfileKernel(missing.client, 'k1ib8m28', (l) => lines.push(l), { pollMs: 1 })).toEqual({ ok: true, version: '154' })
    expect(missing.downloads).toEqual(['154', '154'])
    expect(lines).toEqual(['AdsPower SunBrowser 154: downloading 40%', 'AdsPower SunBrowser 154: completed'])
    const ready = kernelClient({ k1ib8m0k: ua(156) }, LOCAL)
    expect(await ensureKernel(ready.client, () => {}, { version: '156' })).toEqual({ ok: true, version: '156' })
    expect(ready.downloads).toEqual([])
  })

  test('a profile whose user agent names no version is refused, not guessed', async () => {
    const { client } = kernelClient({ odd: 'Mozilla/5.0' }, LOCAL)
    expect(await ensureProfileKernel(client, 'odd', () => {})).toMatchObject({ ok: false })
  })
})
