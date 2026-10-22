/**
 * The group answer machine (`log facebook join group --fill`, rule 45): the stepper's
 * draft filled into the group's own dialog, one fill step per stepper step,
 * in the account's open browser. Its only side effect is `step`, one command
 * to the open inspect session (goto, click, type, snapshot); tests script it.
 *
 *   opening (goto the group)
 *     ├── the dialog is already open ───────────────▶ reading
 *     ├── `button "Answer questions"`, dry run ─────▶ planned (nothing clicked, rule 8)
 *     ├── `button "Answer questions"`, --live ─▶ reopening (click it) ─▶ reading
 *     │      └── no dialog yet: settling (wait, a fresh snapshot) ─▶ reopening once more
 *     │          (Complainers of Bethlehem, 2026-10-20: the first click loaded Facebook's code and
 *     │          the page moved under the cursor; opening the dialog changes nothing on Facebook)
 *     └── no way back into the questions ───────────▶ stopped (groupQuestionsNotReopened)
 *   reading (snapshot the dialog, plan every step onto its elements)
 *     ├── a step has no element ─▶ stopped (groupFillIncomplete), nothing typed
 *     └── filling: each fill step in turn (click / type) ─▶ filled
 *           └── --submit ─▶ submitting (click Submit) ─▶ checking (snapshot)
 *                 ├── the dialog went ─▶ submitted
 *                 └── it stayed ───────▶ stopped (groupSubmitNotConfirmed), not pressed again
 *   a checkpoint, a login or another page, after any step ─▶ stopped
 */
import { assign, fromPromise, setup } from 'xstate'
import { pageProblem } from '../../../browser/flow/index'
import type { ErrorCode } from '../../../errors/catalog/index'
import { readGroupPage, snapshotElements } from '../join/helpers/index'
import type { GroupStepReply } from '../join/types'
import { planFill } from './helpers/index'
import type { GroupAnswerContext, GroupAnswerInput, GroupAnswerOutput } from './types'

export interface AnswerStepInput {
  action: 'goto' | 'click' | 'type' | 'snapshot' | 'wait'
  args: string[]
}

type Done = { output: GroupStepReply }
type Problem = { code: ErrorCode; detail: string }

const hasDialog = (reply: GroupStepReply | null) => /^\s*-\s+dialog\b/m.test(reply?.snapshot ?? '')
/** The recorded way back in: `button "Answer questions"` (Complainers of Bethlehem, step 20). */
const answerButton = (reply: GroupStepReply | null) => (reply ? snapshotElements(reply).find((e) => e.role === 'button' && /^Answer questions$/i.test(e.name))?.ref ?? null : null)

function problemOf(step: AnswerStepInput, reply: GroupStepReply, failed: ErrorCode): Problem | null {
  const landed = pageProblem({ action: step.action, url: step.action === 'goto' ? step.args[0] : undefined }, reply)
  if (landed) return landed
  return reply.ok === false ? { code: failed, detail: reply.error ?? `${step.action} failed` } : null
}

const noted = (context: GroupAnswerContext, step: string, reply: GroupStepReply, detail?: string) => [...context.steps, { step, ok: reply.ok !== false, folder: reply.folder, detail: detail ?? reply.error }]

export const groupAnswerMachine = setup({
  types: { context: {} as GroupAnswerContext, input: {} as GroupAnswerInput, output: {} as GroupAnswerOutput },
  actors: {
    step: fromPromise<GroupStepReply, AnswerStepInput>(async () => {
      throw new Error('groupAnswerMachine: provide a `step` actor')
    })
  },
  guards: {
    stopped: ({ context }) => context.problem !== null,
    dialogOpen: ({ context }) => hasDialog(context.page),
    canReopenLive: ({ context }) => context.live && answerButton(context.page) !== null,
    canReopen: ({ context }) => answerButton(context.page) !== null,
    moreToFill: ({ context }) => context.index < (context.plan?.steps.length ?? 0),
    submitAsked: ({ context }) => context.live && context.submit,
    dialogGone: ({ context }) => !hasDialog(context.dialog)
  }
}).createMachine({
  id: 'groupAnswer',
  context: ({ input }) => ({ ...input, page: null, dialog: null, plan: null, index: 0, reopenTries: 0, answerState: null, filled: [], application: 'ready', problem: null, steps: [] }),
  initial: 'opening',
  states: {
    opening: {
      invoke: {
        src: 'step',
        input: ({ context }) => ({ action: 'goto', args: [context.group.url] }),
        onDone: {
          target: 'choosing',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'goto', args: [context.group.url] }, reply, 'groupPageNotOpened')
            if (problem) return { steps: noted(context, 'opening', reply, problem.detail), problem }
            const panels = readGroupPage(reply).panels
            const detail = `${hasDialog(reply) ? 'the dialog is open' : answerButton(reply) ? 'button "Answer questions"' : 'no way back into the questions'}${panels.length ? `; panel open: ${panels.join(', ')} (the layout moves while it loads)` : ''}`
            return { steps: noted(context, 'opening', reply, detail), page: reply, dialog: hasDialog(reply) ? reply : null }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupPageNotOpened' as const, detail: String(event.error) }) }) }
      }
    },
    choosing: {
      always: [
        { guard: 'stopped', target: 'stopped' },
        { guard: 'dialogOpen', target: 'planning' },
        { guard: 'canReopenLive', target: 'reopening' },
        { guard: 'canReopen', target: 'planned' },
        {
          target: 'stopped',
          actions: assign({
            application: 'cannotReopen' as const,
            problem: { code: 'groupQuestionsNotReopened' as const, detail: 'the group page shows no "Answer questions" button and no open dialog' }
          })
        }
      ]
    },
    reopening: {
      invoke: {
        src: 'step',
        input: ({ context }) => ({ action: 'click', args: [answerButton(context.page)!] }),
        onDone: {
          target: 'reading',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'click', args: [] }, reply, 'groupQuestionsNotReopened')
            const tries = context.reopenTries + 1
            return problem ? { steps: noted(context, 'reopening', reply, problem.detail), problem, reopenTries: tries } : { steps: noted(context, 'reopening', reply, `clicked "Answer questions" (try ${tries})`), reopenTries: tries }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupQuestionsNotReopened' as const, detail: String(event.error) }) }) }
      }
    },
    reading: {
      always: { guard: 'stopped', target: 'stopped' },
      invoke: {
        src: 'step',
        input: { action: 'snapshot', args: [] },
        onDone: {
          target: 'read',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'snapshot', args: [] }, reply, 'groupQuestionsNotReopened')
            return problem ? { steps: noted(context, 'reading', reply, problem.detail), problem } : { steps: noted(context, 'reading', reply, hasDialog(reply) ? 'the dialog' : 'no dialog'), dialog: reply }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupQuestionsNotReopened' as const, detail: String(event.error) }) }) }
      }
    },
    read: {
      always: [
        { guard: 'stopped', target: 'stopped' },
        { guard: ({ context }) => hasDialog(context.dialog), target: 'planning' },
        // No dialog after the first click, the button still there: once more, after the page settles.
        { guard: ({ context }) => context.reopenTries < 2 && answerButton(context.dialog) !== null, target: 'settling' },
        { target: 'planning' }
      ]
    },
    settling: {
      invoke: {
        src: 'step',
        input: { action: 'wait', args: ['4'] },
        onDone: {
          target: 'reopening',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            // The wait's own snapshot gives the button's ref and place as the page now has them.
            return { steps: noted(context, 'settling', reply, 'no dialog yet: waited 4 s for the page to settle'), page: reply.snapshot ? reply : context.dialog }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupQuestionsNotReopened' as const, detail: String(event.error) }) }) }
      }
    },
    planning: {
      entry: assign(({ context }) => {
        if (context.problem) return {}
        const plan = planFill(context.options, context.draft, context.dialog?.snapshot ?? '')
        // Every step needs its element before anything is typed: a half-filled form is never left behind.
        if (plan.missing.length) return { plan, problem: { code: 'groupFillIncomplete' as const, detail: `no element for: ${plan.missing.join('; ')}` } }
        return { plan, application: context.live ? ('filling' as const) : context.application }
      }),
      always: [{ guard: 'stopped', target: 'stopped' }, { guard: ({ context }) => !context.live, target: 'planned' }, { target: 'next' }]
    },
    next: {
      always: [{ guard: 'moreToFill', target: 'filling' }, { guard: 'submitAsked', target: 'submitting' }, { target: 'filled', actions: assign({ application: 'filled' as const }) }]
    },
    filling: {
      invoke: {
        src: 'step',
        input: ({ context }) => {
          const step = context.plan!.steps[context.index]
          return step.action === 'type' ? { action: 'type', args: [step.ref, step.text ?? ''] } : { action: 'click', args: [step.ref] }
        },
        onDone: {
          target: 'filledOne',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const step = context.plan!.steps[context.index]
            const problem = problemOf({ action: step.action, args: [] }, reply, 'groupFillIncomplete')
            if (problem) return { steps: noted(context, `filling ${step.stepperStep}`, reply, problem.detail), problem }
            return { steps: noted(context, `filling ${step.stepperStep}`, reply, step.label), filled: [...context.filled, step.stepperStep], index: context.index + 1 }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupFillIncomplete' as const, detail: String(event.error) }) }) }
      }
    },
    filledOne: {
      always: [{ guard: 'stopped', target: 'stopped' }, { target: 'next' }]
    },
    submitting: {
      invoke: {
        src: 'step',
        input: ({ context }) => ({ action: 'click', args: [context.plan!.submit!.ref] }),
        onDone: {
          target: 'pressed',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'click', args: [] }, reply, 'groupSubmitNotConfirmed')
            const answerState = reply.options?.answerState ?? null
            return problem
              ? { steps: noted(context, 'submitting', reply, problem.detail), problem }
              : { steps: noted(context, 'submitting', reply, `pressed Submit${answerState ? `; ${reply.options!.seen.find((l) => l.startsWith('useGroupMembershipAnswersSaveMutation')) ?? `answers ${answerState}`}` : ''}`), answerState }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupSubmitNotConfirmed' as const, detail: String(event.error) }) }) }
      }
    },
    pressed: {
      always: [{ guard: 'stopped', target: 'stopped' }, { target: 'checking' }]
    },
    checking: {
      invoke: {
        src: 'step',
        input: { action: 'snapshot', args: [] },
        onDone: {
          target: 'answered',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            return { steps: noted(context, 'checking', reply, hasDialog(reply) ? 'the dialog is still open' : 'the dialog closed'), dialog: reply }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupSubmitNotConfirmed' as const, detail: String(event.error) }) }) }
      }
    },
    answered: {
      always: [
        // Facebook's own answer first: useGroupMembershipAnswersSaveMutation's QUESTIONNAIRE_COMPLETED; the dialog closing otherwise.
        { guard: ({ context }) => context.answerState === 'QUESTIONNAIRE_COMPLETED', target: 'submitted', actions: assign({ application: 'submitted' as const }) },
        { guard: 'dialogGone', target: 'submitted', actions: assign({ application: 'submitted' as const }) },
        { target: 'stopped', actions: assign({ application: 'filled' as const, problem: { code: 'groupSubmitNotConfirmed' as const, detail: 'Submit was pressed and the dialog stayed open' } }) }
      ]
    },
    planned: { type: 'final' },
    filled: { type: 'final' },
    submitted: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({
    result: context.problem ? 'stopped' : context.application === 'submitted' ? 'submitted' : context.application === 'filled' ? 'filled' : 'planned',
    application: context.application,
    answerState: context.answerState,
    plan: context.plan,
    filled: context.filled,
    problem: context.problem,
    steps: context.steps
  })
})
