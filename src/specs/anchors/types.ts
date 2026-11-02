export type AnchorValue = string | number | boolean | null | AnchorValue[]

export type Anchor =
  | { kind: 'symbol'; file: string; name: string }
  | { kind: 'value'; file: string; name: string; path?: string[]; equals: AnchorValue }
  | { kind: 'string'; file: string; includes: string }

export type RequirementAnchors = Record<string, Anchor[]>

export interface AnchorFinding {
  requirement: string
  anchor: Anchor
  problem: string
  found?: AnchorValue
  healable: boolean
}

export interface AnchorReport {
  domain: string
  checked: number
  findings: AnchorFinding[]
  healed: AnchorFinding[]
}

export interface PythonSymbol {
  kind: 'def' | 'value'
  line: number
  end: number
  value?: AnchorValue
  valueStart?: [number, number]
  valueEnd?: [number, number]
}

export interface PythonFile {
  symbols: Record<string, PythonSymbol>
  strings: string[]
}
