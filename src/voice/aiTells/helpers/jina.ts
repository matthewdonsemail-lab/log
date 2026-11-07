import { noteProviderAnswer, withCreditNote } from '../../../billing/balance/helpers/answers'
import { saveVectors, vectorsFor } from '../../../inbox/store/index'
import { JINA_DIMENSIONS, JINA_EMBED_MODEL, JINA_RERANK_MODEL } from '../types'
import type { AiEmbedder } from '../types'

async function call(path: string, key: string, body: unknown): Promise<Record<string, unknown>> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`https://api.jina.ai/v1/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (response.ok) {
      noteProviderAnswer('jina', response.status)
      return (await response.json()) as Record<string, unknown>
    }
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
      continue
    }
    const said = withCreditNote('jina', response.status, (await response.text()).slice(0, 200))
    throw new Error(`jina ${path} answered ${response.status}: ${said}`)
  }
}

export function jinaEmbedder(key = process.env.JINA_API_KEY ?? '', batch = 256): AiEmbedder {
  if (!key) throw Object.assign(new Error('JINA_API_KEY is not set (log-cli/.env.local)'), { code: 'jinaKeyMissing' })
  return {
    model: JINA_EMBED_MODEL,
    dimensions: JINA_DIMENSIONS,
    async embed(texts) {
      const held = vectorsFor(JINA_EMBED_MODEL, JINA_DIMENSIONS, texts)
      const missing = [...new Set(texts.filter((_, i) => !held[i]))]
      const made = new Map<string, number[]>()
      for (let start = 0; start < missing.length; start += batch) {
        const slice = missing.slice(start, start + batch)
        const answer = await call('embeddings', key, { model: JINA_EMBED_MODEL, task: 'text-matching', dimensions: JINA_DIMENSIONS, input: slice })
        const data = (answer.data as { index: number; embedding: number[] }[]).sort((a, b) => a.index - b.index)
        data.forEach((d, i) => made.set(slice[i], d.embedding))
        saveVectors(JINA_EMBED_MODEL, JINA_DIMENSIONS, data.map((d, i) => ({ text: slice[i], vector: d.embedding })))
      }
      return texts.map((text, i) => (held[i] ? Array.from(held[i]!) : made.get(text)!))
    },
    async rerank(query, documents) {
      if (!documents.length) return []
      const answer = await call('rerank', key, { model: JINA_RERANK_MODEL, query, documents, top_n: documents.length })
      const scores = new Array<number>(documents.length).fill(0)
      for (const r of answer.results as { index: number; relevance_score: number }[]) scores[r.index] = r.relevance_score
      return scores
    },
  }
}
