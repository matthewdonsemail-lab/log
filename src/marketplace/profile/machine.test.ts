import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { profileMachine } from './machine'
import type { ProfileActOutput, ProfileInput, ProfileNameOutput, ProfileOutput, ProfilePhotosOutput, ProfileReadOutput } from './types'

const SIGNED_IN: ProfileReadOutput = {
  ok: true,
  kind: 'loggedIn',
  path: 'https://www.facebook.com/profile.php',
  profileControl: 'Update profile picture',
  coverControl: 'Add cover photo',
  fileInputs: 0,
  controls: 120
}

function run(input: Partial<ProfileInput>, script: { read?: ProfileReadOutput; name?: ProfileNameOutput; photos?: ProfilePhotosOutput; profile?: ProfileActOutput; cover?: ProfileActOutput } = {}) {
  const calls: string[] = []
  // Scripted actors: typed loosely, as the real ones take each step's own input.
  const act = <T>(name: string, result: T) =>
    fromPromise<T, unknown>(async ({ input: given }) => {
      calls.push(given && typeof given === 'object' && 'path' in given ? `${name} ${(given as { path: string }).path}` : name)
      return result
    }) as never
  const machine = profileMachine.provide({
    actors: {
      preparePhotos: act('preparePhotos', script.photos ?? { ok: true, profilePath: 'p.jpg', coverPath: 'c.jpg' }),
      open: act('open', { ok: true }),
      read: act('read', script.read ?? SIGNED_IN),
      readName: act('readName', script.name ?? { ok: true, path: '/profiles/1/name', currentName: 'Yuli Chaniago', fields: ['First name', 'Surname'], controls: 30 }),
      uploadProfilePhoto: act('uploadProfilePhoto', script.profile ?? { ok: true }),
      uploadCoverPhoto: act('uploadCoverPhoto', script.cover ?? { ok: true })
    }
  })
  const actor = createActor(machine, { input: { accountId: 'allentown', live: false, hasProfilePhoto: true, hasCoverPhoto: true, profileName: null, ...input } as ProfileInput })
  actor.start()
  return toPromise(actor).then((output) => ({ output: output as ProfileOutput, calls }))
}

describe('profileMachine', () => {
  test('a dry run reads the profile and plans both uploads, and never uploads', async () => {
    const { output, calls } = await run({})
    expect(calls).toEqual(['preparePhotos', 'open', 'read'])
    expect(output.result).toBe('planned')
    expect(output.plan.slice(0, 2)).toEqual([
      { item: 'profilePhoto', control: 'Update profile picture', action: 'wouldUpload' },
      { item: 'coverPhoto', control: 'Add cover photo', action: 'wouldUpload' }
    ])
    expect(output.plan[2]).toMatchObject({ item: 'name', action: 'noNameInTwenty' })
  })

  test('a dry run with no photos in Twenty still reads the page, and says so', async () => {
    const { output, calls } = await run({ hasProfilePhoto: false, hasCoverPhoto: false })
    expect(calls).toEqual(['open', 'read'])
    expect(output.plan.map((p) => p.action)).toEqual(['noPhotoInTwenty', 'noPhotoInTwenty', 'noNameInTwenty'])
  })

  test('--live uploads the profile photo, then the cover, in one run', async () => {
    const { output, calls } = await run({ live: true })
    expect(calls).toEqual(['preparePhotos', 'open', 'read', 'uploadProfilePhoto p.jpg', 'uploadCoverPhoto c.jpg'])
    expect(output.result).toBe('saved')
    expect(output.plan.map((p) => p.action)).toEqual(['uploaded', 'uploaded', 'noNameInTwenty'])
  })

  test('--live without both photos stops before any browser opens', async () => {
    const { output, calls } = await run({ live: true, hasCoverPhoto: false })
    expect(calls).toEqual([])
    expect(output.failure).toMatchObject({ state: 'checking', code: 'profilePhotoMissing' })
  })

  test('not signed in stops at reading: connect first', async () => {
    const { output, calls } = await run({ live: true }, { read: { ...SIGNED_IN, kind: 'loginForm' } })
    expect(calls).toEqual(['preparePhotos', 'open', 'read'])
    expect(output.failure).toMatchObject({ state: 'reading', code: 'sessionExpired' })
  })

  test('a failed profile upload stops the run: the cover is never tried', async () => {
    const { output, calls } = await run({ live: true }, { profile: { ok: false, code: 'profileControlNotFound', detail: 'no opener' } })
    expect(calls.at(-1)).toBe('uploadProfilePhoto p.jpg')
    expect(output.result).toBe('failed')
    expect(output.failure).toMatchObject({ state: 'uploadingProfilePhoto', code: 'profileControlNotFound' })
  })

  test('a failed cover upload keeps the profile photo as uploaded', async () => {
    const { output } = await run({ live: true }, { cover: { ok: false, code: 'profileUploadNotSaved' } })
    expect(output.plan.map((p) => p.action).slice(0, 2)).toEqual(['uploaded', 'wouldUpload'])
    expect(output.failure).toMatchObject({ state: 'uploadingCoverPhoto', code: 'profileUploadNotSaved' })
  })

  test('with a profileName, the dry run also reads the name page (read only) and plans the rename', async () => {
    const { output, calls } = await run({ profileName: 'Allentown Trash' })
    expect(calls).toEqual(['preparePhotos', 'open', 'read', 'readName'])
    expect(output.plan[2]).toEqual({ item: 'name', control: 'First name, Surname', current: 'Yuli Chaniago', wanted: 'Allentown Trash', action: 'wouldRename' })
  })

  test('a name page that fails to read never stops the run', async () => {
    const { output } = await run({ profileName: 'Allentown Trash' }, { name: { ok: false, code: 'crashed' } })
    expect(output.result).toBe('planned')
    expect(output.namePage).toBeNull()
  })

  test('--live never renames yet: the rename is built from the dry run first', async () => {
    const { output, calls } = await run({ live: true, profileName: 'Allentown Trash' })
    expect(calls).not.toContain('renameProfile')
    expect(output.plan[2].action).toBe('renameNotBuilt')
  })
})
