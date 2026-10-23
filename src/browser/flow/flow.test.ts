import { pageProblem } from './helpers/pageCheck'
import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { confirmingRequest, createFlowMachine, fillStep, flowFromRecording, renderFlowDoc, toolName } from './index'
import type { FlowActInput, FlowRunOutput, FlowStepResult } from './index'
import type { RecordedCommand } from './helpers/index'

const PROFILE = `- main [ref=e33]:\n  - button "Profile picture actions" [ref=e141] [cursor=pointer]:\n  - button "Add Cover Photo" [ref=e119] [cursor=pointer]:`
const MENU = `${PROFILE}\n- menu "Profile picture options" [ref=e1089]:\n  - menuitem "Choose profile picture" [ref=e1096] [cursor=pointer]:`
const DIALOG = `- dialog "Choose profile picture" [ref=e1168]:\n  - button "Upload Photo" [ref=e1180] [cursor=pointer]:`
const CROP = `- dialog "Choose profile picture" [ref=e1168]:\n  - button "Save" [ref=e1262] [cursor=pointer]:`
const NAME = `- dialog "Name" [ref=e125]:\n  - textbox "First name" [ref=e156]: <redacted>\n  - button "Done" [ref=e317] [cursor=pointer]:`

const cmd = (action: string, args: string[], step: string, snapshot: string, notable: string[] = [], ok = true): RecordedCommand => ({
  action, args, ok, step, url: 'https://www.facebook.com/profile.php', ms: 1000, notable, reaEvidenceId: `ev_${step}`, snapshot
})

const RECORDING: RecordedCommand[] = [
  cmd('goto', ['https://www.facebook.com/me'], '01_goto', PROFILE, ['POST 200 ProfilePromptQuickPromotionMutation (967 ms)']),
  cmd('click', ['e141'], '02_click', MENU),
  cmd('click', ['e1096'], '03_click', DIALOG),
  cmd('upload', ['e1180', 'C:/photos/face.jpg'], '04_upload', CROP),
  cmd('click', ['e1262'], '05_click', PROFILE),
  cmd('wait', ['12'], '06_wait', PROFILE, ['POST 200 ProfileCometProfilePictureSetMutation (3400 ms)', 'POST 200 FBScreenTimeLogger_syncMutation (1724 ms)']),
  cmd('click', ['e999'], '07_click', PROFILE, [], false),
  cmd('goto', ['https://accountscenter.facebook.com/profiles/61593967241658/name'], '08_goto', NAME),
  cmd('click', ['e156'], '09_click', NAME),
  cmd('press', ['Control+a'], '10_press', NAME),
  cmd('type', ['e156', 'Lancaster'], '11_type', NAME),
  cmd('click', ['e317'], '12_click', NAME, ['POST 200 useFXIMUpdateNameMutation (2394 ms)'])
]

describe('pageProblem: where a step really landed', () => {
  test("Erie's lock, a sign-out and a wrong page stop the step; Marketplace settling on its city page doesn't", () => {
    const goto = (url: string) => ({ action: 'goto', url })
    expect(pageProblem(goto('https://www.facebook.com/'), { url: 'https://www.facebook.com/checkpoint/1501092823525282/?next=x' })).toMatchObject({ code: 'checkpointed' })
    expect(pageProblem({ action: 'scroll' }, { url: 'https://www.facebook.com/checkpoint/1501092823525282/' })).toMatchObject({ code: 'checkpointed' })
    expect(pageProblem(goto('https://www.facebook.com/marketplace/'), { url: 'https://www.facebook.com/login/?next=x' })).toMatchObject({ code: 'loginWall' })
    expect(pageProblem(goto('https://www.facebook.com/messages/'), { url: 'https://www.facebook.com/marketplace/' })).toMatchObject({ code: 'pageNotReached' })
    expect(pageProblem(goto('https://www.facebook.com/marketplace/'), { url: 'https://www.facebook.com/marketplace/113668691977096/' })).toBeNull()
    expect(pageProblem(goto('https://www.facebook.com/'), { url: 'https://www.facebook.com/' })).toBeNull()
    expect(pageProblem(goto('https://www.facebook.com/me'), { url: 'https://www.facebook.com/profile.php?id=61594417970255' })).toBeNull()
    expect(pageProblem(goto('https://www.facebook.com/me'), { url: 'https://www.facebook.com/harrisburg.trash' })).toBeNull()
    expect(pageProblem(goto('https://www.facebook.com/me'), { url: 'https://www.facebook.com/checkpoint/1501092823525282/' })).toMatchObject({ code: 'checkpointed' })
  })
})

describe('flowFromRecording: a warm-up recording (rule 35)', () => {
  const warm = flowFromRecording('warmupMarketplaceBrowse', 'test', [
    cmd('goto', ['https://www.facebook.com/marketplace/'], '01_goto', ''),
    cmd('dwell', ['3-5'], '02_dwell', ''),
    cmd('scroll', ['3-5', '400-700'], '03_scroll', ''),
    cmd('openAny', ['/marketplace/item/', '2-4'], '04_openAny', ''),
    cmd('wait', ['2'], '05_wait', ''),
    cmd('clickAny', ['button', '^Like$', '2-3'], '06_clickAny', '')
  ], { runDir: '/r', account: 'reading' })

  test('scroll, openAny, clickAny and dwell keep their ranges and pin no element; a settling wait is dropped', () => {
    expect(warm.steps.map((s) => [s.action, s.args ?? s.url])).toEqual([
      ['goto', 'https://www.facebook.com/marketplace/'],
      ['dwell', ['3-5']],
      ['scroll', ['3-5', '400-700']],
      ['openAny', ['/marketplace/item/', '2-4']],
      ['clickAny', ['button', '^Like$', '2-3']]
    ])
    expect(warm.steps.every((s) => s.role === undefined)).toBe(true)
  })
})

describe('flowFromRecording: a group page recorded with clickRole (Bethlehem, 2026-10-20)', () => {
  const group = flowFromRecording('groupHeaderMenus', 'test', [
    cmd('goto', ['https://www.facebook.com/groups/4191018610937243/'], '01_goto', ''),
    cmd('clickRole', ['button', 'More'], '02_clickRole', '', ['POST 200 GroupsCometMoreActionMenuQuery (578 ms)']),
    cmd('press', ['Escape'], '03_press', ''),
    cmd('clickRole', ['tab', 'People'], '04_clickRole', '', [], false),
    cmd('scrollIn', ['dialog', 'Comments', '3', '400-600'], '05_scrollIn', ''),
    cmd('press', ['Control+a'], '06_press', ''),
    cmd('clickRole', ['button', 'Actions for this post'], '07_clickRole', '', ['POST 200 useCIXLogMutation (583 ms)'])
  ], { runDir: '/r', account: '61594063207669' })

  test('clickRole keeps its own role and name, Escape and scrollIn keep their arguments, a chord and a failure are dropped', () => {
    expect(group.steps.map((s) => [s.action, s.role ?? s.url ?? s.args, s.name ?? null])).toEqual([
      ['goto', 'https://www.facebook.com/groups/{groupId}/', null],
      ['click', 'button', 'More'],
      ['press', ['Escape'], null],
      ['scrollIn', ['dialog', 'Comments', '3', '400-600'], null],
      ['click', 'button', 'Actions for this post']
    ])
    expect(group.steps[4].expect).toBeUndefined()
  })

  test("the group's id is a param, filled on each run", () => {
    expect(group.params).toEqual([{ name: 'groupId', kind: 'text', description: "the group's numeric id, from its URL" }])
    expect(fillStep(group.steps[0], { groupId: '123', uid: 'a' }).url).toBe('https://www.facebook.com/groups/123/')
  })
})

describe('flowFromRecording: posting and deleting on the own profile (Bethlehem, run 20261020T162343)', () => {
  const photo = flowFromRecording('profilePhotoPost', 'test', [
    cmd('goto', ['https://www.facebook.com/profile.php?id=61594063207669'], '01_goto', ''),
    cmd('uploadRole', ['button', 'Photo/video', 'C:/photos/garbageRoom.jpg'], '10_uploadRole', ''),
    cmd('wait', ['5'], '11_wait', '', ['POST 200 /ajax/react_composer/attachments/photo/upload (5129 ms)']),
    cmd('clickRole', ['button', 'Post'], '12_clickRole', '', [], true),
    cmd('wait', ['8'], '13_wait', '', ['POST 200 ComposerStoryCreateMutation (3802 ms)'])
  ], { runDir: '/r', account: '61594063207669' }, { file1: 'photo' })
  const remove = flowFromRecording('deletePost', 'test', [
    cmd('clickRole', ['button', 'Actions for this post by Pat Example'], '14_clickRole', ''),
    cmd('clickRole', ['button', 'Move'], '17_clickRole', '', ['POST 200 useCometTrashPostMutation (848 ms)'])
  ], { runDir: '/r', account: '1' }, { 'Pat Example': 'profileName' })

  test('uploadRole is an upload step whose file is a param, and the Post waits for the create request', () => {
    expect(photo.steps.map((s) => [s.action, s.role ?? s.url, s.name ?? null, s.value ?? null])).toEqual([
      ['goto', 'https://www.facebook.com/profile.php?id={uid}', null, null],
      ['upload', 'button', 'Photo/video', '{photo}'],
      ['click', 'button', 'Post', null]
    ])
    expect(photo.params).toEqual([{ name: 'photo', kind: 'file', description: 'uploaded through button "Photo/video"' }])
    expect(photo.steps[2].expect).toBe('ComposerStoryCreateMutation')
  })

  test('a comment waits for the create request, not the typing broadcast around it', () => {
    expect(confirmingRequest(['POST 200 CometUFILiveTypingBroadcastMutation_StartMutation (505 ms)', 'POST 200 CometUFILiveTypingBroadcastMutation_StopMutation (479 ms)', 'POST 200 useCometUFICreateCommentMutation (2434 ms)'])).toBe('useCometUFICreateCommentMutation')
    expect(confirmingRequest(['POST 200 CometUFILiveTypingBroadcastMutation_StartMutation (675 ms)'])).toBeNull()
  })

  test("the account's own name in an element's name is {profileName}, filled on each run, never a --set", () => {
    expect(remove.steps[0].name).toBe('Actions for this post by {profileName}')
    expect(remove.params).toEqual([])
    expect(fillStep(remove.steps[0], { uid: '1', profileName: 'Another Account' }).name).toBe('Actions for this post by Another Account')
  })
})

describe('flowFromRecording', () => {
  const flow =flowFromRecording('profileSetup', 'test', RECORDING, { runDir: '/r', account: '61593967241658' }, { text1: 'firstName', file1: 'profilePhoto' })

  test('turns refs into the role and name the step acted on, and drops looks, failures and field clicks', () => {
    expect(flow.steps.map((s) => [s.action, s.role ?? s.url, s.name ?? null])).toEqual([
      ['goto', 'https://www.facebook.com/me', null],
      ['click', 'button', 'Profile picture actions'],
      ['click', 'menuitem', 'Choose profile picture'],
      ['upload', 'button', 'Upload Photo'],
      ['click', 'button', 'Save'],
      ['goto', 'https://accountscenter.facebook.com/profiles/{uid}/name', null],
      ['fill', 'textbox', 'First name'],
      ['click', 'button', 'Done']
    ])
  })

  test('the confirming request is the step’s own mutation, from the looks after it too; a page open waits for none', () => {
    expect(flow.steps[0].expect).toBeUndefined()
    expect(flow.steps[4].expect).toBe('ProfileCometProfilePictureSetMutation')
    expect(flow.steps[7].expect).toBe('useFXIMUpdateNameMutation')
    expect(confirmingRequest(['POST 200 FBScreenTimeLogger_syncMutation (1 ms)'])).toBeNull()
  })

  test('typed text and files become named params; the account id becomes {uid}', () => {
    expect(flow.params).toEqual([
      { name: 'profilePhoto', kind: 'file', description: 'uploaded through button "Upload Photo"' },
      { name: 'firstName', kind: 'text', description: 'typed into textbox "First name"' }
    ])
    expect(JSON.stringify(flow)).not.toContain('Lancaster')
    expect(fillStep(flow.steps[5], { uid: '61500000000001' }).url).toBe('https://accountscenter.facebook.com/profiles/61500000000001/name')
    expect(() => fillStep(flow.steps[6], {})).toThrow('missing value for {firstName}')
  })

  test('its doc lists every step with its confirming request, rea Evidence and the machine', () => {
    const doc = renderFlowDoc(flow, (name) => (name === 'useFXIMUpdateNameMutation' ? '../login/x.md' : null))
    expect(doc).toContain('[`useFXIMUpdateNameMutation`](../login/x.md)')
    expect(doc).toContain('`ProfileCometProfilePictureSetMutation`')
    expect(doc).toContain('rea `ev_05_click`')
    expect(doc).toContain('stateDiagram-v2')
    expect(toolName('profileSetup')).toBe('flowProfileSetup')
  })
})

describe('createFlowMachine', () => {
  const flow = flowFromRecording('profileSetup', 'test', RECORDING, { runDir: '/r', account: 'a' })
  const run = async (failAt: string | null) => {
    const seen: string[] = []
    const machine = createFlowMachine(flow).provide({
      actors: {
        act: fromPromise<FlowStepResult, FlowActInput>(async ({ input }) => {
          seen.push(input.step.id)
          return { id: input.step.id, ok: input.step.id !== failAt }
        })
      }
    })
    const actor = createActor(machine)
    actor.start()
    return { output: (await toPromise(actor)) as FlowRunOutput, seen }
  }

  test('runs every step in order and ends done', async () => {
    const { output, seen } = await run(null)
    expect(seen).toEqual(flow.steps.map((s) => s.id))
    expect(output.result).toBe('done')
  })

  test('a failed step ends the run there: nothing after it runs', async () => {
    const failAt = flow.steps[4].id
    const { output, seen } = await run(failAt)
    expect(seen.at(-1)).toBe(failAt)
    expect(output).toMatchObject({ result: 'failed', failedAt: failAt })
  })
})
