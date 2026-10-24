export type PreflightName = 'home' | 'hours' | 'proxy' | 'adsPower' | 'kernel' | 'launches' | 'hostOpens' | 'session' | 'profilePhoto'

export interface PreflightCheck {
  name: PreflightName
  ok: boolean
  code?: string
  detail: string
}

export interface ProxyFact {
  ok: boolean
  facebookMs?: number | null
  exitCountry?: string | null
  code?: string
  detail?: string
}

export interface KernelFact {
  reachable: boolean
  version: string | null
  downloaded: boolean
  detail?: string
}

export interface PreflightFacts {
  proxy: ProxyFact | null
  kernel: KernelFact | null
  launches: Date[]
  hostOpensToday: number
  hostDay: string | null
  sessionPid: number | null
  profilePhotoOnDisk: boolean | null
}

export interface PreflightAccount {
  accountName: string
  homeCity: string | null
  homeCountry: string | null
  activeHoursStart: number | null
  activeHoursEnd: number | null
  proxy: string | null
  adsPowerProfileId: string | null
  profilePhoto: string | null
}

export interface PreflightRow {
  accountName: string
  homeCity: string | null
  checks: PreflightCheck[]
  ready: boolean
}
