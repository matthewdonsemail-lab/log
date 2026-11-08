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

export interface StateRow<T> {
  body: T
  updatedAt: number
}
