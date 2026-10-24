import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { answersIssue, confirmingRequest, dialogAt, dialogOf, flowWithParams, loadFlow } from './index'
import type { StepExchange } from '../../subq/stepReading/index'

const python = join(import.meta.dir, '..', '..', '..', 'python')
const fixture = (name: string) => readFileSync(join(python, 'fixtures', 'controls', `${name}.yml`), 'utf8')

const INTERACTIVE = /^(button|link|textbox|checkbox|radio|combobox|menuitem|tab|option|slider)$/

interface Candidate {
  role: string
  aria: string
  label: string
  text: string
  placeholder: string
  dialog: string | null
  hit: boolean
  enabled: boolean
  path: string
}

function candidatesOf(snapshot: string): Candidate[] {
  const lines = snapshot.split(/\r?\n/).filter((l) => l.trim())
  const indent = (l: string) => l.length - l.trimStart().length
  const out: Candidate[] = []
  lines.forEach((line, i) => {
    const node = line.trim().match(/^- ([a-z]+)(?: "([^"]*)")?(.*)$/)
    if (!node || !INTERACTIVE.test(node[1])) return
    let text = ''
    for (let j = i + 1; j < lines.length && indent(lines[j]) > indent(line); j++) {
      const value = lines[j].trim().match(/^- (?:generic|text)(?: \[[^\]]*\])*: (.+)$/)?.[1]
      if (value) {
        text = value
        break
      }
    }
    out.push({
      role: node[1],
      aria: node[2] ?? '',
      label: '',
      text,
      placeholder: '',
      dialog: dialogAt(lines, i),
      hit: true,
      enabled: !/\[disabled\]/.test(node[3]),
      path: node[3].match(/\[ref=(e\d+)\]/)?.[1] ?? `line${i}`
    })
  })
  return out
}

function pick(cases: { candidates: Candidate[]; role: string; name: string; within?: string | null }[]): Record<string, unknown>[] {
  const script = [
    'import json, sys',
    'sys.path.insert(0, ".")',
    'from browser import controlMatch',
    'cases = json.load(sys.stdin)',
    'print(json.dumps([controlMatch.pick(c["candidates"], c["role"], c["name"], c.get("within")) for c in cases]))'
  ].join('\n')
  const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script], { cwd: python, encoding: 'utf8', input: JSON.stringify(cases) })
  if (run.status !== 0) throw new Error(run.stderr)
  return JSON.parse(run.stdout)
}

describe('controlMatch picks one control or says why not, the same every time', () => {
  test("the two-step box is the textbox named Code, though it has none of CODE_FIELD's attributes", () => {
    const [found] = pick([{ candidates: candidatesOf(fixture('twoStepCode')), role: 'textbox', name: 'Code' }])
    expect(found).toMatchObject({ path: 'e38', enabled: true })
  })

  test("Dismiss is found by its text when the button has no accessible name", () => {
    const [found] = pick([{ candidates: candidatesOf(fixture('automatedBehaviour')), role: 'button', name: 'Dismiss' }])
    expect(found).toMatchObject({ path: 'e53', enabled: true })
  })

  test('"Upload Photo" from the 2026-10-19 recording finds today\'s "Upload photo"', () => {
    const [found] = pick([{ candidates: candidatesOf(fixture('choosePicture')), role: 'button', name: 'Upload Photo', within: 'Choose profile picture' }])
    expect(found).toMatchObject({ path: 'e1313' })
  })

  test('Save is the one inside the dialog the step names, not the page behind it', () => {
    const candidates = candidatesOf(fixture('cropPicture'))
    const [within, open, page] = pick([
      { candidates, role: 'button', name: 'Save', within: 'Choose profile picture' },
      { candidates, role: 'button', name: 'Save' },
      { candidates: candidates.filter((c) => c.dialog === null), role: 'button', name: 'save' }
    ])
    expect(within).toMatchObject({ path: 'e1395' })
    expect(open).toMatchObject({ path: 'e1395' })
    expect(page).toMatchObject({ path: 'e900' })
  })

  test('two equal matches are refused, never guessed', () => {
    const save = candidatesOf(fixture('cropPicture')).find((c) => c.path === 'e1395')!
    const [found] = pick([{ candidates: [save, { ...save, path: 'copy' }], role: 'button', name: 'Save' }])
    expect(found.code).toBe('controlAmbiguous')
  })

  test('a disabled match is reported as disabled, a missing one as missing', () => {
    const candidates = candidatesOf(fixture('twoStepCode'))
    const [disabled, missing, wrongDialog] = pick([
      { candidates, role: 'button', name: 'Continue' },
      { candidates, role: 'button', name: 'Upload photo' },
      { candidates: candidatesOf(fixture('choosePicture')), role: 'button', name: 'Upload photo', within: 'Create post' }
    ])
    expect(disabled).toMatchObject({ path: 'e42', enabled: false })
    expect(missing.code).toBe('controlMissing')
    expect(wrongDialog.code).toBe('controlMissing')
  })
})

describe('flows carry what makes each step deterministic', () => {
  test('dialogOf reads the dialog around a control from a snapshot', () => {
    expect(dialogOf(fixture('cropPicture'), 'button', 'Save')).toBe('Choose profile picture')
    expect(dialogOf(fixture('choosePicture'), 'button', 'Upload photo')).toBe('Choose profile picture')
    expect(dialogOf(fixture('choosePicture'), 'button', 'Profile picture actions')).toBeNull()
  })

  test('a step that sends no mutation is confirmed by its plain endpoint or its dialog query', () => {
    expect(confirmingRequest(['POST 200 /ajax/bnzai (419 ms)', 'POST 200 /profile/picture/upload/ (4784 ms)'])).toBe('profilePictureUpload')
    expect(confirmingRequest(['POST 200 CometHovercardQueryRendererQuery (547 ms)', 'POST 200 ProfileCometProfilePictureEditDialogQuery (433 ms)'])).toBe('ProfileCometProfilePictureEditDialogQuery')
    expect(confirmingRequest(['POST 200 ProfileCometProfilePictureSetMutation (4202 ms)', 'POST 200 /profile/picture/upload/ (1 ms)'])).toBe('ProfileCometProfilePictureSetMutation')
  })

  test("profileSetup's picture steps each wait on Facebook's answer, inside the dialog they belong to", () => {
    const steps = flowWithParams(loadFlow('profileSetup')!, { uid: '1', profilePhoto: 'a.png' }).steps
    expect(steps.map((s) => [s.id, s.within ?? null, s.expect ?? null])).toEqual([
      ['s01_gotome', null, null],
      ['s02_clickProfilePictureActions', null, null],
      ['s03_clickChooseProfilePicture', null, 'ProfileCometProfilePictureEditDialogQuery'],
      ['s04_uploadUploadPhoto', 'Choose profile picture', 'profilePictureUpload'],
      ['s05_clickSave', 'Choose profile picture', 'ProfileCometProfilePictureSetMutation']
    ])
  })
})

describe("the picture steps' answers decide them (rule 73)", () => {
  const steps = loadFlow('profileSetup')!.steps
  const at = (id: string) => steps.find((s) => s.id === id)!.answers!
  const EXETER = { uid: '61593843527201', homeCity: 'Exeter', homeCountry: 'US' }
  const exchange = (name: string, answer: unknown): StepExchange => ({ offsetMs: 0, kind: 'api', name, method: 'POST', host: 'www.facebook.com', path: '/', status: 200, ms: 400, sent: {}, answer, errors: [], known: true })

  test("the dialog must be for this account, the upload must name it and return the photo's id", () => {
    const dialog = (id: string) => exchange('ProfileCometProfilePictureEditDialogQuery', { data: { viewer: { actor: { id, profile_picture_is_silhouette: true } } } })
    expect(answersIssue(at('s03_clickChooseProfilePicture'), [dialog('61593843527201')], EXETER)).toBeNull()
    expect(answersIssue(at('s03_clickChooseProfilePicture'), [dialog('100000000000001')], EXETER)).not.toBeNull()
    const upload = (profileID: string, fbid: string | null) => exchange('profilePictureUpload', { __ar: 1, payload: { fbid, profileID, imageWidth: 896, imageHeight: 1200 } })
    expect(answersIssue(at('s04_uploadUploadPhoto'), [upload('61593843527201', '122123515989461450')], EXETER)).toBeNull()
    expect(answersIssue(at('s04_uploadUploadPhoto'), [upload('61593843527201', null)], EXETER)).not.toBeNull()
  })

  test("the session names a plain endpoint the way the readings do, so a step can wait on it", () => {
    const script = ['import sys', 'sys.path.insert(0, ".")', 'from session.inspectSession import endpoint_name', 'print(endpoint_name("https://www.facebook.com/profile/picture/upload/?profile_id=1"), endpoint_name("https://www.facebook.com/ajax/bnzai?x=1"))'].join('\n')
    const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script], { cwd: python, encoding: 'utf8' })
    expect(run.stdout.trim()).toBe('profilePictureUpload ajaxBnzai')
  })
})
