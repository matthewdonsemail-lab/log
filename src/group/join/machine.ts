/**
 * The group join machine (`log facebook join group`, rule 45): one group, one account,
 * in the account's open browser. Its only side effect is `step`, one command
 * to the open inspect session (goto, clickRole, snapshot), which the caller
 * provides; tests script the replies.
 *
 *   opening (goto the group) ─▶ reading the gate
 *      ├── joined ─────────────────▶ alreadyIn
 *      ├── join, dry run ──────────▶ read            (nothing clicked, rule 8)
 *      ├── join, --live ─▶ joining (click the Join button) ─▶ checking (snapshot)
 *      │                      ├── Joined ─────────▶ joined (a dialog after it, e.g. Participant questions, kept in joinSubmission)
 *      │                      ├── a dialog, not a member ▶ questionsShown (kept in joinSubmission, never answered here)
 *      │                      ├── still Join ─────▶ stopped (groupJoinNotConfirmed)
 *      │                      └── anything else ──▶ clicked (the request went; a page not recorded yet)
 *      └── unknown page ───────────▶ stopped (groupGateUnknown)
 *   a checkpoint, a login or another page, after any step ─▶ stopped
 *
 * Nothing is clicked twice: a Join that is not confirmed stops the run.
 */
import { assign, fromPromise, setup } from 'xstate'
import { pageProblem } from '../../browser/flow/index'
import type { ErrorCode } from '../../errors/catalog/index'
import { inferJoinState, readGroupPage, readJoinDialog } from './helpers/index'
import type { GroupJoinContext, GroupJoinInput, GroupJoinOutput, GroupStepReply } from './types'

export interface GroupStepInput {
  action: 'goto' | 'clickRole' | 'click' | 'snapshot'
  args: string[]
}

type Done = { output: GroupStepReply }
type Problem = { code: ErrorCode; detail: string }

/** The step's reply → its problem, if any: the page went somewhere else (pageProblem), or the step failed. */
function problemOf(step: GroupStepInput, reply: GroupStepReply, failed: ErrorCode): Problem | null {
  const landed = pageProblem({ action: step.action, url: step.action === 'goto' ? step.args[0] : undefined }, reply)
  if (landed) return landed
  return reply.ok === false ? { code: failed, detail: reply.error ?? `${step.action} failed` } : null
}

const noted = (context: GroupJoinContext, step: string, reply: GroupStepReply, detail?: string) => [
  ...context.steps,
  { step, ok: reply.ok !== false, folder: reply.folder, detail: detail ?? reply.error }
]

export const groupJoinMachine = setup({
  types: {
    context: {} as GroupJoinContext,
    input: {} as GroupJoinInput,
    output: {} as GroupJoinOutput
  },
  actors: {
    step: fromPromise<GroupStepReply, GroupStepInput>(async () => {
      throw new Error('groupJoinMachine: provide a `step` actor')
    })
  },
  guards: {
    stopped: ({ context }) => context.problem !== null,
    joined: ({ context }) => context.page?.gate === 'joined',
    canJoinLive: ({ context }) => context.page?.gate === 'join' && context.live,
    canJoin: ({ context }) => context.page?.gate === 'join',
    member: ({ context }) => context.status === 'member',
    questionsShown: ({ context }) => context.status !== 'member' && (context.dialog !== null || Boolean(context.options?.questions.length)),
    stillJoin: ({ context }) => context.status !== 'requested' && context.after?.gate === 'join'
  }
}).createMachine({
  id: 'groupJoin',
  context: ({ input }) => ({ ...input, page: null, after: null, opened: null, formPhase: 'idle', dialog: null, options: null, inference: null, questions: [], submittedAt: null, status: 'unknown', problem: null, steps: [] }),
  initial: 'opening',
  states: {
    opening: {
      invoke: {
        src: 'step',
        input: ({ context }) => ({ action: 'goto', args: [context.group.url] }),
        onDone: {
          target: 'reading',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'goto', args: [context.group.url] }, reply, 'groupPageNotOpened')
            if (problem) return { steps: noted(context, 'opening', reply, problem.detail), problem }
            const page = readGroupPage(reply)
            // The page's own HTML states the membership on every load (viewer_join_state): it decides,
            // the button is the fallback when the HAR kept no body (steps 06 and 21, 2026-10-20).
            const fromPage = reply.options?.stateSource === 'groupPage' ? inferJoinState(reply.options, page, null) : null
            const status = fromPage && !fromPage.ambiguous ? fromPage.status : page.gate === 'joined' ? 'member' : page.gate === 'pending' ? 'requested' : page.gate === 'join' ? 'notMember' : 'unknown'
            // A dialog already on the page (a request to participate left open) is read the same way.
            const dialog = readJoinDialog(reply)
            const facebook = fromPage && !fromPage.ambiguous ? `; Facebook: viewer_join_state ${reply.options!.viewerJoinState}${reply.options!.answerState ? `, answers ${reply.options!.answerState}` : ''}` : ''
            return {
              steps: noted(context, 'opening', reply, `gate ${page.gate}${page.button ? ` (button "${page.button}")` : ''}${dialog ? `, dialog "${dialog.title}"` : ''}${facebook}`),
              page,
              opened: reply,
              status,
              ...(fromPage && !fromPage.ambiguous ? { inference: fromPage, options: reply.options } : {}),
              ...(dialog ? { dialog, questions: dialog.questions, formPhase: 'rendered' } : {})
            } as Partial<GroupJoinContext>
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupPageNotOpened' as const, detail: String(event.error) }) }) }
      }
    },
    reading: {
      always: [
        { guard: 'stopped', target: 'stopped' },
        { guard: 'joined', target: 'alreadyIn' },
        { guard: ({ context }) => context.page?.gate === 'pending', target: 'alreadyRequested' },
        { guard: 'canJoinLive', target: 'joining' },
        { guard: 'canJoin', target: 'read' },
        {
          target: 'stopped',
          actions: assign({ problem: ({ context }) => ({ code: 'groupGateUnknown' as const, detail: `no Join or Joined button on ${context.page?.url || context.group.url}` }) })
        }
      ]
    },
    joining: {
      invoke: {
        src: 'step',
        // By role and name when the snapshot named the button; else by the ref this session's snapshot gave it.
        input: ({ context }) =>
          context.page!.buttonNamed || !context.page!.buttonRef
            ? { action: 'clickRole', args: ['button', context.page!.button!] }
            : { action: 'click', args: [context.page!.buttonRef] },
        onDone: {
          target: 'clickedJoin',
          actions: assign(({ context, event }) => {
            const reply = (event as Done).output
            const problem = problemOf({ action: 'clickRole', args: [] }, reply, 'groupJoinNotConfirmed')
            if (problem) return { steps: noted(context, 'joining', reply, problem.detail), problem }
            // Facebook answers the Join in the click's own HAR: GroupCometJoinForumMutation and the dialog's query.
            const seen = reply.options?.seen.length ? `; ${reply.options.seen.join('; ')}` : ''
            return { steps: noted(context, 'joining', reply, `clicked button "${context.page!.button}"${seen}`), options: reply.options ?? null }
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupJoinNotConfirmed' as const, detail: String(event.error) }) }) }
      }
    },
    // A failed click stops here, before anything else is sent to the page.
    clickedJoin: {
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
            const problem = problemOf({ action: 'snapshot', args: [] }, reply, 'groupJoinNotConfirmed')
            if (problem) return { steps: noted(context, 'checking', reply, problem.detail), problem }
            const after = readGroupPage(reply)
            const dialog = readJoinDialog(reply)
            // The state after Join is inferred: Facebook's answers first (viewer_join_state, the dialog's
            // questions and rules), the page second. Bethlehem 2026-10-20: MEMBER, no questions, rules to agree.
            const inference = inferJoinState(context.options, after, dialog)
            const sent = inference.status === 'member' || inference.status === 'requested'
            const detail = `after Join: ${inference.status}${inference.ambiguous ? ' (ambiguous)' : ''}, posting ${inference.posting}, from ${inference.inferredFrom.join(', ') || 'nothing'}${dialog ? `; dialog "${dialog.title}"` : ''}`
            return {
              steps: noted(context, 'checking', reply, detail),
              after,
              status: inference.status,
              inference,
              dialog,
              questions: dialog?.questions.length ? dialog.questions : (context.options?.questions.map((q) => q.prompt) ?? []),
              // The dialog is left as it is: nothing is ticked, typed or submitted in it (rule 8).
              formPhase: dialog ? 'rendered' : sent ? 'submitted' : context.formPhase,
              ...(sent ? { submittedAt: new Date().toISOString() } : {})
            } as Partial<GroupJoinContext>
          })
        },
        onError: { target: 'stopped', actions: assign({ problem: ({ event }) => ({ code: 'groupJoinNotConfirmed' as const, detail: String(event.error) }) }) }
      }
    },
    answered: {
      always: [
        { guard: 'stopped', target: 'stopped' },
        { guard: 'member', target: 'joined' },
        { guard: 'questionsShown', target: 'questionsShown' },
        { guard: 'stillJoin', target: 'stopped', actions: assign({ problem: { code: 'groupJoinNotConfirmed' as const, detail: 'Join was clicked and the page still shows Join' } }) },
        { target: 'clicked' }
      ]
    },
    read: { type: 'final' },
    alreadyIn: { type: 'final' },
    alreadyRequested: { type: 'final' },
    joined: { type: 'final' },
    clicked: { type: 'final' },
    questionsShown: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({
    account: context.account,
    group: context.group,
    result: outcomeOf(context),
    status: context.status,
    page: context.page,
    after: context.after,
    problem: context.problem,
    steps: context.steps,
    formPhase: context.formPhase,
    dialog: context.dialog,
    options: context.options,
    inference: context.inference,
    questions: context.questions,
    submittedAt: context.submittedAt
  })
})

/** Which final state the context ended in, for the output. Pure. */
function outcomeOf(context: GroupJoinContext): GroupJoinOutput['result'] {
  if (context.problem) return 'stopped'
  if (context.page?.gate === 'joined') return 'alreadyIn'
  if (context.page?.gate === 'pending') return 'alreadyRequested'
  if (!context.after) return 'read'
  if (context.status === 'member') return 'joined'
  return context.dialog || context.options?.questions.length ? 'questions' : 'clicked'
}
