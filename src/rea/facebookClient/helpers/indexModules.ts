import ts from 'typescript'
import type { FacebookModule, GraphqlDefinition, OperationKind } from '../types'

/**
 * Facebook ships its client as bundles of `__d("Name", [deps], factory)`
 * modules (12,000 of them across one create page). rea timed out reading the
 * bundles whole, so we parse them into a syntax tree ourselves, the same way
 * `scripts/astSummary.mjs` reads our own code, and hand rea only the modules
 * behind each request. Pure.
 */
export function indexModules(file: string, text: string): FacebookModule[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
  const modules: FacebookModule[] = []
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) continue
    const call = statement.expression
    if (!ts.isIdentifier(call.expression) || call.expression.text !== '__d') continue
    const [name, deps] = call.arguments
    if (!name || !ts.isStringLiteral(name)) continue
    modules.push({
      name: name.text,
      deps: deps && ts.isArrayLiteralExpression(deps) ? deps.elements.filter(ts.isStringLiteral).map((dep) => dep.text) : [],
      text: text.slice(statement.getStart(source), statement.end)
    })
  }
  return modules
}

/**
 * The modules rea reads for one operation: its `.graphql` definition, its
 * `_facebookRelayOperation` (the doc_id), and every module that imports the
 * definition, which is the hook or component that fires the request. Pure.
 */
export function sliceFor(operation: string, modules: Map<string, FacebookModule>, importers: Map<string, string[]>): FacebookModule[] {
  const names = [`${operation}.graphql`, `${operation}_facebookRelayOperation`, ...(importers.get(`${operation}.graphql`) ?? [])]
  return [...new Set(names)].map((name) => modules.get(name)).filter((module): module is FacebookModule => !!module)
}

/** Module name → the modules that list it as a dependency. Pure. */
export function importersOf(modules: Iterable<FacebookModule>): Map<string, string[]> {
  const importers = new Map<string, string[]>()
  for (const module of modules) for (const dep of module.deps) importers.set(dep, [...(importers.get(dep) ?? []), module.name])
  return importers
}

/**
 * Reads a `.graphql` module's Relay definition from its syntax tree: the
 * operation kind, the variables (`kind:"LocalArgument"`) and the fields its
 * `fragment.selections` read, two levels deep. Minified code keeps arrays in
 * local variables (`argumentDefinitions:e`), so identifiers are resolved
 * against the module's own declarations. Pure.
 */
export function readGraphqlDefinition(text: string): GraphqlDefinition {
  const source = ts.createSourceFile('definition.js', text, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
  const declared = new Map<string, ts.Expression>()
  const objects: ts.ObjectLiteralExpression[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && !declared.has(node.name.text)) declared.set(node.name.text, node.initializer)
    if (ts.isObjectLiteralExpression(node)) objects.push(node)
    ts.forEachChild(node, visit)
  }
  visit(source)
  const resolve = (node: ts.Expression | undefined): ts.Expression | undefined => (node && ts.isIdentifier(node) ? resolve(declared.get(node.text)) : node)
  const prop = (object: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined => {
    for (const p of object.properties) if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === key) return resolve(p.initializer)
    return undefined
  }
  const text_ = (node: ts.Expression | undefined): string | null => (node && ts.isStringLiteral(node) ? node.text : null)

  let kind: OperationKind | null = null
  const sends: string[] = []
  let fragment: ts.ObjectLiteralExpression | undefined
  for (const object of objects) {
    const operationKind = text_(prop(object, 'operationKind'))
    if (operationKind === 'query' || operationKind === 'mutation' || operationKind === 'subscription') kind = operationKind
    if (text_(prop(object, 'kind')) === 'LocalArgument') {
      const name = text_(prop(object, 'name'))
      if (name && !sends.includes(name)) sends.push(name)
    }
    const value = prop(object, 'fragment')
    if (!fragment && value && ts.isObjectLiteralExpression(value)) fragment = value
  }

  const fieldsOf = (selections: ts.Expression | undefined): { name: string; children: ts.Expression | undefined }[] => {
    const list = resolve(selections)
    if (!list || !ts.isArrayLiteralExpression(list)) return []
    const out: { name: string; children: ts.Expression | undefined }[] = []
    for (const element of list.elements) {
      const item = resolve(element as ts.Expression)
      if (!item || !ts.isObjectLiteralExpression(item)) continue
      const kind_ = text_(prop(item, 'kind'))
      const name = text_(prop(item, 'alias')) ?? text_(prop(item, 'name'))
      if (!name) continue
      if (kind_ === 'FragmentSpread') out.push({ name: `...${name}`, children: undefined })
      else if (kind_ === 'LinkedField' || kind_ === 'ScalarField') out.push({ name, children: prop(item, 'selections') })
    }
    return out
  }
  const reads: string[] = []
  for (const top of fieldsOf(fragment && prop(fragment, 'selections'))) {
    const children = fieldsOf(top.children)
    if (!children.length) reads.push(top.name)
    for (const child of children) reads.push(`${top.name}.${child.name}`)
  }
  return { kind, sends, reads: [...new Set(reads)] }
}
