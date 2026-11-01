import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CODE = /\.(ts|tsx|js|mjs|cjs)$/;
const PYTHON = /\.py$/;
const SKIPPED = /(^|\/)(node_modules|generated|vendor)\/|^site\//;

export interface CommentRange {
  pos: number;
  end: number;
}

export function commentRanges(path: string, text: string): CommentRange[] {
  const kind = /\.tsx$/.test(path) ? ts.ScriptKind.TSX : /\.(js|mjs|cjs)$/.test(path) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const seen = new Map<number, CommentRange>();
  const add = (ranges: readonly ts.CommentRange[] | undefined) => {
    for (const range of ranges ?? []) seen.set(range.pos, { pos: range.pos, end: range.end });
  };
  const visit = (node: ts.Node) => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const children = node.getChildren(source);
    if (!children.length) {
      add(ts.getLeadingCommentRanges(text, node.pos));
      add(ts.getTrailingCommentRanges(text, node.end));
    }
    for (const child of children) visit(child);
  };
  visit(source);
  return [...seen.values()].sort((a, b) => a.pos - b.pos);
}

export function stripComments(text: string, ranges: CommentRange[]): string {
  let out = text;
  for (const range of [...ranges].sort((a, b) => b.pos - a.pos)) {
    const lineStart = out.lastIndexOf("\n", range.pos - 1) + 1;
    const nextBreak = out.indexOf("\n", range.end);
    const lineEnd = nextBreak < 0 ? out.length : nextBreak;
    const before = out.slice(lineStart, range.pos);
    const after = out.slice(range.end, lineEnd);
    if (!before.trim() && !after.replace(/\r$/, "").trim()) {
      out = out.slice(0, lineStart) + out.slice(nextBreak < 0 ? lineEnd : nextBreak + 1);
    } else if (!after.replace(/\r$/, "").trim()) {
      out = out.slice(0, lineStart) + before.replace(/[ \t]+$/, "") + out.slice(range.end).replace(/^[ \t]+/, "");
    } else {
      out = out.slice(0, range.pos) + out.slice(range.end).replace(/^[ \t]+/, before.endsWith(" ") ? "" : " ");
    }
  }
  return out.replace(/(\r?\n)(?:[ \t]*\r?\n){2,}/g, "$1$1").replace(/^(?:[ \t]*\r?\n)+/, "");
}

function trackedFiles(): string[] {
  const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" });
  return listed.stdout.split("\n").map((f) => f.trim()).filter((f) => f && !SKIPPED.test(f) && (CODE.test(f) || PYTHON.test(f)) && existsSync(join(root, f)));
}

function python(): string {
  if (process.env.LOG_PYTHON) return process.env.LOG_PYTHON;
  const local = join(root, ".env.local");
  const line = existsSync(local) ? readFileSync(local, "utf8").split(/\r?\n/).find((l) => l.startsWith("LOG_PYTHON=")) : undefined;
  return line ? line.slice("LOG_PYTHON=".length).replace(/^"|"$/g, "") : "python";
}

function pythonComments(files: string[], strip: boolean): Record<string, { kind: string; line: number }[]> {
  if (!files.length) return {};
  const run = spawnSync(python(), [join(root, "python", "checks", "comments.py"), strip ? "--strip" : "--check", ...files.map((f) => join(root, f))], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(`python/checks/comments.py failed: ${run.stderr.trim().slice(0, 400)}`);
  return JSON.parse(run.stdout || "{}") as Record<string, { kind: string; line: number }[]>;
}

function main(): number {
  const strip = process.argv.includes("--strip");
  const files = trackedFiles();
  const problems: string[] = [];
  for (const file of files.filter((f) => CODE.test(f))) {
    const path = join(root, file);
    const text = readFileSync(path, "utf8");
    const ranges = commentRanges(file, text);
    if (!ranges.length) continue;
    if (strip) {
      writeFileSync(path, stripComments(text, ranges));
      const left = commentRanges(file, readFileSync(path, "utf8"));
      if (left.length) problems.push(`${file}: ${left.length} comment(s) left after stripping`);
      continue;
    }
    const lines = ranges.map((r) => text.slice(0, r.pos).split("\n").length);
    problems.push(`${file}: ${ranges.length} comment(s), line ${lines.slice(0, 5).join(", ")}${lines.length > 5 ? ", …" : ""}`);
  }
  const pythonFound = pythonComments(files.filter((f) => PYTHON.test(f)), strip);
  for (const [path, spans] of Object.entries(pythonFound)) {
    problems.push(`${relative(root, path).replace(/\\/g, "/")}: ${spans.length} comment(s) or docstring(s), line ${spans.slice(0, 5).map((s) => s.line).join(", ")}${spans.length > 5 ? ", …" : ""}`);
  }
  if (problems.length) {
    console.error(`noComments: code carries no comments or docstrings (rule 70). ${problems.length} file(s):\n${problems.map((p) => `  - ${p}`).join("\n")}\nStrip them: bun scripts/checks/checkNoComments.ts --strip`);
    return 1;
  }
  console.log(`noComments: ${files.length} code file(s), no comments or docstrings${strip ? " (stripped)" : ""}.`);
  return 0;
}

if (import.meta.main) process.exit(main());
