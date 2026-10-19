/**
 * The contract between log-cli and `python/publishSession.py`: one long-lived
 * Camoufox browser, driven one step at a time over JSON lines (stdin out,
 * stdout back), so the XState publish machine can own every transition.
 */

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
  /** The connect machine's steps in this same browser (rule 24): a login wall or checkpoint met while publishing. */
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
  /** The account's proxy file. publishSession.py opens no browser without it (rule 12). */
  proxyPath: string
  /** The run's device.json: pinned locale, home timezone, the account's device (rule 15). */
  devicePath: string | null
  /** Override the create form URL (local fixture runs). */
  formUrl?: string
  /** Where the review screenshot goes. */
  receiptDir?: string
  /** Auto-login's private login.json (rule 21), for signing in mid-publish (rule 24), or null. */
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

/** A running session. `call` resolves with the step's result object. */
export interface PublishSession {
  call<T = Record<string, unknown>>(step: SessionStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

/** Starts a session. Injectable so tests never launch a browser. */
export type SessionFactory = (config: SessionConfig) => PublishSession

/** `python/connectSession.py`'s steps: what the connect machine's actors ask for. */
export type ConnectStep = 'open' | 'read' | 'submitCredentials' | 'chooseAuthApp' | 'submitCode' | 'dismiss' | 'solveCaptcha' | 'save' | 'close'

export interface ConnectSessionConfig {
  accountId: string
  /** Where the session is written once signed in. May not exist yet: connect makes it. */
  storageStatePath: string
  /** The account's proxy file. No browser opens without it (rule 12). */
  proxyPath: string
  devicePath: string | null
  /** The run's capture folder (`.../firefox`): raw HAR and steps.jsonl (rules 19, 22). */
  captureDir: string
  /** Auto-login's private login.json (rule 21), or null: a person signs in. */
  loginPath: string | null
}

/** A running connect session. */
export interface ConnectSession {
  call<T = Record<string, unknown>>(step: ConnectStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

/** Starts a connect session. Injectable so tests never launch a browser. */
export type ConnectSessionFactory = (config: ConnectSessionConfig) => ConnectSession
