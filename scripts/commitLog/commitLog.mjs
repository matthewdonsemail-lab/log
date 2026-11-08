import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize } from './astSummary.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEX = join(root, 'log.md');
const DAYS = join(root, 'log');
export const PLACEHOLDER = '<fill in>';
export const AST_HEADING = "AST (generated from the staged code by scripts/commitLog/astSummary.mjs, don't edit):";
const AGENT_FIELDS = ['What changed:', 'Why:', 'Checked:'];
export const INDEX_HEADER = `# log

One entry per commit, kept in one file per day (\`log/<date>.md\`, the day in
UTC), newest at the bottom of each day. On every commit the pre-commit hook
parses the staged code into a syntax tree and writes the AST block of the entry
(what was added, changed or removed) into the day's file. The agent then writes
What changed, Why and Checked from it. Never edit old entries. Add a new one.

Entries before the AST hook existed were rebuilt from each commit with
\`node scripts/astSummary.mjs <commit>\`.
`;

const git = (...args) => execFileSync('git', args, { windowsHide: true, cwd: root, encoding: 'utf8' }).trim();

export const dayOf = (when) => when.slice(0, 10);
export const dayFile = (day) => `log/${day}.md`;
const dayHeader = (day) => `# log · ${day}\n\nEvery commit on ${day} (UTC), oldest first. The index of every day is [log.md](../log.md).\n`;

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

function readDays() {
  if (!existsSync(DAYS)) return new Map();
  return new Map(readdirSync(DAYS).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).map((f) => [f.slice(0, 10), countEntries(readFileSync(join(DAYS, f), 'utf8'))]));
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
  if (start === -1) return "the day's log is staged but has no new \"## \" entry.";
  const lines = allLines.slice(start);
  const block = astBlock(lines);
  if (block === null) return 'the new log entry has no AST block.';
  if (block.join('\n') !== ast.join('\n')) return 'stale';
  for (const field of AGENT_FIELDS) {
    const line = lines.find((l) => l.startsWith(field));
    if (!line) return `the new log entry is missing its "${field}" line.`;
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

const gitShow = (spec) => {
  try {
    return execFileSync('git', ['show', spec], { windowsHide: true, cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).replace(/\r/g, '');
  } catch {
    return '';
  }
};

export function newestEntryLines(staged, head) {
  const entries = staged.split(/\n(?=## \d{4}-\d{2}-\d{2} )/).slice(1);
  const last = entries.at(-1);
  if (!last) return [];
  const heading = last.split('\n')[0];
  return head.split('\n').includes(heading) ? [] : last.split('\n');
}

const stagedEntryLines = (file) => newestEntryLines(gitShow(`:${file}`), gitShow(`HEAD:${file}`));

function hasNewEntry(day) {
  return stagedEntryLines(dayFile(day)).length > 0;
}

function writeIndex() {
  const index = renderIndex(readDays());
  const changed = !existsSync(INDEX) || readFileSync(INDEX, 'utf8') !== index;
  if (changed) writeFileSync(INDEX, index);
  return changed;
}

function main() {
  if (existsSync(resolve(root, git('rev-parse', '--git-path', 'MERGE_HEAD')))) return 0;
  const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
  if (staged.length === 0) return 0;
  const ast = summarize();
  const when = new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z';
  const day = dayOf(when);
  const stagedDay = staged.includes(dayFile(day)) && hasNewEntry(day) ? dayFile(day) : null;

  if (!stagedDay) {
    const path = join(root, dayFile(day));
    mkdirSync(DAYS, { recursive: true });
    const current = existsSync(path) ? readFileSync(path, 'utf8') : dayHeader(day);
    const entry = renderEntry({ when, branch: git('rev-parse', '--abbrev-ref', 'HEAD'), ast });
    writeFileSync(path, `${current.trimEnd()}\n\n${entry}`);
    writeIndex();
    console.error(
      [
        `${dayFile(day)}: commit stopped. This is the AST of what you are committing:`,
        '',
        ...ast,
        '',
        `It is now the newest entry at the bottom of ${dayFile(day)}. Under it, write`,
        'What changed, Why and Checked from that list, then `git add log.md log`',
        'and commit again.',
      ].join('\n'),
    );
    return 1;
  }

  const problem = checkAdded(stagedEntryLines(stagedDay), ast);
  if (problem === 'stale') {
    const path = join(root, stagedDay);
    writeFileSync(path, replaceLastAstBlock(readFileSync(path, 'utf8'), ast));
    console.error(
      [`${stagedDay}: the staged code changed since the entry was written. New AST:`, '', ...ast, '', `The block is updated in ${stagedDay}. Check What changed still matches, \`git add log.md log\`, commit again.`].join('\n'),
    );
    return 1;
  }
  if (problem) {
    console.error(`${stagedDay}: ${problem} See skills/commitLog/SKILL.md.`);
    return 1;
  }
  if (writeIndex() || !staged.includes('log.md')) {
    console.error('log.md: the index of days is updated. `git add log.md` and commit again.');
    return 1;
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
