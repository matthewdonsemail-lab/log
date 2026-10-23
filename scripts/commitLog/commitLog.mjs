import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize } from './astSummary.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOG = join(root, 'log.md');
export const PLACEHOLDER = '<fill in>';
export const AST_HEADING = "AST (generated from the staged code by scripts/commitLog/astSummary.mjs, don't edit):";
const AGENT_FIELDS = ['What changed:', 'Why:', 'Checked:'];
const HEADER = `# log

One entry per commit, newest at the bottom. On every commit the pre-commit
hook parses the staged code into a syntax tree and writes the AST block of the
entry (what was added, changed or removed). The agent then writes What
changed, Why and Checked from it. Never edit old entries. Add a new one.
`;

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

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
  if (start === -1) return 'log.md is staged but has no new "## " entry.';
  const lines = allLines.slice(start);
  const block = astBlock(lines);
  if (block === null) return 'the new log.md entry has no AST block.';
  if (block.join('\n') !== ast.join('\n')) return 'stale';
  for (const field of AGENT_FIELDS) {
    const line = lines.find((l) => l.startsWith(field));
    if (!line) return `the new log.md entry is missing its "${field}" line.`;
    if (line.includes(PLACEHOLDER) || line.slice(field.length).trim() === '') return `"${field}" still needs writing.`;
  }
  return null;
}

export function replaceLastAstBlock(text, ast) {
  const at = text.lastIndexOf(AST_HEADING);
  if (at === -1) return text;
  const blockStart = at + AST_HEADING.length + 1;
  const blockEnd = text.indexOf('\n\n', blockStart);
  return `${text.slice(0, blockStart)}${ast.join('\n')}${blockEnd === -1 ? '\n' : text.slice(blockEnd)}`;
}

function main() {
  if (existsSync(join(root, '.git', 'MERGE_HEAD'))) return 0;
  const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
  if (staged.length === 0) return 0;
  const ast = summarize();

  if (!staged.includes('log.md')) {
    const current = existsSync(LOG) ? readFileSync(LOG, 'utf8') : HEADER;
    const entry = renderEntry({
      when: new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z',
      branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
      ast,
    });
    writeFileSync(LOG, `${current.trimEnd()}\n\n${entry}`);
    console.error(
      [
        'log.md: commit stopped. This is the AST of what you are committing:',
        '',
        ...ast,
        '',
        'It is now the newest entry at the bottom of log.md. Under it, write',
        'What changed, Why and Checked from that list, then `git add log.md`',
        'and commit again.',
      ].join('\n'),
    );
    return 1;
  }

  const problem = checkAdded(addedLines(git('diff', '--cached', '--', 'log.md')), ast);
  if (problem === 'stale') {
    writeFileSync(LOG, replaceLastAstBlock(readFileSync(LOG, 'utf8'), ast));
    console.error(
      ['log.md: the staged code changed since the entry was written. New AST:', '', ...ast, '', 'The block is updated in log.md. Check What changed still matches, `git add log.md`, commit again.'].join('\n'),
    );
    return 1;
  }
  if (problem) {
    console.error(`log.md: ${problem} See skills/commitLog/SKILL.md.`);
    return 1;
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
