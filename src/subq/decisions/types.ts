/**
 * SubQ's Decisions API (`POST https://api.subq.ai/v1/systemone`,
 * docs.subq.ai/endpoints/decisions-api, saved in
 * `docs/deviceIsolation/subqDocs.md`): typed yes/no (`noul`), `choice` and
 * `score` answers about a `state` and up to 4 images, with probabilities.
 * Video isn't supported: frames of it are sent as images. Billed on input
 * tokens only; an image is about 64-256 tokens. Paid (rule 41): used only
 * where matt asked, the reel warm-up's labels and decisions (rule 50).
 */

export const SUBQ_DECISIONS_URL = 'https://api.subq.ai/v1/systemone'
export const SUBQ_DECISIONS_MODEL = 'subq-snap-preview'

export type DecisionQuestion =
  | { type: 'noul'; instructions: string; criteria?: { true?: string; false?: string } }
  | { type: 'choice'; instructions: string; criteria: Record<string, string | null> }
  | { type: 'score'; instructions: string; criteria: string[] }

/** One image: plain base64 of PNG, JPEG or WebP bytes (no `data:` prefix), up to 4 MiB decoded. */
export interface DecisionImage {
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp'
  base64: string
}

export interface DecisionRequest {
  state: unknown
  /** 1-16 named questions. */
  questions: Record<string, DecisionQuestion>
  /** Up to 4. */
  images?: DecisionImage[]
}

export type DecisionAnswer =
  | { type: 'noul'; noul: number }
  | { type: 'choice'; choice: string; probabilities: Record<string, number>; confidence: number }
  | { type: 'score'; score: number; legend: Record<string, string>; probabilities: Record<string, number>; confidence: number }

export interface DecisionResponse {
  model: string
  answers: Record<string, DecisionAnswer>
  usage: { input_tokens: number; output_tokens: number }
}

/** Sends one decision request. Injected in tests, so none calls SubQ. */
export type DecisionsClient = (request: DecisionRequest) => Promise<DecisionResponse>
