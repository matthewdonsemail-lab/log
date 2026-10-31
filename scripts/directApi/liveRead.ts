import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createTwentyClient } from '../../src/twenty/graphql/client.ts'
import { findAccount } from '../../src/marketplace/socialAccount/client.ts'

function netscape(cookies: { name: string; value: string; domain?: string; path?: string; expires?: number; httpOnly?: boolean }[]): string {
  const lines = ['# Netscape HTTP Cookie File']
  for (const c of cookies) {
    const domain = c.domain?.startsWith('.') ? c.domain : `.${(c.domain || 'facebook.com').replace(/^\./, '')}`
    const expiry = c.expires && c.expires > 0 ? Math.floor(c.expires) : 9999999999
    const row = `${domain}\tTRUE\t${c.path || '/'}\tTRUE\t${expiry}\t${c.name}\t${c.value}`
    lines.push(c.httpOnly ? `#HttpOnly_${row}` : row)
  }
  return lines.join('\n') + '\n'
}

async function main(): Promise<number> {
  const name = process.argv[2]
  const query = process.argv[3] || 'free'
  const account = await findAccount(createTwentyClient(), name)
  const raw = (account as unknown as { cookies: unknown }).cookies
  const cookies = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? JSON.parse(raw) : []
  if (!cookies.some((c: { name: string }) => c.name === 'c_user') || !account.proxy) {
    process.stderr.write(`${account.accountName}: needs a saved session + proxy\n`)
    return 1
  }
  process.stderr.write(`${account.accountName} (${account.homeCity}): marketplace.search(${JSON.stringify(query)}) via fbk direct API, its proxy, governed\n`)
  const dir = mkdtempSync(join(tmpdir(), 'liveRead'))
  const jar = join(dir, 'cookies.txt')
  writeFileSync(jar, netscape(cookies), { mode: 0o600 })
  const spec = join(dir, 'spec.json')
  writeFileSync(spec, JSON.stringify({ surface: 'marketplace', method: 'search', args: [query], cookiesPath: jar, proxy: account.proxy }), { mode: 0o600 })
  const py = process.env.LOG_PYTHON || 'python'
  const code = await new Promise<number>((resolve) => {
    const p = spawn(py, [join(import.meta.dir, '..', '..', 'python', 'directApi', 'engine.py'), spec], { stdio: 'inherit' })
    p.on('close', (c) => resolve(c ?? 1))
  })
  rmSync(dir, { recursive: true, force: true })
  return code
}

main().then((c) => process.exit(c))
