export const TREG_TIMEOUT_MS = 180_000
export const TREG_MAX_OUTPUT = 200_000

export interface TregRun {
  ok: boolean
  code: number
  stdout: string
  stderr: string
}

export type TregRunner = (args: string[], timeoutMs: number) => Promise<TregRun>

export interface TregEndpoint {
  id: string
  summary: string | null
  price: string | null
  free: boolean
  call: string | null
  text: string
}

export interface TregCallInput {
  id: string
  path?: string
  params: [string, string][]
  data?: string
  method?: string
  wait?: boolean
}

export interface TregClient {
  search: (query: string, limit: number) => Promise<TregRun>
  get: (id: string) => Promise<TregRun>
  call: (input: TregCallInput) => Promise<TregRun>
}

export interface TregTrim {
  fields: string[]
  maxItems?: number
  where: [string, string][]
  raw: boolean
}
