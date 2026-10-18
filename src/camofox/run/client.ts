import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkRunnable, toFacebookCookies } from '../../marketplace/socialAccount/index'
import type { FacebookAccount, PlaywrightCookie, RunPurpose } from '../../marketplace/socialAccount/index'
import type { PrepareRunResult } from './types'

/**
 * Everything a Camoufox run for `account` needs, or why it may not run. The
 * account check comes first (`checkRunnable`, rule 12): no proxy, no home
 * country, a non-Facebook or unusable account means no files and no browser.
 * A normal run also needs a saved session; signing in doesn't.
 */
export function prepareRun(account: FacebookAccount, purpose: RunPurpose, root: string = tmpdir()): PrepareRunResult {
  const check = checkRunnable(account, purpose)
  if (!check.ok) return check
  const cookies = toFacebookCookies(account.cookies)
  if (purpose === 'run' && cookies.length === 0) {
    return { ok: false, code: 'neverConnected', detail: `${account.accountName} has no cookies in Twenty. Run: log connect --account ${account.accountName}` }
  }

  const dir = mkdtempSync(join(root, 'logCliRun'))
  const proxyPath = join(dir, 'proxy.json')
  const statePath = join(dir, 'state.json')
  writeFileSync(proxyPath, JSON.stringify(check.proxy), { mode: 0o600 })
  if (cookies.length) writeFileSync(statePath, JSON.stringify({ cookies, origins: [] }), { mode: 0o600 })
  return {
    ok: true,
    run: {
      dir,
      proxyPath,
      statePath,
      hasSession: cookies.length > 0,
      readCookies(): PlaywrightCookie[] {
        if (!existsSync(statePath)) return []
        try {
          return toFacebookCookies((JSON.parse(readFileSync(statePath, 'utf8')) as { cookies?: unknown }).cookies)
        } catch {
          return []
        }
      },
      cleanup() {
        rmSync(dir, { recursive: true, force: true })
      }
    }
  }
}
