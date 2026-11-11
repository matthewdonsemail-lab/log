import { browserPhases, type BrowserPhase } from './browserCheckTypes'

export type ConnectionPlatform = 'twitter' | 'facebook' | 'discord' | 'slack' | 'instagram' | 'reddit' | 'linkedin'
const accountStatuses = ['active', 'warming', 'limited', 'paused', 'needsLogin', 'checkpoint', 'restricted', 'banned', 'dead', 'deactivated'] as const
type AccountStatus = typeof accountStatuses[number]
export type CheckState = 'running' | 'succeeded' | 'stopped' | 'unavailable' | 'unknown'
export type LocalConnection = { id: string; name: string; homeCountry: string | null; proxyProvider: 'twoCaptcha' | 'byteful' | 'unknown' | null; platform: ConnectionPlatform; status: AccountStatus | 'unknown'; state: 'loggedIn' | 'loggedOut' | 'restricted' | 'checkpoint' | 'unknown' | 'shadowSuspect' | 'accountWarning'; checkedAt: string | null; lastCheck: { state: CheckState; checkedAt: string; launchOutcome?: { phase: BrowserPhase; retryAt: string | null; code: string } } | null }
export type SavedKeyField = { id: string; label: string; required?: boolean; inputType?: 'url' | 'password' | 'text'; hasValue: boolean; masked: string | null }
export type ExtensionConnection = { key: string; state: 'configured' | 'notConfigured' | 'unavailable'; fields: SavedKeyField[]; persisted: boolean }
export type LocalConnections = { accounts: LocalConnection[]; extensions: ExtensionConnection[] }
const platforms = new Set(['twitter', 'facebook', 'discord', 'slack', 'instagram', 'reddit', 'linkedin'])
const providers = new Set(['adsPower', 'typesafe', 'subq', 'memelord', 'fishAudio', 'inworld', 'treg', 'jina', 'assemblyAi', 'parallel', 'twoCaptcha', 'byteful'])

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('connectionsResponseInvalid')
  return value as Record<string, unknown>
}

function parseConnections(value: unknown): LocalConnections {
  const body = record(value)
  if (body.schemaVersion !== 1 || body.source !== 'workspace' || body.mode !== 'local' || !Array.isArray(body.accounts) || !Array.isArray(body.extensions)) throw new Error('connectionsResponseInvalid')
  return {
    accounts: body.accounts.map((item): LocalConnection => {
      const row = record(item)
      if (typeof row.id !== 'string' || !/^[a-f0-9]{24}$/.test(row.id) || typeof row.name !== 'string' || !platforms.has(String(row.platform)) || !['loggedIn', 'loggedOut', 'restricted', 'checkpoint', 'unknown', 'shadowSuspect', 'accountWarning'].includes(String(row.state)) || (row.checkedAt !== null && (typeof row.checkedAt !== 'string' || !Number.isFinite(Date.parse(row.checkedAt))))) throw new Error('connectionsResponseInvalid')
      let lastCheck: LocalConnection['lastCheck'] = null
      if (row.lastCheck) {
        const check = record(row.lastCheck)
        if (!['running', 'succeeded', 'stopped', 'unavailable', 'unknown'].includes(String(check.state)) || typeof check.checkedAt !== 'string' || !Number.isFinite(Date.parse(check.checkedAt))) throw new Error('connectionsResponseInvalid')
        lastCheck = { state: check.state as CheckState, checkedAt: check.checkedAt }
        if (check.launchOutcome) {
          const outcome = record(check.launchOutcome)
          const reason = record(outcome.reason)
          if (!browserPhases.includes(outcome.phase as BrowserPhase) || typeof reason.code !== 'string' || (outcome.retryAt !== null && (typeof outcome.retryAt !== 'string' || !Number.isFinite(Date.parse(outcome.retryAt))))) throw new Error('connectionsResponseInvalid')
          lastCheck.launchOutcome = { phase: outcome.phase as BrowserPhase, retryAt: outcome.retryAt as string | null, code: reason.code }
        }
      }
      return { id: row.id, name: row.name, proxyProvider: row.proxyProvider === 'twoCaptcha' || row.proxyProvider === 'byteful' || row.proxyProvider === 'unknown' ? row.proxyProvider : null, homeCountry: typeof row.homeCountry === 'string' && /^[A-Z]{2}$/.test(row.homeCountry) ? row.homeCountry : null, platform: row.platform as ConnectionPlatform, status: accountStatuses.includes(row.status as AccountStatus) ? row.status as AccountStatus : 'unknown', state: row.state as LocalConnection['state'], checkedAt: row.checkedAt as string | null, lastCheck }
    }),
    extensions: body.extensions.map((item): ExtensionConnection => {
      const row = record(item)
      if (!providers.has(String(row.key)) || !['configured', 'notConfigured', 'unavailable'].includes(String(row.state)) || !Array.isArray(row.fields) || row.fields.length > 3 || typeof row.persisted !== 'boolean') throw new Error('connectionsResponseInvalid')
      return { key: row.key as string, state: row.state as ExtensionConnection['state'], persisted: row.persisted, fields: row.fields.map((value): SavedKeyField => {
        const field = record(value)
        if (typeof field.id !== 'string' || !/^[A-Z][A-Z0-9_]+$/.test(field.id) || typeof field.label !== 'string' || typeof field.hasValue !== 'boolean' || (field.masked !== null && field.masked !== '••••••••••••••••')) throw new Error('connectionsResponseInvalid')
        return { id: field.id, label: field.label, required: field.required !== false, inputType: field.inputType === 'url' || field.inputType === 'text' ? field.inputType : 'password', hasValue: field.hasValue, masked: field.masked as string | null }
      }) }
    }),
  }
}

export async function loadConnections(signal: AbortSignal): Promise<LocalConnections> {
  const response = await fetch('/api/console/connections', { signal, credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) throw new Error('connectionsUnavailable')
  return parseConnections(await response.json())
}

export async function saveConnectionKeys(provider: string, values: Record<string, string>): Promise<LocalConnections> {
  const response = await fetch('/api/console/credentials', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json', 'x-log-console': '1' }, body: JSON.stringify({ provider, values }) })
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(['credentialRejected', 'credentialRateLimited', 'credentialValidationUnavailable', 'credentialInputInvalid'].includes(body?.error) ? body.error : 'credentialSaveFailed') }
  const body = record(await response.json())
  if (body.saved !== true) throw new Error('credentialSaveUnconfirmed')
  if (provider === 'adsPower') {
    const saved = await readConnectionKeys(provider, AbortSignal.timeout(10000))
    const countries = values.LOG_ADSPOWER_HOMES?.trim().toLowerCase() === 'all' ? 'all' : [...new Set((values.LOG_ADSPOWER_HOMES ?? '').split(',').map((value) => value.trim().toUpperCase()))].join(',')
    if (saved.LOG_ADSPOWER_HOMES !== countries) throw new Error('credentialSaveUnconfirmed')
  }
  return parseConnections(body.connections)
}

export async function checkConnection(accountId: string) {
  const response = await fetch('/api/console/connections/check', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json', 'x-log-console': '1' }, body: JSON.stringify({ accountId }) })
  if (!response.ok) throw new Error('accountCheckUnavailable')
  const body = record(await response.json())
  return parseConnections(body.connections)
}


export async function readConnectionKeys(provider: string, signal: AbortSignal): Promise<Record<string, string>> {
  const response = await fetch('/api/console/credentials/read', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-log-console': '1' }, body: JSON.stringify({ provider }) })
  if (!response.ok) throw new Error('credentialReadFailed')
  const values = record(record(await response.json()).values)
  if (Object.entries(values).some(([name, value]) => !/^[A-Z][A-Z0-9_]+$/.test(name) || typeof value !== 'string' || value.length > 8192)) throw new Error('credentialReadFailed')
  return values as Record<string, string>
}
