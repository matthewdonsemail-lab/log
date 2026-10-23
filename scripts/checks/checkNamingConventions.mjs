import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;
const TS_FILE = /^([a-z][a-zA-Z0-9]*)(\.test)?\.ts$/;
const violations = [];
const rel = (path) => relative(root, path).split(sep).join('/');

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!CAMEL.test(entry.name)) violations.push(`${rel(path)}: directory name must be camelCase.`);
      if (entry.name === 'helpers') checkHelpers(path);
      walk(path);
    } else if (entry.name.endsWith('.ts') && !TS_FILE.test(entry.name)) {
      violations.push(`${rel(path)}: file name must be camelCase.`);
    }
  }
}

function checkHelpers(helpersPath) {
  if (!existsSync(join(helpersPath, 'index.ts'))) {
    violations.push(`${rel(helpersPath)}: missing required barrel "helpers/index.ts".`);
  }
  for (const file of readdirSync(helpersPath).filter((f) => f.endsWith('.ts'))) {
    readFileSync(join(helpersPath, file), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/from ['"]\.\.\/index(\.ts)?['"]/.test(line) && !line.trim().startsWith('//')) {
          violations.push(`${rel(join(helpersPath, file))}:${index + 1}: helper imports its parent domain barrel.`);
        }
      });
  }
}

function checkDomains(src) {
  for (const library of readdirSync(src, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const libraryPath = join(src, library.name);
    const domains = readdirSync(libraryPath, { withFileTypes: true }).filter((e) => e.isDirectory());
    if (domains.length === 0) violations.push(`${rel(libraryPath)}: library must contain at least one domain.`);
    for (const domain of domains) {
      if (!existsSync(join(libraryPath, domain.name, 'index.ts'))) {
        violations.push(`${rel(join(libraryPath, domain.name))}: missing required entrypoint "index.ts".`);
      }
    }
  }
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
const ALLOWED_KEBAB = [/^\d+(?:-\d+)+$/, /^2-digit$/, /^rev-parse$/, /^ls-files$/, /^xdg-open$/, /^zone-custom$/, /^set-cookie$/, /^content-type$/, /^no-store$/, /^utf-8$/, /^www-authenticate$/, /^proxy-authorization$/, /^mcp-session-id$/, /^claude-(?:code|ai)$/, /^codex-mcp-client$/, /^x-fb-friendly-name$/, /^inspect-web-network-capture$/, /^analyze-javascript-application$/, /^photo-\d+-[0-9a-f]+$/, /^x{8}-x{4}-4x{3}-yx{3}-x{12}$/, /^wilkes-barre$/, /^aria-[a-z]+$/, /^subq-snap-preview$/, /^subq-snap-\d+\.\d+$/, /^sec-fetch-(?:dest|site|mode|user)$/, /^(?:same|cross)-(?:origin|site)$/,/^[a-z]{2}-[a-z0-9]{1,3}$/];
const LITERAL = /(['"])((?:(?!\1)[^\\\n])*)\1/g;

function checkLiterals(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '__pycache__') checkLiterals(path);
      continue;
    }
    if (!/\.(ts|mjs|py)$/.test(entry.name)) continue;
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const code = line.trim();
        if (code.startsWith('//') || code.startsWith('#') || code.startsWith('*')) return;
        for (const [, , value] of line.matchAll(LITERAL)) {
          if (KEBAB.test(value) && !ALLOWED_KEBAB.some((allowed) => allowed.test(value))) {
            violations.push(`${rel(path)}:${index + 1}: kebab-case value "${value}" must be camelCase.`);
          }
        }
      });
  }
}

function checkNames(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__pycache__' || entry.name.startsWith('.')) continue;
    const base = entry.name.replace(/\.[^.]+$/, '');
    if (entry.name !== 'SKILL.md' && KEBAB.test(base)) {
      violations.push(`${rel(join(dir, entry.name))}: name must be camelCase, never kebab-case.`);
    }
    if (entry.isDirectory()) checkNames(join(dir, entry.name));
  }
}

for (const dir of ['src', 'bin']) {
  const path = join(root, dir);
  if (existsSync(path) && statSync(path).isDirectory()) walk(path);
}
checkDomains(join(root, 'src'));
for (const dir of ['src', 'bin', 'scripts', 'python']) {
  const path = join(root, dir);
  if (existsSync(path)) checkLiterals(path);
}
for (const dir of ['skills', 'python', 'scripts']) {
  const path = join(root, dir);
  if (existsSync(path)) checkNames(path);
}

if (violations.length > 0) {
  console.error('check:naming FAIL');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error('\nSee docs/namingConventions.md.');
  process.exit(1);
}
console.log('check:naming OK — {library}/{domain}/ layout, camelCase names and values, no kebab-case.');
