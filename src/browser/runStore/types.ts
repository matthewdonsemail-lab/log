/** One recorded run under `~/.logCli/runs/<action>/<run>` and whether it may be pruned. */
export interface RunEntry {
  /** The run's own folder. */
  path: string
  /** What recorded it: inspect, warmup, profile, join… (the folder above it). */
  action: string
  /** `20261022T092119_61594063207669`. */
  run: string
  /** The account, from the folder name. */
  account: string
  /** The UTC day it started, `2026-10-22`. */
  day: string
  bytes: number
  /** The folder holding `session.har` (`adsPower/`, `camoufox/`, `firefox/` or the run itself), or null without one. */
  captureDir: string | null
  /** rea read every step (`settle.json`, rule 25). Null when there is no HAR to read. */
  settled: boolean | null
  /** Its requests went into the last `log facebook capture --docs` (rule 27). Null when there is no HAR. */
  documented: boolean | null
  /** An open inspect session is writing it, or it changed in the last 10 minutes. */
  open: boolean
  /** Why it is kept, or null when it may be pruned. */
  keep: string | null
}

/** What a pruned run leaves: one line in `runs/pruned.jsonl`, its findings, steps and settle note in `runs/kept/<action>/<run>/`. */
export interface PrunedRun {
  at: string
  run: string
  action: string
  account: string
  day: string
  bytes: number
  settled: boolean | null
  documented: boolean | null
  /** Its Facebook requests by domain (`docs/platforms/facebook/<domain>/`), counted. */
  domains: Record<string, number>
  /** Where its findings.md, steps.jsonl and settle.json were kept. */
  kept: string
}
