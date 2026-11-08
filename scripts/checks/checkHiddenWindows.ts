import ts from "typescript";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
const CHILD_CALLS = new Set(["spawn", "spawnSync", "execSync", "execFileSync", "execFile", "exec", "fork"]);
const PY_CALLS = ["Popen", "run", "call", "check_call", "check_output", "create_subprocess_exec", "create_subprocess_shell"];

function tracked(patterns: string[]): string[] {
  const run = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...patterns], { windowsHide: true, cwd: root, encoding: "utf8" });
  return run.stdout.split(/\r?\n/).filter((f) => f && !f.includes(".test.") && !f.startsWith("vendor/"));
}

function callName(call: ts.CallExpression): string {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && ["Bun", "child_process", "cp"].includes(e.expression.text)) return e.name.text;
  return "";
}

export function unhiddenTs(file: string, text: string): string[] {
  if (!/child_process|Bun\.spawn/.test(text)) return [];
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && CHILD_CALLS.has(callName(node)) && !/\bwindowsHide\s*:/.test(node.getText())) {
      found.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1} ${callName(node)} without windowsHide`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const PY_SCAN = `
import ast, json, sys
calls = set(${JSON.stringify(PY_CALLS)})
out = []
for path in json.load(sys.stdin):
    try:
        tree = ast.parse(open(path, encoding="utf8").read())
    except SyntaxError:
        continue
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in calls:
            base = node.func.value
            name = base.id if isinstance(base, ast.Name) else base.attr if isinstance(base, ast.Attribute) else ""
            if not ((name == "subprocess" and node.func.attr in ("Popen", "run", "call", "check_call", "check_output")) or (name == "asyncio" and node.func.attr.startswith("create_subprocess"))):
                continue
            if any(k.arg == "creationflags" or k.arg is None for k in node.keywords):
                continue
            out.append(f"{path}:{node.lineno} {node.func.attr} without creationflags (CREATE_NO_WINDOW)")
print(json.dumps(out))
`;

function unhiddenPython(files: string[]): string[] {
  if (!files.length) return [];
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", PY_SCAN], { windowsHide: true, cwd: root, encoding: "utf8", input: JSON.stringify(files) });
  if (run.status !== 0) return [`python scan failed: ${(run.stderr ?? "").trim().slice(0, 300)}`];
  return JSON.parse(run.stdout) as string[];
}

if (import.meta.main) {
  const tsFiles = tracked(["src", "scripts", "bin"]).filter((f) => /\.(ts|mjs)$/.test(f));
  const problems = [...tsFiles.flatMap((f) => unhiddenTs(f, readFileSync(join(root, f), "utf8"))), ...unhiddenPython(tracked(["python"]).filter((f) => f.endsWith(".py")))];
  if (problems.length) {
    console.error(`hiddenWindows: ${problems.length} child process(es) would open a console window on Windows when started from a hidden hook, service or watcher:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`hiddenWindows: every child process in ${tsFiles.length} TypeScript files and the Python sessions starts hidden (windowsHide, CREATE_NO_WINDOW)`);
}
