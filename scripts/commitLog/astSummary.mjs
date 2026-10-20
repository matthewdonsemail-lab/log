// AST summary of a change: parse each TypeScript file before and after with
// the TypeScript compiler, and report which top-level declarations (functions,
// classes, interfaces, types, enums, consts, re-exports) and which tests were
// added, removed or changed. Nothing here is written by hand, so the log.md
// entry says what the code really did, not what the agent remembers.
//
//   node scripts/commitLog/astSummary.mjs            # staged changes vs HEAD
//   node scripts/commitLog/astSummary.mjs <commit>   # that commit vs its parent
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });

/** `git show <rev>:<path>`, or null when the file doesn't exist there. */
function readAt(rev, path) {
  try {
    return git('show', `${rev}:${path}`);
  } catch {
    return null;
  }
}

const normalize = (text) => text.replace(/\s+/g, ' ').trim();

function declarationName(node) {
  if (ts.isFunctionDeclaration(node)) return node.name ? `function ${node.name.text}` : null;
  if (ts.isClassDeclaration(node)) return node.name ? `class ${node.name.text}` : null;
  if (ts.isInterfaceDeclaration(node)) return `interface ${node.name.text}`;
  if (ts.isTypeAliasDeclaration(node)) return `type ${node.name.text}`;
  if (ts.isEnumDeclaration(node)) return `enum ${node.name.text}`;
  return null;
}

/** Top-level declarations and test titles in one source, name -> normalized text. */
export function collectDeclarations(source, fileName = 'file.ts') {
  const out = new Map();
  if (source === null) return out;
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const visitTests = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['test', 'it'].includes(node.expression.text)) {
      const [title] = node.arguments;
      if (title && ts.isStringLiteralLike(title)) out.set(`${node.expression.text} "${title.text}"`, normalize(node.getText(file)));
    }
    ts.forEachChild(node, visitTests);
  };
  for (const statement of file.statements) {
    const name = declarationName(statement);
    if (name) {
      out.set(name, normalize(statement.getText(file)));
    } else if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) out.set(`const ${decl.name.text}`, normalize(decl.getText(file)));
      }
    } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      out.set(`export from "${statement.moduleSpecifier.text}"`, normalize(statement.getText(file)));
    }
  }
  if (/\.test\.ts$/.test(fileName)) visitTests(file);
  return out;
}

// Python: the same idea through Python's own ast module (top-level def/class/assign).
const PY_AST = `
import ast, json, sys
out = {}
for side, src in json.load(sys.stdin).items():
    names = {}
    if src is not None:
        for node in ast.parse(src).body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                names['def ' + node.name] = ast.dump(node)
            elif isinstance(node, ast.ClassDef):
                names['class ' + node.name] = ast.dump(node)
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        names['const ' + target.id] = ast.dump(node)
    out[side] = names
print(json.dumps(out))
`;

/** Python declarations before/after, or null when python can't parse them. */
export function collectPython(before, after) {
  try {
    const raw = execFileSync(process.env.LOG_PYTHON || 'python', ['-c', PY_AST], {
      input: JSON.stringify({ before, after }),
      encoding: 'utf8',
    });
    const parsed = JSON.parse(raw);
    return { before: new Map(Object.entries(parsed.before)), after: new Map(Object.entries(parsed.after)) };
  } catch {
    return null;
  }
}

/** Added / removed / changed declaration names between two sources. Pure. */
export function diffDeclarations(before, after) {
  const added = [...after.keys()].filter((key) => !before.has(key));
  const removed = [...before.keys()].filter((key) => !after.has(key));
  const changed = [...after.keys()].filter((key) => before.has(key) && before.get(key) !== after.get(key));
  return { added, removed, changed };
}

/** One line per file: "- `path`: added a, b · changed c · removed d". */
export function renderSummary(files) {
  const lines = [];
  for (const { path, status, diff } of files) {
    const parts = [];
    if (status === 'deleted') parts.push('file deleted');
    if (diff) {
      if (diff.added.length) parts.push(`added ${diff.added.join(', ')}`);
      if (diff.changed.length) parts.push(`changed ${diff.changed.join(', ')}`);
      if (diff.removed.length) parts.push(`removed ${diff.removed.join(', ')}`);
      if (!parts.length) parts.push(status === 'added' ? 'new file, no top-level declarations' : 'no declaration changed (comments, formatting or line endings)');
    } else if (status !== 'deleted') {
      parts.push(status === 'added' ? 'new file' : 'edited');
    }
    lines.push(`- \`${path}\`: ${parts.join(' · ')}`);
  }
  return lines;
}

/** Summary lines for the staged change (no commit) or for one commit vs its parent. */
export function summarize(commit) {
  const range = commit ? ['diff', '--name-status', '--no-renames', `${commit}^`, commit] : ['diff', '--cached', '--name-status', '--no-renames'];
  let raw;
  try {
    raw = git(...range);
  } catch {
    // A root commit has no parent: everything in it is new.
    raw = git('show', '--name-status', '--no-renames', '--format=', commit);
  }
  const before = commit ? `${commit}^` : 'HEAD';
  const afterRead = (path) => (commit ? readAt(commit, path) : readAt('', path));
  const files = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [code, path] = line.split('\t');
      const status = code === 'A' ? 'added' : code === 'D' ? 'deleted' : 'modified';
      return { path, status };
    })
    .filter(({ path }) => path !== 'log.md')
    .map(({ path, status }) => {
      const oldSource = () => (status === 'added' ? null : readAt(before, path));
      const newSource = () => (status === 'deleted' ? null : afterRead(path));
      if (/\.py$/.test(path)) {
        const py = collectPython(oldSource(), newSource());
        return { path, status, diff: py ? diffDeclarations(py.before, py.after) : null };
      }
      if (!/\.(ts|tsx|mts|mjs|js)$/.test(path)) return { path, status, diff: null };
      const oldDecls = collectDeclarations(oldSource(), path);
      const newDecls = collectDeclarations(newSource(), path);
      return { path, status, diff: diffDeclarations(oldDecls, newDecls) };
    });
  return renderSummary(files);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(summarize(process.argv[2]).join('\n'));
}
