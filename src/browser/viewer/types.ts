export interface ViewerDescriptor {
  port: number
  token: string
  generation: string
  pid: number
}

export interface ViewerStream {
  kind: 'voxl'
  url: string
  page: { width: number; height: number }
  window: { left: number; top: number; width: number; height: number }
}

export interface ViewerLiveState {
  generation: string
  revision: string
  state: string
  url?: string
  historyLength?: number
  blocked: boolean
  inputAllowed: boolean
  busy: boolean
  width?: number
  height?: number
  stream?: unknown
}

export const VIEWER_PHASES = ['browserMissing', 'viewerUnavailable', 'signInRequired', 'needsAttention', 'busy', 'ready'] as const
export type ViewerPhase = (typeof VIEWER_PHASES)[number]

export interface ViewerView {
  account: string
  phase: ViewerPhase
  needsHuman: boolean
  generation: string | null
  revision: string | null
  pageState: string | null
  address: string | null
  width: number | null
  height: number | null
  canInteract: boolean
  stream: ViewerStream | null
}

export interface ViewerFrame {
  generation: string
  revision: string
  mimeType: 'image/jpeg'
  data: string
}

export type ViewerEvent =
  | { type: 'click'; x: number; y: number }
  | { type: 'text'; text: string }
  | { type: 'key'; key: string }
  | { type: 'scroll'; deltaY: number }

export const VIEWER_KEYS = ['Enter', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Space', 'Home', 'End'] as const

export const VIEWER_ERRORS = ['browserMissing', 'browserViewerUnavailable', 'browserGenerationChanged', 'browserBusy', 'browserStateChanged', 'browserInputStopped', 'browserInputInvalid', 'browserInputFailed'] as const
export type ViewerErrorCode = (typeof VIEWER_ERRORS)[number]

export class ViewerError extends Error {
  constructor(readonly code: ViewerErrorCode) {
    super(code)
    this.name = 'ViewerError'
  }
}

export const VIEWER_ERROR_TEXT: Readonly<Record<ViewerErrorCode, string>> = {
  browserMissing: 'No browser is open for this account.',
  browserViewerUnavailable: 'The account browser viewer could not be reached.',
  browserGenerationChanged: 'The account browser owner changed. The stale action was refused.',
  browserBusy: 'The account browser is handling another step.',
  browserStateChanged: 'The page changed before the action. The stale action was refused; nothing reached the page.',
  browserInputStopped: 'The page no longer asks for sign-in, so input is refused.',
  browserInputInvalid: 'The input was rejected as invalid.',
  browserInputFailed: 'The input step failed in the browser.',
}
