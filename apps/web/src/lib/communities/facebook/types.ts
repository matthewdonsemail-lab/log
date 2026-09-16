import type { AccountIssue } from '../../account-issues'
import type { CommunityRemovalProvenance } from '../types'

/**
 * Facebook membership lifecycle. String state values are the xstate nodes;
 * everything the dashboard needs to render (questions, drafts, provenance)
 * rides in {@link FacebookContext}, so a snapshot is always the exact truth
 * of what the client is experiencing.
 *
 * Pre-submit modal phases (`inspectingGate`, `formRendered`,
 * `formIncomplete`, `formAbandoned`) map to the shared `none` join state —
 * no request has reached the group yet. The working detail (questions,
 * drafts, lease) lives on the client-task record and the row until submit.
 */
export type FacebookStateValue =
  | 'notMember'
  | 'inspectingGate'
  | 'formRendered'
  | 'formIncomplete'
  | 'formSubmitting'
  | 'formAbandoned'
  | 'pendingApproval'
  | 'limitedMember'
  | 'fullMember'
  | 'declined'
  | 'removed'
  | 'observationWall'

export type FacebookWallType = 'login' | 'checkpoint' | 'unclassified'

export interface FacebookContext {
  accountId: string | null
  accountIssue?: AccountIssue
  /** Last activity inside the modal (scrape, keystroke, resume) — ISO. */
  lastActivityAt: string | null
  questions: string[]
  questionsHash: string | null
  questionsScrapedAt: string | null
  draftAnswers: string[]
  /** Answers carried by the submitted request (kept for declined re-ask). */
  answers: string[]
  answersComplete: boolean
  submittedAt: string | null
  removedBy?: CommunityRemovalProvenance
  wallType?: FacebookWallType
  /** True while the wall overwrites the membership (guards double-walls). */
  walled: boolean
  /** State to restore when the observation clears (platform re-observes). */
  priorValue?: FacebookStateValue | null
  lastError: string | null
}

export type FacebookEvent =
  | { type: 'INITIATE_JOIN'; accountId: string; accountIssue?: AccountIssue }
  | {
      type: 'GATE_INSPECTED'
      requiresQuestions: boolean
      limited?: boolean
      questions?: string[]
      questionsHash?: string
      scrapedAt?: string
    }
  | { type: 'FORM_RENDERED'; questions: string[]; questionsHash: string; scrapedAt: string }
  | { type: 'ANSWERS_UPDATED'; draftAnswers: string[]; at?: string }
  | { type: 'FORM_IDLE_TIMEOUT' }
  | { type: 'RESUME_FORM'; at: string }
  | { type: 'SUBMIT'; answers: string[]; at: string }
  | { type: 'SUBMIT_CONFIRMED'; at: string }
  | { type: 'SUBMIT_FAILED'; error: string }
  | { type: 'APPROVED' }
  | { type: 'OBSERVE_LIMITED' }
  | { type: 'PROMOTED' }
  | { type: 'DECLINED' }
  | { type: 'LEAVE' }
  | { type: 'ADMIN_REMOVED' }
  | { type: 'WITHDRAW' }
  | { type: 'OBSERVE_WALL'; wallType: FacebookWallType }

export interface FacebookInput {
  accountId?: string | null
  accountIssue?: AccountIssue
  questions?: string[]
  questionsHash?: string | null
  questionsScrapedAt?: string | null
  draftAnswers?: string[]
  answers?: string[]
  answersComplete?: boolean
  submittedAt?: string | null
  removedBy?: CommunityRemovalProvenance
}

/** Lease for an open entry-question modal before it reads as abandoned. */
export const FACEBOOK_MODAL_LEASE_MS = 5 * 60 * 1000
