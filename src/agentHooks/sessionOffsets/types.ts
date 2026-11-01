export type Offsets = Record<string, number>

export interface SessionOffsets {
  offsets: Offsets
  firstLook: boolean
}
