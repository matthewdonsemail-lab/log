import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, chmodSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseEnvFile, userEnvPath } from '../../config/userEnv'
import { credentialFields } from './types'

export function savedCredential(name: string, env: Record<string, string | undefined> = process.env): string | null {
  if (env !== process.env && !env.LOG_USER_ENV) return null
  const path = userEnvPath(env)
  if (!existsSync(path)) return null
  return parseEnvFile(readFileSync(path, 'utf8'))[name]?.trim() || null
}

export function validateCredentialInput(provider: string, values: unknown): Record<string, string> {
  if (!Object.prototype.hasOwnProperty.call(credentialFields, provider) || !values || typeof values !== 'object' || Array.isArray(values)) throw new Error('credentialInputInvalid')
  const entries = Object.entries(values)
  if (entries.length !== credentialFields[provider].length || entries.some(([name, value]) => !credentialFields[provider].some((field) => field.id === name) || typeof value !== 'string' || !value.trim() || value.length > 8192 || /[\r\n\0"']/.test(value))) throw new Error('credentialInputInvalid')
  return Object.fromEntries(entries.map(([name, value]) => [name, String(value).trim()]))
}

export function saveProviderCredentials(provider: string, values: unknown, env: Record<string, string | undefined> = process.env) {
  if (!Object.prototype.hasOwnProperty.call(credentialFields, provider) || !values || typeof values !== 'object' || Array.isArray(values)) throw new Error('credentialInputInvalid')
  const fields = credentialFields[provider]
  const input = values as Record<string, unknown>
  const entries = Object.entries(input)
  if (!entries.length || entries.some(([name, value]) => !fields.some((field) => field.id === name) || typeof value !== 'string' || !value.trim() || value.length > 8192 || /[\r\n\0"']/.test(value))) throw new Error('credentialInputInvalid')
  const path = userEnvPath(env)
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : ''
  const previous = parseEnvFile(existing)
  const changed = entries.filter(([name, value]) => previous[name] !== String(value).trim())
  if (!changed.length) return { saved: true, changed: false }
  const update = new Map(changed.map(([name, value]) => [name, String(value).trim()]))
  const lines = existing.split(/\r?\n/).filter((line) => {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)
    return !match || !update.has(match[1])
  })
  while (lines.at(-1) === '') lines.pop()
  for (const [name, value] of update) lines.push(`${name}="${value}"`)
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const pending = `${path}.${process.pid}.pending`
  writeFileSync(pending, `${lines.join('\n')}\n`, { mode: 0o600 })
  chmodSync(pending, 0o600)
  renameSync(pending, path)
  const verified = parseEnvFile(readFileSync(path, 'utf8'))
  for (const [name, value] of update) {
    if (verified[name] !== value) throw new Error('credentialSaveUnconfirmed')
    env[name] = value
  }
  return { saved: true, changed: true }
}
