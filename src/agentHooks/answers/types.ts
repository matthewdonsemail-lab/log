import type { HookEvent } from '../registry/types'

export interface HookAnswer {
  context?: string
  output?: Record<string, unknown>
}

export interface HookTiming {
  hook: string
  ms: number
  ok: boolean
}

export interface EventAnswer {
  event: HookEvent
  body: Record<string, unknown> | null
  timings: HookTiming[]
}

export type RouteAsk = (prompt: string) => Promise<unknown>

export const REFUSING_HOOKS: readonly string[] = ['scripts/hooks/chatNames.ts', 'scripts/hooks/liveLogs.ts']
