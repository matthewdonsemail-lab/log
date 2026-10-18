/** One script body taken out of a Firefox HAR before the body is deleted. */
export interface FirefoxScript {
  file: string
  url: string
  sha256: string
  text: string
}

export interface FirefoxStripCounts {
  cookies: number
  headers: number
  bodies: number
  queryValues: number
}

/** A HAR after cookies, auth headers, query values and bodies are gone. */
export interface FirefoxCapture {
  har: Record<string, unknown>
  counts: FirefoxStripCounts
  scripts: FirefoxScript[]
}

export interface ReaRunResult {
  code: number
  stdout: string
  stderr: string
}

/** Runs one `rea` invocation. Tests pass a fake. The default spawns the `rea` on PATH. */
export type ReaRunner = (args: string[], cwd: string) => Promise<ReaRunResult>
