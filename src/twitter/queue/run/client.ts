import { createActor, toPromise } from 'xstate'
import type { InspectionEvent } from 'xstate'
import type { Queue } from '../plan/index'
import { approvalProblem } from '../plan/index'
import { queueRunMachine } from './machine'
import type { RunDeps, RunResult } from './types'

export { dropPost, failureOf, mergeAdded, refusalOf, sentUrlOf, succeeded } from './helpers/index'

export async function runQueue(queue: Queue, deps: RunDeps, trace?: (event: InspectionEvent) => void): Promise<RunResult> {
  const refused = approvalProblem(queue)
  if (refused) throw new Error(refused)
  if (!queue.randomRun) throw new Error('no random plan: run queue plan first')
  const actor = createActor(queueRunMachine, { input: { queue, deps }, ...(trace ? { inspect: trace } : {}) })
  const ended = toPromise(actor)
  actor.start()
  actor.send({ type: 'BEGIN' })
  const output = await ended
  if (output.crashed) throw output.error
  return output.result!
}
