export type QueueEventKind = 'held' | 'sent' | 'cooling' | 'stopped' | 'cancelled' | 'fellBehind' | 'started'

export interface QueueEvent {
  queue: string
  at: string
  kind: QueueEventKind
  line: string
}

export const QUEUE_EVENT_PATTERNS: readonly [QueueEventKind, RegExp][] = [
  ['held', /\bHELD #\d+/],
  ['sent', /\bSENT #\d+/],
  ['cooling', /\[cooling\] (reply|like) #\d+/],
  ['stopped', /\bSTOPPED: /],
  ['cancelled', /\bcancelled (while|during|before)/],
  ['fellBehind', /fell behind/],
  ['started', /random run: \d+ events/],
]
