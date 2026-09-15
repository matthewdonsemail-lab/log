import type { BrandEntity, BrandSourceRef } from './types'

/**
 * Voice → system prompt compiler. Deterministic and versioned: the same
 * brand always compiles to the same prompt, and every draft records the
 * version that produced it so voice edits never silently rewrite history.
 */
export const PROMPT_VERSION = 1

const FORMALITY_LINES: Record<BrandEntity['voice']['formality'], string> = {
  casual: 'Keep it casual: contractions, short sentences, first names, a warm sign-off.',
  professional: 'Keep it professional but plain-spoken: clear sentences, no jargon, a brief sign-off.',
  formal: 'Keep it formal: full sentences, titles where known, a courteous sign-off.',
}

/**
 * Compile the exact system prompt the agent receives — identity line, tone
 * and formality rules, offerings with details, dos / don'ts verbatim, then
 * the gold examples in full. What the Brand tab previews is byte-for-byte
 * what the agent will be told.
 */
export function buildBrandSystemPrompt(brand: BrandEntity): string {
  const lines: string[] = [
    `You speak as ${brand.identity.name}${brand.identity.tagline ? ` — ${brand.identity.tagline}` : ''}.`,
    `Voice: ${brand.voice.tone}`,
    FORMALITY_LINES[brand.voice.formality],
  ]
  if (brand.offerings.length > 0) {
    lines.push('Services you can mention:')
    for (const offering of brand.offerings) {
      lines.push(`- ${offering.name}${offering.detail ? `: ${offering.detail}` : ''}`)
    }
  }
  if (brand.location.label) {
    lines.push(`Service area: ${brand.location.label}.`)
  }
  for (const rule of brand.voice.dos) {
    lines.push(`Do: ${rule}`)
  }
  for (const rule of brand.voice.donts) {
    lines.push(`Never: ${rule}`)
  }
  if (brand.voice.examples.length > 0) {
    lines.push('Example replies to mimic:')
    for (const example of brand.voice.examples) {
      lines.push(`[${example.situation}] ${example.reply}`)
    }
  }
  return lines.join('\n')
}

/** Up-front retrieval over indexed sources: rank by keyword overlap. */
export function retrieveSourceRefs(
  brand: BrandEntity,
  query: string,
  limit = 2,
): BrandSourceRef[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4)
  if (tokens.length === 0) return []
  const scored = brand.sources
    .filter((page) => page.status === 'indexed')
    .map((page) => {
      const haystack = `${page.title} ${page.headings.join(' ')} ${page.text}`.toLowerCase()
      const score = tokens.filter((token) => haystack.includes(token)).length
      return { page, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ page }) => ({
    url: page.url,
    excerpt: page.text.slice(0, 160),
  }))
}

export interface ReplyContext {
  /** Exact system prompt — agent `instructions`, or the mock's rule source. */
  systemPrompt: string
  /** Prompt version stamped on the draft. */
  promptVersion: number
  /** Cited pages behind the draft — the mock mirror of RAG hits. */
  sourceRefs: BrandSourceRef[]
}

/**
 * Build the full reply context for an event: compiled prompt + retrieved
 * sources. The live agent passes this as system prompt and up-front RAG
 * messages; the mock `draftReply()` reads the same object.
 */
export function buildReplyContext(brand: BrandEntity | null, eventText: string): ReplyContext {
  if (!brand) {
    return { systemPrompt: '', promptVersion: PROMPT_VERSION, sourceRefs: [] }
  }
  return {
    systemPrompt: buildBrandSystemPrompt(brand),
    promptVersion: PROMPT_VERSION,
    sourceRefs: retrieveSourceRefs(brand, eventText),
  }
}
