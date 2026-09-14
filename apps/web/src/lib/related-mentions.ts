import { assign, setup } from 'xstate'

/**
 * State machine for the "Find related mentions" chain.
 *
 * Owns the interactive half of the flow; the streaming/scan phases are
 * timer-driven in the component (the same split revealMachine and
 * BrandRevealStep share). Forward-only, like the onboarding reveal:
 *
 * scanning → picking → onlineAsk → searching → groups → mapReady → saving → saved
 *               ↓              (skip online)
 *            retrying → repicking → onlineAsk …
 *               (second None) → dismissed
 *
 * `saved` and `dismissed` are final: once the save lands (or the user walks
 * away after two empty rounds), the chain renders as frozen history.
 */

export interface RelatedMentionsContext {
  /** Phrases the user has toggled among the candidates (both rounds share it). */
  picked: string[]
  /** Round picks rejected via "none of these are relevant" — later rounds exclude them. */
  rejected: string[]
  /** Phrases persisted as keywords after a successful save. */
  saved: string[]
  /** Community ids joined along the way — extra scopes on the final map. */
  joinedIds: string[]
  /** Message from the last failed save; cleared by the next action. */
  error: string | null
}

export type RelatedMentionsEvent =
  | { type: 'STREAM_DONE' }
  | { type: 'RETRY_DONE' }
  | { type: 'SEARCH_DONE' }
  | { type: 'TOGGLE_PICK'; phrase: string }
  | { type: 'CONTINUE' }
  | { type: 'NONE_RELEVANT' }
  | { type: 'LOOK_ONLINE' }
  | { type: 'SKIP_ONLINE' }
  | { type: 'JOINED'; id: string }
  | { type: 'CONTINUE_GROUPS' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; message: string }

function togglePick(list: string[], phrase: string): string[] {
  return list.includes(phrase) ? list.filter((row) => row !== phrase) : [...list, phrase]
}

const hasPicks = ({ context }: { context: RelatedMentionsContext }) => context.picked.length > 0

export const relatedMentionsMachine = setup({
  types: {
    context: {} as RelatedMentionsContext,
    events: {} as RelatedMentionsEvent,
  },
}).createMachine({
  id: 'relatedMentions',
  initial: 'scanning',
  context: { picked: [], rejected: [], saved: [], joinedIds: [], error: null },
  states: {
    scanning: {
      on: {
        STREAM_DONE: { target: 'picking' },
      },
    },
    picking: {
      on: {
        TOGGLE_PICK: {
          actions: assign({
            picked: ({ context, event }) => togglePick(context.picked, event.phrase),
            error: () => null,
          }),
        },
        CONTINUE: { guard: hasPicks, target: 'onlineAsk' },
        NONE_RELEVANT: {
          target: 'retrying',
          actions: assign({
            rejected: ({ context }) => [...context.rejected, ...context.picked],
            picked: () => [],
            error: () => null,
          }),
        },
      },
    },
    retrying: {
      on: {
        RETRY_DONE: { target: 'repicking' },
      },
    },
    repicking: {
      on: {
        TOGGLE_PICK: {
          actions: assign({
            picked: ({ context, event }) => togglePick(context.picked, event.phrase),
            error: () => null,
          }),
        },
        CONTINUE: { guard: hasPicks, target: 'onlineAsk' },
        NONE_RELEVANT: {
          target: 'dismissed',
          actions: assign({
            rejected: ({ context }) => [...context.rejected, ...context.picked],
            picked: () => [],
          }),
        },
      },
    },
    onlineAsk: {
      on: {
        LOOK_ONLINE: { target: 'searching' },
        SKIP_ONLINE: { target: 'mapReady' },
      },
    },
    searching: {
      on: {
        SEARCH_DONE: { target: 'groups' },
      },
    },
    groups: {
      on: {
        JOINED: {
          actions: assign({
            joinedIds: ({ context, event }) =>
              context.joinedIds.includes(event.id) ? context.joinedIds : [...context.joinedIds, event.id],
          }),
        },
        CONTINUE_GROUPS: { target: 'mapReady' },
      },
    },
    mapReady: {
      on: {
        SAVE_START: {
          target: 'saving',
          actions: assign({ error: () => null }),
        },
      },
    },
    saving: {
      on: {
        SAVE_SUCCESS: {
          target: 'saved',
          actions: assign({
            saved: ({ context }) => [...context.saved, ...context.picked],
            picked: () => [],
            error: () => null,
          }),
        },
        SAVE_ERROR: {
          target: 'mapReady',
          actions: assign({ error: ({ event }) => event.message }),
        },
      },
    },
    saved: {
      type: 'final',
    },
    dismissed: {
      type: 'final',
    },
  },
})
