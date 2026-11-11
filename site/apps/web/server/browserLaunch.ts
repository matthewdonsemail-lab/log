import type { BrowserCheckView } from '../shared/browserCheck'

type Outcome = { phase: BrowserCheckView['phase']; reason: NonNullable<BrowserCheckView['reason']>; retryAt: string | null; proxyMs?: number; limitMs?: number }
const blockers = ['proxyRateLimited', 'proxyUnreachable', 'proxyTooSlow', 'proxyAuthFailed', 'proxyMalformed', 'noProxy', 'proxyCountryMismatch', 'proxyCountryChanged', 'proxyTooFar', 'proxyWrongCountry', 'proxyCheckFailed', 'launchTooSoon', 'launchBudgetSpent', 'browserTimezoneMismatch', 'browserLocaleMismatch', 'browserExitIpMismatch', 'adsPowerKernelMissing', 'adsPowerProfileMissing', 'noAdsPowerProfile', 'unguardedLaunch']

export function launchOutcome(data: Record<string, unknown> | undefined, at = new Date().toISOString()): Outcome {
  const text = typeof data?.stderr === 'string' ? data.stderr : ''
  const recordedAt = at
  if (/\boutsideActiveHours:/.test(text)) return { phase: 'launchBlocked', reason: { code: 'retiredActiveHours', message: 'An older runtime returned the retired active-hours restriction. No browser was opened.', recordedAt }, retryAt: null }
  const provider = ['adsPowerUnavailable', 'adsPowerRequestFailed', 'adsPowerRateLimited'].find((code) => new RegExp(`\\b${code}\\b`).test(text))
  if (provider) return { phase: 'providerSetupRequired', reason: { code: provider, message: `The browser provider did not accept launch (${provider}). No launch retry was dispatched.`, recordedAt }, retryAt: null }
  const gate = blockers.find((code) => new RegExp(`\\b${code}\\b`).test(text))
  if (gate === 'launchTooSoon') {
    const exact = /next launch at (\d{4}-\d{2}-\d{2}T[^\s)]+)/.exec(text)?.[1]
    const minutes = /wait (\d+) min/.exec(text)?.[1]
    const retryAt = exact && Number.isFinite(Date.parse(exact)) ? new Date(exact).toISOString() : minutes ? new Date(Date.parse(recordedAt) + Number(minutes) * 60000).toISOString() : null
    return { phase: 'launchCooldown', reason: { code: gate, message: `The previous browser launch is inside the existing 10-minute gap.${retryAt ? ` A newly requested launch is eligible after ${retryAt}.` : ''} Closing the modal stopped the browser; it did not reset the launch history.`, recordedAt }, retryAt }
  }
  if (gate === 'proxyTooSlow') {
    const measured = /took (\d+) ms.*?limit (\d+) ms/.exec(text)
    return { phase: 'launchBlocked', ...(measured ? { proxyMs: Number(measured[1]), limitMs: Number(measured[2]) } : {}), reason: { code: gate, message: measured ? `Proxy validation refused launch: ${measured[1]} ms measured, ${measured[2]} ms maximum. The browser did not open. No retry or proxy change was dispatched.` : 'Proxy validation refused launch because its response exceeded the configured limit. The browser did not open.', recordedAt }, retryAt: null }
  }
  if (gate) return { phase: 'launchBlocked', reason: { code: gate, message: `The native launch gate refused this attempt (${gate}). Resolve the recorded cause before another launch.`, recordedAt }, retryAt: null }
  if (/\b(?:inspectAlreadyRunning|accountOwnerBusy|ownerConflict|inspectBusy):/.test(text)) return { phase: 'waitingForOwner', reason: { code: 'accountOwnerBusy', message: 'The account already has an owner or an operation in progress. No parallel browser was opened.', recordedAt }, retryAt: null }
  return { phase: 'launchUncertain', reason: { code: 'browserLaunchUnconfirmed', message: 'The runtime did not confirm browser readiness. The private Log run retains the full request and failure; no launch retry was dispatched.', recordedAt }, retryAt: null }
}
