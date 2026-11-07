import { homedir } from 'node:os'
import { join } from 'node:path'

export const PROVIDERS = ['subq', 'jina', 'inworld', 'fishAudio', 'assemblyAi', 'parallel', 'treg', 'twoCaptcha', 'byteful'] as const
export type Provider = (typeof PROVIDERS)[number]

export type BalanceState = 'ok' | 'low' | 'empty' | 'outOfCredit' | 'failing' | 'unknown' | 'notSetUp'

export interface ProviderAnswer {
  provider: Provider
  at: string
  status: number
  ok: boolean
  outOfCredit: boolean
  said: string
}

export interface ProviderBalance {
  provider: Provider
  label: string
  usedFor: string
  state: BalanceState
  amount: string | null
  how: 'balanceApi' | 'lastCall' | 'notSetUp'
  detail: string
  lastAnswer: ProviderAnswer | null
  topUp: string
}

export interface ProviderInfo {
  label: string
  usedFor: string
  keyNames: readonly string[]
  topUp: string
  balanceApi: boolean
}

export const PROVIDER_INFO: Record<Provider, ProviderInfo> = {
  subq: { label: 'SubQ', usedFor: 'the voice gate, page readings, meme taste and the spec gate', keyNames: ['SUBQ_API_KEY'], topUp: 'https://subq.ai', balanceApi: false },
  jina: { label: 'Jina', usedFor: 'the AI tells index and the voice gate ranking (embeddings and rerank)', keyNames: ['JINA_API_KEY'], topUp: 'https://jina.ai/api-dashboard', balanceApi: true },
  inworld: { label: 'Inworld', usedFor: 'voice notes in matt\'s cloned voice (the default voice provider)', keyNames: ['INWORLD_API_KEY'], topUp: 'https://platform.inworld.ai (Billing)', balanceApi: false },
  fishAudio: { label: 'Fish Audio', usedFor: 'voice notes when --provider fishAudio', keyNames: ['FISH_API_KEY'], topUp: 'https://fish.audio/app/billing', balanceApi: true },
  assemblyAi: { label: 'AssemblyAI', usedFor: 'voice note transcripts and the listen-back check', keyNames: ['ASSEMBLYAI_API_KEY', 'ASSEMBLY_AI_KEY'], topUp: 'https://www.assemblyai.com/dashboard/account/billing', balanceApi: false },
  parallel: { label: 'Parallel', usedFor: 'web search and deep research', keyNames: ['PARALLEL_API_KEY'], topUp: 'https://platform.parallel.ai/settings?tab=billing', balanceApi: false },
  treg: { label: 'treg', usedFor: 'lookups, SEO data and X media reads', keyNames: [], topUp: 'treg topup', balanceApi: true },
  twoCaptcha: { label: '2Captcha', usedFor: 'residential proxies and captchas', keyNames: ['2CAPTCHA_API_KEY', 'TWOCAPTCHA_API_KEY'], topUp: 'https://2captcha.com/pay', balanceApi: true },
  byteful: { label: 'Byteful', usedFor: 'residential and static proxies', keyNames: ['BYTEFUL_PUBLIC_KEY'], topUp: 'https://byteful.com', balanceApi: true },
}

export const OUT_OF_CREDIT_WORDS = /insufficient[ _](credit|balance|funds|quota)|out of credits?|no credits? (left|remaining)|credit (limit|balance is)|payment required|exceeded your (current )?quota|quota exceeded|not enough (credit|balance|funds)|balance is (too )?low|creation limit|top up|add (more )?funds/i

export const LOW_AT: Partial<Record<Provider, number>> = { jina: 1_000_000, fishAudio: 1, treg: 5, twoCaptcha: 1, byteful: 100 }

export const ANSWERS_ENV = 'LOG_BILLING_ANSWERS'

export function answersFile(env: Record<string, string | undefined> = process.env, home = homedir()): string {
  return env[ANSWERS_ENV]?.trim() || join(home, '.logCli', 'billing', 'answers.jsonl')
}

export const JINA_BALANCE_URL = 'https://embeddings-dashboard-api.jina.ai/api/v1/api_key/fe_user?api_key='
export const FISH_BALANCE_URL = 'https://api.fish.audio/wallet/self/api-credit'
