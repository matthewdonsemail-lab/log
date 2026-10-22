/**
 * The application in Twenty (rule 45): `joinSubmission.application` on the
 * account's agencyGroup row, patched after every fill step with a history
 * line naming the stepper step it did. Nothing here touches Facebook.
 */
import type { TwentyClient, TwentyObjects } from '../../twenty/graphql/index'
import { AGENCY_GROUPS, toGroup } from '../join/client'
import { draftComplete, patchSubmission } from '../join/helpers/index'
import type { Group, JoinDraft, JoinOptions } from '../join/types'
import type { Application, ApplicationStatus } from './types'

/** What the draft makes of the application before any fill: notStarted, drafting or ready. Pure. */
export function applicationFromDraft(options: JoinOptions | null, draft: JoinDraft | null, now: Date): Application {
  if (!options || !draft) return { status: 'notStarted', filled: [], submittedAt: null, updatedAt: now.toISOString(), detail: 'no draft: run the stepper (log facebook join group --answer)' }
  const complete = draftComplete(options, draft)
  return complete.complete
    ? { status: 'ready', filled: [], submittedAt: null, updatedAt: now.toISOString(), detail: 'every answer given and the rules agreed: log facebook join group --fill --live' }
    : { status: 'drafting', filled: [], submittedAt: null, updatedAt: now.toISOString(), detail: `missing: ${complete.missing.join('; ')}` }
}

/** One fill step's outcome on the row: the application's status, what is filled, and a history line. */
export async function patchApplication(
  twenty: TwentyClient,
  group: Group,
  next: { status: ApplicationStatus; filled: string[]; detail: string; answerState?: string | null },
  step: { step: string; folder: string | null },
  now: Date
): Promise<Group> {
  const previous = group.joinSubmission.application
  const application: Application = {
    status: next.status,
    answerState: next.answerState ?? previous?.answerState ?? null,
    filled: next.filled,
    submittedAt: next.status === 'submitted' ? now.toISOString() : (previous?.submittedAt ?? null),
    updatedAt: now.toISOString(),
    detail: next.detail
  }
  const formPhase = next.status === 'submitted' ? 'submitted' : next.status === 'filling' || next.status === 'filled' ? 'submitting' : group.joinSubmission.formPhase
  const joinSubmission = patchSubmission(
    group.joinSubmission,
    { application, formPhase, ...(next.status === 'submitted' ? { submittedAt: application.submittedAt, answers: group.joinSubmission.draftAnswers } : {}) },
    { at: now.toISOString(), step: step.step, detail: next.detail, folder: step.folder }
  )
  return toGroup(await twenty.update(AGENCY_GROUPS, group.id, { joinSubmission } as unknown as TwentyObjects['agencyGroups']['update']))
}
