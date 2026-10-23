import { answerWait } from '../../../../browser/flow/helpers/answers'
import { stepExchangesAt } from '../../../../subq/stepReading/helpers/stepExchanges'
import type { ActivityStep } from '../types'

export { ANSWER_WAIT_MS, answerIssueOf, answersIssue, valueAt } from '../../../../browser/flow/helpers/answers'

export const answersAt = stepExchangesAt

export function answerWaitOf(step: ActivityStep): { name: string; ms: number } | undefined {
  return answerWait(step.expect?.answers)
}
