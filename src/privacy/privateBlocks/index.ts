export const PRIVATE_OPEN = '<!-- private -->'
export const PRIVATE_CLOSE = '<!-- /private -->'

const BLOCK = /(?:^[ \t]*)?<!--\s*private\s*-->[\s\S]*?<!--\s*\/private\s*-->(?:[ \t]*\n)?/gm
const OPEN = /<!--\s*private\s*-->/
const CLOSE = /<!--\s*\/private\s*-->/
const CODE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$|`[^`\n]+`/gm

export interface StrippedText {
  text: string
  problem: string | null
}

export function stripPrivateBlocks(text: string): StrippedText {
  const code: string[] = []
  const masked = text.replace(CODE, (whole) => `\u0000${code.push(whole) - 1}\u0000`)
  const restore = (value: string) => value.replace(/\u0000(\d+)\u0000/g, (_, i: string) => code[Number(i)])
  if (masked.search(OPEN) === -1 && masked.search(CLOSE) === -1) return { text, problem: null }
  const stripped = masked.replace(BLOCK, '').replace(/\n{3,}/g, '\n\n')
  if (OPEN.test(stripped)) return { text: restore(stripped.slice(0, stripped.search(OPEN))), problem: `${PRIVATE_OPEN} has no ${PRIVATE_CLOSE} after it` }
  if (CLOSE.test(stripped)) return { text: restore(stripped.replace(CLOSE, '')), problem: `${PRIVATE_CLOSE} has no ${PRIVATE_OPEN} before it` }
  return { text: restore(stripped), problem: null }
}
