import { createActor, fromPromise } from 'xstate'
import { browserSessionMachine } from './machine'
import { BROWSER_DRIVERS, DEFAULT_BROWSER_DRIVER } from './types'
import type { BrowserDriver, BrowserDriverName, BrowserSessionInput } from './types'

export function driverNameOf(account: { browserDriver: string | null; adsPowerProfileId?: string | null }): BrowserDriverName {
  const name = account.browserDriver?.trim() ?? ''
  if ((BROWSER_DRIVERS as readonly string[]).includes(name)) return name as BrowserDriverName
  return account.adsPowerProfileId ? 'adsPower' : DEFAULT_BROWSER_DRIVER
}

export function sessionMachineFor(driver: BrowserDriver) {
  return browserSessionMachine.provide({
    actors: {
      prepare: fromPromise(({ input }) => driver.prepare(input)),
      gate: fromPromise(({ input }) => driver.gate(input.input, input.handle)),
      start: fromPromise(({ input }) => driver.start(input.input, input.handle, input.gate)),
      selfCheck: fromPromise(({ input }) => driver.selfCheck(input.input, input.endpoint, input.gate)),
      stop: fromPromise(({ input }) => driver.stop(input.input, input.endpoint))
    }
  })
}

export function createBrowserSession(driver: BrowserDriver, input: BrowserSessionInput) {
  if (driver.name !== input.driver) throw new Error(`driver ${driver.name} given for a ${input.driver} session`)
  return createActor(sessionMachineFor(driver), { input })
}

export function browserFor(account: { browserDriver?: string | null; adsPowerProfileId?: string | null }): { driver: BrowserDriverName; profileId: string | null } {
  return { driver: driverNameOf({ browserDriver: account.browserDriver ?? null, adsPowerProfileId: account.adsPowerProfileId ?? null }), profileId: account.adsPowerProfileId ?? null }
}
