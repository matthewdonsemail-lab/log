/**
 * Running a browser session: pick the account's driver (Twenty `browserDriver`, default
 * Camoufox), give the machine its steps, and start it. Callers watch it like any other
 * machine (`observability/trace`) and send CLOSE with a reason (rule 35).
 */
import { createActor, fromPromise } from 'xstate'
import { browserSessionMachine } from './machine'
import { BROWSER_DRIVERS, DEFAULT_BROWSER_DRIVER } from './types'
import type { BrowserDriver, BrowserDriverName, BrowserSessionInput } from './types'

/** The account's driver from Twenty; anything unknown or empty keeps the default. Pure. */
export function driverNameOf(account: { browserDriver: string | null }): BrowserDriverName {
  const name = account.browserDriver?.trim() ?? ''
  return (BROWSER_DRIVERS as readonly string[]).includes(name) ? (name as BrowserDriverName) : DEFAULT_BROWSER_DRIVER
}

/** The machine with this driver's steps in it. */
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

/** The `browser` a Python session is started with, from the account's Twenty fields (rule 44). Pure. */
export function browserFor(account: { browserDriver?: string | null; adsPowerProfileId?: string | null }): { driver: BrowserDriverName; profileId: string | null } {
  return { driver: driverNameOf({ browserDriver: account.browserDriver ?? null }), profileId: account.adsPowerProfileId ?? null }
}
