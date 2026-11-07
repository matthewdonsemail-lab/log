import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'
import type { Anchor, AnchorFinding, AnchorReport, AnchorValue, PythonFile, RequirementAnchors } from './types'

export function pythonBin(root: string, env: Record<string, string | undefined> = process.env): string {
  if (env.LOG_PYTHON) return env.LOG_PYTHON
  const local = join(root, '.env.local')
  const line = existsSync(local) ? readFileSync(local, 'utf8').split(/\r?\n/).find((l) => l.startsWith('LOG_PYTHON=')) : undefined
  return line ? line.slice('LOG_PYTHON='.length).replace(/^"|"$/g, '') : 'python'
}

const unwrap = (node: Node | undefined): Node | undefined => {
  let current = node
  while (current && (Node.isAsExpression(current) || Node.isParenthesizedExpression(current) || Node.isSatisfiesExpression(current))) current = current.getExpression()
  return current
}

export function literalOf(input: Node | undefined): AnchorValue | undefined {
  const node = unwrap(input)
  if (!node) return undefined
  if (Node.isNumericLiteral(node)) return Number(node.getText().replace(/_/g, ''))
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) return node.getLiteralText()
  if (node.getKind() === SyntaxKind.TrueKeyword) return true
  if (node.getKind() === SyntaxKind.FalseKeyword) return false
  if (node.getKind() === SyntaxKind.NullKeyword) return null
  if (Node.isPrefixUnaryExpression(node) && node.getOperatorToken() === SyntaxKind.MinusToken) {
    const inner = literalOf(node.getOperand())
    return typeof inner === 'number' ? -inner : undefined
  }
  if (Node.isArrayLiteralExpression(node)) {
    const items = node.getElements().map(literalOf)
    return items.every((i) => i !== undefined) ? (items as AnchorValue[]) : undefined
  }
  return undefined
}

function propertyNode(node: Node | undefined, path: string[]): Node | undefined {
  let current = node
  for (const key of path) {
    current = unwrap(current)
    if (!current || !Node.isObjectLiteralExpression(current)) return undefined
    const prop = current.getProperties().find((p) => Node.isPropertyAssignment(p) && p.getName().replace(/^['"]|['"]$/g, '') === key)
    current = prop && Node.isPropertyAssignment(prop) ? prop.getInitializer() : undefined
  }
  return current
}

export function tsDeclaration(project: Project, path: string, name: string): Node | undefined {
  const source = project.getSourceFile(path) ?? project.addSourceFileAtPathIfExists(path)
  if (!source) return undefined
  return source.getVariableDeclaration(name) ?? source.getFunction(name) ?? source.getClass(name) ?? source.getInterface(name) ?? source.getTypeAlias(name) ?? source.getEnum(name)
}

export function pythonSymbols(root: string, files: string[]): Record<string, PythonFile> {
  if (!files.length) return {}
  const run = spawnSync(pythonBin(root), [join(root, 'python', 'checks', 'symbols.py'), ...files.map((f) => join(root, f))], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
  if (run.status !== 0) throw new Error(`python symbols failed: ${run.stderr}`)
  const parsed = JSON.parse(run.stdout) as Record<string, PythonFile>
  return Object.fromEntries(files.map((f) => [f, parsed[join(root, f)]!]))
}

const same = (a: AnchorValue | undefined, b: AnchorValue) => JSON.stringify(a) === JSON.stringify(b)

export function pythonLiteral(value: AnchorValue, original: string): string {
  if (value === null) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return JSON.stringify(value)
  const inner = value.map((v) => pythonLiteral(v, '')).join(', ')
  return original.trim().startsWith('(') ? `(${inner}${value.length === 1 ? ',' : ''})` : `[${inner}]`
}

export function checkAnchors(root: string, domain: string, anchors: RequirementAnchors, heal = false): AnchorReport {
  const project = new Project({ skipAddingFilesFromTsConfig: true, skipFileDependencyResolution: true })
  const all = Object.entries(anchors).flatMap(([requirement, list]) => list.map((anchor) => ({ requirement, anchor })))
  const py = pythonSymbols(root, [...new Set(all.map((a) => a.anchor.file).filter((f) => f.endsWith('.py') && existsSync(join(root, f))))])
  const findings: AnchorFinding[] = []
  const healed: AnchorFinding[] = []
  const pyEdits: Record<string, { start: [number, number]; end: [number, number]; text: string }[]> = {}
  for (const { requirement, anchor } of all) {
    const path = join(root, anchor.file)
    const miss = (problem: string, found?: AnchorValue, healable = false) => findings.push({ requirement, anchor, problem, ...(found !== undefined ? { found } : {}), healable })
    if (!existsSync(path)) {
      miss(`${anchor.file} does not exist`)
      continue
    }
    if (anchor.kind === 'string') {
      const strings = anchor.file.endsWith('.py') ? py[anchor.file]!.strings : project.addSourceFileAtPath(path).getDescendants().filter((n) => Node.isStringLiteral(n) || Node.isNoSubstitutionTemplateLiteral(n) || Node.isTemplateHead(n) || Node.isTemplateMiddle(n) || Node.isTemplateTail(n)).map((n) => (n as unknown as { getLiteralText(): string }).getLiteralText())
      if (!strings.some((s) => s.includes(anchor.includes))) miss(`no string "${anchor.includes}" in ${anchor.file}`)
      continue
    }
    if (anchor.kind === 'uses') {
      const names = anchor.file.endsWith('.py') ? py[anchor.file]!.names : project.addSourceFileAtPath(path).getDescendantsOfKind(SyntaxKind.Identifier).map((n) => n.getText())
      if (!names.includes(anchor.name)) miss(`${anchor.name} is not used in ${anchor.file}`)
      continue
    }
    if (anchor.file.endsWith('.py')) {
      const symbol = py[anchor.file]!.symbols[anchor.name]
      if (!symbol) {
        miss(`${anchor.name} is not defined in ${anchor.file}`)
        continue
      }
      if (anchor.kind === 'value' && !same(symbol.value, anchor.equals)) {
        if (heal && symbol.valueStart && symbol.valueEnd) {
          const original = readFileSync(path, 'utf8').split('\n')[symbol.valueStart[0] - 1]!.slice(symbol.valueStart[1])
          ;(pyEdits[anchor.file] ??= []).push({ start: symbol.valueStart, end: symbol.valueEnd, text: pythonLiteral(anchor.equals, original) })
          healed.push({ requirement, anchor, problem: `${anchor.name} was ${JSON.stringify(symbol.value)}`, found: symbol.value ?? null, healable: true })
        } else miss(`${anchor.name} is ${JSON.stringify(symbol.value)}, the rule says ${JSON.stringify(anchor.equals)}`, symbol.value ?? null, Boolean(symbol.valueStart))
      }
      continue
    }
    const declaration = tsDeclaration(project, path, anchor.name)
    if (!declaration) {
      miss(`${anchor.name} is not declared in ${anchor.file}`)
      continue
    }
    if (anchor.kind !== 'value') continue
    const init = Node.isVariableDeclaration(declaration) ? declaration.getInitializer() : undefined
    const node = anchor.path?.length ? propertyNode(init, anchor.path) : unwrap(init)
    const found = literalOf(node)
    if (same(found, anchor.equals)) continue
    const where = [anchor.name, ...(anchor.path ?? [])].join('.')
    if (heal && node && (found !== undefined || anchor.path?.length)) {
      node.replaceWithText(JSON.stringify(anchor.equals).replace(/"/g, "'"))
      healed.push({ requirement, anchor, problem: `${where} was ${JSON.stringify(found)}`, found: found ?? null, healable: true })
    } else miss(`${where} is ${JSON.stringify(found)}, the rule says ${JSON.stringify(anchor.equals)}`, found ?? null, Boolean(node))
  }
  if (heal) {
    project.saveSync()
    for (const [file, edits] of Object.entries(pyEdits)) {
      const path = join(root, file)
      const lines = readFileSync(path, 'utf8').split('\n')
      for (const edit of edits.sort((a, b) => b.start[0] - a.start[0] || b.start[1] - a.start[1])) {
        const head = lines[edit.start[0] - 1]!.slice(0, edit.start[1])
        const tail = lines[edit.end[0] - 1]!.slice(edit.end[1])
        lines.splice(edit.start[0] - 1, edit.end[0] - edit.start[0] + 1, head + edit.text + tail)
      }
      writeFileSync(path, lines.join('\n'))
    }
  }
  return { domain, checked: all.length, findings, healed }
}

export function sliceOf(root: string, anchors: RequirementAnchors): string {
  const project = new Project({ skipAddingFilesFromTsConfig: true, skipFileDependencyResolution: true })
  const named = Object.values(anchors).flat().filter((a): a is Extract<Anchor, { kind: 'symbol' | 'value' }> => (a.kind === 'symbol' || a.kind === 'value') && existsSync(join(root, a.file)))
  const py = pythonSymbols(root, [...new Set(named.map((a) => a.file).filter((f) => f.endsWith('.py')))])
  const seen = new Set<string>()
  const parts: string[] = []
  for (const a of named) {
    const key = `${a.file}:${a.name}`
    if (seen.has(key)) continue
    seen.add(key)
    if (a.file.endsWith('.py')) {
      const s = py[a.file]?.symbols[a.name]
      if (s) parts.push(`${a.file}:${s.line}\n${readFileSync(join(root, a.file), 'utf8').split('\n').slice(s.line - 1, s.end).join('\n')}`)
      continue
    }
    const d = tsDeclaration(project, join(root, a.file), a.name)
    const statement = d && Node.isVariableDeclaration(d) ? (d.getVariableStatement() ?? d) : d
    if (statement) parts.push(`${a.file}:${statement.getStartLineNumber()}\n${statement.getText()}`)
  }
  return parts.join('\n\n')
}

export function anchorLines(report: AnchorReport): string[] {
  return [
    ...report.healed.map((f) => `healed ${report.domain} ${f.requirement}: ${f.problem}, now ${JSON.stringify((f.anchor as { equals?: AnchorValue }).equals)} (${f.anchor.file})`),
    ...report.findings.map((f) => `${report.domain} ${f.requirement}: ${f.problem}${f.healable ? ' (bun run check:specs --heal fixes it)' : ''}`),
  ]
}
