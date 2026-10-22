export type SessionStep =
  | 'open'
  | 'solveCaptcha'
  | 'setCategory'
  | 'uploadPhotos'
  | 'fillFields'
  | 'review'
  | 'publish'
  | 'confirm'
  | 'captureId'
  | 'signInOpen'
  | 'signInRead'
  | 'signInSubmitCredentials'
  | 'signInChooseAuthApp'
  | 'signInSubmitCode'
  | 'signInDismiss'
  | 'signInSave'
  | 'close'

export interface SessionConfig {
  accountId: string
  storageStatePath: string
  proxyPath: string
  devicePath: string | null
  formUrl?: string
  receiptDir?: string
  loginPath?: string | null
}

export interface SessionRequest {
  id: number
  step: SessionStep
  params?: Record<string, unknown>
}

export interface SessionReply {
  id: number | null
  result: Record<string, unknown>
}

export interface PublishSession {
  call<T = Record<string, unknown>>(step: SessionStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

export type SessionFactory = (config: SessionConfig) => PublishSession

export type ConnectStep = 'open' | 'read' | 'submitCredentials' | 'chooseAuthApp' | 'submitCode' | 'dismiss' | 'solveCaptcha' | 'save' | 'close'

export interface ConnectSessionConfig {
  accountId: string
  storageStatePath: string
  proxyPath: string
  devicePath: string | null
  captureDir: string
  loginPath: string | null
}

export interface ConnectSession {
  call<T = Record<string, unknown>>(step: ConnectStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

export type ConnectSessionFactory = (config: ConnectSessionConfig) => ConnectSession

export type ProfileStep = 'open' | 'read' | 'readName' | 'uploadProfilePhoto' | 'uploadCoverPhoto' | 'close'

export interface ProfileSessionConfig {
  accountId: string
  storageStatePath: string
  proxyPath: string
  devicePath: string | null
  captureDir: string
}

export interface ProfileSession {
  call<T = Record<string, unknown>>(step: ProfileStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

export type ProfileSessionFactory = (config: ProfileSessionConfig) => ProfileSession
