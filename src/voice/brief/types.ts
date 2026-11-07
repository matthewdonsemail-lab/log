import type { Room } from '../room/index'

export const BRIEF_PASS = 0.7

export const BRIEF_MODEL = 'subq-snap-1.1'

export const ATTACHED_TEXT_CHARS = 6000

export const BRIEF_CHECKS = ['clear', 'why', 'doneWhen', 'kind', 'steerable'] as const

export type BriefCheck = (typeof BRIEF_CHECKS)[number]

export interface BriefDraft {
  to: string
  text: string
  conversation?: readonly unknown[]
  room?: Room
  attached?: readonly { name: string; text: string | null }[]
  howMattWrites?: string
}

export interface BriefReading {
  to: string
  scores: Record<BriefCheck, number>
  fitsTheRoom: number | null
  pass: boolean
}
