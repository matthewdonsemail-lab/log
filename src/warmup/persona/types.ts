export interface DatasetRow {
  source: string
  fields: Record<string, string>
}

export interface BehaviourProfile {
  seed: number
  country: string
  rows: DatasetRow[]
  summary: Record<string, string>
}

export type PersonaSegment = 'lurker' | 'skipper' | 'social' | 'commerce'

export interface PersonaPack {
  personaId: string
  segment: PersonaSegment
  interests: string[]
  traits: {
    ageBand: string
    gender: string
    occupation: string
    attentionCapS: number
    completionP: number
    skipP: number
    likeP: number
    commentP: number
    profileP: number
    commentMs: number
    profileMs: number
    sessionReels: number
    adSkipP: number
    likeCooldownReels: number
  }
  provenance: string[]
}
