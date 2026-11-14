export type StateScope =
  | 'hookMemory'
  | 'lastHook'
  | 'hookOffsets'
  | 'contextService'
  | 'contextServiceStarting'
  | 'memeTaste'
  | 'voiceClone'
  | 'chatList'
  | 'mcpServerStart'
  | 'mcpReload'
  | 'voicePasses'
  | 'consoleAccountCheck'
  | 'browserCheckProof'
  | 'signIn'
  | 'sessionSave'
  | 'watcherEnd'
  | 'watcherHold'

export interface StateRow<T> {
  body: T
  updatedAt: number
}
