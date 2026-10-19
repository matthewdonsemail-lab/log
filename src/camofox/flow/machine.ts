/**
 * A flow definition → an XState machine: one state per recorded step, in
 * order, each invoking the `act` actor (the open inspect session does the
 * step and waits for its confirming request). A step that fails ends the run
 * in `failed`; nothing is retried on Facebook.
 *
 *   s01_goto… ─▶ s02_click… ─▶ … ─▶ done
 *        └──────────┴─── any step fails ──▶ failed
 */
import { assign, fromPromise, setup } from 'xstate'
import type { FlowActInput, FlowDefinition, FlowRunOutput, FlowStepResult } from './types'

interface FlowContext {
  flow: string
  results: FlowStepResult[]
  failedAt: string | null
}

/** The machine for one flow. Its only side effect is `act`, which the caller provides. */
export function createFlowMachine(definition: FlowDefinition) {
  const ids = definition.steps.map((s) => s.id)
  // The states are built from the definition at run time, so they are typed loosely here.
  type Args = { context: FlowContext; event: { output?: FlowStepResult; error?: unknown } }
  const record = (failedAt: string | null) =>
    assign(({ context, event }: { context: FlowContext; event: unknown }) => {
      const { output, error } = event as Args['event']
      return { results: [...context.results, output ?? { id: failedAt ?? '', ok: false, error: String(error) }], ...(failedAt ? { failedAt } : {}) }
    })
  const states: Record<string, unknown> = {}
  definition.steps.forEach((step, i) => {
    states[step.id] = {
      invoke: {
        src: 'act',
        input: { step } satisfies FlowActInput,
        onDone: [
          { guard: ({ event }: Args) => event.output?.ok === true, target: ids[i + 1] ?? 'done', actions: record(null) },
          { target: 'failed', actions: record(step.id) }
        ],
        onError: { target: 'failed', actions: record(step.id) }
      }
    }
  })
  return setup({
    types: { context: {} as FlowContext, output: {} as FlowRunOutput },
    actors: {
      act: fromPromise<FlowStepResult, FlowActInput>(async () => {
        throw new Error('flowMachine: provide an `act` actor')
      })
    }
  }).createMachine({
    id: definition.name,
    context: { flow: definition.name, results: [], failedAt: null },
    initial: ids[0] ?? 'done',
    states: { ...states, done: { type: 'final' }, failed: { type: 'final' } } as never,
    output: ({ context }) => ({ flow: context.flow, result: context.failedAt ? 'failed' : 'done', steps: context.results, failedAt: context.failedAt })
  })
}

