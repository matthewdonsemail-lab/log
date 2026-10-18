// Pre-commit gate: every commit adds an entry to log.md.
//
// - log.md not staged: append a template entry for the staged files, then
//   stop the commit so the agent writes the AST: lines.
// - log.md staged: the added entry must have its AST: lines written (no
//   "<fill in>" left). Then the commit goes through.
//
// AST lines are the agent's statement of what happened: what changed, why,
// and how it was checked. See skills/commitLog/SKILL.md.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(root, 'log.md');
const PLACEHOLDER = '<fill in>';
const HEADER = `# log

One entry per commit, newest at the bottom. The pre-commit hook adds the
template; the agent fills in every \`AST:\` line before the commit goes
through. Never edit old entries. Add a new one.
`;

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

export function renderEntry({ when, branch, files }) {
  return [
    `## ${when} · ${branch}`,
    '',
    `Files: ${files.map((f) => `\`${f}\``).join(', ')}`,
    '',
    `AST: What changed: ${PLACEHOLDER}`,
    `AST: Why: ${PLACEHOLDER}`,
    `AST: Checked: ${PLACEHOLDER}`,
    '',
  ].join('\n');
}

/** Lines the staged diff adds to log.md. */
export function addedLines(diff) {
  return diff
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
}

/** null when the added entry is complete, else the reason it isn't. */
export function checkAdded(lines) {
  if (!lines.some((line) => line.startsWith('## '))) return 'log.md is staged but has no new "## " entry.';
  const ast = lines.filter((line) => line.startsWith('AST:'));
  if (ast.length < 3) return 'the new log.md entry needs its AST: What changed / Why / Checked lines.';
  if (ast.some((line) => line.includes(PLACEHOLDER))) return `the new log.md entry still has "${PLACEHOLDER}" in an AST: line.`;
  return null;
}

function main() {
  if (existsSync(join(root, '.git', 'MERGE_HEAD'))) return 0;
  const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
  if (staged.length === 0) return 0;

  if (!staged.includes('log.md')) {
    const current = existsSync(LOG) ? readFileSync(LOG, 'utf8') : HEADER;
    const entry = renderEntry({
      when: new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z',
      branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
      files: staged,
    });
    writeFileSync(LOG, `${current.trimEnd()}\n\n${entry}`);
    console.error('log.md: added an entry for this commit. Fill in its AST: lines, `git add log.md`, then commit again.');
    return 1;
  }

  const problem = checkAdded(addedLines(git('diff', '--cached', '--', 'log.md')));
  if (problem) {
    console.error(`log.md: ${problem} See skills/commitLog/SKILL.md.`);
    return 1;
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
