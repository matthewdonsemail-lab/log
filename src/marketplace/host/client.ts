/**
 * The host runner (rule 35): the lifecycle machine, run for one account with
 * the real steps (`actors`, provided by the caller), every change saved.
 *
 *   start ─▶ read progress ─▶ createActor(lifecycleMachine, { input: { standing, resume } })
 *     each snapshot ─▶ progress.json (persisted snapshot + resume) ─▶ Twenty milestones
 *     control.jsonl ─▶ actor.send (PERSON_DONE, SHUTDOWN, PAUSE, RESUME, LOST, ACT)
 *   final state ─▶ done
 *
 * A restart resumes from `resume` (what was done), never mid-step: the old
 * browser is gone, so the machine opens one fresh browser and its router walks
 * to the exact next step.
 */
import { createActor } from 'xstate'
import type { AnyActorLogic, InspectionEvent } from 'xstate'
import { statePath } from '../lifecycle/helpers/standing'
import { lifecycleMachine } from '../lifecycle/machine'
import type { AccountStanding, LifecycleContext, LifecycleTiming } from '../lifecycle/types'
import { milestones, readControl, readProgress, resumeFrom, writeProgress } from './helpers/progress'
import type { MilestoneField } from './types'

export interface RunHostOptions {
  account: string
  standing: AccountStanding
  liveActions: boolean
  /** The lifecycle's steps, run in the one open browser (`src/cli/host`); tests script them. */
  actors: Record<string, AnyActorLogic>
  /** Writes milestone fields to the account in Twenty. */
  saveFields: (fields: Partial<Record<MilestoneField, string>>) => Promise<void>
  /** The account's local day (`YYYY-MM-DD`): opens are counted per day. */
  today: string
  timing?: Partial<LifecycleTiming>
  onLine?: (line: string) => void
  inspect?: (event: InspectionEvent) => void
  pollMs?: number
}

export interface HostResult {
  state: string
  context: LifecycleContext
}

/** Twenty gets the lane-level state (`onboarding.warming`), the file the full path. */
const laneState = (state: string) => state.split('.').slice(0, 2).join('.')

export function runHost(options: RunHostOptions): { done: Promise<HostResult>; send: (event: Parameters<ReturnType<typeof createActor<typeof lifecycleMachine>>['send']>[0]) => void } {
  const log = options.onLine ?? (() => {})
  const progress = readProgress(options.account)
  const resume = resumeFrom(progress, options.today)
  if (resume) log(`host ${options.account}: resuming (${resume.warmupDone.length} warm-up activities done, ${resume.opensToday} open(s) today)`)
  const machine = lifecycleMachine.provide({ actors: options.actors as never })
  const actor = createActor(machine, {
    input: { standing: options.standing, liveActions: options.liveActions, timing: options.timing, resume },
    inspect: options.inspect
  })

  let last: LifecycleContext | null = null
  let lastLane = ''
  let lastState = ''
  // Twenty writes in order, one at a time; a failed write is logged and the next milestone tries again.
  let writes = Promise.resolve()
  actor.subscribe((snapshot) => {
    const state = statePath(snapshot.value)
    const context = snapshot.context
    if (state !== lastState) log(`host ${options.account}: ${state}`)
    lastState = state
    writeProgress({
      account: options.account,
      accountId: options.standing.accountId,
      state,
      savedAt: new Date().toISOString(),
      day: options.today,
      resume: { warmupDone: context.warmup.done, warmupStartedAt: context.warmup.startedAt, opensToday: context.browser.opensToday },
      issue: context.issue,
      lastError: context.lastError,
      closes: context.browser.closes,
      snapshot: actor.getPersistedSnapshot()
    })
    const fields = milestones(last, context, laneState(state), new Date())
    const lane = fields.lifecycleState!
    if (lane === lastLane) delete fields.lifecycleState
    lastLane = lane
    last = context
    if (Object.keys(fields).length) {
      writes = writes.then(() => options.saveFields(fields)).catch((error) => log(`host ${options.account}: could not save ${Object.keys(fields).join(', ')} to Twenty (${error instanceof Error ? error.message : String(error)})`))
    }
  })

  let offset = readControl(options.account, Number.MAX_SAFE_INTEGER).offset
  let finished = false
  const poll = async () => {
    while (!finished) {
      await new Promise((r) => setTimeout(r, options.pollMs ?? 1000))
      const read = readControl(options.account, offset)
      offset = read.offset
      for (const event of read.events) {
        log(`host ${options.account}: event ${event.type}`)
        actor.send(event)
      }
    }
  }

  const done = new Promise<HostResult>((resolve) => {
    actor.subscribe({
      complete: () => {
        finished = true
        const snap = actor.getSnapshot()
        void writes.then(() => resolve({ state: statePath(snap.value), context: snap.context }))
      }
    })
  })
  actor.start()
  void poll()
  return { done, send: (event) => actor.send(event) }
}
