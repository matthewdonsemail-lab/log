import type { PassTick } from '../types'

export function tickLine(tick: PassTick | null): string {
  if (!tick) return 'index pass: not in this owner'
  if (!tick.chats) return `index pass: nothing new (through event ${tick.throughSeq} of ${tick.head}, ${tick.backlog} conversation(s) behind)`
  return `index pass: ${tick.chats} conversation(s) queued, ${tick.embedded} embedded, ${tick.voiced} voiced, ${tick.screened} screened, ${tick.decided} decided; ${tick.p50.toFixed(0)} ms p50 / ${tick.p95.toFixed(0)} ms p95, ${tick.ms} ms this tick, ${tick.backlog} behind${tick.overran ? ', carried over' : ''}`
}
