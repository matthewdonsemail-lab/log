import ts from 'typescript'
import { MAX_LITERAL_CHARS, MAX_SLICE_CHARS, MAX_SLICES, MIN_SLICE_CHARS } from '../types'
import type { BundleScript, SourceSlice } from '../types'
import { camelOf } from './requestName'

const parsed = new Map<string, ts.SourceFile>()

function sourceOf(script: BundleScript): ts.SourceFile {
  let source = parsed.get(script.file)
  if (!source) {
    source = ts.createSourceFile(script.file, script.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    parsed.set(script.file, source)
  }
  return source
}

export function forgetParsed(): void {
  parsed.clear()
}

function literalText(node: ts.Node): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text
  return null
}

function propertyName(node: ts.Node): string | null {
  return (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : null
}

export function scoreOf(literal: ts.Node, text: string): number {
  const parent = literal.parent
  if (ts.isPropertyAssignment(parent) && /^(operation|operationName|url|path|endpoint|route)$/i.test(propertyName(parent.name) ?? '')) return 3
  if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(parent.left) && parent.left.name.text === text) return 0
  if (ts.isPropertyAssignment(parent) && propertyName(parent.name) === text) return 0
  let node: ts.Node = parent
  for (let i = 0; i < 4 && node; i++, node = node.parent) if (ts.isCallExpression(node) || ts.isNewExpression(node)) return 2
  return 1
}

const isFunction = (node: ts.Node): boolean => ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node) || ts.isGetAccessor(node)

function functionName(node: ts.Node): string {
  if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) && node.name) return node.name.getText()
  if (ts.isVariableDeclaration(node.parent) || ts.isPropertyAssignment(node.parent)) return node.parent.name.getText()
  return 'anonymous'
}

export function enclosingSlice(literal: ts.Node, source: ts.SourceFile): { node: ts.Node; text: string } {
  let best: ts.Node | null = null
  for (let node: ts.Node = literal.parent; node && node !== source; node = node.parent) {
    if (!isFunction(node)) continue
    if (node.getEnd() - node.getStart(source) > MAX_SLICE_CHARS) break
    best = node
    if (node.getEnd() - node.getStart(source) >= MIN_SLICE_CHARS) break
  }
  if (best) return { node: best, text: best.getText(source) }
  let statement: ts.Node = literal
  while (statement.parent && statement.parent !== source && statement.parent.getEnd() - statement.parent.getStart(source) <= MAX_SLICE_CHARS) statement = statement.parent
  if (statement.getEnd() - statement.getStart(source) >= MIN_SLICE_CHARS || statement === literal) {
    const at = literal.getStart(source)
    const start = Math.max(0, at - MAX_SLICE_CHARS / 2)
    return statement === literal ? { node: literal, text: source.text.slice(start, start + MAX_SLICE_CHARS) } : { node: statement, text: statement.getText(source) }
  }
  return { node: statement, text: statement.getText(source) }
}

export function slicesFor(needles: string[], scripts: BundleScript[], options: { exact?: boolean; max?: number } = {}): SourceSlice[] {
  const max = options.max ?? MAX_SLICES
  const hits = (text: string): boolean => (options.exact ? needles.includes(text) : text.length <= MAX_LITERAL_CHARS && needles.some((n) => text.includes(n)))
  const found: { score: number; slice: SourceSlice }[] = []
  const texts = new Set<string>()
  for (const script of scripts) {
    const needle = needles.find((n) => script.text.includes(n))
    if (!needle) continue
    const source = sourceOf(script)
    const visit = (node: ts.Node): void => {
      const text = literalText(node)
      if (text !== null && hits(text)) {
        const score = scoreOf(node, text) + (camelOf(text).includes('faceplatePartial') || /^\/?svc\//.test(text) ? 1 : 0)
        if (score > 0) {
          const { node: around, text: sliceText } = enclosingSlice(node, source)
          if (!texts.has(sliceText)) {
            texts.add(sliceText)
            const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
            found.push({ score: score - (sliceText.length > MAX_SLICE_CHARS / 2 ? 1 : 0), slice: { file: script.file, calledFrom: `${script.file}:${line} ${isFunction(around) ? functionName(around) : 'statement'}`, text: sliceText } })
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return found.sort((a, b) => b.score - a.score || a.slice.text.length - b.slice.text.length).slice(0, max).map((f) => f.slice)
}
