export interface CapturedScript {
  file: string
  url: string
  sha256: string
  text: string
}

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

export type ReaRunner = (args: string[], cwd: string) => Promise<ReaRunResult>
