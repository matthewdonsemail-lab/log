import { spawnSync } from 'node:child_process'
import { envValue } from '../../extensions/voiceClone/helpers/provider'
import { bytefulCredentials, getCreditCents, getResidentialSummary } from '../../proxyVendor/byteful/index'
import { getBalance, twoCaptchaCredentials } from '../../proxyVendor/twoCaptcha/index'
import { assemblyAiKey } from '../../media/voiceNotes/client'
import { subqKey } from '../../subq/decisions/client'
import { lastAnswers } from './helpers/answers'
import { FISH_BALANCE_URL, JINA_BALANCE_URL, LOW_AT, PROVIDER_INFO, PROVIDERS } from './types'
import type { BalanceState, Provider, ProviderAnswer, ProviderBalance } from './types'

export interface BalanceDeps {
  key: (provider: Provider) => string | null
  fetcher: typeof fetch
  answers: () => Map<Provider, ProviderAnswer>
  treg: () => string | null
  twoCaptcha: (key: string) => Promise<number>
  byteful: () => Promise<{ mbLeft: number; creditUsd: number } | null>
}

function bytefulEnv(env: Record<string, string | undefined>): Record<string, string | undefined> {
  return { ...env, BYTEFUL_PUBLIC_KEY: envValue('BYTEFUL_PUBLIC_KEY', env) ?? undefined, BYTEFUL_PRIVATE_KEY: envValue('BYTEFUL_PRIVATE_KEY', env) ?? undefined }
}

export function keyOf(provider: Provider, env: Record<string, string | undefined> = process.env): string | null {
  if (provider === 'subq') return subqKey(env) ?? envValue('SUBQ_API_KEY', env)
  if (provider === 'assemblyAi') return assemblyAiKey(env)
  if (provider === 'twoCaptcha') {
    const creds = twoCaptchaCredentials(env)
    return 'apiKey' in creds ? creds.apiKey : envValue('2CAPTCHA_API_KEY', env) ?? envValue('TWOCAPTCHA_API_KEY', env)
  }
  if (provider === 'byteful') return 'missing' in bytefulCredentials(bytefulEnv(env)) ? null : 'set'
  if (provider === 'treg') return 'cli'
  for (const name of PROVIDER_INFO[provider].keyNames) {
    const value = envValue(name, env)
    if (value) return value
  }
  return null
}

export const balanceDeps: BalanceDeps = {
  key: (provider) => keyOf(provider),
  fetcher: fetch,
  answers: () => lastAnswers(),
  treg: () => {
    const run = spawnSync('treg', ['balance'], { encoding: 'utf8', timeout: 30_000, shell: process.platform === 'win32', windowsHide: true })
    return run.status === 0 ? run.stdout : null
  },
  twoCaptcha: async (key) => (await getBalance(key)).balance,
  byteful: async () => {
    const creds = bytefulCredentials(bytefulEnv(process.env))
    if ('missing' in creds) return null
    const [summary, cents] = await Promise.all([getResidentialSummary(creds), getCreditCents(creds)])
    return { mbLeft: Math.round(summary.bytesLeft / 1_000_000), creditUsd: cents / 100 }
  },
}

function stateOfAmount(provider: Provider, amount: number): BalanceState {
  if (amount <= 0) return 'empty'
  const low = LOW_AT[provider]
  return low !== undefined && amount < low ? 'low' : 'ok'
}

function stateOfAnswer(answer: ProviderAnswer | null): BalanceState {
  if (!answer) return 'unknown'
  if (answer.outOfCredit) return 'outOfCredit'
  return answer.ok ? 'ok' : 'failing'
}

function worse(fromApi: BalanceState, answer: ProviderAnswer | null): BalanceState {
  return answer?.outOfCredit ? 'outOfCredit' : fromApi
}

async function amountOf(provider: Provider, key: string, deps: BalanceDeps): Promise<{ amount: number; shown: string } | null> {
  if (provider === 'jina') {
    const answer = await deps.fetcher(`${JINA_BALANCE_URL}${encodeURIComponent(key)}`)
    if (!answer.ok) throw new Error(`Jina answered ${answer.status}`)
    const wallet = ((await answer.json()) as { wallet?: { total_balance?: number } }).wallet
    const tokens = Number(wallet?.total_balance ?? 0)
    return { amount: tokens, shown: `${tokens.toLocaleString('en-GB')} tokens` }
  }
  if (provider === 'fishAudio') {
    const answer = await deps.fetcher(FISH_BALANCE_URL, { headers: { Authorization: `Bearer ${key}` } })
    if (!answer.ok) throw new Error(`Fish Audio answered ${answer.status}`)
    const credit = Number(((await answer.json()) as { credit?: string | number }).credit ?? 0)
    return { amount: credit, shown: `$${credit.toFixed(2)} credit` }
  }
  if (provider === 'treg') {
    const said = deps.treg()
    const dollars = said ? /Balance\s+\$([\d,.]+)/.exec(said)?.[1] : undefined
    if (!dollars) throw new Error('treg balance gave no balance (is the treg CLI signed in?)')
    const amount = Number(dollars.replace(/,/g, ''))
    return { amount, shown: `$${amount.toFixed(2)}` }
  }
  if (provider === 'twoCaptcha') {
    const amount = await deps.twoCaptcha(key)
    return { amount, shown: `$${amount.toFixed(2)}` }
  }
  if (provider === 'byteful') {
    const found = await deps.byteful()
    return found === null ? null : { amount: found.mbLeft, shown: `${found.mbLeft} MB residential left, $${found.creditUsd.toFixed(2)} credit` }
  }
  return null
}

export async function balanceOf(provider: Provider, deps: BalanceDeps = balanceDeps, answers = deps.answers()): Promise<ProviderBalance> {
  const info = PROVIDER_INFO[provider]
  const lastAnswer = answers.get(provider) ?? null
  const base = { provider, label: info.label, usedFor: info.usedFor, lastAnswer, topUp: info.topUp }
  const key = deps.key(provider)
  if (!key) return { ...base, state: 'notSetUp', amount: null, how: 'notSetUp', detail: `no key (${info.keyNames.join(' or ')})` }
  if (info.balanceApi) {
    try {
      const found = await amountOf(provider, key, deps)
      if (found) {
        const state = worse(stateOfAmount(provider, found.amount), lastAnswer)
        return { ...base, state, amount: found.shown, how: 'balanceApi', detail: `read from ${info.label}'s own balance` }
      }
    } catch (error) {
      return { ...base, state: stateOfAnswer(lastAnswer) === 'ok' ? 'unknown' : stateOfAnswer(lastAnswer), amount: null, how: 'lastCall', detail: `its balance couldn't be read: ${(error as Error).message}` }
    }
  }
  const state = stateOfAnswer(lastAnswer)
  const detail = lastAnswer ? `${info.label} has no balance API, so this is its last answer to a real call` : `${info.label} has no balance API and log hasn't called it since answers were kept`
  return { ...base, state, amount: null, how: 'lastCall', detail }
}

export async function checkBalances(only: readonly Provider[] = PROVIDERS, deps: BalanceDeps = balanceDeps): Promise<ProviderBalance[]> {
  const answers = deps.answers()
  return Promise.all(only.map((provider) => balanceOf(provider, deps, answers)))
}

export function needsMoney(balances: readonly ProviderBalance[]): ProviderBalance[] {
  return balances.filter((b) => b.state === 'empty' || b.state === 'outOfCredit' || b.state === 'low')
}
