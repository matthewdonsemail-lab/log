export const SUBQ_DECISIONS_URL = 'https://api.subq.ai/v1/systemone'
export const SUBQ_DECISIONS_MODEL = 'subq-snap-preview'

export type DecisionQuestion =
  | { type: 'noul'; instructions: string; criteria?: { true?: string; false?: string } }
  | { type: 'choice'; instructions: string; criteria: Record<string, string | null> }
  | { type: 'score'; instructions: string; criteria: string[] }

export interface DecisionImage {
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp'
  base64: string
}

export interface DecisionRequest {
  state: unknown
  questions: Record<string, DecisionQuestion>
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

export type DecisionsClient = (request: DecisionRequest) => Promise<DecisionResponse>
