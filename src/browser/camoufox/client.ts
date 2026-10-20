/**
 * Camoufox as a `BrowserDriver` for the session machine (rule 44). Camoufox's gate and
 * self-check run inside its launch (python/browser/proxyGate.py), so this driver's steps are given
 * by the caller that opens the Python session, the same way AdsPower's are. A step not given
 * refuses with a catalog code, never silently.
 */
import type { BrowserDriver, BrowserEndpoint, GateResult } from '../driver/index'

export interface CamoufoxDriverDeps {
  /** The account check before anything opens (proxy, home, hours, launch budget). */
  gate?: (accountId: string) => Promise<GateResult>
  /** Opens the Python session; resolves once its gate and self-check passed. */
  open?: (accountId: string) => Promise<BrowserEndpoint>
  close?: (endpoint: BrowserEndpoint) => Promise<void>
}

const missing = (step: string) => ({ code: 'browserDriverFailed', detail: `the camoufox driver was given no "${step}" step` })

export function camoufoxDriver(deps: CamoufoxDriverDeps = {}): BrowserDriver {
  return {
    name: 'camoufox',
    // Camoufox's identity is its pinned device, made on first launch and kept in Twenty: nothing to prepare here.
    async prepare(input) {
      return input.accountName
    },
    async gate(input) {
      if (!deps.gate) throw missing('gate')
      return deps.gate(input.accountId)
    },
    async start(input) {
      if (!deps.open) throw missing('open')
      return deps.open(input.accountId)
    },
    // The Python session only reports ready after its own self-check passed (rule 17).
    async selfCheck() {
      return { ok: true, failure: null }
    },
    async stop(_input, endpoint) {
      if (deps.close) await deps.close(endpoint)
    }
  }
}
