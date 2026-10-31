import type { BrowserDriver, BrowserEndpoint, GateResult } from '../driver/index'

export interface CamoufoxDriverDeps {
  gate?: (accountId: string) => Promise<GateResult>
  open?: (accountId: string) => Promise<BrowserEndpoint>
  close?: (endpoint: BrowserEndpoint) => Promise<void>
}

const missing = (step: string) => ({ code: 'browserDriverFailed', detail: `the camoufox driver was given no "${step}" step` })

export function camoufoxDriver(deps: CamoufoxDriverDeps = {}): BrowserDriver {
  return {
    name: 'camoufox',
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
    async selfCheck() {
      return { ok: true, failure: null }
    },
    async stop(_input, endpoint) {
      if (deps.close) await deps.close(endpoint)
    }
  }
}
