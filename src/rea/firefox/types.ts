/** One script body copied out of a Firefox HAR. */
export interface FirefoxScript {
  file: string
  url: string
  sha256: string
  text: string
}

/** A HAR as Playwright wrote it (rule 19: kept raw), and the scripts copied out of it. */
export interface FirefoxCapture {
  har: Record<string, unknown>
  entries: number
  scripts: FirefoxScript[]
}

export interface ReaRunResult {
  code: number
  stdout: string
  stderr: string
}

/** Runs one `rea` invocation. Tests pass a fake. The default spawns the `rea` on PATH. */
export type ReaRunner = (args: string[], cwd: string) => Promise<ReaRunResult>
