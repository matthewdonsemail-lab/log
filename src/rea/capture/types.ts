/** One script body copied out of a run's HAR (any browser driver). */
export interface CapturedScript {
  file: string
  url: string
  sha256: string
  text: string
}

/** A HAR as Playwright wrote it (rule 19: kept raw), and the scripts copied out of it. */
export interface BrowserCapture {
  har: Record<string, unknown>
  entries: number
  scripts: CapturedScript[]
}

export interface ReaRunResult {
  code: number
  stdout: string
  stderr: string
}

/** Runs one `rea` invocation. Tests pass a fake. The default spawns the `rea` on PATH. */
export type ReaRunner = (args: string[], cwd: string) => Promise<ReaRunResult>
