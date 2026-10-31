import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { marketplaceFixture } from '../../../twenty/graphql/index'
import { draftComplete, draftFrom, emptySubmission, ensureGroup, groupJoinMachine, hashQuestionSet, inferJoinState, stepsFor, parseGroupRef, patchGroupStep, patchSubmission, readGroupPage, readJoinDialog, readJoinOptions, readSubmission, recordGroupRead } from './index'
import type { GroupStepInput, GroupStepReply } from './index'
import recordedJoins from './fixtures/recordedJoins.json'

const GROUP_URL = 'https://www.facebook.com/groups/4191018610937243/'

export const recordedGroupPage = (button = 'Join Group', extra: string[] = []): GroupStepReply => ({
  ok: true,
  url: GROUP_URL,
  title: '(4) Recommendations of Bethlehem, PA and Greater Lehigh Valley Region | Facebook',
  folder: 'steps/01_goto',
  interactive: [
    '- combobox "Search Facebook" [ref=e20]',
    '- link "17.3K members" [ref=e4515] [cursor=pointer]:',
    `- button "${button}" [ref=e4519] [cursor=pointer]:`,
    '- button "Share group" [ref=e4532] [cursor=pointer]:',
    '- button "Write something..." [ref=e4630] [cursor=pointer]:',
    ...extra
  ]
})

export const recordedAfterJoin = [
  '            - button [ref=e969] [cursor=pointer]:',
  '              - generic [ref=e970]:',
  '                - img [ref=e971]',
  '                - generic [ref=e974]: Joined',
  '                      - generic [ref=e647]:',
  '                        - textbox [ref=e1046]: <redacted>',
  '                        - generic: Submit your first comment…',
  '    - dialog "Participant questions" [ref=e1062]:',
  '      - generic [ref=e1065]:',
  '            - heading "Participant questions" [level=2] [ref=e1070]:',
  '              - generic [ref=e1071]: Participant questions',
  '            - button "Close" [active] [ref=e1074] [cursor=pointer]:',
  '                - generic [ref=e1092]: Recommendations of Bethlehem, PA and Greater Lehigh Valley Region',
  "                - generic [ref=e1094]: You're now a member of this public group.",
  '              - generic [ref=e1098]: Get started by submitting a request to participate',
  '              - generic [ref=e1108]: Group rules from the admins',
  '                - checkbox "I agree to the group rules" [ref=e1112] [cursor=pointer]',
  '                - generic [ref=e1114]: I agree to the group rules',
  '                  - generic [ref=e1118]: "1"',
  '                  - generic [ref=e1119]: Be kind and courteous',
  '                  - generic [ref=e1125]: "2"',
  '                  - generic [ref=e1126]: No hate speech or bullying',
  '              - button "Not Now" [ref=e1146] [cursor=pointer]:',
  '                - generic [ref=e1149]: Not Now',
  '              - button "Submit" [disabled] [ref=e1151]:',
  '                - generic [ref=e1154]: Submit',
  '    - button "New message" [ref=e739] [cursor=pointer]:'
].join('\n')

function run(live: boolean, replies: GroupStepReply[]) {
  const sent: GroupStepInput[] = []
  const machine = groupJoinMachine.provide({
    actors: {
      step: fromPromise<GroupStepReply, GroupStepInput>(async ({ input }) => {
        sent.push(input)
        return replies.shift() ?? { ok: false, error: 'no reply scripted' }
      })
    }
  })
  const actor = createActor(machine, { input: { account: 'bethlehem', group: (parseGroupRef(GROUP_URL) as { ok: true; group: never }).group, live } })
  actor.start()
  return toPromise(actor).then((output) => ({ output, sent }))
}

describe('parseGroupRef', () => {
  test('a URL, groups/<key>, an id or a slug; never a guess', () => {
    expect(parseGroupRef('https://www.facebook.com/groups/4191018610937243/?ref=share')).toEqual({ ok: true, group: { key: '4191018610937243', numeric: true, url: GROUP_URL } })
    expect(parseGroupRef('https://m.facebook.com/groups/bethlehemcommunity/about')).toMatchObject({ ok: true, group: { key: 'bethlehemcommunity', numeric: false } })
    expect(parseGroupRef('groups/4191018610937243')).toMatchObject({ ok: true, group: { key: '4191018610937243' } })
    expect(parseGroupRef('4191018610937243')).toMatchObject({ ok: true })
    expect(parseGroupRef('https://example.com/groups/1')).toMatchObject({ ok: false })
    expect(parseGroupRef('https://www.facebook.com/marketplace/')).toMatchObject({ ok: false })
    expect(parseGroupRef('https://www.facebook.com/groups/search/?q=x')).toMatchObject({ ok: false })
    expect(parseGroupRef('a b')).toMatchObject({ ok: false })
  })
})

describe('readGroupPage', () => {
  test('reads the recorded page: Join Group, its name, its members, its id', () => {
    expect(readGroupPage(recordedGroupPage())).toEqual({
      gate: 'join',
      button: 'Join Group',
      buttonRef: 'e4519',
      buttonNamed: true,
      panels: [],
      name: 'Recommendations of Bethlehem, PA and Greater Lehigh Valley Region',
      members: '17.3K members',
      groupId: '4191018610937243',
      url: GROUP_URL
    })
  })

  test("AdsPower's page: an unnamed button takes its own text, and the click goes to its ref", async () => {
    const snapshot = [
      '                    - link [ref=e144] [cursor=pointer]:',
      '                      - /url: /groups/4191018610937243/members/',
      '                      - text: 17.3K members',
      '                - generic [ref=e146]:',
      '                  - button [ref=e148] [cursor=pointer]:',
      '                    - generic [ref=e149]:',
      '                      - img [ref=e150]',
      '                      - generic [ref=e157]: Join Group',
      '                  - button [ref=e161] [cursor=pointer]:',
      '                    - generic [ref=e165]: Share',
      '  - alertdialog "Push notifications request" [ref=e745]:',
      '    - button "Close" [active] [ref=e747]'
    ].join('\n')
    const reply = { ok: true, url: GROUP_URL, title: 'x | Facebook', snapshot }
    expect(readGroupPage(reply)).toMatchObject({ gate: 'join', button: 'Join Group', buttonRef: 'e148', buttonNamed: false, members: '17.3K members' })
    const { sent } = await run(true, [reply, { ok: true, url: GROUP_URL }, { ...reply, snapshot: snapshot.replace('Join Group', 'Joined') }])
    expect(sent[1]).toEqual({ action: 'click', args: ['e148'] })
  })

  test('the Related groups panel that opens after a Join is a page state of its own (it moves the layout)', () => {
    expect(readGroupPage(recordedGroupPage('Cancel Request', ['- heading "Related groups" [level=2] [ref=e300]'])).panels).toEqual(['relatedGroups'])
  })

  test('Joined is a member; a page with neither is unknown', () => {
    expect(readGroupPage(recordedGroupPage('Joined')).gate).toBe('joined')
    expect(readGroupPage(recordedGroupPage('Something else')).gate).toBe('unknown')
  })
})

describe('the join submission (the hackathon reportCommunityForm shape)', () => {
  test("the dialog is read from inside itself only: the feed's comment box is not a question", () => {
    expect(readJoinDialog({ ok: true, snapshot: recordedAfterJoin })).toEqual({
      title: 'Participant questions',
      notes: ['Recommendations of Bethlehem, PA and Greater Lehigh Valley Region', "You're now a member of this public group.", 'Get started by submitting a request to participate', 'Group rules from the admins'],
      questions: [],
      agreements: ['I agree to the group rules'],
      rules: ['1. Be kind and courteous', '2. No hate speech or bullying'],
      submitEnabled: false
    })
    expect(readJoinDialog({ ok: true, snapshot: '  - alertdialog "Push notifications request" [ref=e745]:' })).toBeNull()
  })

  test('patches keep a history, hash the question set, and drop drafts when the set changes', () => {
    const at = '2026-10-20T10:00:00.000Z'
    let s = patchSubmission(emptySubmission(), { formPhase: 'rendered', questions: ['A?'] }, { at, step: 'checking', detail: 'one question', folder: null })
    expect(s).toMatchObject({ formPhase: 'rendered', questionsHash: hashQuestionSet(['A?']), questionsScrapedAt: at, answersComplete: false })
    s = { ...s, draftAnswers: ['yes'] }
    s = patchSubmission(s, { questions: ['B?'] }, { at, step: 'checking', detail: 'changed', folder: null })
    expect(s.draftAnswers).toEqual([])
    expect(s.history.map((h) => h.formPhase)).toEqual(['rendered', 'rendered'])
    expect(hashQuestionSet(['A?'])).toMatch(/^[0-9a-f]{8}$/)
  })

  test('whatever Twenty holds reads back whole', () => {
    expect(readSubmission(null)).toEqual(emptySubmission())
    expect(readSubmission({ formPhase: 'nonsense', questions: ['Q'] })).toMatchObject({ formPhase: 'idle', questions: ['Q'] })
  })
})

export function recordedJoinHar(group: keyof typeof recordedJoins.groups) {
  return {
    log: {
      entries: recordedJoins.groups[group].entries.map((e) => ({
        request: { postData: { text: `fb_api_req_friendly_name=${e.operation}` } },
        response: { status: e.status, content: { text: JSON.stringify({ data: e.data }) } }
      }))
    }
  }
}

describe('the join options (the schema) and the state inferred from them, on the five recorded groups', () => {
  test('Recommendations of Bethlehem: MEMBER at once, no questions, the rules to agree (instantRules)', () => {
    const options = readJoinOptions(recordedJoinHar('recommendationsOfBethlehem'))
    expect(options).toMatchObject({ path: 'instantRules', joinOperation: 'GroupCometJoinForumMutation', viewerJoinState: 'MEMBER', questions: [], rulesAgreementRequired: true, questionsQueried: true })
    expect(options.rules.map((r) => r.title)).toEqual(['Be kind and courteous', 'No hate speech or bullying', "Respect everyone's privacy"])
    expect(options.dialog?.title).toBe('Participant questions')
    expect(inferJoinState(options, null, null)).toMatchObject({ status: 'member', path: 'instantRules', posting: 'rulesAgreement', ambiguous: false })
  })

  test('Friends of Bethlehem PA: MEMBER at once, then two paragraph questions before posting (instantQuestions)', () => {
    const options = readJoinOptions(recordedJoinHar('friendsOfBethlehem'))
    expect(options.path).toBe('instantQuestions')
    expect(options.questions).toEqual([
      { id: '2365312223601773', stage: 'participation', prompt: 'What is your connection to Bethlehem, Pennsylvania and what do you hope to gain from participating in this group?', type: 'paragraph', rawType: 'PARAGRAPH', options: [] },
      { id: '2728028100663515', stage: 'participation', prompt: 'What is the name of the big festival hosted in Bethlehem each August?', type: 'paragraph', rawType: 'PARAGRAPH', options: [] }
    ])
    expect(inferJoinState(options, null, null)).toMatchObject({ status: 'member', posting: 'questions', ambiguous: false })
  })

  test('Bethlehem, PA Neighborhood: MEMBER and no questions query at all: open, inferred from what did not come (instant)', () => {
    const options = readJoinOptions(recordedJoinHar('bethlehemNeighborhood'))
    expect(options).toMatchObject({ path: 'instant', viewerJoinState: 'MEMBER', questionsQueried: false })
    expect(inferJoinState(options, null, null)).toMatchObject({ status: 'member', posting: 'open', ambiguous: false, inferredFrom: ['GroupCometJoinForumMutation.viewer_join_state=MEMBER', 'no questions query after Join, no dialog'] })
  })

  test('Complainers of Bethlehem (private): REQUESTED, a checkboxes and a paragraph question, answers required (request)', () => {
    const options = readJoinOptions(recordedJoinHar('complainersOfBethlehem'))
    expect(options).toMatchObject({ path: 'request', joinOperation: 'useGroupRequestToJoinMutation', viewerJoinState: 'REQUESTED', forumJoinState: 'CANNOT_JOIN', mustAnswerToSubmit: true, rulesAgreementRequired: true })
    expect(options.questions.map((q) => [q.stage, q.type, q.options.map((o) => o.label)])).toEqual([
      ['membership', 'checkboxes', ['Yes', 'No']],
      ['membership', 'paragraph', []]
    ])
    expect(options.questions[0].options[0]).toEqual({ id: '2345806655660910', label: 'Yes' })
    expect(inferJoinState(options, null, null)).toMatchObject({ status: 'requested', path: 'request', posting: 'questions', ambiguous: false })
  })

  test("You know you're from Bethlehem (private): REQUESTED, three questions (request)", () => {
    const options = readJoinOptions(recordedJoinHar('youKnowYoureFromBethlehem'))
    expect(options.path).toBe('request')
    expect(options.questions).toHaveLength(3)
    expect(new Set(options.questions.map((q) => q.stage))).toEqual(new Set(['membership']))
  })

  test("the group page's own HTML and the answers mutation, as recorded after Submit (steps 08 and 10)", () => {
    const page = (state: string, answers: string) => ({
      request: { method: 'GET', url: 'https://www.facebook.com/groups/1640115596230023/' },
      response: { status: 200, content: { text: `<html>…"viewer_join_state":"${state}",…"viewer_forum_join_state":"CANNOT_JOIN",…"viewer_membership_questions_answer_state":"${answers}"…</html>` } }
    })
    const before = readJoinOptions({ log: { entries: [page('REQUESTED', 'NO_ANSWER')] } })
    expect(before).toMatchObject({ viewerJoinState: 'REQUESTED', stateSource: 'groupPage', answerState: 'NO_ANSWER', forumJoinState: 'CANNOT_JOIN' })
    expect(inferJoinState(before, null, null)).toMatchObject({ status: 'requested', ambiguous: false, inferredFrom: ['groupPage.viewer_join_state=REQUESTED'] })
    const submit = {
      request: { postData: { text: 'fb_api_req_friendly_name=useGroupMembershipAnswersSaveMutation' } },
      response: { status: 200, content: { text: '{"data":{"group":{"viewer_join_state":"REQUESTED","viewer_forum_join_state":"CANNOT_JOIN","viewer_membership_questions_answer_state":"QUESTIONNAIRE_COMPLETED"}}}' } }
    }
    expect(readJoinOptions({ log: { entries: [submit] } })).toMatchObject({ answerState: 'QUESTIONNAIRE_COMPLETED', viewerJoinState: 'REQUESTED' })
    expect(readJoinOptions({ log: { entries: [page('REQUESTED', 'QUESTIONNAIRE_COMPLETED')] } }).answerState).toBe('QUESTIONNAIRE_COMPLETED')
  })

  test('a reload of a waiting group: its status from the page HTML, nothing clicked', async () => {
    const page = { request: { method: 'GET', url: GROUP_URL }, response: { status: 200, content: { text: '"viewer_join_state":"REQUESTED"' } } }
    const { output, sent } = await run(true, [{ ...recordedGroupPage('Cancel Request'), options: readJoinOptions({ log: { entries: [page] } }) }])
    expect(output).toMatchObject({ result: 'alreadyRequested', status: 'requested' })
    expect(sent).toHaveLength(1)
  })

  test('no answer in the HAR: the page decides, and the state is ambiguous', () => {
    const empty = readJoinOptions({ log: { entries: [] } })
    expect(inferJoinState(empty, readGroupPage(recordedGroupPage('Joined')), null)).toMatchObject({ status: 'member', path: 'unknown', ambiguous: true, posting: 'unknown' })
  })

  test('a viewer_join_state not recorded yet is kept raw, unknown and ambiguous', () => {
    const har = { log: { entries: [{ request: { postData: { text: 'fb_api_req_friendly_name=GroupCometJoinForumMutation' } }, response: { status: 200, content: { text: '{"data":{"viewer_join_state":"SOMETHING_NEW"}}' } } }] } }
    expect(inferJoinState(readJoinOptions(har), null, null)).toMatchObject({ status: 'unknown', ambiguous: true, inferredFrom: ['GroupCometJoinForumMutation.viewer_join_state=SOMETHING_NEW'] })
  })
})

describe('the Clack stepper, built from the schema', () => {
  test('a private group: checkboxes → multiselect over its options, paragraph → text, then the rules and the agreement', () => {
    const options = readJoinOptions(recordedJoinHar('complainersOfBethlehem'))
    const steps = stepsFor(options, null)
    expect(steps.map((s) => s.kind)).toEqual(['intro', 'multiselect', 'text', 'rules', 'agree'])
    expect(steps[1]).toMatchObject({ questionId: '2345806658994243', options: [{ value: '2345806655660910', label: 'Yes' }, { value: '2345806652327577', label: 'No' }] })
  })

  test('a public group with rules only: no question steps, the rules and the agreement', () => {
    expect(stepsFor(readJoinOptions(recordedJoinHar('recommendationsOfBethlehem')), null).map((s) => s.kind)).toEqual(['intro', 'rules', 'agree'])
  })

  test('a saved draft starts the steps from its answers; a changed question set starts blank', () => {
    const options = readJoinOptions(recordedJoinHar('friendsOfBethlehem'))
    const draft = draftFrom(options, { '2365312223601773': 'I live here' }, false, new Date('2026-10-20T00:00:00Z'))
    expect(stepsFor(options, draft)[1]).toMatchObject({ kind: 'text', initial: 'I live here' })
    expect(draftComplete(options, draft)).toEqual({ complete: false, missing: ['What is the name of the big festival hosted in Bethlehem each August?', 'I agree to the group rules'] })
    const changed = { ...options, questions: options.questions.slice(1) }
    expect(stepsFor(changed, draft)[1]).toMatchObject({ initial: '' })
  })

  test('a type no recording has shown is listed and skipped, never guessed', () => {
    const options = readJoinOptions(recordedJoinHar('friendsOfBethlehem'))
    const odd = { ...options, questions: [{ ...options.questions[0], type: 'notRecorded' as const, rawType: 'MULTIPLE_CHOICE' }] }
    expect(stepsFor(odd, null)[1]).toMatchObject({ kind: 'skipped' })
  })
})

describe('groupJoinMachine', () => {
  test('--live on Bethlehem as recorded: the click HAR settles it, member, rules to agree', async () => {
    const click = { ok: true, url: GROUP_URL, options: readJoinOptions(recordedJoinHar('recommendationsOfBethlehem')) }
    const { output } = await run(true, [recordedGroupPage(), click, { ok: true, url: GROUP_URL, snapshot: recordedAfterJoin }])
    expect(output).toMatchObject({ result: 'joined', status: 'member', inference: { posting: 'rulesAgreement', ambiguous: false }, options: { viewerJoinState: 'MEMBER' } })
  })

  test('--live on a private group as recorded: requested, its questions kept, nothing answered', async () => {
    const click = { ok: true, url: GROUP_URL, options: readJoinOptions(recordedJoinHar('complainersOfBethlehem')) }
    const { output } = await run(true, [recordedGroupPage(), click, { ok: true, url: GROUP_URL }])
    expect(output).toMatchObject({ result: 'questions', status: 'requested', inference: { path: 'request' } })
    expect(output.questions).toHaveLength(2)
  })

  test('a dry run opens the group, reads Join and clicks nothing', async () => {
    const { output, sent } = await run(false, [recordedGroupPage()])
    expect(output).toMatchObject({ result: 'read', status: 'notMember', formPhase: 'idle' })
    expect(sent.map((s) => s.action)).toEqual(['goto'])
  })

  test('already a member: nothing clicked, even with --live', async () => {
    const { output, sent } = await run(true, [recordedGroupPage('Joined')])
    expect(output).toMatchObject({ result: 'alreadyIn', status: 'member' })
    expect(sent).toHaveLength(1)
  })

  test('--live presses the recorded button once and reads Joined', async () => {
    const { output, sent } = await run(true, [recordedGroupPage(), { ok: true, url: GROUP_URL }, recordedGroupPage('Joined')])
    expect(sent).toEqual([{ action: 'goto', args: [GROUP_URL] }, { action: 'clickRole', args: ['button', 'Join Group'] }, { action: 'snapshot', args: [] }])
    expect(output).toMatchObject({ result: 'joined', status: 'member', formPhase: 'submitted' })
    expect(output.submittedAt).toBeTruthy()
  })

  test('Bethlehem: Join made it a member, then Participant questions: joined, the dialog kept, nothing ticked', async () => {
    const { output, sent } = await run(true, [recordedGroupPage(), { ok: true, url: GROUP_URL }, { ok: true, url: GROUP_URL, snapshot: recordedAfterJoin }])
    expect(output).toMatchObject({ result: 'joined', status: 'member', formPhase: 'rendered', questions: [], dialog: { title: 'Participant questions', agreements: ['I agree to the group rules'] } })
    expect(sent).toHaveLength(3)
  })

  test('a dialog and no Joined: questionsShown, nothing answered, nothing sent', async () => {
    const asked = { ok: true, url: GROUP_URL, snapshot: recordedAfterJoin.replace('Joined', 'Join Group').replace('    - dialog "Participant questions"', '    - dialog "Answer questions"') + '\n      - textbox "Where do you live?" [ref=e9001]' }
    const { output } = await run(true, [recordedGroupPage(), { ok: true, url: GROUP_URL }, asked])
    expect(output).toMatchObject({ result: 'questions', status: 'notMember', formPhase: 'rendered', submittedAt: null })
  })

  test('the button went, no answer in the HAR, a page not recorded yet: clicked, and the state stays unknown (ambiguous)', async () => {
    const { output } = await run(true, [recordedGroupPage(), { ok: true, url: GROUP_URL }, recordedGroupPage('Share')])
    expect(output).toMatchObject({ result: 'clicked', status: 'unknown', inference: { ambiguous: true } })
  })

  test('still Join after the click stops, and Join is never pressed twice', async () => {
    const { output, sent } = await run(true, [recordedGroupPage(), { ok: true, url: GROUP_URL }, recordedGroupPage()])
    expect(output).toMatchObject({ result: 'stopped', problem: { code: 'groupJoinNotConfirmed' } })
    expect(sent.filter((s) => s.action === 'clickRole')).toHaveLength(1)
  })

  test('a failed click stops before anything else is sent', async () => {
    const { output, sent } = await run(true, [recordedGroupPage(), { ok: false, error: 'no visible button' }])
    expect(output.result).toBe('stopped')
    expect(sent.map((s) => s.action)).toEqual(['goto', 'clickRole'])
  })

  test('a checkpoint or an unknown page stops at the gate', async () => {
    expect((await run(true, [{ ok: true, url: 'https://www.facebook.com/checkpoint/1501092823525282/' }])).output.problem?.code).toBe('checkpointed')
    expect((await run(true, [recordedGroupPage('Something else')])).output.problem?.code).toBe('groupGateUnknown')
  })
})

describe('agencyGroups in Twenty', () => {
  test('one row per account and group, patched per step, keyed on the id the page gave', async () => {
    const twenty = marketplaceFixture()
    const ref = (parseGroupRef('bethlehemcommunity') as { ok: true; group: never }).group
    let group = await ensureGroup(twenty, 'galwayOne', ref)
    expect(group.joinSubmission).toEqual(emptySubmission())
    expect((await ensureGroup(twenty, 'galwayOne', ref)).id).toBe(group.id)
    const now = new Date('2026-10-20T10:00:00.000Z')
    group = await patchGroupStep(twenty, group, { formPhase: 'idle', dialog: null, options: null, inference: null, questions: [], submittedAt: null }, { step: 'opening', detail: 'gate join', folder: 'steps/01' }, now)
    expect(group.joinSubmission.history).toHaveLength(1)
    const { output } = await run(false, [recordedGroupPage()])
    group = await recordGroupRead(twenty, group, { ...output, group: ref }, '/runs/x', now)
    expect(group).toMatchObject({ facebookGroupId: '4191018610937243', joinStatus: 'notMember', membersLabel: '17.3K members', name: 'Recommendations of Bethlehem, PA and Greater Lehigh Valley Region' })
    expect(twenty.rows.agencyGroups).toHaveLength(1)
    expect(twenty.rows.agencyGroups[0].joinStatus).toBe('NOT_MEMBER')
  })
})
