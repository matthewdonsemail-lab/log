export const browserPhases = ['profileRequired', 'providerSetupRequired', 'operationUncertain', 'browserMissing', 'viewerUnavailable', 'ready', 'signInRequired', 'needsResolution', 'needsAttention', 'verified', 'busy'] as const
export type BrowserPhase = (typeof browserPhases)[number]
export type BrowserStream = { kind: 'voxl'; url: string; page: { width: number; height: number }; window: { left: number; top: number; width: number; height: number } }
export type BrowserCheckView = { accountId: string; account: string; phase: BrowserPhase; location: 'local' | 'remote'; viewerId: string | null; generation: string | null; revision: string | null; pageState: string | null; address: string | null; width: number | null; height: number | null; canInteract: boolean; canResolve: boolean; canComplete: boolean; canNavigate: boolean; canGoBack: boolean; stream: BrowserStream | null; reason: { code: string; message: string } | null }
export type BrowserInput = { type: 'click'; x: number; y: number } | { type: 'text'; text: string } | { type: 'key'; key: string } | { type: 'scroll'; deltaY: number }
export type BrowserOperation = 'status' | 'open' | 'linkProfile' | 'verify' | 'resolve' | 'complete' | 'input' | 'back' | 'reload' | 'close'
export const browserKeys = ['Enter', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Home', 'End'] as const
