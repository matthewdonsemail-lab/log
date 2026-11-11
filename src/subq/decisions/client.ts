import { subqKey } from './helpers'
export { subqKey, subqKeyFile } from './helpers'
import { noteProviderAnswer, outOfCreditNote } from '../../billing/balance/helpers/answers'
import type { DecisionRequest, DecisionResponse, DecisionsClient } from './types'
import { SUBQ_DECISIONS_MODEL, SUBQ_DECISIONS_URL } from './types'
import { timed } from '../../observability/timing'

export function createDecisionsClient(key: string | null = subqKey()): DecisionsClient {
  return async (request: DecisionRequest): Promise<DecisionResponse> => {
    if (!key) throw Object.assign(new Error('SUBQ_API_KEY is not set (~/.config/listeningkit/subq-api-key.txt or .env.local)'), { code: 'subqKeyMissing' })
    return timed('inference', async (span) => {
      const body = JSON.stringify({ model: SUBQ_DECISIONS_MODEL, ...request })
      for (const [attempt, wait] of [0, 1000, 3000].entries()) {
        if (wait) await new Promise((r) => setTimeout(r, wait))
        const response = await fetch(SUBQ_DECISIONS_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body })
        if (response.ok) {
          noteProviderAnswer('subq', response.status)
          const answer = (await response.json()) as DecisionResponse
          if (typeof answer.usage?.input_tokens === 'number') span.attrs.inputTokens = answer.usage.input_tokens
          if (typeof answer.usage?.output_tokens === 'number') span.attrs.outputTokens = answer.usage.output_tokens
          return answer
        }
        const text = await response.text()
        const retryable = response.status === 429 || response.status >= 500
        if (!retryable || attempt === 2) {
          let message = text.slice(0, 300)
          try {
            message = (JSON.parse(text) as { detail?: { message?: string } }).detail?.message ?? message
          } catch {
          }
          const answer = noteProviderAnswer('subq', response.status, message)
          if (answer.outOfCredit) throw Object.assign(new Error(`SubQ ${response.status}: ${message} (${outOfCreditNote('subq')})`), { code: 'providerOutOfCredit' })
          throw Object.assign(new Error(`SubQ ${response.status}: ${message}`), { code: 'subqRequestFailed' })
        }
      }
      throw Object.assign(new Error('SubQ: no answer'), { code: 'subqRequestFailed' })
    }, { provider: 'subq' })
  }
}
