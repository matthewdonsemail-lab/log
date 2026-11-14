import { assign, fromPromise, setup } from 'xstate'
import type { GapRow } from '../store/types'
import type { CatchUpActors, CatchUpEnd, CatchUpGot, CatchUpRun } from './types'

interface CatchUpContext {
  gap: GapRow | null
  got: CatchUpGot | null
  end: CatchUpEnd
  detail: string | null
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function gapCatchUpMachine(actors: CatchUpActors) {
  const { platform, account, log } = actors
  return setup({
    types: { context: {} as CatchUpContext, output: {} as CatchUpRun },
    actors: {
      close: fromPromise(async ({ input }: { input: { gap: GapRow; got: CatchUpGot } }): Promise<boolean> => actors.mark(input.gap.id, 'closed', input.got.detail ?? null, input.got.appended, new Date(), input.gap.drops ?? 0)),
      catchUp: fromPromise(async ({ input }: { input: GapRow }): Promise<CatchUpGot> => {
        if (!actors.catchUp) throw new Error('no catch-up')
        return actors.catchUp(input)
      }),
    },
    guards: {
      nothingBehind: ({ context }) => !context.gap,
      heldByThePlatform: ({ context }) => context.gap?.status === 'refused' && !actors.notThePlatform(context.gap.detail),
      stoppedByUs: ({ context }) => context.gap?.status === 'refused' && actors.notThePlatform(context.gap.detail),
      noCatchUp: () => !actors.catchUp,
      failedWithoutThePlatform: ({ context }) => !!context.got?.refused && actors.notThePlatform(context.got.refused),
      refusedByThePlatform: ({ context }) => !!context.got?.refused,
      closed: (_, closed: boolean) => closed,
    },
    actions: {
      readGap: assign(() => ({ gap: actors.behind() })),
      reopen: assign(({ context }) => {
        const gap = context.gap as GapRow
        actors.mark(gap.id, 'open', `reopened: the platform never refused it (${gap.detail})`)
        log(`${platform} ${account}: the gap from ${gap.fromAt} was stopped by a network failure or our own error, not by the platform, so it is caught up again`)
        return { gap: actors.behind() }
      }),
      noteNoCatchUp: ({ context }) => log(`${platform} ${account}: behind from ${context.gap?.fromAt} (${context.gap?.reason}), and this owner has no catch-up yet`),
      startCatchingUp: ({ context }) => {
        const gap = context.gap as GapRow
        actors.mark(gap.id, 'catchingUp')
        log(`${platform} ${account}: catching up from ${gap.fromAt} (${gap.reason}) through its own session`)
      },
      keepGot: assign((_, got: CatchUpGot) => ({ got })),
      keepOpen: ({ context }) => {
        const refused = context.got?.refused ?? ''
        actors.mark((context.gap as GapRow).id, 'open', `the platform didn't refuse it (a network failure or our own error), so it is tried again at the next check: ${refused}`, context.got?.appended ?? 0)
        log(`${platform} ${account}: catch-up failed without the platform refusing (${refused}); still behind, tried again at the next check`)
      },
      markRefused: ({ context }) => {
        const refused = context.got?.refused ?? ''
        actors.mark((context.gap as GapRow).id, 'refused', refused, context.got?.appended ?? 0)
        log(`${platform} ${account}: catch-up refused: ${refused}; it stays behind until matt says so (rule 94)`)
      },
      noteCaughtUp: ({ context }) => log(`${platform} ${account}: caught up, ${context.got?.appended ?? 0} event(s) added from the gap`),
      keepDroppedAgain: ({ context }) => {
        actors.mark((context.gap as GapRow).id, 'open', 'the socket dropped again while catching up, so the gap stays open and is caught up again')
        log(`${platform} ${account}: dropped again while catching up, ${context.got?.appended ?? 0} event(s) added; catching up again`)
      },
      keepThrown: assign(({ context }, error: unknown) => {
        const detail = messageOf(error)
        actors.mark((context.gap as GapRow).id, 'open', detail)
        log(`${platform} ${account}: catch-up failed (${detail}), still behind`)
        return { detail }
      }),
      endAs: assign((_, end: CatchUpEnd) => ({ end })),
    },
  }).createMachine({
    id: 'gapCatchUp',
    initial: 'checking',
    context: { gap: null, got: null, end: 'nothingBehind', detail: null },
    states: {
      checking: {
        entry: 'readGap',
        always: [
          { guard: 'nothingBehind', target: 'done', actions: { type: 'endAs', params: 'nothingBehind' } },
          { guard: 'stoppedByUs', target: 'reopening' },
          { guard: 'heldByThePlatform', target: 'done', actions: { type: 'endAs', params: 'held' } },
          { guard: 'noCatchUp', target: 'done', actions: ['noteNoCatchUp', { type: 'endAs', params: 'noCatchUp' }] },
          { target: 'catchingUp' },
        ],
      },
      reopening: {
        entry: 'reopen',
        always: [
          { guard: 'nothingBehind', target: 'done', actions: { type: 'endAs', params: 'nothingBehind' } },
          { guard: 'stoppedByUs', target: 'done', actions: { type: 'endAs', params: 'held' } },
          { guard: 'heldByThePlatform', target: 'done', actions: { type: 'endAs', params: 'held' } },
          { guard: 'noCatchUp', target: 'done', actions: ['noteNoCatchUp', { type: 'endAs', params: 'noCatchUp' }] },
          { target: 'catchingUp' },
        ],
      },
      catchingUp: {
        entry: 'startCatchingUp',
        invoke: {
          src: 'catchUp',
          input: ({ context }) => context.gap as GapRow,
          onDone: { target: 'settling', actions: { type: 'keepGot', params: ({ event }: { event: { output: CatchUpGot } }) => event.output } },
          onError: { target: 'done', actions: [{ type: 'keepThrown', params: ({ event }: { event: { error: unknown } }) => event.error }, { type: 'endAs', params: 'retryLater' }] },
        },
      },
      settling: {
        always: [
          { guard: 'failedWithoutThePlatform', target: 'done', actions: ['keepOpen', { type: 'endAs', params: 'retryLater' }] },
          { guard: 'refusedByThePlatform', target: 'done', actions: ['markRefused', { type: 'endAs', params: 'refused' }] },
          { target: 'closing' },
        ],
      },
      closing: {
        invoke: {
          src: 'close',
          input: ({ context }) => ({ gap: context.gap as GapRow, got: context.got as CatchUpGot }),
          onDone: [
            { guard: { type: 'closed', params: ({ event }: { event: { output: boolean } }) => event.output }, target: 'done', actions: ['noteCaughtUp', { type: 'endAs', params: 'caughtUp' }] },
            { target: 'done', actions: ['keepDroppedAgain', { type: 'endAs', params: 'retryLater' }] },
          ],
          onError: { target: 'done', actions: [{ type: 'keepThrown', params: ({ event }: { event: { error: unknown } }) => event.error }, { type: 'endAs', params: 'retryLater' }] },
        },
      },
      done: { type: 'final' },
    },
    output: ({ context }) => ({ end: context.end, appended: context.got?.appended ?? 0, detail: context.got?.refused ?? context.detail ?? null }),
  })
}
