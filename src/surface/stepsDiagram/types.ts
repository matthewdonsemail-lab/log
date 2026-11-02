export interface Step {
  n: string
  step: string
  tool: string
}

export const DIAGRAM_START = '<!-- stepsDiagram: written by `bun run docs:build` from the steps table below, not edited by hand -->'
export const DIAGRAM_END = '<!-- /stepsDiagram -->'
