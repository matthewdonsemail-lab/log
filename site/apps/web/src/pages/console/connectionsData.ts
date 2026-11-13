import { consoleRequest, type ConsoleTarget } from './consoleClient'

export type ConnectionPlatform = 'twitter' | 'facebook' | 'discord' | 'slack' | 'instagram' | 'reddit' | 'linkedin'
const accountStatuses = ['active', 'warming', 'limited', 'paused', 'needsLogin', 'checkpoint', 'restricted', 'banned', 'dead', 'deactivated'] as const
type AccountStatus = typeof accountStatuses[number]
const sessionStates = ['loggedIn', 'loggedOut', 'restricted', 'checkpoint', 'unknown', 'shadowSuspect', 'accountWarning'] as const
export type CheckState = 'running' | 'succeeded' | 'signInNeeded' | 'stopped' | 'unavailable' | 'unknown'
export type SignInKind = 'cookies' | 'connect' | 'browser'
export type LaunchOutcome = { phase: string; retryAt: string | null; code: string }
export type LocalConnection = { id: string; name: string; homeCountry: string | null; proxyProvider: 'twoCaptcha' | 'byteful' | 'unknown' | null; platform: ConnectionPlatform; status: AccountStatus | 'unknown'; state: typeof sessionStates[number]; checkedAt: string | null; signIn: SignInKind; lastCheck: { state: CheckState; checkedAt: string; launchOutcome?: LaunchOutcome } | null }
export type SavedKeyField = { id: string; label: string; secret: boolean; required: boolean; inputType: 'url' | 'password' | 'text'; hasValue: boolean; masked: string | null }
export type ExtensionConnection = { key: string; state: 'configured' | 'notConfigured' | 'unavailable'; fields: SavedKeyField[]; persisted: boolean }
export type LocalConnections = { accounts: LocalConnection[]; extensions: ExtensionConnection[] }
export type SignInRequest = { platform: string; method: 'cookies' | 'password'; account: string; cookies?: string; username?: string; password?: string }
export type SignInAnswer = { signedIn: boolean; next: 'none' | 'browserCheck'; accountId: string; detail: string; connections: LocalConnections }

export const KEY_MASK = '••••••••••••••••'
const platforms = new Set(['twitter', 'facebook', 'discord', 'slack', 'instagram', 'reddit', 'linkedin'])
const providers = new Set(['adsPower', 'typesafe', 'subq', 'memelord', 'fishAudio', 'inworld', 'treg', 'jina', 'assemblyAi', 'parallel', 'twoCaptcha', 'byteful'])
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('consoleResponseInvalid')
  return value as Record<string, unknown>
}

function lastCheckOf(value: unknown): LocalConnection['lastCheck'] {
  if (!value) return null
  const check = record(value)
  if (!['running', 'succeeded', 'signInNeeded', 'stopped', 'unavailable', 'unknown'].includes(String(check.state)) || !date(check.checkedAt)) throw new Error('consoleResponseInvalid')
  const last: NonNullable<LocalConnection['lastCheck']> = { state: check.state as CheckState, checkedAt: check.checkedAt as string }
  if (check.launchOutcome) {
    const outcome = record(check.launchOutcome)
    if (typeof outcome.phase !== 'string' || typeof outcome.code !== 'string' || (outcome.retryAt !== null && !date(outcome.retryAt))) throw new Error('consoleResponseInvalid')
    last.launchOutcome = { phase: outcome.phase, retryAt: outcome.retryAt as string | null, code: outcome.code }
  }
  return last
}

export function parseConnections(value: unknown): LocalConnections {
  const body = record(value)
  if (body.schemaVersion !== 1 || !Array.isArray(body.accounts) || !Array.isArray(body.extensions)) throw new Error('consoleResponseInvalid')
  return {
    accounts: body.accounts.map((item): LocalConnection => {
      const row = record(item)
      if (typeof row.id !== 'string' || !/^[a-f0-9]{24}$/.test(row.id) || typeof row.name !== 'string' || !platforms.has(String(row.platform)) || !(sessionStates as readonly unknown[]).includes(row.state) || (row.checkedAt !== null && !date(row.checkedAt))) throw new Error('consoleResponseInvalid')
      return {
        id: row.id,
        name: row.name,
        platform: row.platform as ConnectionPlatform,
        proxyProvider: row.proxyProvider === 'twoCaptcha' || row.proxyProvider === 'byteful' || row.proxyProvider === 'unknown' ? row.proxyProvider : null,
        homeCountry: typeof row.homeCountry === 'string' && /^[A-Z]{2}$/.test(row.homeCountry) ? row.homeCountry : null,
        status: (accountStatuses as readonly unknown[]).includes(row.status) ? row.status as AccountStatus : 'unknown',
        state: row.state as LocalConnection['state'],
        checkedAt: row.checkedAt as string | null,
        signIn: row.signIn === 'cookies' || row.signIn === 'connect' ? row.signIn : 'browser',
        lastCheck: lastCheckOf(row.lastCheck),
      }
    }),
    extensions: body.extensions.map((item): ExtensionConnection => {
      const row = record(item)
      if (!providers.has(String(row.key)) || !['configured', 'notConfigured', 'unavailable'].includes(String(row.state)) || !Array.isArray(row.fields) || row.fields.length > 3 || typeof row.persisted !== 'boolean') throw new Error('consoleResponseInvalid')
      return {
        key: row.key as string,
        state: row.state as ExtensionConnection['state'],
        persisted: row.persisted,
        fields: row.fields.map((value): SavedKeyField => {
          const field = record(value)
          if (typeof field.id !== 'string' || !/^[A-Z][A-Z0-9_]+$/.test(field.id) || typeof field.label !== 'string' || typeof field.hasValue !== 'boolean' || (field.masked !== null && field.masked !== KEY_MASK)) throw new Error('consoleResponseInvalid')
          return { id: field.id, label: field.label, secret: field.secret !== false, required: field.required !== false, inputType: field.inputType === 'url' || field.inputType === 'text' ? field.inputType : 'password', hasValue: field.hasValue, masked: field.masked as string | null }
        }),
      }
    }),
  }
}

export async function loadConnections(target: ConsoleTarget, signal?: AbortSignal): Promise<LocalConnections> {
  return parseConnections(await consoleRequest(target, { local: '/api/console/connections', hosted: '/console/connections' }, { signal }))
}

export async function saveConnectionKeys(target: ConsoleTarget, provider: string, values: Record<string, string>): Promise<LocalConnections> {
  const body = record(await consoleRequest(target, { local: '/api/console/credentials', hosted: '/console/credentials', method: 'POST' }, { body: { provider, values } }))
  if (body.saved !== true) throw new Error('credentialSaveUnconfirmed')
  return parseConnections(body.connections)
}

export async function readConnectionKeys(target: ConsoleTarget, provider: string, signal?: AbortSignal): Promise<Record<string, string>> {
  const values = record(record(await consoleRequest(target, { local: '/api/console/credentials/read', hosted: '/console/credentials/read', method: 'POST' }, { body: { provider }, signal })).values)
  if (Object.entries(values).some(([name, value]) => !/^[A-Z][A-Z0-9_]+$/.test(name) || typeof value !== 'string' || value.length > 8192)) throw new Error('consoleResponseInvalid')
  return values as Record<string, string>
}

export async function checkConnection(target: ConsoleTarget, accountId: string): Promise<LocalConnections> {
  return parseConnections(record(await consoleRequest(target, { local: '/api/console/connections/check', hosted: '/console/accountCheck', method: 'POST' }, { body: { accountId } })).connections)
}

export async function signInAccount(target: ConsoleTarget, request: SignInRequest): Promise<SignInAnswer> {
  const body = record(await consoleRequest(target, { local: '/api/console/signIn', hosted: '/console/signIn', method: 'POST' }, { body: request }))
  if (typeof body.signedIn !== 'boolean' || (body.next !== 'none' && body.next !== 'browserCheck') || typeof body.accountId !== 'string') throw new Error('consoleResponseInvalid')
  return { signedIn: body.signedIn, next: body.next, accountId: body.accountId, detail: String(body.detail ?? ''), connections: parseConnections(body.connections) }
}
