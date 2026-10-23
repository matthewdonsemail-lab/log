import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createActor, fromPromise, toPromise } from 'xstate'
import { marketplaceFixture } from '../../../twenty/graphql/index'
import { draftFrom, ensureGroup, parseGroupRef, readJoinOptions, saveDraft, draftComplete } from '../join/index'
import type { GroupStepReply } from '../join/index'
import { recordedJoinHar } from '../join/join.test'
import { applicationFromDraft, describePlan, groupAnswerMachine, patchApplication, planFill } from './index'
import type { AnswerStepInput } from './index'

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8')
const DIALOG = fixture('complainersDialog.yml')
const PENDING = fixture('complainersPending.yml')
const GROUP_URL = 'https://www.facebook.com/groups/1640115596230023/'
const OPTIONS = readJoinOptions(recordedJoinHar('complainersOfBethlehem'))
const YES = '2345806655660910'
const DRAFT = draftFrom(OPTIONS, { '2345806658994243': [YES], '2345807182327524': 'Parking on Main Street' }, true, new Date('2026-10-20T00:00:00Z'))

function run(live: boolean, submit: boolean, replies: GroupStepReply[]) {
  const sent: AnswerStepInput[] = []
  const machine = groupAnswerMachine.provide({
    actors: {
      step: fromPromise<GroupStepReply, AnswerStepInput>(async ({ input }) => {
        sent.push(input)
        return replies.shift() ?? { ok: false, error: 'no reply scripted' }
      })
    }
  })
  const group = (parseGroupRef(GROUP_URL) as { ok: true; group: never }).group
  const actor = createActor(machine, { input: { account: 'bethlehem', group, options: OPTIONS, draft: DRAFT, live, submit } })
  actor.start()
  return toPromise(actor).then((output) => ({ output, sent }))
}

describe('planFill: each Clack step onto the recorded dialog', () => {
  test('Yes ticked under its own question, the box clicked then typed, the rules agreed, Submit found disabled', () => {
    const plan = planFill(OPTIONS, DRAFT, DIALOG)
    expect(plan.missing).toEqual([])
    expect(plan.steps).toEqual([
      { stepperStep: 'question:2345806658994243', label: 'tick "Yes"', action: 'click', ref: 'e1073' },
      { stepperStep: 'question:2345807182327524', label: 'click into "What is a general complaint you have about Bethlehem?"', action: 'click', ref: 'e1107' },
      { stepperStep: 'question:2345807182327524', label: 'type the answer to "What is a general complaint you have about Bethlehem?"', action: 'type', ref: 'e1107', text: 'Parking on Main Street' },
      { stepperStep: 'agree', label: 'tick "I agree to the group rules"', action: 'click', ref: 'e1120' }
    ])
    expect(plan.submit).toEqual({ ref: 'e1228', enabled: false })
    expect(describePlan(plan).at(-1)).toContain('press Submit (click e1228), only with --submit')
  })

  test('no dialog, or an answer missing: nothing planned for it, said as missing', () => {
    expect(planFill(OPTIONS, DRAFT, PENDING).missing).toEqual(['the dialog (not open)'])
    const partial = { ...DRAFT, answers: { '2345806658994243': [YES] } }
    expect(planFill(OPTIONS, partial, DIALOG).missing).toEqual(['What is a general complaint you have about Bethlehem?'])
  })
})

describe('groupAnswerMachine', () => {
  test('a dry run finds "Answer questions" and clicks nothing', async () => {
    const { output, sent } = await run(false, false, [{ ok: true, url: GROUP_URL, snapshot: PENDING }])
    expect(output.result).toBe('planned')
    expect(sent.map((s) => s.action)).toEqual(['goto'])
  })

  test('--live: reopens the dialog, fills every step in order, and stops before Submit', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const { output, sent } = await run(true, false, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: DIALOG }, ok, ok, ok, ok])
    expect(sent).toEqual([
      { action: 'goto', args: [GROUP_URL] },
      { action: 'click', args: ['e220'] },
      { action: 'snapshot', args: [] },
      { action: 'click', args: ['e1073'] },
      { action: 'click', args: ['e1107'] },
      { action: 'type', args: ['e1107', 'Parking on Main Street'] },
      { action: 'click', args: ['e1120'] }
    ])
    expect(output).toMatchObject({ result: 'filled', application: 'filled', filled: ['question:2345806658994243', 'question:2345807182327524', 'question:2345807182327524', 'agree'] })
  })

  test('--live --submit: presses Submit once, and the dialog closing is the confirmation', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const { output, sent } = await run(true, true, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: DIALOG }, ok, ok, ok, ok, ok, { ...ok, snapshot: PENDING }])
    expect(sent.at(-2)).toEqual({ action: 'click', args: ['e1228'] })
    expect(output).toMatchObject({ result: 'submitted', application: 'submitted' })
  })

  test("Facebook's answer to Submit confirms it (useGroupMembershipAnswersSaveMutation: QUESTIONNAIRE_COMPLETED)", async () => {
    const ok = { ok: true, url: GROUP_URL }
    const answered = { ...ok, options: { ...OPTIONS, answerState: 'QUESTIONNAIRE_COMPLETED', seen: ['useGroupMembershipAnswersSaveMutation 200: answers QUESTIONNAIRE_COMPLETED, viewer_join_state REQUESTED'] } }
    const { output } = await run(true, true, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: DIALOG }, ok, ok, ok, ok, answered, { ...ok, snapshot: DIALOG }])
    expect(output).toMatchObject({ result: 'submitted', application: 'submitted', answerState: 'QUESTIONNAIRE_COMPLETED' })
  })

  test('Submit pressed and the dialog stayed: stopped, never pressed again', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const { output, sent } = await run(true, true, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: DIALOG }, ok, ok, ok, ok, ok, { ...ok, snapshot: DIALOG }])
    expect(output.problem?.code).toBe('groupSubmitNotConfirmed')
    expect(sent.filter((s) => s.args[0] === 'e1228')).toHaveLength(1)
  })

  test('no dialog after the first click (the page moved, 2026-10-20): it waits, takes a fresh snapshot and clicks once more', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const { output, sent } = await run(true, false, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: PENDING }, { ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: DIALOG }, ok, ok, ok, ok])
    expect(sent.slice(0, 6).map((s) => `${s.action} ${s.args.join(' ')}`)).toEqual(['goto ' + GROUP_URL, 'click e220', 'snapshot ', 'wait 4', 'click e220', 'snapshot '])
    expect(output.result).toBe('filled')
  })

  test('still no dialog after the second click: stopped, nothing typed, never a third click', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const { output, sent } = await run(true, false, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: PENDING }, { ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: PENDING }])
    expect(output.problem?.code).toBe('groupFillIncomplete')
    expect(sent.filter((s) => s.args[0] === 'e220')).toHaveLength(2)
    expect(sent.some((s) => s.action === 'type')).toBe(false)
  })

  test('a dialog that lacks an element stops before anything is typed', async () => {
    const ok = { ok: true, url: GROUP_URL }
    const noBox = DIALOG.replace(/^.*textbox.*$/m, '')
    const { output, sent } = await run(true, false, [{ ...ok, snapshot: PENDING }, ok, { ...ok, snapshot: noBox }])
    expect(output.problem?.code).toBe('groupFillIncomplete')
    expect(sent.some((s) => s.action === 'type')).toBe(false)
  })

  test('a page with no way back into the questions: cannotReopen', async () => {
    const { output } = await run(true, false, [{ ok: true, url: GROUP_URL, snapshot: '- button "Joined" [ref=e1]' }])
    expect(output).toMatchObject({ result: 'stopped', application: 'cannotReopen', problem: { code: 'groupQuestionsNotReopened' } })
  })
})

describe('the application in Twenty', () => {
  test('the stepper sets ready or drafting; each fill step patches it with a history line', async () => {
    expect(applicationFromDraft(OPTIONS, null, new Date()).status).toBe('notStarted')
    expect(applicationFromDraft(OPTIONS, { ...DRAFT, rulesAgreed: false }, new Date()).status).toBe('drafting')
    const twenty = marketplaceFixture()
    let group = await ensureGroup(twenty, 'galwayOne', (parseGroupRef(GROUP_URL) as { ok: true; group: never }).group)
    group = { ...group, joinSubmission: { ...group.joinSubmission, options: OPTIONS } }
    const now = new Date('2026-10-20T01:00:00Z')
    group = await saveDraft(twenty, group, DRAFT, draftComplete(OPTIONS, DRAFT), now)
    expect(group.joinSubmission.application?.status).toBe('ready')
    group = await patchApplication(twenty, group, { status: 'submitted', filled: ['agree'], detail: 'pressed Submit' }, { step: 'submitting', folder: 'steps/30' }, now)
    expect(group.joinSubmission).toMatchObject({ formPhase: 'submitted', application: { status: 'submitted', submittedAt: now.toISOString() } })
    expect(group.joinSubmission.history.at(-1)).toMatchObject({ step: 'submitting', detail: 'pressed Submit', folder: 'steps/30' })
  })
})
