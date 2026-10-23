import { assign, fromPromise, setup } from 'xstate'
import type { CodedFailure } from '../../errors/catalog/index'
import type {
  ProfileActOutput,
  ProfileActorInputs,
  ProfileContext,
  ProfileFailure,
  ProfileInput,
  ProfileNameOutput,
  ProfileNamePage,
  ProfileOutput,
  ProfilePhotosOutput,
  ProfilePlanStep,
  ProfileReadOutput
} from './types'

function missing<TOutput, TInput>(name: string) {
  return fromPromise<TOutput, TInput>(async () => {
    throw new Error('profileMachine: provide a `' + name + '` actor')
  })
}

const isFailure = (output: { ok?: boolean }): output is CodedFailure => output.ok === false
const crash = (state: string, error: unknown): ProfileFailure => ({ state, code: 'crashed', detail: String(error) })

export function planOf(context: Pick<ProfileContext, 'page' | 'namePage' | 'hasProfilePhoto' | 'hasCoverPhoto' | 'profileName' | 'uploaded' | 'live'>): ProfilePlanStep[] {
  const step = (item: ProfilePlanStep['item'], has: boolean, control: string | null): ProfilePlanStep => ({
    item,
    control,
    action: context.uploaded.includes(item) ? 'uploaded' : !has ? 'noPhotoInTwenty' : !control ? 'noControl' : 'wouldUpload'
  })
  const current = context.namePage?.currentName ?? null
  const wanted = context.profileName
  const name: ProfilePlanStep = {
    item: 'name',
    control: context.namePage ? context.namePage.fields.join(', ') || null : null,
    current,
    wanted,
    action: !wanted
      ? 'noNameInTwenty'
      : current && current.toLowerCase() === wanted.toLowerCase()
        ? 'alreadyNamed'
        : context.live
          ? 'renameNotBuilt'
          : context.namePage && !context.namePage.fields.length
            ? 'noControl'
            : 'wouldRename'
  }
  return [
    step('profilePhoto', context.hasProfilePhoto, context.page?.profileControl ?? null),
    step('coverPhoto', context.hasCoverPhoto, context.page?.coverControl ?? null),
    name
  ]
}

const stepFailed = (state: string) => ({
  guard: { type: 'stepFailed' as const, params: ({ event }: { event: { output: { ok?: boolean } } }) => event.output },
  target: '#profile.stopping',
  actions: { type: 'recordFailure' as const, params: ({ event }: { event: { output: { ok?: boolean } } }) => ({ state, ...(event.output as CodedFailure) }) }
})
const stepError = (state: string) => ({
  target: '#profile.stopping',
  actions: { type: 'recordFailure' as const, params: ({ event }: { event: { error: unknown } }) => crash(state, event.error) }
})

export const profileMachine = setup({
  types: {
    context: {} as ProfileContext,
    input: {} as ProfileInput,
    output: {} as ProfileOutput
  },
  actors: {
    preparePhotos: missing<ProfilePhotosOutput, ProfileActorInputs['preparePhotos']>('preparePhotos'),
    open: missing<ProfileActOutput, ProfileActorInputs['open']>('open'),
    read: missing<ProfileReadOutput, ProfileActorInputs['read']>('read'),
    readName: missing<ProfileNameOutput, ProfileActorInputs['readName']>('readName'),
    uploadProfilePhoto: missing<ProfileActOutput, ProfileActorInputs['uploadProfilePhoto']>('uploadProfilePhoto'),
    uploadCoverPhoto: missing<ProfileActOutput, ProfileActorInputs['uploadCoverPhoto']>('uploadCoverPhoto')
  },
  guards: {
    stepFailed: (_, output: { ok?: boolean }) => isFailure(output),
    live: ({ context }) => context.live,
    wantsName: ({ context }) => context.profileName !== null,
    hasPhotos: ({ context }) => context.hasProfilePhoto && context.hasCoverPhoto,
    anyPhoto: ({ context }) => context.hasProfilePhoto || context.hasCoverPhoto,
    signedIn: (_, output: ProfileReadOutput) => output.ok === true && output.kind === 'loggedIn'
  },
  actions: {
    recordFailure: assign((_, failure: ProfileFailure) => ({ failure }))
  }
}).createMachine({
  id: 'profile',
  context: ({ input }) => ({ ...input, photos: null, page: null, namePage: null, uploaded: [], failure: null, result: null }),
  initial: 'checking',
  states: {
    checking: {
      always: [
        {
          guard: { type: 'live' },
          target: 'preparing',
          actions: assign(({ context }) =>
            context.hasProfilePhoto && context.hasCoverPhoto
              ? {}
              : { failure: { state: 'checking', code: 'profilePhotoMissing' as const, detail: `--live needs both: profilePhoto ${context.hasProfilePhoto ? 'set' : 'missing'}, coverPhoto ${context.hasCoverPhoto ? 'set' : 'missing'}` } }
          )
        },
        { target: 'preparing' }
      ]
    },
    preparing: {
      always: [
        { guard: ({ context }) => context.failure !== null, target: 'stopping' },
        { guard: { type: 'anyPhoto' }, target: 'preparingPhotos' },
        { target: 'opening' }
      ]
    },
    preparingPhotos: {
      invoke: {
        src: 'preparePhotos',
        onDone: [
          stepFailed('preparingPhotos'),
          { target: 'opening', actions: assign(({ event }) => ({ photos: event.output as { profilePath: string; coverPath: string } })) }
        ],
        onError: stepError('preparingPhotos')
      }
    },
    opening: {
      invoke: { src: 'open', onDone: [stepFailed('opening'), { target: 'reading' }], onError: stepError('opening') }
    },
    reading: {
      invoke: {
        src: 'read',
        onDone: [
          stepFailed('reading'),
          {
            guard: { type: 'signedIn', params: ({ event }) => event.output },
            target: 'afterReading',
            actions: assign(({ event }) => {
              const { ok: _ok, ...page } = event.output as Extract<ProfileReadOutput, { ok: true }>
              return { page }
            })
          },
          {
            target: 'stopping',
            actions: [
              assign(({ event }) => {
                const { ok: _ok, ...page } = event.output as Extract<ProfileReadOutput, { ok: true }>
                return { page }
              }),
              { type: 'recordFailure', params: ({ event }) => ({ state: 'reading', code: 'sessionExpired' as const, detail: `the profile shows ${(event.output as { kind?: string }).kind} at ${(event.output as { path?: string }).path}: run log facebook connect first` }) }
            ]
          }
        ],
        onError: stepError('reading')
      }
    },
    afterReading: {
      always: [{ guard: { type: 'wantsName' }, target: 'readingName' }, { target: 'planning' }]
    },
    readingName: {
      invoke: {
        src: 'readName',
        onDone: [
          { guard: { type: 'stepFailed', params: ({ event }) => event.output }, target: 'planning' },
          {
            target: 'planning',
            actions: assign(({ event }) => {
              const { ok: _ok, ...namePage } = event.output as Extract<ProfileNameOutput, { ok: true }>
              return { namePage: namePage as ProfileNamePage }
            })
          }
        ],
        onError: { target: 'planning' }
      }
    },
    planning: {
      always: [{ guard: { type: 'live' }, target: 'uploadingProfilePhoto' }, { target: 'done', actions: assign({ result: 'planned' as const }) }]
    },
    uploadingProfilePhoto: {
      invoke: {
        src: 'uploadProfilePhoto',
        input: ({ context }) => ({ path: context.photos!.profilePath }),
        onDone: [stepFailed('uploadingProfilePhoto'), { target: 'uploadingCoverPhoto', actions: assign(({ context }) => ({ uploaded: [...context.uploaded, 'profilePhoto' as const] })) }],
        onError: stepError('uploadingProfilePhoto')
      }
    },
    uploadingCoverPhoto: {
      invoke: {
        src: 'uploadCoverPhoto',
        input: ({ context }) => ({ path: context.photos!.coverPath }),
        onDone: [
          stepFailed('uploadingCoverPhoto'),
          { target: 'done', actions: assign(({ context }) => ({ uploaded: [...context.uploaded, 'coverPhoto' as const], result: 'saved' as const })) }
        ],
        onError: stepError('uploadingCoverPhoto')
      }
    },
    stopping: {
      always: { target: 'done', actions: assign({ result: 'failed' as const }) }
    },
    done: { type: 'final' }
  },
  output: ({ context }) => ({
    accountId: context.accountId,
    live: context.live,
    result: context.result ?? 'failed',
    page: context.page,
    namePage: context.namePage,
    plan: planOf(context),
    failure: context.failure
  })
})
