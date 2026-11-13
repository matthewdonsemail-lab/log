export const browserPhases = ['browserMissing', 'viewerUnavailable', 'signInRequired', 'needsAttention', 'busy', 'ready'] as const
export type BrowserPhase = (typeof browserPhases)[number]
export type BrowserStream = { kind: 'voxl'; url: string; page: { width: number; height: number }; window: { left: number; top: number; width: number; height: number } }
export type BrowserCheckView = { account: string; phase: BrowserPhase; needsHuman: boolean; generation: string | null; revision: string | null; pageState: string | null; address: string | null; width: number | null; height: number | null; canInteract: boolean; stream: BrowserStream | null }
export type BrowserInput = { type: 'click'; x: number; y: number } | { type: 'text'; text: string } | { type: 'key'; key: string } | { type: 'scroll'; deltaY: number }
export const browserKeys = ['Enter', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Home', 'End'] as const
