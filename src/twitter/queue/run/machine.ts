import { setup } from 'xstate'
import type { RunEvent } from './types'

export const queueRunMachine = setup({
  types: {
    events: {} as RunEvent
  }
}).createMachine({
  id: 'twitterQueueRun',
  initial: 'planned',
  states: {
    planned: { on: { BEGIN: 'waiting', FAIL: 'halted' } },
    waiting: { on: { LIKE_DUE: 'liking', REPLY_DUE: 'replying', COMPLETE: 'finished', FAIL: 'halted' } },
    liking: { on: { ACTED: 'waiting', COOL: 'cooling', FAIL: 'halted' } },
    replying: { on: { ACTED: 'waiting', COOL: 'cooling', FAIL: 'halted' } },
    cooling: { on: { RESUME: 'waiting', FAIL: 'halted' } },
    finished: { type: 'final' },
    halted: { type: 'final' }
  }
})
