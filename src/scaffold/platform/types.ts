export interface NewPlatformOptions {
  name: string
  label?: string
  twentyPlatform?: string
  library?: string
  sessionCookies?: string[]
  cookieDomain?: string
}

export interface PlatformNames {
  name: string
  pascal: string
  constant: string
  label: string
  twentyPlatform: string
  library: string | null
  libraryText: string
  sessionCookies: string[]
  cookieDomain: string
  seam: string
  sessionKey: string
}

export interface PlannedFile {
  path: string
  content: string
}

export interface PlannedEdit {
  path: string
  what: string
  apply: (source: string) => string
  landed: (source: string) => boolean
}

export interface PlatformPlan {
  names: PlatformNames
  files: PlannedFile[]
  edits: PlannedEdit[]
  notes: string[]
}

export const NEW_PLATFORM_RULE = 83
