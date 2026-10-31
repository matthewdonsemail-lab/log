import ts from "typescript";

export class AstEditError extends Error {}

function parse(source: string): ts.SourceFile {
  return ts.createSourceFile("edit.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isParenthesizedExpression(current) || ts.isTypeAssertionExpression(current)) current = current.expression;
  return current;
}

function variableInitializer(file: ts.SourceFile, name: string): ts.Expression {
  let found: ts.Expression | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found = unwrap(node.initializer);
    if (!found) ts.forEachChild(node, visit);
  };
  visit(file);
  if (!found) throw new AstEditError(`no variable ${name}`);
  return found;
}

function insertBeforeClose(source: string, list: ts.NodeArray<ts.Node>, closeEnd: number, text: string, indent: string): string {
  const close = closeEnd - 1;
  const last = list[list.length - 1];
  if (!last) return `${source.slice(0, close)}\n${indent}${text}\n${source.slice(close)}`;
  const afterLast = last.end;
  const trailing = /^\s*,/.test(source.slice(afterLast));
  const multiline = source.slice(list.pos, closeEnd).includes("\n");
  if (multiline) {
    const insertAt = trailing ? source.indexOf(",", afterLast) + 1 : afterLast;
    return `${source.slice(0, insertAt)}${trailing ? "" : ","}\n${indent}${text}${trailing ? "," : ""}${source.slice(insertAt)}`;
  }
  return `${source.slice(0, afterLast)}, ${text}${source.slice(afterLast)}`;
}

function indentOf(source: string, node: ts.Node, file: ts.SourceFile): string {
  const start = node.getStart(file);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  return source.slice(lineStart, start).match(/^\s*/)![0];
}

export function arrayHasText(source: string, name: string, text: string): boolean {
  const array = variableInitializer(parse(source), name);
  if (!ts.isArrayLiteralExpression(array)) throw new AstEditError(`${name} isn't an array literal`);
  return array.elements.some((e) => e.getText() === text);
}

export function addToArray(source: string, name: string, text: string): string {
  const file = parse(source);
  const array = variableInitializer(file, name);
  if (!ts.isArrayLiteralExpression(array)) throw new AstEditError(`${name} isn't an array literal`);
  if (array.elements.some((e) => e.getText(file) === text)) throw new AstEditError(`${name} already has ${text}`);
  const indent = array.elements.length ? indentOf(source, array.elements[0], file) : "  ";
  return insertBeforeClose(source, array.elements, array.end, text, indent);
}

export function objectHasKey(source: string, name: string, key: string): boolean {
  const object = variableInitializer(parse(source), name);
  if (!ts.isObjectLiteralExpression(object)) throw new AstEditError(`${name} isn't an object literal`);
  return object.properties.some((p) => p.name !== undefined && p.name.getText().replace(/^["']|["']$/g, "") === key);
}

export function addToObject(source: string, name: string, key: string, valueText: string): string {
  const file = parse(source);
  const object = variableInitializer(file, name);
  if (!ts.isObjectLiteralExpression(object)) throw new AstEditError(`${name} isn't an object literal`);
  if (objectHasKey(source, name, key)) throw new AstEditError(`${name} already has ${key}`);
  const indent = object.properties.length ? indentOf(source, object.properties[0], file) : "  ";
  return insertBeforeClose(source, object.properties, object.end, `${key}: ${valueText}`, indent);
}

function returnedObject(file: ts.SourceFile, functionName: string): ts.ObjectLiteralExpression {
  let found: ts.ObjectLiteralExpression | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName && node.body) {
      const inner = (child: ts.Node) => {
        if (ts.isReturnStatement(child) && child.expression && ts.isObjectLiteralExpression(unwrap(child.expression))) found = unwrap(child.expression) as ts.ObjectLiteralExpression;
        if (!found && !ts.isFunctionLike(child)) ts.forEachChild(child, inner);
      };
      ts.forEachChild(node.body, inner);
    }
    if (!found) ts.forEachChild(node, visit);
  };
  visit(file);
  if (!found) throw new AstEditError(`${functionName} returns no object literal`);
  return found;
}

export function returnedObjectHasKey(source: string, functionName: string, key: string): boolean {
  return returnedObject(parse(source), functionName).properties.some((p) => p.name?.getText() === key);
}

export function addToReturnedObject(source: string, functionName: string, key: string, valueText: string): string {
  const file = parse(source);
  const object = returnedObject(file, functionName);
  if (object.properties.some((p) => p.name?.getText(file) === key)) throw new AstEditError(`${functionName}'s object already has ${key}`);
  const indent = object.properties.length ? indentOf(source, object.properties[0], file) : "    ";
  return insertBeforeClose(source, object.properties, object.end, `${key}: ${valueText}`, indent);
}

function interfaceNode(file: ts.SourceFile, name: string): ts.InterfaceDeclaration {
  const found = file.statements.find((s): s is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(s) && s.name.text === name);
  if (!found) throw new AstEditError(`no interface ${name}`);
  return found;
}

export function interfaceHasMember(source: string, name: string, member: string): boolean {
  return interfaceNode(parse(source), name).members.some((m) => m.name?.getText() === member);
}

export function addToInterface(source: string, name: string, member: string, memberText: string): string {
  const file = parse(source);
  const node = interfaceNode(file, name);
  if (node.members.some((m) => m.name?.getText(file) === member)) throw new AstEditError(`${name} already has ${member}`);
  const last = node.members[node.members.length - 1];
  const indent = last ? indentOf(source, last, file) : "  ";
  const at = last ? last.end : source.indexOf("{", node.getStart(file)) + 1;
  return `${source.slice(0, at)}\n${indent}${memberText}${source.slice(at)}`;
}

export function hasImport(source: string, from: string, name: string): boolean {
  return parse(source).statements.some((s) => ts.isImportDeclaration(s) && (s.moduleSpecifier as ts.StringLiteral).text === from && !!s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings) && s.importClause.namedBindings.elements.some((e) => e.name.text === name));
}

export function addImport(source: string, from: string, name: string): string {
  const file = parse(source);
  if (hasImport(source, from, name)) throw new AstEditError(`${name} is already imported from ${from}`);
  const imports = file.statements.filter(ts.isImportDeclaration);
  const quote = imports[0] && imports[0].moduleSpecifier.getText(file).startsWith("'") ? "'" : '"';
  const semi = imports[0] && imports[0].getText(file).trim().endsWith(";") ? ";" : "";
  const line = `import { ${name} } from ${quote}${from}${quote}${semi}`;
  const last = imports[imports.length - 1];
  if (!last) return `${line}\n${source}`;
  return `${source.slice(0, last.end)}\n${line}${source.slice(last.end)}`;
}
