import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize } from './astSummary.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PLACEHOLDER = '<fill in>';
export const AST_HEADING = "AST (generated from the staged code by scripts/commitLog/astSummary.mjs, don't edit):";
const AGENT_FIELDS = ['What changed:', 'Why:', 'Checked:'];
export const INDEX_HEADER = `# log

One entry per commit, kept in one file per day (\`<date>.md\`, the day in UTC),
newest at the bottom of each day. This folder is private (\`LOG_DEVLOG_DIR\`,
default \`~/.logCli/devlog/\`) and never goes in the repo. On every commit the
pre-commit hook parses the staged code into a syntax tree and writes the AST
block of the entry (what was added, changed or removed) into the day's file.
The agent then writes What changed, Why and Checked from it. Never edit old
entries. Add a new one.
`;

const git = (...args) => execFileSync('git', args, { windowsHide: true, cwd: root, encoding: 'utf8' }).trim();

export const devlogDir = (env = process.env) => env.LOG_DEVLOG_DIR || join(homedir(), '.logCli', 'devlog');
export const dayOf = (when) => when.slice(0, 10);
export const dayFile = (day) => `${day}.md`;
const dayHeader = (day) => `# log · ${day}\n\nEvery commit on ${day} (UTC), oldest first. The index of every day is [log.md](log.md).\n`;

export function renderEntry({ when, branch, ast }) {
  return [
    `## ${when} · ${branch}`,
    '',
    AST_HEADING,
    ...ast,
    '',
    ...AGENT_FIELDS.map((field) => `${field} ${PLACEHOLDER}`),
    '',
  ].join('\n');
}

export function splitEntries(text) {
  const days = new Map();
  for (const chunk of text.split(/\n(?=## \d{4}-\d{2}-\d{2} )/).slice(1)) {
    const day = chunk.slice(3, 13);
    days.set(day, [...(days.get(day) ?? []), chunk.trimEnd()]);
  }
  return days;
}

export function renderDay(day, entries) {
  return `${dayHeader(day)}\n${entries.join('\n\n')}\n`;
}

export function renderIndex(days) {
  const rows = [...days].sort(([a], [b]) => b.localeCompare(a)).map(([day, count]) => `| [${day}](${dayFile(day)}) | ${count} |`);
  return `${INDEX_HEADER}\n| Day | Commits |\n| --- | --- |\n${rows.join('\n')}\n`;
}

export function countEntries(text) {
  return text.split('\n').filter((line) => /^## \d{4}-\d{2}-\d{2} /.test(line)).length;
}

function readDays(dir) {
  if (!existsSync(dir)) return new Map();
  return new Map(readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).map((f) => [f.slice(0, 10), countEntries(readFileSync(join(dir, f), 'utf8'))]));
}

export function addedLines(diff) {
  return diff
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1).replace(/\r$/, ''));
}

export function astBlock(lines) {
  const start = lines.indexOf(AST_HEADING);
  if (start === -1) return null;
  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') break;
    block.push(line);
  }
  return block;
}

export function checkAdded(allLines, ast) {
  const start = allLines.findLastIndex((line) => line.startsWith('## '));
  if (start === -1) return 'the entry has no "## " heading.';
  const lines = allLines.slice(start);
  const block = astBlock(lines);
  if (block === null) return 'the entry has no AST block.';
  if (block.join('\n') !== ast.join('\n')) return 'stale';
  for (const field of AGENT_FIELDS) {
    const line = lines.find((l) => l.startsWith(field));
    if (!line) return `the entry is missing its "${field}" line.`;
    if (line.includes(PLACEHOLDER) || line.slice(field.length).trim() === '') return `"${field}" still needs writing.`;
  }
  return null;
}

export function replaceLastAstBlock(text, ast) {
  const lf = text.replace(/\r\n/g, '\n');
  const at = lf.lastIndexOf(AST_HEADING);
  if (at === -1) return lf;
  const blockStart = lf.indexOf('\n', at) + 1;
  if (blockStart === 0) return `${lf}\n${ast.join('\n')}\n`;
  const blockEnd = lf.indexOf('\n\n', blockStart);
  return `${lf.slice(0, blockStart)}${ast.join('\n')}${blockEnd === -1 ? '\n' : lf.slice(blockEnd)}`;
}

function entrySpan(text, heading) {
  const at = text.lastIndexOf(`${heading}\n`);
  if (at === -1) return null;
  const next = text.slice(at + heading.length).search(/\n## \d{4}-\d{2}-\d{2} /);
  return { start: at, end: next === -1 ? text.length : at + heading.length + next };
}

export function entryLines(text, heading) {
  const lf = text.replace(/\r\n/g, '\n');
  const span = entrySpan(lf, heading);
  return span ? lf.slice(span.start, span.end).split('\n') : [];
}

export function replaceEntryAstBlock(text, heading, ast) {
  const lf = text.replace(/\r\n/g, '\n');
  const span = entrySpan(lf, heading);
  if (!span) return lf;
  const entry = lf.slice(span.start, span.end);
  const replaced = replaceLastAstBlock(entry, ast);
  return `${lf.slice(0, span.start)}${span.end === lf.length ? replaced : replaced.replace(/\n$/, '')}${lf.slice(span.end)}`;
}

export const pendingFile = (dir, repoRoot) => join(dir, '.pending', `${createHash('sha256').update(resolve(repoRoot).toLowerCase()).digest('hex').slice(0, 16)}.json`);

function readPending(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function writeIndex(dir) {
  const index = renderIndex(readDays(dir));
  const path = join(dir, 'log.md');
  if (!existsSync(path) || readFileSync(path, 'utf8') !== index) writeFileSync(path, index);
}

export function markCommitted(dir = devlogDir(), repoRoot = root) {
  rmSync(pendingFile(dir, repoRoot), { force: true });
  return 0;
}

function main() {
  if (process.argv.includes('--committed')) return markCommitted();
  if (existsSync(resolve(root, git('rev-parse', '--git-path', 'MERGE_HEAD')))) return 0;
  const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
  if (staged.length === 0) return 0;
  const dir = devlogDir();
  const ast = summarize();
  const pendingPath = pendingFile(dir, root);
  const pending = readPending(pendingPath);
  const pendingText = pending && existsSync(pending.file) ? readFileSync(pending.file, 'utf8') : null;
  const lines = pendingText === null ? [] : entryLines(pendingText, pending.heading);

  if (!lines.length) {
    const when = new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z';
    const day = dayOf(when);
    const path = join(dir, dayFile(day));
    mkdirSync(dirname(pendingPath), { recursive: true });
    const current = existsSync(path) ? readFileSync(path, 'utf8') : dayHeader(day);
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    writeFileSync(path, `${current.trimEnd()}\n\n${renderEntry({ when, branch, ast })}`);
    writeFileSync(pendingPath, `${JSON.stringify({ file: path, heading: `## ${when} · ${branch}` })}\n`);
    writeIndex(dir);
    console.error(
      [
        `devlog: commit stopped. This is the AST of what you are committing:`,
        '',
        ...ast,
        '',
        `It is now the newest entry at the bottom of ${path} (private, outside the repo).`,
        'Under it, write What changed, Why and Checked from that list, then commit again.',
        'Nothing to stage: the day log never goes in the repo.',
      ].join('\n'),
    );
    return 1;
  }

  const problem = checkAdded(lines, ast);
  if (problem === 'stale') {
    writeFileSync(pending.file, replaceEntryAstBlock(pendingText, pending.heading, ast));
    console.error([`${pending.file}: the staged code changed since the entry was written. New AST:`, '', ...ast, '', 'The block is updated. Check What changed still matches, then commit again.'].join('\n'));
    return 1;
  }
  if (problem) {
    console.error(`${pending.file}: ${problem} See skills/commitLog/SKILL.md.`);
    return 1;
  }
  writeIndex(dir);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
