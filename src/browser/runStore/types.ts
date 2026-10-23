export interface RunEntry {
  path: string
  action: string
  run: string
  account: string
  day: string
  bytes: number
  captureDir: string | null
  settled: boolean | null
  documented: boolean | null
  open: boolean
  keep: string | null
}

export interface PrunedRun {
  at: string
  run: string
  action: string
  account: string
  day: string
  bytes: number
  settled: boolean | null
  documented: boolean | null
  domains: Record<string, number>
  kept: string
}
