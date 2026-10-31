export interface CopyVersion {
  id: string
  title: string
  description: string
}

export interface LiveCopy {
  title: string
  description: string
  copyVersionId: string | null
}

export interface CopyProblem {
  versionId: string
  rule: string
  detail: string
}

export const MIN_COPY_VERSIONS = 3

export const MIN_TITLE_DIFFERENCE = 0.5

export const MAX_TITLE_LENGTH = 70

export const TITLE_WEIGHT = 2 / 3

export const BANNED_PHRASES: readonly string[] = [
  'cheap',
  'cheapest',
  'affordable',
  'best price',
  'lowest price',
  "won't last",
  'wont last',
  "don't miss",
  'dont miss',
  'limited time'
]

export const LIVE_COPY_STATUSES = ['ready', 'publishing', 'unconfirmed', 'active', 'underReview'] as const
